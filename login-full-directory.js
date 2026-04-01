let audioContext;
let currentSource = null;
let fallbackAudio = null;

async function playAlarm() {
    const audioPath = '/images/audio/alarm.mp3';
    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }
        const response = await fetch(audioPath);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        if (currentSource) {
            currentSource.stop();
        }
        const source = audioContext.createBufferSource();
        const gainNode = audioContext.createGain();
        source.buffer = audioBuffer;
        source.loop = true;
        gainNode.gain.value = 3.0;
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
        source.start(0);
        currentSource = source;
    } catch (error) {
        if (!fallbackAudio) {
            fallbackAudio = new Audio(audioPath);
            fallbackAudio.loop = true;
            fallbackAudio.volume = 1.0;
        }
        if (!fallbackAudio.paused) {
            fallbackAudio.pause();
        }
        fallbackAudio.currentTime = 0;
        fallbackAudio.play().catch(err => {
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
    if (fallbackAudio) {
        fallbackAudio.pause();
        fallbackAudio.currentTime = 0;
    }
};
