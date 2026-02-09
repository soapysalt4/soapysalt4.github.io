// ===============================
// Lockdown Overlay Script
// ===============================

// Easily add/remove admin codes here
const ADMIN_CODES = new Set(["893880", "199032"]);

// Create overlay container
const overlay = document.createElement("div");
overlay.id = "lockdown-overlay";
overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(10, 10, 15, 0.96);
    backdrop-filter: blur(6px);
    color: #e6e6e6;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 999999;
    font-family: 'Segoe UI', sans-serif;
`;

// Title
const title = document.createElement("h1");
title.textContent = "Only admins have access to this site";
title.style.cssText = `
    font-size: 3rem;
    letter-spacing: 3px;
    margin-bottom: 20px;
    color: #4da6ff;
`;

// Subtitle
const subtitle = document.createElement("p");
subtitle.textContent = "If you are admin, type your ID to enter.";
subtitle.style.cssText = `
    font-size: 1.2rem;
    opacity: 0.8;
    margin-bottom: 30px;
`;

// Input
const input = document.createElement("input");
input.type = "password";
input.placeholder = "Admin ID";
input.style.cssText = `
    padding: 12px 18px;
    font-size: 1.1rem;
    border-radius: 6px;
    border: 1px solid #4da6ff;
    background: #0f0f15;
    color: #e6e6e6;
    outline: none;
    width: 260px;
    text-align: center;
    margin-bottom: 15px;
`;

// Status text
const status = document.createElement("div");
status.style.cssText = `
    height: 20px;
    font-size: 0.95rem;
    color: #ff4d4d;
    margin-top: 5px;
`;

// Handle login attempt
input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        const code = input.value.trim();
        if (ADMIN_CODES.has(code)) {
            overlay.style.opacity = "0";
            setTimeout(() => overlay.remove(), 300);
        } else {
            status.textContent = "Invalid ID";
            input.value = "";
        }
    }
});

// Assemble overlay
overlay.appendChild(title);
overlay.appendChild(subtitle);
overlay.appendChild(input);
overlay.appendChild(status);

document.body.appendChild(overlay);
