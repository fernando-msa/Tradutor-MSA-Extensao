// Elements
const sourceLangSelect = document.getElementById('sourceLang');
const targetLangSelect = document.getElementById('targetLang');
const sourceText = document.getElementById('sourceText');
const targetText = document.getElementById('targetText');
const translateBtn = document.getElementById('translateBtn');
const swapBtn = document.getElementById('swapLanguages');
const micBtn = document.getElementById('micBtn');
const speakBtn = document.getElementById('speakBtn');
const voiceSelect = document.getElementById('voiceSelect');
const copySourceBtn = document.getElementById('copySourceBtn');
const copyTargetBtn = document.getElementById('copyTargetBtn');
const statusMessage = document.getElementById('statusMessage');
const reviewBanner = document.getElementById('reviewBanner');
const rateBtn = document.getElementById('rateBtn');
const closeRateBtn = document.getElementById('closeRateBtn');

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
  loadSettings(); // Load settings first

  // Check for URL parameters (Context Menu)
  const urlParams = new URLSearchParams(window.location.search);
  const textParam = urlParams.get('text');
  const autoParam = urlParams.get('auto');

  if (textParam) {
    sourceText.value = textParam;
    if (autoParam === 'true') {
      // Delay slightly to ensure settings/DOM are ready
      setTimeout(translate, 500);
    }
  }

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

  // Defaults (will be overwritten by loadSettings if available)
  sourceLangSelect.value = 'autodetect';
  targetLangSelect.value = 'en-US';

  // Update voices if already loaded
  updateVoiceOptions();
}

targetLangSelect.addEventListener('change', updateVoiceOptions);

// Voice Selection Logic
let voices = [];

function populateVoices() {
  voices = window.speechSynthesis.getVoices();
  updateVoiceOptions();
}

if (window.speechSynthesis.onvoiceschanged !== undefined) {
  window.speechSynthesis.onvoiceschanged = populateVoices;
}

function updateVoiceOptions() {
  if (!voiceSelect) return;
  const targetLang = targetLangSelect.value;
  voiceSelect.innerHTML = '<option value="">Voz Padrão</option>';

  if (!voices.length) return;

  const langPrefix = targetLang.split('-')[0].toLowerCase();
  const matchingVoices = voices.filter(v => v.lang.toLowerCase().startsWith(langPrefix));

  matchingVoices.forEach(voice => {
    const option = document.createElement('option');
    option.value = voice.voiceURI;
    let name = voice.name;
    if (name.includes('Desktop')) name = name.replace('- Desktop', '').replace('Desktop', '').trim();
    if (name.includes('Microsoft')) name = name.replace('Microsoft', '').trim();
    option.textContent = name;
    voiceSelect.appendChild(option);
  });
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

      // Save logic (only if valid translation)
      if (translatedText) {
        const detectedSource = data.responseData.detectedSourceLanguage || source;
        saveToHistory(text, translatedText, detectedSource, target);
        incrementTranslationCount();
      }

      statusMessage.textContent = 'Tradução concluída!';
      setTimeout(() => statusMessage.textContent = '', 2000);
    } else {
      targetText.value = '';
      targetText.placeholder = 'Erro na tradução.';
      statusMessage.textContent = `Erro API: ${data.responseDetails || data.responseStatus}`;
    }
  } catch (error) {
    console.error('Translation Error:', error);
    statusMessage.textContent = 'Erro de conexão/internet.';
  } finally {
    isTranslating = false;
    translateBtn.disabled = false;
    translateBtn.textContent = 'Traduzir';

    // Save last used languages
    if (chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({
        lastSource: sourceLangSelect.value,
        lastTarget: targetLangSelect.value
      });
    }
  }
}

// History Management
function saveToHistory(original, translated, source, target) {
  if (!chrome.storage || !chrome.storage.local) {
    console.error("Storage API NOT available");
    return;
  }

  chrome.storage.local.get(['history'], (result) => {
    let history = result.history || [];

    // Check duplicates (optional, but good UX)
    const isDuplicate = history.some(item => item.original === original && item.target === target);
    if (isDuplicate) return;

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

    chrome.storage.local.set({ history }, () => {
      if (chrome.runtime.lastError) {
        console.error("Error saving history:", chrome.runtime.lastError);
      }
    });
  });
}

function loadHistory() {
  if (!chrome.storage || !chrome.storage.local) {
    historyList.innerHTML = '<li class="empty-state">Erro: Armazenamento indisponível.</li>';
    return;
  }

  chrome.storage.local.get(['history'], (result) => {
    if (chrome.runtime.lastError) {
      historyList.innerHTML = '<li class="empty-state">Erro ao carregar histórico.</li>';
      return;
    }
    const history = result.history || [];
    renderHistory(history);
  });
}

function renderHistory(history) {
  historyList.innerHTML = '';

  if (!history || history.length === 0) {
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

      // Try to set source (handle auto case)
      let srcCode = item.source === 'Autodetect' ? 'autodetect' : item.source;
      if (item.source && item.source !== 'Autodetect') {
        // Check if option exists, if not default to auto
        if (!sourceLangSelect.querySelector(`option[value="${srcCode}"]`)) {
          srcCode = 'autodetect';
        }
      }
      sourceLangSelect.value = srcCode;
      targetLangSelect.value = item.target;

      // Switch tab
      tabs[0].click(); // Click Translator tab
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
  if (!chrome.storage || !chrome.storage.local) return;
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

  // Configure Language
  let lang = sourceLangSelect.value;
  if (lang === 'autodetect') {
    lang = navigator.language || 'pt-BR'; // Default to browser or PT-BR
  }
  recognition.lang = lang;

  recognition.continuous = false;
  recognition.interimResults = false;

  micBtn.classList.add('active');
  statusMessage.textContent = 'Ouvindo... (Fale agora)';

  recognition.onstart = () => {
    console.log('Voice recognition started');
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    sourceText.value = transcript;
    translate(); // Auto translate after speak
  };

  recognition.onerror = (event) => {
    console.error('Speech error', event);
    if (event.error === 'not-allowed' || event.error === 'permission-denied') {
      statusMessage.textContent = 'Permissão necessária.';
      // Open small popup window instead of full tab
      chrome.windows.create({
        url: 'permission.html',
        type: 'popup',
        width: 360,
        height: 320,
        focused: true
      });
    } else if (event.error === 'network') {
      statusMessage.textContent = 'Erro de Rede. Verifique sua internet.';
    } else if (event.error === 'no-speech') {
      statusMessage.textContent = 'Erro: Nenhuma fala detectada.';
    } else {
      statusMessage.textContent = `Erro Voz: ${event.error}`;
    }
    micBtn.classList.remove('active');
  };

  recognition.onnomatch = (event) => {
    statusMessage.textContent = 'Não entendi. Tente novamente.';
    micBtn.classList.remove('active');
  };

  recognition.onend = () => {
    micBtn.classList.remove('active');
    if (statusMessage.textContent.includes('Ouvindo')) {
      statusMessage.textContent = '';
    }
  };

  recognition.start();
});

// Voice Output (Text to Speech)
speakBtn.addEventListener('click', () => {
  const text = targetText.value;
  if (!text) {
    statusMessage.textContent = 'Nada para ouvir.';
    return;
  }

  // Cancel any current speaking
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = targetLangSelect.value;

  const selectedVoiceURI = voiceSelect.value;
  if (selectedVoiceURI) {
    const voice = voices.find(v => v.voiceURI === selectedVoiceURI);
    if (voice) utterance.voice = voice;
  }

  utterance.onerror = (e) => {
    console.error('TTS Error:', e);
    statusMessage.textContent = 'Erro ao reproduzir áudio.';
  };

  window.speechSynthesis.speak(utterance);
});

// Copy Functions
function copyToClipboard(text) {
  if (!text) return;
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
    sourceLangSelect.value = tVal;
    targetLangSelect.value = 'en-US';
  } else {
    sourceLangSelect.value = tVal;
    targetLangSelect.value = sVal;
  }

  const sText = sourceText.value;
  // Only swap if target has text, otherwise just swap langs
  if (targetText.value) {
    sourceText.value = targetText.value;
    targetText.value = sText;
  }
});

translateBtn.addEventListener('click', translate);

sourceText.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'Enter') {
    translate();
  }
});

// Support Button
document.getElementById('supportBtn').addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://github.com/fernando-msa/Tradutor-MSA-Extensao/issues' });
});

// Review Banner Logic
function incrementTranslationCount() {
  if (!chrome.storage || !chrome.storage.local) return;
  chrome.storage.local.get(['translationCount', 'hasReviewed'], (result) => {
    if (result.hasReviewed) return;

    let count = (result.translationCount || 0) + 1;
    chrome.storage.local.set({ translationCount: count });

    if (count === 5) {
      if (reviewBanner) reviewBanner.style.display = 'block';
    }
  });
}

if (rateBtn) {
  rateBtn.addEventListener('click', () => {
    if (chrome.storage && chrome.storage.local) chrome.storage.local.set({ hasReviewed: true });
    reviewBanner.style.display = 'none';
    chrome.tabs.create({ url: 'https://microsoftedge.microsoft.com/addons/detail/tradutor-r%C3%A1pido-edge/dkojdeehfjpjphkndhagfbhknnlckami' });
```

**Pelo GitHub web:**
1. Acesse `Tradutor-MSA-Extensao` → clique em `popup.js`
2. Clique no ícone de lápis ✏️
3. Use `Ctrl+F` para encontrar `tradutor-msa/`
4. Faça a substituição
5. Commit com a mensagem:
```
fix: corrige URL da review na Edge Store
  });
}

if (closeRateBtn) {
  closeRateBtn.addEventListener('click', () => {
    if (chrome.storage && chrome.storage.local) chrome.storage.local.set({ hasReviewed: true });
    reviewBanner.style.display = 'none';
  });
}
