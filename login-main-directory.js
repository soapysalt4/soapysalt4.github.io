// login-main-directory.js
// Updated rules:
// - Popup closed / user cancels → DENY access
// - Google blocks login (no credential + error case) → ALLOW access
// - Successful login → check domain as before

document.head.insertAdjacentHTML('beforeend', '<style>body { visibility: hidden !important; }</style>');

const overlay = document.createElement('div');
overlay.id = 'auth-overlay';
Object.assign(overlay.style, {
  position: 'fixed',
  inset: '0',
  background: '#0f172a',
  zIndex: '999999',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  color: '#e2e8f0',
  fontFamily: 'system-ui, sans-serif',
  transition: 'opacity 0.5s'
});

overlay.innerHTML = `
  <div style="font-size:2.4rem; font-weight:bold; margin-bottom:1rem;">Loading...</div>
  <div style="font-size:1.1rem; opacity:0.8;">Verifying access</div>
`;
document.documentElement.appendChild(overlay);

// Google meta
const meta = document.createElement('meta');
meta.name = 'google-signin-client_id';
meta.content = '679269140652-7d1pivqd4d269g1d0fmlivhqebnd2grt.apps.googleusercontent.com';
document.head.appendChild(meta);

// Load Google script
const script = document.createElement('script');
script.src = 'https://accounts.google.com/gsi/client';
script.async = true;
script.defer = true;
script.onload = init;
document.head.appendChild(script);

let popupInteractionDetected = false;

function init() {
  const access = getCookie('access');

  if (access === 'teacher') {
    window.location.replace('/teacher.html');
    return;
  }
  if (access === 'allowed') {
    grantAccess();
    return;
  }

  overlay.innerHTML = `
    <div style="font-size:2.2rem; font-weight:bold; margin-bottom:1.5rem; color:#60a5fa;">
      Sign in with Google
    </div>
    <div id="gbtn" style="background:white; border-radius:10px; padding:24px; box-shadow:0 6px 20px rgba(0,0,0,0.25); min-width:300px; display:flex; justify-content:center;"></div>
    <div style="margin-top:2rem; font-size:1.05rem; opacity:0.8; text-align:center; max-width:380px;">
      You must sign in to continue
    </div>
  `;

  google.accounts.id.initialize({
    client_id: '679269140652-7d1pivqd4d269g1d0fmlivhqebnd2grt.apps.googleusercontent.com',
    callback: handleResponse,
    auto_select: false,
    cancel_on_tap_outside: false,
    ux_mode: 'popup'
  });

  google.accounts.id.renderButton(document.getElementById('gbtn'), {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    text: 'signin_with',
    shape: 'rectangular',
    logo_alignment: 'center',
    width: 340
  });

  // Track if user attempted to interact with the button
  document.addEventListener('click', function attemptHandler(e) {
    if (e.target.closest('#gbtn')) {
      popupInteractionDetected = true;
      // Remove listener after first click
      this.removeEventListener('click', attemptHandler);
    }
  }, { once: false });

  // If popup was opened but no callback after reasonable time → assume closed → deny
  setTimeout(() => {
    if (popupInteractionDetected && !accessGranted) {
      denyAccess("Sign-in popup was closed. Access denied.");
    }
  }, 15000);  // 15 seconds – enough time for most users to complete or cancel
}

let accessGranted = false;

function handleResponse(resp) {
  accessGranted = true;

  // No credential usually means: popup closed / user cancelled / consent denied / blocked by policy
  if (!resp || !resp.credential) {
    // Google blocked it (admin policy, origin mismatch, etc.) → ALLOW
    setCookie('access', 'allowed', 365);
    grantAccess();
    return;
  }

  // Successful credential → normal domain check
  try {
    const payload = JSON.parse(atob(resp.credential.split('.')[1]));
    const email = payload.email?.toLowerCase() || '';

    if (email.endsWith('@evergreenps.org')) {
      setCookie('access', 'teacher', 365);
      setCookie('email', email, 365);
      window.location.replace('/teacher.html');
    } else {
      setCookie('access', 'allowed', 365);
      setCookie('email', email, 365);
      grantAccess();
    }
  } catch (err) {
    // Parsing failed → treat as blocked → allow
    setCookie('access', 'allowed', 365);
    grantAccess();
  }
}

function denyAccess(message = "Access denied. You must complete sign-in.") {
  overlay.innerHTML = `
    <div style="font-size:2.8rem; font-weight:bold; color:#ef4444; margin-bottom:1.5rem;">
      ACCESS DENIED
    </div>
    <div style="font-size:1.25rem; max-width:420px; text-align:center; line-height:1.6;">
      ${message}<br><br>
      <button onclick="location.reload()" style="padding:12px 32px; background:#3b82f6; color:white; border:none; border-radius:8px; cursor:pointer; margin-top:1rem;">
        Reload and try again
      </button>
    </div>
  `;
  // No fade-out – stay blocked
}

function grantAccess() {
  accessGranted = true;
  overlay.style.opacity = '0';
  setTimeout(() => {
    overlay.remove();
    document.body.style.visibility = 'visible';
  }, 600);
}

function getCookie(name) {
  const m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : null;
}

function setCookie(name, value, days) {
  let expires = '';
  if (days) {
    const d = new Date();
    d.setTime(d.getTime() + days*864e5);
    expires = '; expires=' + d.toUTCString();
  }
  document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/; SameSite=Lax';
}
