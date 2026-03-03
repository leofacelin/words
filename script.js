// === 1. 状态管理 ===
let currentUnitId = 1;
let currentIndex = 0;
let currentMode = 'learn'; 
let voices = [];

// === 2. 初始化逻辑 ===
function initApp() {
    const select = document.getElementById('unitSelect');
    if (!select) return;

    // 动态生成单元菜单
    select.innerHTML = '';
    const unitIds = Object.keys(wordData);
    if (unitIds.length === 0) return;

    unitIds.forEach(id => {
        const opt = document.createElement('option');
        opt.value = id;
        opt.textContent = wordData[id].title;
        select.appendChild(opt);
    });

    currentUnitId = unitIds[0];
    initVoices();
    renderCard();
}

// === 3. TTS 语音初始化与播放 ===
function initVoices() {
    voices = window.speechSynthesis.getVoices();
    const voiceSelect = document.getElementById('voiceSelect');
    if (!voiceSelect) return;

    voiceSelect.innerHTML = '';
    const englishVoices = voices.filter(v => v.lang.includes('en'));
    
    englishVoices.forEach(v => {
        const option = document.createElement('option');
        option.textContent = v.name;
        option.value = v.name;
        if (v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Zira')) {
            option.selected = true;
        }
        voiceSelect.appendChild(option);
    });
}

function speak(text) {
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(text);
    const selectedName = document.getElementById('voiceSelect').value;
    msg.voice = voices.find(v => v.name === selectedName);
    msg.rate = 0.8; // 稍微慢一点，适合孩子听
    window.speechSynthesis.speak(msg);
}

// === 4. 核心渲染逻辑 ===
function renderCard() {
    const gameArea = document.getElementById('game-area');
    const unit = wordData[currentUnitId]?.words || [];
    const item = unit[currentIndex];
    
    if (!item) {
        gameArea.innerHTML = "<div>正在准备数据...</div>";
        return;
    }

    let html = `<div class="emoji-img">${item.image}</div>`;

    if (currentMode === 'learn') {
        html += `
            <div class="english-word">${item.word}</div>
            <div class="chinese-meaning">${item.meaning}</div>
        `;
        speak(item.word);

    } else if (currentMode === 'spell') {
        html += `
            <div class="chinese-meaning">${item.meaning}</div>
            <div id="slots-area">
                ${item.word.split('').map((_, i) => `<div class="letter-box" id="slot-${i}"></div>`).join('')}
            </div>
            <div id="keyboard-area">
                ${[...item.word].sort(() => Math.random() - 0.5).map(char => 
                    `<button class="letter-btn" onclick="fillLetter('${char}', '${item.word}')">${char}</button>`
                ).join('')}
            </div>
            <div id="spell-msg"></div>
        `;
        window.currentSpellIndex = 0;

    } else if (currentMode === 'quiz') {
        html += `<div class="chinese-meaning" style="margin-bottom:15px;">${item.meaning}</div>`;
        // 填空处隐藏文字
        const sentenceHtml = item.sentence.replace('_____', `<span id="quiz-blank" class="quiz-blank-hidden">${item.word}</span>`);
        html += `
            <h3 class="quiz-sentence">${sentenceHtml}</h3>
            <div class="options-grid">
                ${[...item.options].sort(() => Math.random() - 0.5).map(opt => 
                    `<button class="quiz-option" onclick="checkQuiz('${opt}', '${item.word}', this)">${opt}</button>`
                ).join('')}
            </div>
            <div id="quiz-feedback"></div>
        `;
        // 自动朗读完整句子（包含答案）
        speak(item.sentence.replace('_____', item.word));
    }

    // 通用播放按钮
    html += `
        <div style="margin-top: auto; padding-top: 10px;">
            <button class="card-play-btn" onclick="speakCurrent()">🔊 播放读音</button>
        </div>
    `;

    gameArea.innerHTML = html;
    updateProgress();
}

// === 5. 交互功能 ===
// === 新增：音效函数 ===
function playSound(type) {
    const sounds = {
        success: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3', // 欢快成功音
        correct: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3', // 叮咚对号音
        wrong: './sounds/mixkit-tech-break-fail-2947.wav'    // 错误提示音
    };
    const audio = new Audio(sounds[type]);
    audio.play();
}

// === 新增：统一的撒花庆祝函数 ===
function celebrate() {
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff9800', '#2196F3', '#4CAF50', '#E91E63', '#9C27B0']
    });
}


// 拼写逻辑
window.fillLetter = function(char, targetWord) {
    const slot = document.getElementById(`slot-${window.currentSpellIndex}`);
    if (!slot) return;

    if (char === targetWord[window.currentSpellIndex]) {
        slot.innerText = char;
        slot.classList.remove('success-pop');
        void slot.offsetWidth; 
        slot.classList.add('success-pop');
        
        window.currentSpellIndex++;
        speak(char);

        if (window.currentSpellIndex === targetWord.length) {
            document.getElementById('spell-msg').innerText = "✨ Excellent! ✨";
            // 触发音效和撒花
            playSound('success');
            celebrate();
            setTimeout(() => speak(targetWord), 400);
        }
    } else {
        slot.classList.add('shake');
        setTimeout(() => slot.classList.remove('shake'), 400);
        playSound('wrong'); // 错误音效
        speak("Try again");
    }
};

// 填空逻辑
// === 修改：填空逻辑 ===
window.checkQuiz = function(selected, answer, btn) {
    const blankEl = document.getElementById('quiz-blank');
    const item = wordData[currentUnitId].words[currentIndex];
    const fullSentence = item.sentence.replace('_____', answer);

    if (selected === answer) {
        btn.classList.add('quiz-correct');
        blankEl.classList.add('quiz-blank-visible');
        document.getElementById('quiz-feedback').innerText = "🎉 Good Job!";
        
        // 填空正确时也触发撒花和音效
        playSound('correct');
        celebrate();
        
        speak("Correct! " + fullSentence);
        document.querySelectorAll('.quiz-option').forEach(b => b.disabled = true);
    } else {
        btn.classList.add('quiz-wrong');
        playSound('wrong'); // 错误音效
        speak(fullSentence);
    }
};

window.speakCurrent = function() {
    const item = wordData[currentUnitId].words[currentIndex];
    const text = currentMode === 'quiz' ? item.sentence.replace('_____', item.word) : item.word;
    speak(text);
};

window.changeCard = (step) => {
    const unit = wordData[currentUnitId].words;
    const next = currentIndex + step;
    if (next >= 0 && next < unit.length) {
        currentIndex = next;
        renderCard();
    }
};

window.switchMode = (mode, btn) => {
    currentMode = mode;
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderCard();
};

window.changeUnit = () => {
    currentUnitId = document.getElementById('unitSelect').value;
    currentIndex = 0;
    renderCard();
};

function updateProgress() {
    const unit = wordData[currentUnitId].words;
    const bar = document.getElementById('progressBar');
    if (bar) bar.style.width = ((currentIndex + 1) / unit.length * 100) + '%';
}

// 绑定语音变化事件
window.speechSynthesis.onvoiceschanged = initVoices;
// 启动应用
setTimeout(initApp, 100);
