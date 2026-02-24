(function() {
  let iframed = false;
  try {
    iframed = window.top !== window.self;
  } catch (e) {
    iframed = true;
  }

  let allowFromAboutBlank = false;

  try {
    const isAboutBlank = document.referrer === "";

    const hasOpener = !!window.opener;

    let openerOrigin = null;
    if (hasOpener) {
      try {
        openerOrigin = window.opener.location.origin;
      } catch (e) {
        openerOrigin = null;
      }
    }

    const trustedOrigins = [
      "https://vexacloud.github.io",
      "https://vexacloud.orson-sander.workers.dev"
    ];

    if (isAboutBlank && hasOpener && trustedOrigins.includes(openerOrigin)) {
      allowFromAboutBlank = true;
    }
  } catch (e) {
    allowFromAboutBlank = false;
  }

  if (iframed && allowFromAboutBlank) return;

  if (!iframed) return;

  const overlay = document.createElement("div");
  overlay.id = "anti-iframe-overlay";
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.background = "linear-gradient(135deg, #001a33, #003366)";
  overlay.style.display = "flex";
  overlay.style.flexDirection = "column";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.zIndex = "999999999";
  overlay.style.color = "white";
  overlay.style.fontFamily = "Arial, sans-serif";
  overlay.style.textAlign = "center";
  overlay.style.padding = "20px";
  overlay.style.boxSizing = "border-box";

  const title = document.createElement("div");
  title.textContent = "ACCESS BLOCKED";
  title.style.fontSize = "3rem";
  title.style.fontWeight = "bold";
  title.style.marginBottom = "20px";
  title.style.letterSpacing = "2px";

  const subtitle = document.createElement("div");
  subtitle.textContent = "Please go to VexaCloud.github.io to access this website!";
  subtitle.style.fontSize = "1.5rem";
  subtitle.style.opacity = "0.85";

  overlay.appendChild(title);
  overlay.appendChild(subtitle);

  document.documentElement.appendChild(overlay);

  overlay.animate(
    [
      { opacity: 0 },
      { opacity: 1 }
    ],
    {
      duration: 400,
      easing: "ease-out",
      fill: "forwards"
    }
  );
})();
