// === 状态管理 ===
// 建立映射关系
const allUnits = {
    1: unit1_data,
    2: unit2_data
};

let currentUnit = allUnits[1]; // 默认 Unit 1
let currentIndex = 0;
let currentMode = 'learn'; 
let voices = [];

// ... (initVoices 和 speak 函数保持不变，为了节省篇幅略过，请保留原来的代码) ...
// === 复制之前的 initVoices 和 speak 代码 ===
const voiceSelect = document.getElementById('voiceSelect');
window.speechSynthesis.onvoiceschanged = initVoices;
function initVoices() {
    voices = window.speechSynthesis.getVoices();
    voiceSelect.innerHTML = '';
    const englishVoices = voices.filter(voice => voice.lang.includes('en'));
    englishVoices.forEach((voice, index) => {
        const option = document.createElement('option');
        option.textContent = `${voice.name} (${voice.lang})`;
        option.value = index;
        if (voice.name.includes('Google') || voice.name.includes('Samantha')) option.selected = true;
        option.setAttribute('data-name', voice.name);
        voiceSelect.appendChild(option);
    });
}
function speak(text) {
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(text);
    msg.text = text;
    const selectedVoiceName = voiceSelect.selectedOptions[0]?.getAttribute('data-name');
    if (selectedVoiceName) msg.voice = voices.find(v => v.name === selectedVoiceName);
    msg.rate = 0.8;
    window.speechSynthesis.speak(msg);
}
// ===========================================

// === 核心渲染逻辑 (有修改) ===
function renderCard() {
    const gameArea = document.getElementById('game-area');
    const item = currentUnit[currentIndex];
    let html = '';

    // --- 顶部通用：图片 ---
    html += `<div class="emoji-img">${item.image}</div>`;

    if (currentMode === 'learn') {
        // --- 记忆模式 ---
        html += `<div class="english-word">${item.word}</div>`;
        html += `<div class="chinese-meaning">${item.meaning}</div>`;
        
        // 自动读
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
        html += `</div><div id="spell-msg" style="height:30px; color:green; font-weight:bold;"></div>`;
        window.currentSpellIndex = 0;

    } else if (currentMode === 'quiz') {
        // --- 填空模式 ---
        html += `<div class="chinese-meaning" style="margin-bottom:20px;">${item.meaning}</div>`;
        html += `<h3 style="color:#555;">"${item.sentence}"</h3>`;
        html += `<div style="margin-top:20px; width:100%;">`;
        
        const opts = [...item.options].sort(() => Math.random() - 0.5);
        opts.forEach(opt => {
            // 注意：这里 onclick 多传了一个 'this'，代表当前点击的按钮元素
            html += `<button class="quiz-option" onclick="checkQuiz('${opt}', '${item.word}', this)">${opt}</button>`;
        });
        html += `</div>`;
        
        // 新增：用于显示结果文字的区域
        html += `<div id="quiz-feedback"></div>`;

        speak(item.sentence.replace('_____', 'blank')); 
    }

    // === 新增：统一的播放按钮（放在卡片最下方） ===
    // 只有非拼写模式，或者你希望拼写模式也能听发音提示的话，可以都加
    // 既然在"单词区块里的最下面"，我们加在这里：
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

// === 单元切换逻辑 (新增) ===
window.changeUnit = function() {
    const select = document.getElementById('unitSelect');
    const unitId = select.value;
    
    // 切换数据源
    if (allUnits[unitId]) {
        currentUnit = allUnits[unitId];
        currentIndex = 0; // 重置到第一个词
        
        // 稍微给点反馈
        alert(`已切换到第 ${unitId} 单元，加油！`);
        renderCard();
    }
}

// ... (fillLetter, checkQuiz, changeCard, switchMode 逻辑保持不变) ...
// === 复制之前的交互逻辑 ===
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
window.checkQuiz = function(selected, answer, btnElement) {
    const feedbackEl = document.getElementById('quiz-feedback');
    
    // 为了防止多次点击已经变色的按钮，可以加个判断
    if (btnElement.classList.contains('quiz-correct') || btnElement.classList.contains('quiz-wrong')) {
        return;
    }

    if (selected === answer) {
        // --- 答对逻辑 ---
        
        // 1. 按钮变绿
        btnElement.classList.add('quiz-correct');
        
        // 2. 界面显示文字
        feedbackEl.innerHTML = "🎉 答对啦！真棒！";
        feedbackEl.style.color = "#4CAF50"; // 绿色文字
        
        // 3. 播放完整句子
        const fullSentence = currentUnit[currentIndex].sentence.replace('_____', answer);
        speak("Correct! " + fullSentence);

        // 可选：答对后自动禁用其他按钮，防止乱点
        const allBtns = document.querySelectorAll('.quiz-option');
        allBtns.forEach(btn => btn.disabled = true);

    } else {
        // --- 答错逻辑 ---
        
        // 1. 按钮变红
        btnElement.classList.add('quiz-wrong');
        
        // 2. 界面显示文字
        feedbackEl.innerHTML = "❌ 不对哦，再试一次";
        feedbackEl.style.color = "#F44336"; // 红色文字
        
        // 3. 语音提示
        speak("Try again");
        
        // 4. 0.5秒后把红色去掉，让孩子可以重新点（或者保持红色表示这个已经排除）
        // 现在的逻辑是保持红色，更有教育意义，告诉他这个选过了
    }
};
window.speakCurrentWord = function() {
    const item = currentUnit[currentIndex];
    if (currentMode === 'quiz') {
        speak(item.sentence.replace('_____', item.word));
    } else {
        speak(item.word);
    }
};
window.changeCard = function(step) {
    const newIndex = currentIndex + step;
    if (newIndex >= 0 && newIndex < currentUnit.length) {
        currentIndex = newIndex;
        renderCard();
    }
};
window.switchMode = function(mode) {
    currentMode = mode;
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    renderCard();
};
function updateProgress() {
    const bar = document.getElementById('progressBar');
    if(bar) bar.style.width = ((currentIndex + 1) / currentUnit.length * 100) + '%';
}
// 启动
setTimeout(() => { initVoices(); renderCard(); }, 500);