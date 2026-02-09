document.addEventListener("DOMContentLoaded", () => {
    const ADMIN_CODES = new Set(["893880", "199032", "296260"]);
    const STORAGE_KEY = "admin_authenticated";  // key we store in localStorage

    // Check if already authenticated
    if (localStorage.getItem(STORAGE_KEY) === "true") {
        // Skip lockdown entirely if previously logged in successfully
        return;
    }

    function initLockdown() {
        // Disable all page interaction
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
        document.body.style.pointerEvents = "none";

        // Create overlay
        const overlay = document.createElement("div");
        overlay.id = "lockdown-overlay";
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: radial-gradient(circle at top, #ff1a1a 0%, #000 60%);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 999999999;
            pointer-events: all;
            font-family: 'Segoe UI', sans-serif;
            color: white;
        `;

        // Panel
        const panel = document.createElement("div");
        panel.style.cssText = `
            background: rgba(0,0,0,0.82);
            border: 1px solid rgba(255,50,50,0.7);
            padding: 40px 50px;
            border-radius: 14px;
            text-align: center;
            box-shadow: 0 0 40px rgba(255,0,0,0.35);
            position: relative;
            overflow: hidden;
            min-width: 340px;
        `;

        // Animated accent
        const accent = document.createElement("div");
        accent.style.cssText = `
            position: absolute;
            inset: 0;
            background: linear-gradient(120deg, rgba(255,0,0,0.2), transparent, rgba(255,0,0,0.2));
            animation: sweep 6s linear infinite;
            pointer-events: none;
        `;

        // Keyframes
        const style = document.createElement("style");
        style.textContent = `
            @keyframes sweep {
                0% { transform: translateX(-40%); }
                100% { transform: translateX(40%); }
            }
            @keyframes fadeText {
                0% { opacity: 0; transform: translateY(4px); }
                15% { opacity: 1; transform: translateY(0); }
                85% { opacity: 1; transform: translateY(0); }
                100% { opacity: 0; transform: translateY(-4px); }
            }
            @keyframes shake {
                0% { transform: translateX(0); }
                20% { transform: translateX(-6px); }
                40% { transform: translateX(6px); }
                60% { transform: translateX(-4px); }
                80% { transform: translateX(4px); }
                100% { transform: translateX(0); }
            }
        `;
        document.head.appendChild(style);

        // Lock icon
        const lock = document.createElement("div");
        lock.innerHTML = "&#128274;";
        lock.style.cssText = `
            font-size: 3rem;
            margin-bottom: 12px;
            color: #ff4d4d;
            text-shadow: 0 0 18px rgba(255,0,0,0.7);
        `;

        // Title
        const title = document.createElement("div");
        title.textContent = "LOCKDOWN ACTIVE";
        title.style.cssText = `
            font-size: 1.9rem;
            letter-spacing: 0.18em;
            margin-bottom: 12px;
        `;

        // Rotating text
        const rotating = document.createElement("div");
        rotating.style.cssText = `
            font-size: 1rem;
            color: #ff9999;
            margin-bottom: 20px;
            min-height: 1.2em;
            animation: fadeText 4s ease-in-out infinite;
        `;
        const messages = [
            "System access restricted.",
            "You will know if you are admin!",
            "All activity is monitored",
            "Admin verification required."
        ];
        let idx = 0;
        rotating.textContent = messages[idx];
        setInterval(() => {
            idx = (idx + 1) % messages.length;
            rotating.textContent = messages[idx];
        }, 4000);

        // Static instruction
        const instruction = document.createElement("div");
        instruction.textContent = "If you are admin, type your ID to enter!";
        instruction.style.cssText = `
            font-size: 0.95rem;
            color: #cccccc;
            margin-bottom: 16px;
        `;

        // Input
        const input = document.createElement("input");
        input.type = "password";
        input.placeholder = "Admin ID";
        input.style.cssText = `
            padding: 12px 16px;
            width: 240px;
            font-size: 1rem;
            border-radius: 6px;
            border: 1px solid rgba(255,80,80,0.9);
            background: #111;
            color: white;
            text-align: center;
            outline: none;
            margin-bottom: 10px;
            box-shadow: 0 0 12px rgba(255,0,0,0.35);
        `;

        // Status
        const status = document.createElement("div");
        status.style.cssText = `
            height: 18px;
            font-size: 0.85rem;
            color: #ff6666;
            margin-top: 4px;
        `;

        // Handle login
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                const code = input.value.trim();
                if (ADMIN_CODES.has(code)) {
                    status.style.color = "#66ff99";
                    status.textContent = "Access granted.";

                    // Remember successful login
                    localStorage.setItem(STORAGE_KEY, "true");

                    overlay.style.transition = "opacity 0.35s ease-out";
                    overlay.style.opacity = "0";
                    setTimeout(() => {
                        overlay.remove();
                        document.documentElement.style.overflow = "";
                        document.body.style.overflow = "";
                        document.body.style.pointerEvents = "";
                    }, 350);
                } else {
                    status.textContent = "Invalid ID.";
                    input.value = "";
                    panel.style.animation = "shake 0.35s";
                    panel.addEventListener("animationend", () => {
                        panel.style.animation = "";
                    }, { once: true });
                }
            }
        });

        // Focus trap
        overlay.addEventListener("click", () => input.focus());
        setTimeout(() => input.focus(), 50);

        // Build DOM
        panel.appendChild(accent);
        panel.appendChild(lock);
        panel.appendChild(title);
        panel.appendChild(rotating);
        panel.appendChild(instruction);
        panel.appendChild(input);
        panel.appendChild(status);
        overlay.appendChild(panel);
        document.body.appendChild(overlay);
    }

    // Start lockdown only if not already authenticated
    initLockdown();
});
