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

// Daha belirgin ve okunabilir renk paletleri
function getPalette(step) {
    if (step % 3 === 1) {
        // Kırmızı-Yeşil Kontrastı Artırıldı
        return {
            bgColors: ['#b91c1c', '#dc2626', '#ef4444', '#f87171'], // Canlı Kırmızı Tonları
            targetColors: ['#047857', '#059669', '#10b981', '#34d399'] // Canlı Yeşil Tonları
        };
    } else if (step % 3 === 2) {
        // Mavi-Sarı Kontrastı Artırıldı
        return {
            bgColors: ['#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa'], // Canlı Mavi Tonları
            targetColors: ['#b45309', '#d97706', '#f59e0b', '#fbbf24'] // Canlı Sarı/Turuncu Tonları
        };
    } else {
        // Mor-Yeşil Kontrastı
        return {
            bgColors: ['#6b21a8', '#7e22ce', '#9333ea', '#a855f7'],
            targetColors: ['#15803d', '#16a34a', '#22c55e']
        };
    }
}

// Okunabilirliği artırılmış SVG sayı üreticisi (Matematiksel font simülasyonu)
function generateIshiharaNumberSVG(targetNumber, step) {
    const palette = getPalette(step);
    let svgContent = `<svg viewBox="0 0 200 200" width="100%" height="100%">`;
    svgContent += `<circle cx="100" cy="100" r="100" fill="${palette.bgColors[0]}" />`;

    // Sayıyı oluşturan koordinat kalıpları (Örn: 10-99 arası rakamların hatları)
    let dots = [];
    
    // Arka planı dolduran rastgele noktalar
    for (let i = 0; i < 250; i++) {
        let x = Math.random() * 180 + 10;
        let y = Math.random() * 180 + 10;
        let r = Math.random() * 5 + 4; // Daha büyük noktalar
        let color = palette.bgColors[Math.floor(Math.random() * palette.bgColors.length)];
        
        dots.push({x, y, r, color, isTarget: false});
    }

    // Hedef sayıyı net belirten şekil matrisi (Merkezde konumlandırılmış metin alanı)
    // Sayının okunabilmesi için SVG içerisine <text> ekleyip etrafını net noktalarla sarıyoruz
    svgContent += `<g>`;
    // Arka plan noktalarını bas
    dots.forEach(d => {
        svgContent += `<circle cx="${d.x}" cy="${d.y}" r="${d.r}" fill="${d.color}" />`;
    });

    // Sayıyı oluşturan net hedef noktalar (Merkez bölgede 2 haneli sayı)
    let tens = Math.floor(targetNumber / 10);
    let ones = targetNumber % 10;

    svgContent += `<text x="100" y="130" font-size="95" font-weight="900" font-family="Arial, sans-serif" text-anchor="middle" fill="${palette.targetColors[0]}" opacity="0.95">${targetNumber}</text>`;
    
    // Sayının okunmasını Ishihara tarzında zorlaştırmak ama okunabilir kılmak için hafif maskeleme benekleri
    for (let j = 0; j < 40; j++) {
        let rx = 60 + Math.random() * 80;
        let ry = 70 + Math.random() * 60;
        let rr = Math.random() * 3 + 2;
        svgContent += `<circle cx="${rx}" cy="${ry}" r="${rr}" fill="${palette.bgColors[1]}" opacity="0.6" />`;
    }

    svgContent += `</g></svg>`;
    svgContainer.innerHTML = svgContent;
}

function generateIshiharaTouchSVG() {
    let svgContent = `<svg viewBox="0 0 200 200" width="100%" height="100%">`;
    svgContent += `<circle cx="100" cy="100" r="100" fill="#4b5563" />`;

    let dots = [];
    targetDotIndex = Math.floor(Math.random() * 30);

    for (let i = 0; i < 30; i++) {
        let angle = (i / 30) * 2 * Math.PI;
        let distance = 35 + Math.random() * 40;
        let x = 100 + Math.cos(angle) * distance;
        let y = 100 + Math.sin(angle) * distance;
        let r = 14;

        let isTarget = (i === targetDotIndex);
        let color = isTarget ? '#34d399' : '#b45309';

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