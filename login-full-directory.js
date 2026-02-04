//JS login system V=3.1.1. If you are a user on this page, you will be banned for web scraping! Please view the repo instead. If you are on a worker version, the repo will be private. You may not view the code. Please view the license before taking any code!

// Hide content right away
document.head.insertAdjacentHTML('beforeend', '<style>body { visibility: hidden !important; }</style>');

// Create persistent loading overlay (stays until final decision)
const loading = document.createElement('div');
loading.id = 'vexa-loading';
Object.assign(loading.style, {
  position: 'fixed',
  inset: '0',
  background: '#0f172a',
  zIndex: '9999',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontFamily: 'system-ui, sans-serif',
  transition: 'opacity 0.7s'
});

loading.innerHTML = `
<div style="font-size:3.5rem; font-weight:bold; margin-bottom:1.8rem;">
Loading VexaCloud...
</div>
<div style="width:90px; height:90px; border:10px solid #334155; border-top:10px solid #60a5fa; border-radius:50%; animation:spin 1.1s linear infinite;"></div>
<style>
@keyframes spin { 0% { transform:rotate(0deg); } 100% { transform:rotate(360deg); } }
</style>
`;
document.documentElement.appendChild(loading);

// Google meta
const meta = document.createElement('meta');
meta.name = 'google-signin-client_id';
meta.content = '1009780597482-i6k7vuq1us9u1oiqenbdklj1hbv711pq.apps.googleusercontent.com';
document.head.appendChild(meta);

// Load Google script
const script = document.createElement('script');
script.src = 'https://accounts.google.com/gsi/client';
script.async = true;
script.defer = true;
script.onload = init;
document.head.appendChild(script);

function init() {
  const access = getCookie('access');

  if (access === 'teacher') {
    if (window.location.pathname.endsWith('/teacher.html')) {
      hideLoading();
    } else {
      window.location.replace('/teacher.html');
    }
    return;
  }
  if (access === 'allowed') {
    afterLoginSuccess();
    return;
  }

  // Show sign-in UI
  loading.innerHTML = `
  <div style="font-size:2.4rem; font-weight:bold; margin-bottom:1.5rem; color:#60a5fa;">
  Sign in with Google
  </div>
  <div id="gbtn" style="background:white; border-radius:10px; padding:24px; box-shadow:0 6px 20px rgba(0,0,0,0.25); min-width:300px; display:flex; justify-content:center;"></div>
  <div style="margin-top:2rem; font-size:1.05rem; opacity:0.8; text-align:center; max-width:380px;">
  Required to access VexaCloud. Please review the license at https://www.mozilla.org/en-US/MPL/2.0/ before entering!
  </div>
  `;

  google.accounts.id.initialize({
    client_id: '1009780597482-i6k7vuq1us9u1oiqenbdklj1hbv711pq.apps.googleusercontent.com',
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

  // Detect popup interactions
  let popupAttempted = false;
  let popupOpened = false;
  let longTimeout;

  document.addEventListener('click', e => {
    if (e.target.closest('#gbtn')) {
      popupAttempted = true;
      popupOpened = false;

      const onBlur = () => {
        popupOpened = true;
      };
      window.addEventListener('blur', onBlur, { once: true });

      const onFocus = () => {
        if (popupOpened && !accessGranted) {
          // Popup closed (cancelled)
          setCookie('access', 'allowed', 365);
          clearTimeout(longTimeout);
          location.reload();
        }
      };
      window.addEventListener('focus', onFocus, { once: true });

      // Short timeout for blocked popup
      setTimeout(() => {
        if (popupAttempted && !popupOpened && !accessGranted) {
          // Popup blocked
          setCookie('access', 'allowed', 365);
          clearTimeout(longTimeout);
          location.reload();
        }
      }, 1000);

      // Long timeout for showing cancelled if still open
      longTimeout = setTimeout(() => {
        if (popupAttempted && popupOpened && !accessGranted) {
          // Show sign-in cancelled
          loading.innerHTML = `
          <div style="font-size:2.8rem; font-weight:bold; color:#ef4444; margin-bottom:1.5rem;">
          Sign-in cancelled
          </div>
          <div style="font-size:1.25rem; text-align:center; max-width:420px;">
          Please reload and complete sign-in.
          </div>
          <button onclick="location.reload()" style="margin-top:1.5rem; padding:12px 32px; background:#3b82f6; color:white; border:none; border-radius:8px; cursor:pointer;">
          Reload
          </button>
          `;
        }
      }, 15000);
    }
  }, { once: true });
}

let accessGranted = false;

function handleResponse(resp) {
  accessGranted = true;

  if (!resp || !resp.credential) {
    // Fallback for other errors
    setCookie('access', 'allowed', 365);
    location.reload();
    return;
  }

  try {
    const payload = JSON.parse(atob(resp.credential.split('.')[1]));
    const email = payload.email?.toLowerCase() || '';

    const teacherEmails = ['specificteacher1@example.com', 'specificteacher2@example.com']; // Add individual emails here

    if (teacherEmails.includes(email) || email.endsWith('@evergreenps.org')) {
      setCookie('access', 'teacher', 365);
      setCookie('email', email, 365);
      window.location.replace('/teacher.html');
    } else {
      setCookie('access', 'allowed', 365);
      setCookie('email', email, 365);
      location.reload();
    }
  } catch {
    setCookie('access', 'allowed', 365);
    location.reload();
  }
}

// ────────────────────────────────────────────────
// Runs after login success (or returning user)
// ────────────────────────────────────────────────
function afterLoginSuccess() {
  // Get or create ID
  let userId = localStorage.getItem('vexaUserId');
  if (!userId) {
    userId = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem('vexaUserId', userId);
  }

  const target = `/${userId}.html`;

  fetch(target, { method: 'HEAD', cache: 'no-store' })
  .then(res => {
    if (res.ok) {
      window.location.replace(target);
    } else {
      hideLoading();
    }
  })
  .catch(() => hideLoading());
}

function hideLoading() {
  loading.style.opacity = '0';
  setTimeout(() => {
    loading.remove();
    document.body.style.visibility = 'visible';
  }, 800);
}

// Cookie helpers
function getCookie(name) {
  const m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : null;
}

function setCookie(name, value, days) {
  let expires = '';
  if (days) {
    const d = new Date();
    d.setTime(d.getTime() + days * 864e5);
    expires = '; expires=' + d.toUTCString();
  }
  document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/; SameSite=Lax';
}
