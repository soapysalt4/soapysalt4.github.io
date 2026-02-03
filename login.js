const hideStyle = document.createElement('style');
hideStyle.textContent = 'body { visibility: hidden; }';
document.head.appendChild(hideStyle);

const overlay = document.createElement('div');
overlay.id = 'auth-overlay';
Object.assign(overlay.style, {
  position: 'fixed',
  inset: '0',
  background: '#f0f2f5',
  zIndex: '999999',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  fontFamily: 'system-ui, sans-serif',
  color: '#333',
  transition: 'opacity 0.4s'
});

overlay.innerHTML = `
  <div style="font-size: 2.2rem; font-weight: 600; margin-bottom: 1.5rem;">
    Loading...
  </div>
  <div style="font-size: 1.1rem; opacity: 0.7; max-width: 320px; text-align: center;">
    Please wait while we prepare the sign-in screen
  </div>
`;

document.documentElement.appendChild(overlay);

const meta = document.createElement('meta');
meta.name = 'google-signin-client_id';
meta.content = '679269140652-7d1pivqd4d269g1d0fmlivhqebnd2grt.apps.googleusercontent.com';
document.head.appendChild(meta);

const script = document.createElement('script');
script.src = 'https://accounts.google.com/gsi/client';
script.async = true;
script.defer = true;
script.onload = initializeGoogleSignIn;
document.head.appendChild(script);

setTimeout(() => {
  if (!window.google?.accounts) {
    overlay.innerHTML = `
      <div style="font-size: 1.8rem; color: #d32f2f; margin-bottom: 1.5rem;">
        Failed to load Google Sign-In
      </div>
      <div style="font-size: 1.1rem; max-width: 360px; text-align: center; line-height: 1.5;">
        Please check your internet connection and
        <button onclick="location.reload()" style="margin:0 4px; padding:6px 14px; background:#1976d2; color:white; border:none; border-radius:6px; cursor:pointer;">
          Reload page
        </button>
      </div>
    `;
  }
}, 12000);

function initializeGoogleSignIn() {
  // Wait a tiny bit to make sure gsi/client is fully ready
  setTimeout(() => {
    if (!window.google?.accounts?.id) {
      showError("Google Sign-In library did not initialize properly.");
      return;
    }

    checkForExistingSession();
  }, 400);
}

function checkForExistingSession() {
  // Check our own cookie first (faster than google callback)
  const access = getCookie('access');
  if (access === 'teacher') {
    window.location.replace('teacher.html');
    return;
  }
  if (access === 'allowed') {
    showGameAccess();
    return;
  }

  // No valid cookie → show sign-in button
  showGoogleSignInButton();
}

function showGoogleSignInButton() {
  overlay.innerHTML = `
    <div style="font-size: 2rem; font-weight: 600; margin-bottom: 2rem; color: #1a73e8;">
      Sign in to continue
    </div>
    <div id="google-signin-button" style="margin: 1.5rem 0;"></div>
    <div style="font-size: 1rem; opacity: 0.65; margin-top: 1.5rem; max-width: 340px; text-align: center;">
      You need a Google account to access this site.
    </div>
  `;

  google.accounts.id.initialize({
    client_id: '679269140652-7d1pivqd4d269g1d0fmlivhqebnd2grt.apps.googleusercontent.com',
    callback: handleGoogleSignIn,
    auto_select: false,
    cancel_on_tap_outside: false   // important: we want to detect cancel
  });

  google.accounts.id.renderButton(
    document.getElementById('google-signin-button'),
    {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: 280
    }
  );

  // Google doesn't give perfect "cancel" event, but we can detect popup close
  // by watching if prompt() was called but no callback happened
  google.accounts.id.prompt(notification => {
    if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
      // User closed / dismissed the one-tap prompt or popup
      setTimeout(() => {
        // Only show message if still on this screen (no redirect happened)
        if (document.getElementById('auth-overlay')) {
          showCancelledMessage();
        }
      }, 800);
    }
  });
}

function handleGoogleSignIn(response) {
  if (!response.credential) {
    showCancelledMessage();
    return;
  }

  // Decode JWT (credential is base64 encoded ID token)
  const payload = JSON.parse(atob(response.credential.split('.')[1]));
  const email = payload.email;

  if (!email) {
    alert("Could not retrieve email from Google account.");
    showCancelledMessage();
    return;
  }

  if (email.endsWith('@evergreenps.org')) {
    setCookie('access', 'teacher', 365);
    setCookie('email', email, 365);
    window.location.replace('teacher.html');
  } else {
    setCookie('access', 'allowed', 365);
    setCookie('email', email, 365);
    showGameAccess();
  }
}

function showGameAccess() {
  overlay.innerHTML = `
    <div style="font-size: 2.2rem; font-weight: bold; color: #2e7d32; margin-bottom: 1.5rem;">
      Access Granted
    </div>
    <div style="font-size: 1.15rem; max-width: 400px; text-align: center; line-height: 1.5;">
      You are allowed into the game site
    </div>
  `;

  setTimeout(() => {
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.remove();
      document.body.style.visibility = 'visible';
    }, 500);
  }, 1400);
}

function showCancelledMessage() {
  overlay.innerHTML = `
    <div style="font-size: 1.9rem; color: #d32f2f; margin-bottom: 1.8rem; text-align: center;">
      Sign-in was cancelled
    </div>
    <div style="font-size: 1.15rem; max-width: 380px; text-align: center; line-height: 1.6; margin-bottom: 2rem;">
      Please reload the page and sign in with Google to continue.
    </div>
    <button onclick="location.reload()" style="
      padding: 12px 28px;
      font-size: 1.1rem;
      background: #1976d2;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
    ">
      Reload Page
    </button>
  `;
}

function showError(msg) {
  overlay.innerHTML = `
    <div style="font-size: 1.8rem; color: #c62828; margin-bottom: 1.5rem;">
      Error
    </div>
    <div style="font-size: 1.1rem; max-width: 360px; text-align: center; line-height: 1.5;">
      ${msg}<br><br>
      <button onclick="location.reload()" style="padding:8px 18px; background:#1976d2; color:white; border:none; border-radius:6px; cursor:pointer;">
        Reload
      </button>
    </div>
  `;
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
