const TOTAL_STEPS = 10;
let currentStep = 1;
let scoreData = {
    redGreenErrors: 0,
    blueYellowErrors: 0,
    totalErrors: 0
};
let currentQuestionType = ''; // 'number' veya 'touch'
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

    // İlk 5 aşama sayı girişi, son 5 aşama dokunma/şekil bulma (veya karma)
    // Gereksinim: "Testin 5 aşamasında farklı renkteki alana dokunma, kalan 5 aşamasında sayı yazma"
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

// Renk Paleti Algoritmaları (Kırmızı-Yeşil, Mavi-Sarı, Tam Körlük simülasyonları için paletler)
function getPalette(step) {
    if (step % 3 === 1) {
        // Kırmızı - Yeşil Palet Simülasyonu (Protan/Deutan)
        return {
            bgColors: ['#7c2d12', '#9a3412', '#c2410c', '#ea580c', '#f97316', '#fbbf24', '#fde047'],
            targetColors: ['#15803d', '#16a34a', '#22c55e', '#4ade80']
        };
    } else if (step % 3 === 2) {
        // Mavi - Sarı Palet Simülasyonu (Tritan)
        return {
            bgColors: ['#0369a1', '#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc'],
            targetColors: ['#b45309', '#d97706', '#f59e0b', '#fbbf24']
        };
    } else {
        // Genel / Karışık Palet
        return {
            bgColors: ['#4b5563', '#6b7280', '#9ca3af', '#d1d5db'],
            targetColors: ['#be123c', '#e11d48', '#f43f5e']
        };
    }
}

function generateIshiharaNumberSVG(targetNumber, step) {
    const palette = getPalette(step);
    let svgContent = `<svg viewBox="0 0 200 200" width="100%" height="100%">`;
    svgContent += `<circle cx="100" cy="100" r="100" fill="${palette.bgColors[0]}" />`;

    let dots = [];
    // Rastgele noktacıklar üret (Arka plan ve gizli sayı matrisi)
    for (let i = 0; i < 350; i++) {
        let x = Math.random() * 180 + 10;
        let y = Math.random() * 180 + 10;
        let r = Math.random() * 4 + 3;
        
        // Basit bir merkez mesafe kontrolü ile sayı görünümü simülasyonu
        let distToCenter = Math.hypot(x - 100, y - 100);
        let isInsideNumberArea = distToCenter < 45 && (i % 2 === 0);

        let color = isInsideNumberArea 
            ? palette.targetColors[Math.floor(Math.random() * palette.targetColors.length)]
            : palette.bgColors[Math.floor(Math.random() * palette.bgColors.length)];

        dots.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" />`);
    }

    svgContent += dots.join('') + `</svg>`;
    svgContainer.innerHTML = svgContent;
}

function generateIshiharaTouchSVG() {
    let svgContent = `<svg viewBox="0 0 200 200" width="100%" height="100%">`;
    svgContent += `<circle cx="100" cy="100" r="100" fill="#78716c" />`;

    let dots = [];
    targetDotIndex = Math.floor(Math.random() * 40); // Rastgele doğru nokta

    for (let i = 0; i < 40; i++) {
        let angle = (i / 40) * 2 * Math.PI;
        let distance = 40 + Math.random() * 30;
        let x = 100 + Math.cos(angle) * distance;
        let y = 100 + Math.sin(angle) * distance;
        let r = 12;

        let isTarget = (i === targetDotIndex);
        let color = isTarget ? '#10b981' : '#b45309'; // Doğru nokta yeşilimsi, diğerleri kahverengi

        dots.push(`<circle class="touch-dot" data-index="${i}" cx="${x}" cy="${y}" r="${r}" fill="${color}" style="cursor:pointer;" />`);
    }

    svgContent += dots.join('') + `</svg>`;
    svgContainer.innerHTML = svgContent;

    // Dokunma olaylarını dinle
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
        summaryText = "Test sonucunuz normal renk görme yeteneğine sahip olduğunuzu göstermektedir. Herhangi bir renk körlüğü belirtisine rastlanmamıştır.";
    } else if (rgPercent >= byPercent) {
        summaryText = "Analiz sonucunda Kırmızı-Yeşil renk körlüğü (Protan/Deutan) şüphesi tespit edilmiştir. Kesin teşhis için bir göz hastalıkları uzmanına başvurmanız önerilir.";
    } else {
        summaryText = "Analiz sonucunda Mavi-Sarı renk körlüğü veya genel renk algı farkı belirtileri görülmüştür.";
    }

    document.getElementById('result-summary').textContent = summaryText;
}