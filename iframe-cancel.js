if (window.top !== window.self) {
  document.body.innerHTML = `
    <style>
      body { background:#f2f2f2; font-family:sans-serif; padding:40px; }
      .error-box {
        background:white; padding:20px; border-radius:8px;
        max-width:600px; margin:auto; border:1px solid #ccc;
      }
      h1 { color:#cc0000; }
    </style>
    <div class="error-box">
      <h1>The connection was reset</h1>
      <p>The connection to the server was reset while the page was loading.</p>
    </div>
  `;
}
