const TOTAL_STEPS = 10;
let currentStep = 1;
let scoreData = {
    redGreenErrors: 0,
    blueYellowErrors: 0,
    totalErrors: 0
};
let currentQuestionType = ''; 
let correctTargetValue = null; 
let targetDotIndex = null;

// DOM Elementleri
const welcomeScreen = document.getElementById('welcome-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const submitAnswerBtn = document.getElementById('submit-answer-btn');
const answerInput = document.getElementById('answer-input');
const svgContainer = document.getElementById('svg-container');
const stepIndicator = document.getElementById('step-indicator');
const progressFill = document.getElementById('progress-fill');
const questionInstruction = document.getElementById('question-instruction');
const inputSection = document.getElementById('input-section');
const touchInfo = document.getElementById('touch-info');

startBtn.addEventListener('click', startTest);
restartBtn.addEventListener('click', startTest);
submitAnswerBtn.addEventListener('click', handleNumberSubmit);
answerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleNumberSubmit();
});

function startTest() {
    currentStep = 1;
    scoreData = { redGreenErrors: 0, blueYellowErrors: 0, totalErrors: 0 };
    switchScreen(quizScreen);
    loadQuestion();
}

function switchScreen(screen) {
    [welcomeScreen, quizScreen, resultScreen].forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
}

function loadQuestion() {
    stepIndicator.textContent = `Aşama ${currentStep} / ${TOTAL_STEPS}`;
    progressFill.style.width = `${(currentStep / TOTAL_STEPS) * 100}%`;
    answerInput.value = '';

    if (currentStep <= 5) {
        currentQuestionType = 'number';
        questionInstruction.textContent = "Görselin içine gizlenmiş sayıyı giriniz:";
        inputSection.classList.remove('hidden');
        touchInfo.classList.add('hidden');
        
        correctTargetValue = Math.floor(Math.random() * 89) + 11; // 11-99 arası
        generateIshiharaNumberSVG(correctTargetValue, currentStep);
    } else {
        currentQuestionType = 'touch';
        questionInstruction.textContent = "Farklı renkteki şekle / bölgeye ekrandan dokununuz:";
        inputSection.classList.add('hidden');
        touchInfo.classList.remove('hidden');

        generateIshiharaTouchSVG();
    }
}

// Yüksek Kontrastlı Renk Paletleri
function getPalette(step) {
    if (step % 3 === 1) {
        // Kırmızı (Arka plan) - Yeşil (Sayı)
        return {
            bgColors: ['#dc2626', '#ef4444', '#f87171', '#b91c1c'],
            targetColors: ['#16a34a', '#22c55e', '#4ade80', '#15803d']
        };
    } else if (step % 3 === 2) {
        // Mavi (Arka plan) - Turuncu/Sarı (Sayı)
        return {
            bgColors: ['#2563eb', '#3b82f6', '#60a5fa', '#1d4ed8'],
            targetColors: ['#d97706', '#f59e0b', '#fbbf24', '#b45309']
        };
    } else {
        // Mor (Arka plan) - Açık Yeşil (Sayı)
        return {
            bgColors: ['#7e22ce', '#9333ea', '#a855f7', '#6b21a8'],
            targetColors: ['#22c55e', '#4ade80', '#86efac', '#15803d']
        };
    }
}

// 7-Segment Rakam Matris Tanımları (0-9 rakamlarını tam düzgün çizmek için)
const DIGIT_PATTERNS = {
    0: [1,1,1, 1,0,1, 1,0,1, 1,0,1, 1,1,1],
    1: [0,1,0, 0,1,0, 0,1,0, 0,1,0, 0,1,0],
    2: [1,1,1, 0,0,1, 1,1,1, 1,0,0, 1,1,1],
    3: [1,1,1, 0,0,1, 1,1,1, 0,0,1, 1,1,1],
    4: [1,0,1, 1,0,1, 1,1,1, 0,0,1, 0,0,1],
    5: [1,1,1, 1,0,0, 1,1,1, 0,0,1, 1,1,1],
    6: [1,1,1, 1,0,0, 1,1,1, 1,0,1, 1,1,1],
    7: [1,1,1, 0,0,1, 0,0,1, 0,0,1, 0,0,1],
    8: [1,1,1, 1,0,1, 1,1,1, 1,0,1, 1,1,1],
    9: [1,1,1, 1,0,1, 1,1,1, 0,0,1, 1,1,1]
};

// Noktalardan Oluşan Düzgün Sayı Üreticisi
function generateIshiharaNumberSVG(targetNumber, step) {
    const palette = getPalette(step);
    let svgContent = `<svg viewBox="0 0 200 200" width="100%" height="100%">`;
    svgContent += `<circle cx="100" cy="100" r="100" fill="${palette.bgColors[0]}" />`;

    // 1. Düzgün Rakam Noktalarını Oluştur
    const tens = Math.floor(targetNumber / 10);
    const ones = targetNumber % 10;
    
    let numberDots = [];

    function addDigitDots(digit, offsetX) {
        const pattern = DIGIT_PATTERNS[digit];
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 3; col++) {
                if (pattern[row * 3 + col] === 1) {
                    // Her grid karesine 2x2 nokta ekleyerek dolgunlaştır
                    for (let dx = 0; dx < 2; dx++) {
                        for (let dy = 0; dy < 2; dy++) {
                            let cx = offsetX + col * 12 + dx * 6 + (Math.random() * 2 - 1);
                            let cy = 60 + row * 16 + dy * 8 + (Math.random() * 2 - 1);
                            let r = Math.random() * 2 + 5; // Sayı noktaları daha büyük
                            let color = palette.targetColors[Math.floor(Math.random() * palette.targetColors.length)];
                            numberDots.push({ cx, cy, r, color });
                        }
                    }
                }
            }
        }
    }

    addDigitDots(tens, 52);  // Onlar basamağı
    addDigitDots(ones, 110); // Birler basamağı

    // 2. Arka Plan Rastgele Noktaları (Sayının çakışmadığı yerlere)
    let bgDots = [];
    for (let i = 0; i < 220; i++) {
        let cx = Math.random() * 180 + 10;
        let cy = Math.random() * 180 + 10;
        let r = Math.random() * 3 + 3;

        // Daire alanının içinde kal ve rakam noktalarına çok yakın olma
        let distFromCenter = Math.hypot(cx - 100, cy - 100);
        if (distFromCenter < 90) {
            let overlapsNumber = numberDots.some(nd => Math.hypot(nd.cx - cx, nd.cy - cy) < (nd.r + r + 1));
            if (!overlapsNumber) {
                let color = palette.bgColors[Math.floor(Math.random() * palette.bgColors.length)];
                bgDots.push({ cx, cy, r, color });
            }
        }
    }

    // SVG içerisine önce arka plan noktalarını, sonra sayı noktalarını çiz
    bgDots.forEach(d => {
        svgContent += `<circle cx="${d.cx}" cy="${d.cy}" r="${d.r}" fill="${d.color}" />`;
    });
    numberDots.forEach(d => {
        svgContent += `<circle cx="${d.cx}" cy="${d.cy}" r="${d.r}" fill="${d.color}" />`;
    });

    svgContent += `</svg>`;
    svgContainer.innerHTML = svgContent;
}

function generateIshiharaTouchSVG() {
    let svgContent = `<svg viewBox="0 0 200 200" width="100%" height="100%">`;
    svgContent += `<circle cx="100" cy="100" r="100" fill="#374151" />`;

    let dots = [];
    targetDotIndex = Math.floor(Math.random() * 24);

    for (let i = 0; i < 24; i++) {
        let angle = (i / 24) * 2 * Math.PI;
        let distance = 35 + Math.random() * 45;
        let x = 100 + Math.cos(angle) * distance;
        let y = 100 + Math.sin(angle) * distance;
        let r = 13;

        let isTarget = (i === targetDotIndex);
        let color = isTarget ? '#10b981' : '#f59e0b';

        dots.push(`<circle class="touch-dot" data-index="${i}" cx="${x}" cy="${y}" r="${r}" fill="${color}" style="cursor:pointer;" />`);
    }

    svgContent += dots.join('') + `</svg>`;
    svgContainer.innerHTML = svgContent;

    document.querySelectorAll('.touch-dot').forEach(dot => {
        dot.addEventListener('click', (e) => {
            let selectedIndex = parseInt(e.target.getAttribute('data-index'));
            evaluateTouch(selectedIndex === targetDotIndex, currentStep);
        });
    });
}

function handleNumberSubmit() {
    let userVal = parseInt(answerInput.value);
    let isCorrect = (userVal === correctTargetValue);
    
    evaluateAnswer(isCorrect, currentStep);
}

function evaluateAnswer(isCorrect, step) {
    if (!isCorrect) {
        scoreData.totalErrors++;
        if (step % 3 === 1) scoreData.redGreenErrors++;
        else if (step % 3 === 2) scoreData.blueYellowErrors++;
        else scoreData.totalErrors++;
    }
    nextStep();
}

function evaluateTouch(isCorrect, step) {
    if (!isCorrect) {
        scoreData.totalErrors++;
        scoreData.redGreenErrors++;
    }
    nextStep();
}

function nextStep() {
    currentStep++;
    if (currentStep > TOTAL_STEPS) {
        showResults();
    } else {
        loadQuestion();
    }
}

function showResults() {
    switchScreen(resultScreen);

    let summaryText = "";
    let rgPercent = Math.min(100, scoreData.redGreenErrors * 35);
    let byPercent = Math.min(100, scoreData.blueYellowErrors * 35);
    let totalPercent = Math.min(100, scoreData.totalErrors * 20);

    document.getElementById('metric-rg').style.width = `${rgPercent}%`;
    document.getElementById('metric-by').style.width = `${byPercent}%`;
    document.getElementById('metric-total').style.width = `${totalPercent}%`;

    if (scoreData.totalErrors <= 1) {
        summaryText = "Test sonucunuz normal renk görme yeteneğine sahip olduğunuzu göstermektedir.";
    } else if (rgPercent >= byPercent) {
        summaryText = "Analiz sonucunda Kırmızı-Yeşil renk körlüğü (Protan/Deutan) şüphesi tespit edilmiştir.";
    } else {
        summaryText = "Analiz sonucunda Mavi-Sarı renk körlüğü belirtileri görülmüştür.";
    }

    document.getElementById('result-summary').textContent = summaryText;
}