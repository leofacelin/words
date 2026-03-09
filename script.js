// === 1. 状态管理与配置 ===
let currentUnitId = 1;
let currentIndex = 0;
let currentMode = 'learn'; 
let voices = [];
const audioCache = {}; // 用于存储已生成的语音，节省额度并消除延迟

// ⚠️ 请在此处填入你的 ElevenLabs 信息
const ELEVEN_LABS_API_KEY = 'sk_30d82e6a0ca783be2cef5f796ac3f145c57c2b2fb55b0c0f'; 
const VOICE_ID = 'Gfpl8Yo74Is0W6cPUWWT'; // 默认 Adam，可换成你喜欢的 Voice ID

// === 2. 初始化逻辑 ===
function initApp() {
    const select = document.getElementById('unitSelect');
    if (!select) return;

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
    renderCard();
}

// === 3. 核心语音功能 (ElevenLabs + Fallback) ===
async function speak(text) {
    if (!text) return;

    // 1. 检查缓存
    if (audioCache[text]) {
        const audio = new Audio(audioCache[text]);
        audio.play();
        return;
    }

    // 2. 尝试调用 ElevenLabs
    try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': ELEVEN_LABS_API_KEY
            },
            body: JSON.stringify({
                text: text,
                model_id: 'eleven_turbo_v2_5', // Turbo 模型速度最快，延迟最低
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75
                }
            })
        });

        if (!response.ok) throw new Error('ElevenLabs API Error');

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        // 存入缓存并播放
        audioCache[text] = url;
        const audio = new Audio(url);
        audio.play();
    } catch (error) {
        console.error('ElevenLabs 失败，尝试系统语音:', error);
        fallbackSpeak(text);
    }
}

// 系统自带语音作为兜底方案
function fallbackSpeak(text) {
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = 'en-US';
    msg.rate = 0.8;
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

// 启动
window.onload = initApp;
