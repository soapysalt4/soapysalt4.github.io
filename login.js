document.head.insertAdjacentHTML('beforeend', '<style id="vexa-hide-body">body { visibility: hidden !important; }</style>');

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

const meta = document.createElement('meta');
meta.name = 'google-signin-client_id';
meta.content = '1009780597482-i6k7vuq1us9u1oiqenbdklj1hbv711pq.apps.googleusercontent.com';
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

  loading.innerHTML = `
  <div style="font-size:2.4rem; font-weight:bold; margin-bottom:1.5rem; color:#60a5fa;">
  Sign in with Google
  </div>
  <div id="gbtn" style="background:white; border-radius:10px; padding:24px; box-shadow:0 6px 20px rgba(0,0,0,0.25); min-width:300px; display:flex; justify-content:center;"></div>
  <div style="margin-top:2rem; font-size:1.05rem; opacity:0.8; text-align:center; max-width:380px;">
  Required to access VexaCloud. Please review the Terms of Service before entering: evergreen-ps.github.io/vexacloud-terms! A link to the license is included in the terms of service!
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

  let popupAttempted = false;
  let cancelTimeout;

  document.addEventListener('click', e => {
    if (!e.target.closest('#gbtn')) return;

    popupAttempted = true;

    cancelTimeout = setTimeout(() => {
      if (popupAttempted && !accessGranted) {
        setCookie('access', 'allowed', 365);
        afterLoginSuccess();
      }
    }, 4000);

  }, { once: true });
}

let accessGranted = false;

function handleResponse(resp) {
  accessGranted = true;
  clearTimeout(cancelTimeout);

  if (!resp || !resp.credential) {
    setCookie('access', 'allowed', 365);
    afterLoginSuccess();
    return;
  }

  try {
    const payload = JSON.parse(atob(resp.credential.split('.')[1]));
    const email = payload.email?.toLowerCase() || '';

    const teacherEmails = ['specificteacher1@example.com', 'specificteacher2@example.com'];

    if (teacherEmails.includes(email) || email.endsWith('@evergreenps.org')) {
      setCookie('access', 'teacher', 365);
      setCookie('email', email, 365);
      window.location.replace('/teacher.html');
    } else {
      setCookie('access', 'allowed', 365);
      setCookie('email', email, 365);
      afterLoginSuccess();
    }
  } catch (err) {
    // Invalid token → still allow (fail-open)
    setCookie('access', 'allowed', 365);
    afterLoginSuccess();
  }
}

function afterLoginSuccess() {
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
  const hideStyle = document.getElementById('vexa-hide-body');
  if (hideStyle) hideStyle.remove();

  loading.style.opacity = '0';
  setTimeout(() => loading.remove(), 800);
}

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
