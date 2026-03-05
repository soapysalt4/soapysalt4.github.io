<script>
(function() {
    'use strict';
    let isAllowed = false;
    const referrer = document.referrer;
    if (referrer) {
        try {
            const url = new URL(referrer);
            if (url.hostname === 'vexacloud.github.io') {
                isAllowed = true;
            }
        } catch (e) {}
    }
    if (!isAllowed) {
        const blockHTML = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Access Blocked</title>
    <style>
        html, body {
            margin: 0;
            padding: 0;
            height: 100%;
            overflow: hidden;
            background: #001f3f;
            color: #ffffff;
            font-family: Arial, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        #block-screen {
            text-align: center;
            max-width: 500px;
        }
        #block-screen h1 {
            font-size: 3rem;
            margin-bottom: 30px;
        }
        #block-screen p {
            font-size: 1.4rem;
            margin: 15px 0;
        }
        #block-screen a {
            color: #4da6ff;
            text-decoration: none;
        }
        #block-screen a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div id="block-screen">
        <h1>ACCESS BLOCKED</h1>
        <p>Please go to</p>
        <p><a href="https://vexacloud.github.io" target="_blank" rel="noopener">vexacloud.github.io</a></p>
    </div>
</body>
</html>`;
        document.documentElement.innerHTML = blockHTML;
        window.__sveltekit_1mwzs34 = null;
        window.stop();
        return;
    }
})();
</script>
