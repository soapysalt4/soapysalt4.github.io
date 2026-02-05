// Frame‑busting fallback
if (window.top !== window.self) {
  window.top.location = window.location.href;
}
