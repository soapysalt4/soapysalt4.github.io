let audioContext;
let currentSource = null;

async function playAlarm() {
    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }

        const response = await fetch('/images/audio/alarm.mp4');
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        const source = audioContext.createBufferSource();
        const gainNode = audioContext.createGain();

        source.buffer = audioBuffer;
        source.loop = true;                    

        gainNode.gain.value = 3.0;

        source.connect(gainNode);
        gainNode.connect(audioContext.destination);

        source.start(0);
        currentSource = source;

        console.log('Alarm playing automatically at 1.2 volume');

    } catch (error) {
        console.error('Web Audio API failed, using fallback:', error);
        
        const audio = new Audio('images/audio/alarm.mp3');
        audio.volume = 1.0;    
        audio.loop = true;
        audio.play().catch(err => {
            console.error('Autoplay blocked:', err);
        });
    }
}

playAlarm();

document.addEventListener('click', () => {
    playAlarm();
}, { once: true });

document.addEventListener('keydown', () => {
    playAlarm();
}, { once: true });

window.stopAlarm = function() {
    if (currentSource) {
        currentSource.stop();
        currentSource = null;
    }
    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }
    console.log('Alarm stopped');
};
