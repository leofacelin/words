// === 状态管理 ===
// 确保 unit1_data 和 unit2_data 已经在 HTML 中加载
const allUnits = {
    1: typeof unit1_data !== 'undefined' ? unit1_data : [],
    2: typeof unit2_data !== 'undefined' ? unit2_data : [],
    3: typeof unit3_data !== 'undefined' ? unit3_data : [],
    4: typeof unit4_data !== 'undefined' ? unit4_data : [],
    5: typeof unit5_data !== 'undefined' ? unit5_data : [],
    6: typeof unit6_data !== 'undefined' ? unit6_data : [],
    7: typeof unit7_data !== 'undefined' ? unit7_data : []
};

let currentUnit = allUnits[1]; // 默认 Unit 1
let currentIndex = 0;
let currentMode = 'learn'; 
let voices = [];

// === 1. TTS 语音初始化 ===
const voiceSelect = document.getElementById('voiceSelect');
window.speechSynthesis.onvoiceschanged = initVoices;

function initVoices() {
    voices = window.speechSynthesis.getVoices();
    voiceSelect.innerHTML = '';
    
    // 筛选英语声音
    const englishVoices = voices.filter(voice => voice.lang.includes('en'));
    
    englishVoices.forEach((voice, index) => {
        const option = document.createElement('option');
        option.textContent = `${voice.name} (${voice.lang})`;
        option.value = index;
        // 尝试默认选中好听的声音
        if (voice.name.includes('Google') || voice.name.includes('Samantha') || voice.name.includes('Zira')) {
            option.selected = true;
        }
        option.setAttribute('data-name', voice.name);
        voiceSelect.appendChild(option);
    });
}

function speak(text) {
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(text);
    msg.text = text;
    const selectedVoiceName = voiceSelect.selectedOptions[0]?.getAttribute('data-name');
    if (selectedVoiceName) {
        msg.voice = voices.find(v => v.name === selectedVoiceName);
    }
    msg.rate = 0.8;
    window.speechSynthesis.speak(msg);
}

// === 2. 核心渲染逻辑 ===
function renderCard() {
    const gameArea = document.getElementById('game-area');
    const item = currentUnit[currentIndex];
    
    // 如果数据没加载好，防止报错
    if (!item) {
        gameArea.innerHTML = "<div>暂无数据</div>";
        return;
    }

    let html = '';

    // --- 顶部通用：图片 ---
    html += `<div class="emoji-img">${item.image}</div>`;

    if (currentMode === 'learn') {
        // --- 记忆模式 ---
        html += `<div class="english-word">${item.word}</div>`;
        html += `<div class="chinese-meaning">${item.meaning}</div>`;
        speak(item.word);

    } else if (currentMode === 'spell') {
        // --- 拼写模式 ---
        html += `<div class="chinese-meaning">${item.meaning}</div><br>`;
        
        // 填空槽
        const letters = item.word.split('');
        html += `<div id="slots-area">`;
        letters.forEach((l, i) => {
            html += `<div class="letter-box" id="slot-${i}"></div>`;
        });
        html += `</div><br>`;

        // 键盘
        html += `<div id="keyboard-area">`;
        const shuffled = [...letters].sort(() => Math.random() - 0.5);
        shuffled.forEach((char) => {
            html += `<button class="letter-btn" onclick="fillLetter('${char}', '${item.word}')">${char}</button>`;
        });
        html += `</div><div id="spell-msg" style="height:30px; color:green; font-weight:bold; margin-top:10px;"></div>`;
        window.currentSpellIndex = 0;

    } else if (currentMode === 'quiz') {
        // --- 填空模式 ---
        html += `<div class="chinese-meaning" style="margin-bottom:20px;">${item.meaning}</div>`;
        
        // 将 _____ 替换为 <span id="quiz-blank">word</span>
        const sentenceHtml = item.sentence.replace(
            '_____', 
            `<span id="quiz-blank" class="quiz-blank">${item.word}</span>`
        );

        html += `<h3 style="color:#555; line-height: 1.6; margin: 10px 0;">${sentenceHtml}</h3>`;
        html += `<div style="margin-top:20px; width:100%;">`;
        
        const opts = [...item.options].sort(() => Math.random() - 0.5);
        opts.forEach(opt => {
            html += `<button class="quiz-option" onclick="checkQuiz('${opt}', '${item.word}', this)">${opt}</button>`;
        });
        html += `</div>`;
        
        html += `<div id="quiz-feedback"></div>`;
        speak(item.sentence.replace('_____', 'blank')); 
    }

    // --- 底部：播放按钮 (记忆和填空模式显示，拼写模式如果不想要可以去掉这个if) ---
    // 这里为了统一，所有模式都显示
    html += `
        <div style="margin-top: auto; padding-top: 20px;">
            <button class="card-play-btn" onclick="speakCurrentWord()">
                🔊 播放读音
            </button>
        </div>
    `;

    gameArea.innerHTML = html;
    updateProgress();
}

// === 3. 交互逻辑 ===

// 拼写逻辑
window.fillLetter = function(char, targetWord) {
    const slot = document.getElementById(`slot-${window.currentSpellIndex}`);
    if (char === targetWord[window.currentSpellIndex]) {
        slot.innerText = char;
        slot.style.borderBottomColor = '#4CAF50';
        window.currentSpellIndex++;
        speak(char);
        if (window.currentSpellIndex === targetWord.length) {
            document.getElementById('spell-msg').innerText = "✨ Excellent! ✨";
            speak("Good job! " + targetWord);
        }
    } else {
        speak('Oh no');
        slot.style.borderBottomColor = 'red';
        setTimeout(() => slot.style.borderBottomColor = '#333', 500);
    }
};

// 填空逻辑 (新)
window.checkQuiz = function(selected, answer, btnElement) {
    const feedbackEl = document.getElementById('quiz-feedback');
    const blankEl = document.getElementById('quiz-blank');
    
    if (btnElement.classList.contains('quiz-correct') || btnElement.classList.contains('quiz-wrong')) return;

    const fullSentence = currentUnit[currentIndex].sentence.replace('_____', answer);

    if (selected === answer) {
        // 答对
        btnElement.classList.add('quiz-correct');
        blankEl.classList.remove('wrong');
        blankEl.classList.add('correct'); // 文字变绿可见
        feedbackEl.innerHTML = "🎉 答对啦！";
        feedbackEl.style.color = "#4CAF50";
        speak("Correct! " + fullSentence);
        
        // 禁用其他按钮
        document.querySelectorAll('.quiz-option').forEach(btn => btn.disabled = true);
    } else {
        // 答错
        btnElement.classList.add('quiz-wrong');
        blankEl.classList.add('wrong'); // 下划线变红
        feedbackEl.innerHTML = "❌ 再听听看？";
        feedbackEl.style.color = "#F44336";
        speak(fullSentence); // 播放正确句子提示
        
        setTimeout(() => {
            blankEl.classList.remove('wrong');
        }, 1000);
    }
};

// 读音按钮
window.speakCurrentWord = function() {
    const item = currentUnit[currentIndex];
    if (currentMode === 'quiz') {
        const answer = document.getElementById('quiz-blank').classList.contains('correct') ? item.word : 'blank';
        speak(item.sentence.replace('_____', answer));
    } else {
        speak(item.word);
    }
};

// 切换卡片
window.changeCard = function(step) {
    const newIndex = currentIndex + step;
    if (newIndex >= 0 && newIndex < currentUnit.length) {
        currentIndex = newIndex;
        renderCard();
    }
};

// 切换模式
window.switchMode = function(mode) {
    currentMode = mode;
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    renderCard();
};

// 切换单元
window.changeUnit = function() {
    const select = document.getElementById('unitSelect');
    const unitId = select.value;
    if (allUnits[unitId]) {
        currentUnit = allUnits[unitId];
        currentIndex = 0;
        renderCard();
    }
};

function updateProgress() {
    const bar = document.getElementById('progressBar');
    if(bar) bar.style.width = ((currentIndex + 1) / currentUnit.length * 100) + '%';
}

// 启动
setTimeout(() => {
    initVoices();
    renderCard();
}, 500);
