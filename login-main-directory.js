// login.js
// - Remembers successful sign-in via 'access' cookie → skips Google prompt on reload/return visits
// - Still generates/checks user ID + bans on EVERY load (even returning users)
// - Keeps loading screen, teacher redirect, allowed access, ban logic

// 1. Hide content immediately
const hideStyle = document.createElement('style');
hideStyle.textContent = 'body { visibility: hidden !important; }';
document.head.appendChild(hideStyle);

// 2. Loading overlay
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
  <div style="font-size: 2.6rem; font-weight: bold; margin-bottom: 1.5rem;">
    Verifying access...
  </div>
  <div style="font-size: 1.15rem; opacity: 0.8; text-align: center; max-width: 360px;">
    Just a moment
  </div>
`;
document.documentElement.appendChild(overlay);

// 3. Google meta (still needed even if we skip sign-in)
const meta = document.createElement('meta');
meta.name = 'google-signin-client_id';
meta.content = '679269140652-7d1pivqd4d269g1d0fmlivhqebnd2grt.apps.googleusercontent.com';
document.head.appendChild(meta);

// 4. Load GIS script (only if needed, but we load it anyway for safety)
const script = document.createElement('script');
script.src = 'https://accounts.google.com/gsi/client';
script.async = true;
script.defer = true;
script.onload = initialize;
document.head.appendChild(script);

setTimeout(() => {
  if (!window.google?.accounts?.id && !hasValidAccessCookie()) {
    overlay.innerHTML = `
      <div style="font-size: 2rem; color: #f87171; margin-bottom: 1.5rem;">
        Sign-in library failed to load
      </div>
      <button onclick="location.reload()" style="padding:12px 32px; background:#3b82f6; color:white; border:none; border-radius:8px; cursor:pointer;">
        Reload
      </button>
    `;
  }
}, 12000);

function hasValidAccessCookie() {
  const access = getCookie('access');
  return access === 'teacher' || access === 'allowed';
}

function initialize() {
  // Quick check first — if already authorized via cookie, skip Google entirely
  if (hasValidAccessCookie()) {
    const userId = getCookie('userId') || generateUserId();
    checkIfBanned(userId, proceedBasedOnAccess);
    return;
  }

  // No valid cookie → proceed to sign-in flow
  setTimeout(showSignInScreen, 300);
}

function proceedBasedOnAccess() {
  const access = getCookie('access');
  if (access === 'teacher') {
    window.location.replace('teacher.html');
  } else {
    grantGameAccess();
  }
}

function showSignInScreen() {
  overlay.innerHTML = `
    <div style="font-size: 2.3rem; font-weight: bold; margin-bottom: 2rem; color: #60a5fa;">
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
      Required to access this site.
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

  // Timeout fallback for no interaction / cancel / block
  document.addEventListener('click', e => {
    if (e.target.closest('#google-button-container')) {
      setTimeout(() => {
        if (overlay.parentNode) {
          generateAndCheckUserId(proceedBasedOnAccess); // treat as allowed
        }
      }, 10000);
    }
  }, { once: true });
}

function handleGoogleResponse(response) {
  if (!response?.credential) {
    generateAndCheckUserId(proceedBasedOnAccess);
    return;
  }

  try {
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    const email = payload.email?.toLowerCase() || '';

    if (!email) {
      generateAndCheckUserId(proceedBasedOnAccess);
      return;
    }

    if (email.endsWith('@evergreenps.org')) {
      setCookie('access', 'teacher', 365);
      setCookie('email', email, 365);
    } else {
      setCookie('access', 'allowed', 365);
      setCookie('email', email, 365);
    }

    generateAndCheckUserId(proceedBasedOnAccess);
  } catch {
    generateAndCheckUserId(proceedBasedOnAccess);
  }
}

// ────────────────────────────────────────────────
// User ID & Ban logic (runs every time)
function generateUserId() {
  const existing = getCookie('userId');
  if (existing) return existing;

  const newId = Math.floor(100000 + Math.random() * 900000).toString();
  setCookie('userId', newId, 365);
  return newId;
}

function generateAndCheckUserId(onSuccess = proceedBasedOnAccess) {
  const userId = generateUserId();
  checkIfBanned(userId, onSuccess);
}

function checkIfBanned(userId, onNotBanned) {
  const banUrl = `/banned/${userId}.txt`;  // or .html

  fetch(banUrl, { method: 'HEAD', cache: 'no-store' })
    .then(res => {
      if (res.ok) {
        showBannedScreen(userId);
      } else {
        onNotBanned();
      }
    })
    .catch(() => onNotBanned()); // network error / 404 → not banned
}

function showBannedScreen(userId) {
  overlay.innerHTML = `
    <div style="font-size: 2.8rem; font-weight: bold; color: #ef4444; margin-bottom: 1.5rem;">
      ACCESS DENIED
    </div>
    <div style="font-size: 1.25rem; max-width: 420px; text-align: center; line-height: 1.6;">
      This account is banned.<br>
      User ID: <strong>${userId}</strong><br><br>
      Contact support if this is a mistake.
    </div>
  `;
  // Stays on screen — no access granted
}

function grantGameAccess() {
  overlay.innerHTML = `
    <div style="font-size: 2.5rem; font-weight: bold; color: #22c55e; margin-bottom: 1.5rem;">
      Welcome back!
    </div>
    <div style="font-size: 1.2rem; text-align: center; max-width: 400px;">
      Access granted to the game site
    </div>
  `;

  setTimeout(() => {
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.remove();
      document.body.style.visibility = 'visible';
    }, 600);
  }, 1400);
}

// ────────────────────────────────────────────────
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
