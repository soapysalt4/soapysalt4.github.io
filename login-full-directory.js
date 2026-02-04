// login-main-directory.js - Cleaned & Fixed Version

// Safety: Force show page after 10 seconds no matter what
setTimeout(() => {
  document.getElementById('vexa-loading')?.remove();
  document.documentElement.style.visibility = 'visible';
  document.body.style.visibility = 'visible';
}, 10000);

// Create Loading Screen
const loading = document.createElement('div');
loading.id = 'vexa-loading';
loading.style.cssText = `
  position: fixed; inset: 0; z-index: 9999;
  background: #0f172a; color: white;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  font-family: system-ui, sans-serif;
`;
loading.innerHTML = `
  <div style="font-size: 3.2rem; font-weight: bold; margin-bottom: 2rem;">Loading VexaCloud...</div>
  <div style="width: 80px; height: 80px; border: 8px solid #334155; border-top: 8px solid #60a5fa; border-radius: 50%; animation: spin 1s linear infinite;"></div>
  <style>@keyframes spin {0% {transform: rotate(0deg);} 100% {transform: rotate(360deg);}}</style>
`;
document.documentElement.appendChild(loading);

document.documentElement.style.visibility = 'hidden';

// Google Sign-In Setup
const meta = document.createElement('meta');
meta.name = 'google-signin-client_id';
meta.content = '679269140652-7d1pivqd4d269g1d0fmlivhqebnd2grt.apps.googleusercontent.com';
document.head.appendChild(meta);

const script = document.createElement('script');
script.src = 'https://accounts.google.com/gsi/client';
script.async = true;
script.defer = true;
script.onload = init;
document.head.appendChild(script);

function init() {
  const access = getCookie('access');

  if (access === 'teacher') {
    window.location.replace('/teacher.html');
    return;
  }
  if (access === 'allowed') {
    finishLogin();
    return;
  }

  // Show Google Sign In Button
  loading.innerHTML = `
    <div style="font-size:2.3rem; font-weight:bold; margin-bottom:1.5rem; color:#60a5fa;">
      Sign in with Google
    </div>
    <div id="gbtn" style="background:white; padding:24px; border-radius:12px; box-shadow:0 6px 20px rgba(0,0,0,0.3);"></div>
  `;

  google.accounts.id.initialize({
    client_id: '679269140652-7d1pivqd4d269g1d0fmlivhqebnd2grt.apps.googleusercontent.com',
    callback: handleResponse,
    ux_mode: 'popup'
  });

  google.accounts.id.renderButton(document.getElementById('gbtn'), {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    text: 'signin_with',
    width: 340
  });
}

function handleResponse(response) {
  if (!response?.credential) {
    setCookie('access', 'allowed', 365);
    finishLogin();
    return;
  }

  try {
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    const email = payload.email?.toLowerCase() || '';

    if (email.endsWith('@evergreenps.org')) {
      setCookie('access', 'teacher', 365);
      window.location.replace('/teacher.html');
    } else {
      setCookie('access', 'allowed', 365);
      finishLogin();
    }
  } catch (e) {
    setCookie('access', 'allowed', 365);
    finishLogin();
  }
}

function finishLogin() {
  const loadingEl = document.getElementById('vexa-loading');
  if (loadingEl) {
    loadingEl.style.opacity = '0';
    setTimeout(() => {
      loadingEl.remove();
      document.documentElement.style.visibility = 'visible';
      document.body.style.visibility = 'visible';
    }, 600);
  }
}

// Cookie Functions
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name, value, days) {
  const date = new Date();
  date.setTime(date.getTime() + days * 86400000);
  document.cookie = name + "=" + encodeURIComponent(value) + ";expires=" + date.toUTCString() + ";path=/";
}
