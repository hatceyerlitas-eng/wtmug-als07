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
        
        correctTargetValue = Math.floor(Math.random() * 89) + 11; 
        generateIshiharaNumberSVG(correctTargetValue, currentStep);
    } else {
        currentQuestionType = 'touch';
        questionInstruction.textContent = "Farklı renkteki şekle / bölgeye ekrandan dokununuz:";
        inputSection.classList.add('hidden');
        touchInfo.classList.remove('hidden');

        generateIshiharaTouchSVG();
    }
}

// Gerçek Ishihara Renk Tonları (Ton farkıyla ayırt edilen paletler)
function getPalette(step) {
    if (step % 3 === 1) {
        // Kırmızı-Yeşil Ishihara Tonları (Protan/Deutan testi)
        return {
            bgColors: ['#b91c1c', '#dc2626', '#ef4444', '#991b1b', '#f87171'], 
            targetColors: ['#15803d', '#16a34a', '#22c55e', '#166534', '#4ade80'] 
        };
    } else if (step % 3 === 2) {
        // Mavi-Turuncu Ishihara Tonları (Tritan testi)
        return {
            bgColors: ['#1d4ed8', '#2563eb', '#3b82f6', '#1e40af', '#60a5fa'], 
            targetColors: ['#c2410c', '#ea580c', '#f97316', '#9a3412', '#fb923c'] 
        };
    } else {
        // Kahverengi-Yeşil Klasik Ishihara Tonları
        return {
            bgColors: ['#854d0e', '#a16207', '#ca8a04', '#713f12'],
            targetColors: ['#15803d', '#16a34a', '#22c55e', '#14532d']
        };
    }
}

// Gerçekçi Ishihara Sayı Maskesi (Organik ve Dağınık Nokta Dağılımı)
function generateIshiharaNumberSVG(targetNumber, step) {
    const palette = getPalette(step);
    let svgContent = `<svg viewBox="0 0 200 200" width="100%" height="100%" style="border-radius: 50%;">`;
    
    // Zemin ana rengi
    svgContent += `<circle cx="100" cy="100" r="100" fill="${palette.bgColors[0]}" />`;

    // Sayıyı oluşturan hatları matematiksel eğrilerle (koordinat bölgeleriyle) simüle edelim
    const tens = Math.floor(targetNumber / 10);
    const ones = targetNumber % 10;

    // Noktaları tutacak dizi
    let dots = [];
    let totalDots = 280; // Yoğun ama mobilde okunabilir miktar

    for (let i = 0; i < totalDots; i++) {
        let x = Math.random() * 170 + 15;
        let y = Math.random() * 170 + 15;
        let r = Math.random() * 4.5 + 3.5; // Farklı boyutlarda doğal daireler

        let distFromCenter = Math.hypot(x - 100, y - 100);
        if (distFromCenter > 92) continue; // Daire dışına taşmayı önle

        // Sayı bölgesi kontrolü (Onlar ve Birler basamağının kaba koordinat kalıpları)
        let isTensArea = (x > 50 && x < 95 && y > 50 && y < 150 && !(tens === 1 && x > 75));
        let isOnesArea = (x > 105 && x < 150 && y > 50 && y < 150 && !(ones === 1 && x > 130));
        
        // Rakamların tipine göre iç boşluk maskeleri (Örn: 0, 4, 6, 8, 9 için orta boşluk)
        let inTensHole = (tens !== 1 && x > 62 && x < 83 && y > 80 && y < 120);
        let inOnesHole = (ones !== 1 && x > 117 && x < 138 && y > 80 && y < 120);

        let isNumberShape = (isTensArea && !inTensHole) || (isOnesArea && !inOnesHole);

        // Doğal Ishihara dokusu için hafif rastgelelik ve geçişler katalım
        if (Math.random() < 0.12) isNumberShape = !isNumberShape; 

        let colorPalette = isNumberShape ? palette.targetColors : palette.bgColors;
        let color = colorPalette[Math.floor(Math.random() * colorPalette.length)];

        dots.push({ x, y, r, color });
    }

    dots.forEach(d => {
        svgContent += `<circle cx="${d.x}" cy="${d.y}" r="${d.r}" fill="${d.color}" />`;
    });

    svgContent += `</svg>`;
    svgContainer.innerHTML = svgContent;
}

function generateIshiharaTouchSVG() {
    let svgContent = `<svg viewBox="0 0 200 200" width="100%" height="100%" style="border-radius: 50%;">`;
    svgContent += `<circle cx="100" cy="100" r="100" fill="#713f12" />`;

    let dots = [];
    targetDotIndex = Math.floor(Math.random() * 22);

    for (let i = 0; i < 22; i++) {
        let angle = (i / 22) * 2 * Math.PI;
        let distance = 35 + Math.random() * 45;
        let x = 100 + Math.cos(angle) * distance;
        let y = 100 + Math.sin(angle) * distance;
        let r = 14 + Math.random() * 4;

        let isTarget = (i === targetDotIndex);
        let color = isTarget ? '#16a34a' : '#ca8a04'; // Doğru alan hafif ton farkıyla gizlendi

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
        summaryText = "Analiz sonucunda Kırmızı-Yeşil renk körlüğü şüphesi tespit edilmiştir.";
    } else {
        summaryText = "Analiz sonucunda Mavi-Sarı renk körlüğü belirtileri görülmüştür.";
    }

    document.getElementById('result-summary').textContent = summaryText;
}