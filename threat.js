(function () {
    function createSnowflake(layerConfig, layerIndex) {
        const flake = document.createElement("div");
        flake.className = "snowflake layer-" + layerIndex;

        const size = Math.random() * (layerConfig.maxSize - layerConfig.minSize) + layerConfig.minSize;
        flake.style.width = size + "px";
        flake.style.height = size + "px";

        flake.style.left = Math.random() * 100 + "vw";
        flake.style.animationDuration = 
            (Math.random() * (layerConfig.maxSpeed - layerConfig.minSpeed) + layerConfig.minSpeed) + "s";
        flake.style.opacity = layerConfig.opacity;

        return flake;
    }

    function injectStyles() {
        if (document.getElementById("snowfall-styles")) return;

        const style = document.createElement("style");
        style.id = "snowfall-styles";
        style.textContent = `
            .snowflake {
                position: fixed;
                top: -10px;
                background: white;
                border-radius: 50%;
                pointer-events: none;
                animation-name: fall;
                animation-timing-function: linear;
                animation-iteration-count: infinite;
            }

            @keyframes fall {
                0% { transform: translateY(0); }
                100% { transform: translateY(110vh); }
            }
        `;
        document.head.appendChild(style);
    }

    window.startSnowfall = function (config = {}) {
        injectStyles();

        const layers = config.layers || 5000;
        const flakesPerLayer = config.flakesPerLayer || 1000;

        const defaultLayerConfig = {
            minSize: 2,
            maxSize: 6,
            minSpeed: 6,
            maxSpeed: 12,
            opacity: 0.8
        };

        const layerSettings = config.layerSettings || {};

        for (let i = 0; i < layers; i++) {
            const layerConfig = { ...defaultLayerConfig, ...(layerSettings[i] || {}) };

            for (let j = 0; j < flakesPerLayer; j++) {
                const flake = createSnowflake(layerConfig, i);
                document.body.appendChild(flake);
            }
        }
    };
})();
