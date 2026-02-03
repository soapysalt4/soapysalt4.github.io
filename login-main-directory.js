// login.js - Updated: changes URL to include user ID (like /483921)
// Remembers sign-in, assigns persistent user ID, checks ban, redirects URL

// Immediately hide content
const hideStyle = document.createElement('style');
hideStyle.textContent = 'body { visibility: hidden !important; }';
document.head.appendChild(hideStyle);

// Create loading overlay
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
  <div style="font-size: 2.6rem; font-weight: bold; margin-bottom: 1rem;">
    Loading...
  </div>
  <div style="font-size: 1.15rem; opacity: 0.8; text-align: center; max-width: 360px;">
    Preparing secure access
  </div>
`;
document.documentElement.appendChild(overlay);

// Google Sign-In meta
const meta = document.createElement('meta');
meta.name = 'google-signin-client_id';
meta.content = '679269140652-7d1pivqd4d269g1d0fmlivhqebnd2grt.apps.googleusercontent.com';
document.head.appendChild(meta);

// Load Google script
const script = document.createElement('script');
script.src = 'https://accounts.google.com/gsi/client';
script.async = true;
script.defer = true;
script.onload = initialize;
document.head.appendChild(script);

// ────────────────────────────────────────────────
// Get or generate persistent user ID
function getOrCreateUserId() {
  let id = getCookie('userId');
  if (!id) {
    id = Math.floor(100000 + Math.random() * 900000).toString();
    setCookie('userId', id, 365);
  }
  return id;
}

const userId = getOrCreateUserId();

// ────────────────────────────────────────────────
// Change URL to include user ID (e.g., /483921)
function updateUrlWithId() {
  const currentPath = window.location.pathname;
  const idPath = `/${userId}`;

  if (currentPath !== idPath && currentPath !== idPath + '/') {
    // Preserve any query params or hash
    const newUrl = idPath + window.location.search + window.location.hash;
    window.history.replaceState(null, '', newUrl);
  }
}

// Call immediately
updateUrlWithId();

// ────────────────────────────────────────────────
function initialize() {
  // Check if already signed in (via cookie)
  const access = getCookie('access');

  checkIfBanned(() => {
    if (access === 'teacher') {
      window.location.replace('/teacher.html');
    } else if (access === 'allowed') {
      grantAccess();
    } else {
      showSignIn();
    }
  });
}

function showSignIn() {
  overlay.innerHTML = `
    <div style="font-size: 2.3rem; font-weight: bold; margin-bottom: 1.5rem; color: #60a5fa;">
      Sign in with Google
    </div>
    <div id="google-button-container" style="
      background: white;
      border-radius: 10px;
      padding: 24px;
      box-shadow: 0 6px 20px rgba(0,0,0,0.25);
      min-width: 340px;
      display: flex;
      justify-content: center;
    "></div>
    <div style="margin-top: 2rem; font-size: 1.05rem; opacity: 0.8; text-align: center; max-width: 380px;">
      Required to access this site.<br>User ID: ${userId}
    </div>
  `;

  google.accounts.id.initialize({
    client_id: '679269140652-7d1pivqd4d269g1d0fmlivhqebnd2grt.apps.googleusercontent.com',
    callback: handleGoogleResponse,
    auto_select: false,
    cancel_on_tap_outside: false,
    ux_mode: 'popup'
  });

  google.accounts.id.renderButton(
    document.getElementById('google-button-container'),
    {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      logo_alignment: 'center',
      width: 340
    }
  );

  // Timeout: treat as allowed if no response
  document.addEventListener('click', e => {
    if (e.target.closest('#google-button-container')) {
      setTimeout(() => {
        if (overlay.parentNode) {
          setCookie('access', 'allowed', 365);
          grantAccess();
        }
      }, 10000);
    }
  }, { once: true });
}

function handleGoogleResponse(response) {
  if (!response?.credential) {
    setCookie('access', 'allowed', 365);
    grantAccess();
    return;
  }

  try {
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
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
  } catch {
    setCookie('access', 'allowed', 365);
    grantAccess();
  }
}

function checkIfBanned(onNotBanned) {
  const banUrl = `/banned/${userId}.txt`;

  fetch(banUrl, { method: 'HEAD', cache: 'no-store' })
    .then(res => {
      if (res.ok) {
        showBannedScreen();
      } else {
        onNotBanned();
      }
    })
    .catch(() => onNotBanned());
}

function showBannedScreen() {
  overlay.innerHTML = `
    <div style="font-size: 2.8rem; font-weight: bold; color: #ef4444; margin-bottom: 1rem;">
      ACCESS DENIED
    </div>
    <div style="font-size: 1.25rem; max-width: 420px; text-align: center; line-height: 1.6;">
      Your account (ID: ${userId}) is banned.<br>Contact support.
    </div>
  `;
}

function grantAccess() {
  // Show main content
  document.getElementById('main-content').style.display = 'flex';
  document.getElementById('user-id-display').textContent = userId;

  overlay.style.opacity = '0';
  setTimeout(() => {
    overlay.remove();
    document.body.style.visibility = 'visible';
  }, 600);
}

// Cookie helpers
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name, value, days) {
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 86400000);
    expires = '; expires=' + date.toUTCString();
  }
  document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/; SameSite=Lax';
}
