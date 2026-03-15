// === 1. 状态管理与配置 ===
let currentUnitId = 1;
let currentIndex = 0;
let currentMode = 'learn'; 
let voices = []; // 存储系统获取到的语音对象

// === 2. 初始化应用 ===
function initApp() {
    // 1. 初始化单元选择
    const select = document.getElementById('unitSelect');
    if (select) {
        select.innerHTML = '';
        const unitIds = Object.keys(wordData);
        unitIds.forEach(id => {
            const opt = document.createElement('option');
            opt.value = id;
            opt.textContent = wordData[id].title;
            select.appendChild(opt);
        });
        currentUnitId = unitIds[0];
    }

    // 2. 初始化语音选择列表
    loadVoices();
    // 关键：某些浏览器需要监听这个事件来异步加载语音
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }
}

// 获取并填充语音列表
function loadVoices() {
    // 获取系统支持的所有语音
    const allVoices = window.speechSynthesis.getVoices();
    const voiceSelect = document.getElementById('voiceSelect');
    if (!voiceSelect || allVoices.length === 0) return;

    voices = allVoices;
    voiceSelect.innerHTML = '';

    // 过滤出所有英文语音 (en-)，防止列表过长干扰选择
    const englishVoices = voices.filter(v => v.lang.startsWith('en'));

    englishVoices.forEach((voice) => {
        const option = document.createElement('option');
        option.textContent = `${voice.name} (${voice.lang})`;
        // 存储该语音在原始 voices 数组中的索引，方便后续调用
        option.value = voices.indexOf(voice); 
        
        // 尝试默认选择一个 Google 的美音（通常效果较好）
        if (voice.name === 'Google US English') {
            option.selected = true;
        }
        voiceSelect.appendChild(option);
    });
}

function startApp() {
    window.speechSynthesis.cancel(); 
    renderCard(); 
}

// === 3. 核心语音功能 (使用用户选择的语音) ===
function speak(text) {
    if (!text) return;

    window.speechSynthesis.cancel();

    const msg = new SpeechSynthesisUtterance(text);
    
    // 获取下拉框当前选择的语音索引
    const voiceSelect = document.getElementById('voiceSelect');
    const selectedVoiceIndex = voiceSelect.value;
    
    // 如果索引有效，则设置对应的语音对象
    if (voices[selectedVoiceIndex]) {
        msg.voice = voices[selectedVoiceIndex];
        msg.lang = voices[selectedVoiceIndex].lang;
    } else {
        msg.lang = 'en-US'; // 兜底方案
    }
    
    msg.rate = 0.8; 
    msg.pitch = 1.0; 
    window.speechSynthesis.speak(msg);
}

// 辅助音效
function playSound(type) {
    const sounds = {
        success: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3',
        correct: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
        wrong: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3'
    };
    const audio = new Audio(sounds[type]);
    audio.playbackRate = 1.5; 
    audio.play();
}

// 撒花庆祝
function celebrate() {
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#ff9800', '#2196F3', '#4CAF50', '#E91E63', '#9C27B0']
        });
    }
}

// === 4. 渲染与交互逻辑 ===
function renderCard() {
    const gameArea = document.getElementById('game-area');
    const unit = wordData[currentUnitId]?.words || [];
    const item = unit[currentIndex];
    
    if (!item) return;

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
        speak(item.sentence.replace('_____', item.word));
    }

    html += `
        <div style="margin-top: auto; padding-top: 10px;">
            <button class="card-play-btn" onclick="speakCurrent()">🔊 播放读音</button>
        </div>
    `;

    gameArea.innerHTML = html;
    updateProgress();
}

// ... 保持原有 window.fillLetter, window.checkQuiz, window.changeCard 等函数不变 ...
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
            playSound('success');
            celebrate();
            setTimeout(() => speak(targetWord), 600);
        }
    } else {
        slot.classList.add('shake');
        setTimeout(() => slot.classList.remove('shake'), 400);
        playSound('wrong');
        speak("Try again");
    }
};

window.checkQuiz = function(selected, answer, btn) {
    const blankEl = document.getElementById('quiz-blank');
    const item = wordData[currentUnitId].words[currentIndex];
    const fullSentence = item.sentence.replace('_____', answer);

    if (selected === answer) {
        btn.classList.add('quiz-correct');
        blankEl.classList.add('quiz-blank-visible');
        document.getElementById('quiz-feedback').innerText = "🎉 Good Job!";
        playSound('correct');
        celebrate();
        speak("Correct! " + fullSentence);
        document.querySelectorAll('.quiz-option').forEach(b => b.disabled = true);
    } else {
        btn.classList.add('quiz-wrong');
        playSound('wrong');
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

window.onload = initApp;
