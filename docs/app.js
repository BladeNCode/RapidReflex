// State Variables
let isRunning = false;
let dotsTimer = null;
let wakeLock = null;
let timer = null;
let isDotSoundOn = true;
let isColorSoundOn = true;

// Audio Elements
const dotSound = new Audio('media/dot.mp3');
dotSound.volume = 0.05;

const colorSound = new Audio('media/color.mp3');

// DOM Elements
const startButton = document.getElementById('startButton');
const settingsButton = document.getElementById('settingsButton');
const settingsModal = document.getElementById('settingsModal');
const closeSettings = document.getElementById('closeSettings');
const colorCountInput = document.getElementById('colorCount');
// const dotCountInput = document.getElementById('dotCount');
const showDotsInput = document.getElementById('showDots');
const colorCountValue = document.getElementById('colorCountValue');
const dotCountValue = document.getElementById('dotCountValue');
const rangeMin = document.getElementById('rangeMin');
const rangeMax = document.getElementById('rangeMax');
const minValue = document.getElementById('minValue');
const maxValue = document.getElementById('maxValue');
const messageDiv = document.getElementById('message');
const signDiv = document.getElementById('sign');
const dotSoundCheckbox = document.getElementById('dotSound');
const colorSoundCheckbox = document.getElementById('colorSound');

// Constants
const colors = ['#570408', '#1192e8', '#198038', '#b28600', '#6929c4', '#8a3800', '#ee538b', '#005d5d', '#1192e8', '#fa4d56'];
const signs = ['1','2','3','4','5','6','7','8','9','0'];
//const signs = ['A','B','C','D','E','F','G','H','I','J'];
//const signs = ['↗','↖','↘','↙','♠︎','♥︎','♦︎','♣︎','★','☀︎'];
//const signs = ['♜','♞','✚','☯︎','☀︎','1','2','3','4','5'];

// Utility Functions
const getRandomColorIndex = () => Math.floor(Math.random() * parseInt(colorCountInput.value, 10));

const getRandomInterval = () => {
    const min = parseInt(rangeMin.value, 10) * 1000;
    const max = parseInt(rangeMax.value, 10) * 1000;
    return Math.random() * (max - min) + min;
};

const enableWakeLock = async () => {
    try {
        wakeLock = await navigator.wakeLock.request('screen');
    } catch (err) {
        console.error('Wake Lock failed:', err);
    }
};

const disableWakeLock = () => {
    if (wakeLock) wakeLock.release().then(() => (wakeLock = null));
};

// Core Functions
const showColor = () => {
    const index = getRandomColorIndex();
    document.body.style.backgroundColor = colors[index];
    signDiv.textContent = signs[index];

    if (isColorSoundOn) {
        colorSound.currentTime = 0;
        colorSound.play();
    }

    clearInterval(dotsTimer);

    setTimeout(() => {
        document.body.style.backgroundColor = '#f5f5f5';
        signDiv.textContent = '';
        scheduleNext();
    }, 3000);
};

const showReadyMessage = () => {
    return new Promise((resolve) => {
        messageDiv.textContent = 'Ready...';
        setTimeout(() => {
            messageDiv.textContent = '';
            resolve();
        }, 1500);
    });
};

const showDots = (duration) => {
    const endTime = Date.now() + duration - 400;

    dotsTimer = setInterval(() => {
        if (Date.now() >= endTime || !isRunning) {
            clearInterval(dotsTimer);
            messageDiv.textContent = '';
            return;
        }

        if (showDotsInput.checked) {
            messageDiv.textContent = '◉';
            setTimeout(() => (messageDiv.textContent = ''), 500);
        }

        if (isDotSoundOn) {
            dotSound.currentTime = 0;
            dotSound.play();
        }

    }, 1000);
};

const scheduleNext = () => {
    if (!isRunning) return;

    const nextInterval = getRandomInterval();
    showReadyMessage().then(() => {
        if (!isRunning) return;
        showDots(nextInterval);
        timer = setTimeout(() => {
            if (isRunning) showColor();
        }, nextInterval);
    });
};

const startLoop = () => {
    if (isRunning) return;

    isRunning = true;
    enableWakeLock();
    startButton.textContent = 'Stop';
    startButton.classList.add('transparent');
    settingsButton.classList.add('hidden');
    scheduleNext();
};

const stopLoop = () => {
    isRunning = false;
    disableWakeLock();
    clearTimeout(timer);
    clearInterval(dotsTimer);
    startButton.textContent = 'Start';
    startButton.classList.remove('transparent');
    settingsButton.classList.remove('hidden');
    messageDiv.textContent = '';
    signDiv.textContent = '';
    document.body.style.backgroundColor = '#f5f5f5';
};

// UI and Settings Handlers
const updateRangeBackground = () => {
    const min = parseInt(rangeMin.value, 10);
    const max = parseInt(rangeMax.value, 10);
    const minPercent = ((min - rangeMin.min) * 0.9673 / (rangeMax.max - rangeMin.min)) * 100;
    const maxPercent = ((max - rangeMin.min) / (rangeMax.max - rangeMin.min)) * 100;

    const gradient = `linear-gradient(to right, 
        #ddd ${minPercent}%, 
        #ff4141ff ${minPercent}%, 
        #ff4141ff ${maxPercent}%, 
        #ddd ${maxPercent}%)`;

    if (navigator.userAgent.toLowerCase().includes('firefox')) {
        const style = document.getElementById('rangeStyle') || document.createElement('style');
        style.id = 'rangeStyle';
        style.textContent = `
            input[type="range"][data-gradient="true"]::-moz-range-track {
                background: ${gradient};
                height: 4px;
                border-radius: 4px;
                margin: -9px 0;
            }
        `;
        document.head.appendChild(style);
    } else {
        rangeMin.style.background = gradient;
        rangeMax.style.background = gradient;
    }
};

const syncRanges = () => {
    if (parseInt(rangeMin.value, 10) >= parseInt(rangeMax.value, 10)) {
        rangeMin.value = rangeMax.value;
    }
    if (parseInt(rangeMax.value, 10) <= parseInt(rangeMin.value, 10)) {
        rangeMax.value = rangeMin.value;
    }

    minValue.textContent = rangeMin.value;
    maxValue.textContent = rangeMax.value;
};

// Event Listeners
startButton.addEventListener('click', () => (isRunning ? stopLoop() : startLoop()));
settingsButton.addEventListener('click', () => settingsModal.classList.remove('hidden'));
closeSettings.addEventListener('click', () => settingsModal.classList.add('hidden'));

colorCountInput.addEventListener('input', () => {
    colorCountValue.textContent = colorCountInput.value;
});

// dotCountInput.addEventListener('input', (e) => {
//     dotCountValue.textContent = e.target.value;
// });

dotSoundCheckbox.addEventListener('change', () => {
    isDotSoundOn = dotSoundCheckbox.checked;
});

colorSoundCheckbox.addEventListener('change', () => {
    isColorSoundOn = colorSoundCheckbox.checked;
});

rangeMin.addEventListener('input', syncRanges);
rangeMax.addEventListener('input', syncRanges);
rangeMin.addEventListener('input', updateRangeBackground);
rangeMax.addEventListener('input', updateRangeBackground);

// Initialization
updateRangeBackground();
