// Elements
const sourceLangSelect = document.getElementById('sourceLang');
const targetLangSelect = document.getElementById('targetLang');
const sourceText = document.getElementById('sourceText');
const targetText = document.getElementById('targetText');
const translateBtn = document.getElementById('translateBtn');
const swapBtn = document.getElementById('swapLanguages');
const micBtn = document.getElementById('micBtn');
const speakBtn = document.getElementById('speakBtn');
const copySourceBtn = document.getElementById('copySourceBtn');
const copyTargetBtn = document.getElementById('copyTargetBtn');
const statusMessage = document.getElementById('statusMessage');

// Tabs
const tabs = document.querySelectorAll('.tab-btn');
const views = document.querySelectorAll('.view');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

// State
let isTranslating = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  populateLanguages();
  loadSettings();
  loadHistory();
  setupTabs();
});

// Populate Language Dropdowns
function populateLanguages() {
  // Add Auto Detect to Source
  const autoOption = document.createElement('option');
  autoOption.value = 'autodetect';
  autoOption.textContent = 'Detectar Idioma';
  sourceLangSelect.appendChild(autoOption);

  // Populate from LANGUAGES constant (loaded from languages.js)
  for (const [code, name] of Object.entries(LANGUAGES)) {
    const optionSource = document.createElement('option');
    optionSource.value = code;
    optionSource.textContent = name;
    sourceLangSelect.appendChild(optionSource);

    const optionTarget = document.createElement('option');
    optionTarget.value = code;
    optionTarget.textContent = name;
    targetLangSelect.appendChild(optionTarget);
  }

  // Defaults
  sourceLangSelect.value = 'autodetect';
  targetLangSelect.value = 'en-US'; // Default target
}

// Tab Switching
function setupTabs() {
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Deactivate all
      tabs.forEach(t => t.classList.remove('active'));
      views.forEach(v => v.classList.remove('active'));

      // Activate clicked
      tab.classList.add('active');
      const tabName = tab.dataset.tab;
      document.getElementById(`${tabName}-view`).classList.add('active');

      if (tabName === 'history') {
        loadHistory();
      }
    });
  });
}

// Translation Logic
async function translate() {
  const text = sourceText.value.trim();
  if (!text) return;

  if (isTranslating) return;
  isTranslating = true;
  translateBtn.disabled = true;
  translateBtn.textContent = 'Traduzindo...';
  statusMessage.textContent = '';
  targetText.placeholder = 'Traduzindo...';
  targetText.value = '';

  let source = sourceLangSelect.value;
  const target = targetLangSelect.value;

  // API handling for 'autodetect'
  const apiSource = source === 'autodetect' ? 'Autodetect' : source;

  const pair = `${apiSource}|${target}`;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${pair}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.responseStatus === 200) {
      const translatedText = data.responseData.translatedText;
      targetText.value = translatedText;

      // Save logic
      const detectedSource = data.responseData.detectedSourceLanguage || source;
      saveToHistory(text, translatedText, detectedSource, target);

      statusMessage.textContent = 'Tradução concluída!';
      setTimeout(() => statusMessage.textContent = '', 2000);
    } else {
      targetText.value = '';
      targetText.placeholder = 'Erro na tradução.';
      statusMessage.textContent = `Erro: ${data.responseDetails}`;
    }
  } catch (error) {
    console.error('Translation Error:', error);
    statusMessage.textContent = 'Erro de conexão.';
  } finally {
    isTranslating = false;
    translateBtn.disabled = false;
    translateBtn.textContent = 'Traduzir';

    // Save last used languages
    chrome.storage.local.set({
      lastSource: sourceLangSelect.value,
      lastTarget: targetLangSelect.value
    });
  }
}

// History Management
function saveToHistory(original, translated, source, target) {
  chrome.storage.local.get(['history'], (result) => {
    let history = result.history || [];

    // New item
    const newItem = {
      original,
      translated,
      source,
      target,
      timestamp: Date.now()
    };

    // Add to beginning, limit to 20 items
    history.unshift(newItem);
    if (history.length > 20) history.pop();

    chrome.storage.local.set({ history });
  });
}

function loadHistory() {
  chrome.storage.local.get(['history'], (result) => {
    const history = result.history || [];
    renderHistory(history);
  });
}

function renderHistory(history) {
  historyList.innerHTML = '';

  if (history.length === 0) {
    historyList.innerHTML = '<li class="empty-state">Nenhum histórico ainda.</li>';
    return;
  }

  history.forEach(item => {
    const li = document.createElement('li');
    li.className = 'history-item';
    li.innerHTML = `
      <div class="history-lang">${getLangName(item.source)} → ${getLangName(item.target)}</div>
      <div class="history-original" title="${item.original}">${item.original}</div>
      <div class="history-translated" title="${item.translated}">${item.translated}</div>
    `;

    li.addEventListener('click', () => {
      // Load into translator
      sourceText.value = item.original;
      targetText.value = item.translated;
      sourceLangSelect.value = item.source === 'Autodetect' ? 'autodetect' : item.source; // Might not match perfectly if auto
      targetLangSelect.value = item.target;

      // Switch tab
      tabs[0].click();
    });

    historyList.appendChild(li);
  });
}

function getLangName(code) {
  if (!code || code === 'Autodetect') return 'Detectado';
  return LANGUAGES[code] || code;
}

clearHistoryBtn.addEventListener('click', () => {
  if (confirm('Tem certeza que deseja limpar o histórico?')) {
    chrome.storage.local.set({ history: [] }, () => {
      loadHistory();
    });
  }
});

function loadSettings() {
  chrome.storage.local.get(['lastSource', 'lastTarget'], (result) => {
    if (result.lastSource) sourceLangSelect.value = result.lastSource;
    if (result.lastTarget) targetLangSelect.value = result.lastTarget;
  });
}

// Voice Input (Speech to Text)
micBtn.addEventListener('click', () => {
  if (!('webkitSpeechRecognition' in window)) {
    alert('Seu navegador não suporta reconhecimento de voz.');
    return;
  }

  const recognition = new webkitSpeechRecognition();

  // Set language based on selection or default to browser lang if autodetect
  let lang = sourceLangSelect.value;
  if (lang === 'autodetect') lang = navigator.language;
  recognition.lang = lang;

  recognition.continuous = false;
  recognition.interimResults = false;

  micBtn.classList.add('active');
  statusMessage.textContent = 'Ouvindo...';

  recognition.onstart = () => { /* ... */ };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    sourceText.value = transcript;
    translate(); // Auto translate after speak
  };

  recognition.onerror = (event) => {
    console.error('Speech error', event);
    statusMessage.textContent = 'Erro no reconhecimento de voz.';
    micBtn.classList.remove('active');
  };

  recognition.onend = () => {
    micBtn.classList.remove('active');
    if (statusMessage.textContent === 'Ouvindo...') statusMessage.textContent = '';
  };

  recognition.start();
});

// Voice Output (Text to Speech)
speakBtn.addEventListener('click', () => {
  const text = targetText.value;
  if (!text) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = targetLangSelect.value;

  window.speechSynthesis.speak(utterance);
});

// Copy Functions
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    statusMessage.textContent = 'Copiado!';
    setTimeout(() => statusMessage.textContent = '', 1500);
  });
}

copySourceBtn.addEventListener('click', () => copyToClipboard(sourceText.value));
copyTargetBtn.addEventListener('click', () => copyToClipboard(targetText.value));

// Other Events
swapBtn.addEventListener('click', () => {
  const sVal = sourceLangSelect.value;
  const tVal = targetLangSelect.value;

  if (sVal === 'autodetect') {
    // Can't really swap nicely if source is auto, but we can try setting source to current target
    sourceLangSelect.value = tVal;
    targetLangSelect.value = 'en-US'; // Default back to English or something
  } else {
    sourceLangSelect.value = tVal;
    targetLangSelect.value = sVal;
  }

  const sText = sourceText.value;
  sourceText.value = targetText.value;
  targetText.value = sText;
});

translateBtn.addEventListener('click', translate);

sourceText.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'Enter') {
    translate();
  }
});
