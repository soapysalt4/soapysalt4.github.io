<script>
document.addEventListener("DOMContentLoaded", () => {
    
    //OsonEsMuySkib, Jamie Hessler, Givini Shmeltser, OsonEsMuySkibCloudflare, Grant Hessler, Oscar Blacksmith, Gram Highskibidi, Arty Faggy, Jordan Es Hammy, Holden Is Blacky, Jaredy Jaspery, tristan is righty, Adrian Skibidi!
    const ADMIN_CODES = new Set(["939168", "199032", "296260", "699119", "796447", "412654", "830912", "685666", "180572", "263879", "152160", "764110", "312208"]);
    const STORAGE_KEY = "positive_verification_rq158zmb7daj7hsfa8";

    if (localStorage.getItem(STORAGE_KEY) === "true") {
        return;
    }

    function initLockdown() {
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
        document.body.style.pointerEvents = "none";

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

        const accent = document.createElement("div");
        accent.style.cssText = `
            position: absolute;
            inset: 0;
            background: linear-gradient(120deg, rgba(255,0,0,0.2), transparent, rgba(255,0,0,0.2));
            animation: sweep 6s linear infinite;
            pointer-events: none;
        `;

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

        const lock = document.createElement("div");
        lock.innerHTML = "&#128274;";
        lock.style.cssText = `
            font-size: 3rem;
            margin-bottom: 12px;
            color: #ff4d4d;
            text-shadow: 0 0 18px rgba(255,0,0,0.7);
        `;

        const title = document.createElement("div");
        title.textContent = "LOCKDOWN";
        title.style.cssText = `
            font-size: 1.9rem;
            letter-spacing: 0.18em;
            margin-bottom: 12px;
        `;

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
            "Website on lockdown",
            "Site will hopefully be back soon",
            "Admin verification required."
        ];
        let idx = 0;
        rotating.textContent = messages[idx];
        setInterval(() => {
            idx = (idx + 1) % messages.length;
            rotating.textContent = messages[idx];
        }, 4000);

        const instruction = document.createElement("div");
        instruction.textContent = "Admins Only";
        instruction.style.cssText = `
            font-size: 0.95rem;
            color: #cccccc;
            margin-bottom: 16px;
        `;

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

        const status = document.createElement("div");
        status.style.cssText = `
            height: 18px;
            font-size: 0.85rem;
            color: #ff6666;
            margin-top: 4px;
        `;

        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                const enteredCode = input.value.trim();

                const currentPath = window.location.pathname;

                let isValid = false;

                if (ADMIN_CODES.has(enteredCode)) {
                    if (currentPath.includes(enteredCode)) {
                        isValid = true;
                    }
                }

                if (isValid) {
                    status.style.color = "#66ff99";
                    status.textContent = "Access granted.";
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
                    status.textContent = enteredCode 
                        ? "Invalid Credentials." 
                        : "Please enter your ID.";
                    input.value = "";
                    panel.style.animation = "shake 0.35s";
                    panel.addEventListener("animationend", () => {
                        panel.style.animation = "";
                    }, { once: true });
                }
            }
        });

        overlay.addEventListener("click", () => input.focus());
        setTimeout(() => input.focus(), 50);

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

    initLockdown();
});
</script>
