let recognition = null;
window.voiceGender = 'female'; // Default voice gender

function startListening(onResult, onEnd, languageCode) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Voice not supported in this browser. Use Chrome.");
        if (onEnd) onEnd();
        return;
    }
    recognition = new SpeechRecognition();
    recognition.lang = languageCode;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        onResult(transcript);
    };
    recognition.onerror = (e) => console.error("Voice error:", e.error);
    recognition.onend = () => {
        if (onEnd) onEnd();
    };
    recognition.start();
}

function stopListening() {
    if (recognition) recognition.abort();
}

function setVoiceGender(gender) {
    window.voiceGender = gender;
}

function speak(text, languageCode, onEndCallback) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = languageCode;
    
    if (onEndCallback) {
        utterance.onend = onEndCallback;
    }

    const voices = window.speechSynthesis.getVoices();
    
    // First filter by language
    let langVoices = voices.filter(v => v.lang.startsWith(languageCode.split('-')[0]));
    if (langVoices.length === 0) langVoices = voices; // Fallback to all if lang not found
    
    let selectedVoice = null;
    
    // Heuristic search for gender
    const isFemale = window.voiceGender === 'female';
    const femaleKeywords = ['female', 'woman', 'zira', 'samantha', 'victoria', 'karen', 'tessa', 'veena', 'lekha'];
    const maleKeywords = ['male', 'man', 'david', 'mark', 'alex', 'daniel', 'rishi'];
    
    const targetKeywords = isFemale ? femaleKeywords : maleKeywords;
    const avoidKeywords = isFemale ? maleKeywords : femaleKeywords;

    // 1. Try to find a voice that matches target keywords and doesn't match avoid keywords
    selectedVoice = langVoices.find(v => {
        const name = v.name.toLowerCase();
        return targetKeywords.some(k => name.includes(k)) && !avoidKeywords.some(k => name.includes(k));
    });

    // 2. If no heuristic match, just pick the first one available for the language
    if (!selectedVoice && langVoices.length > 0) {
        selectedVoice = langVoices[0];
    }
    
    if (selectedVoice) {
        utterance.voice = selectedVoice;
    }

    window.speechSynthesis.speak(utterance);
}

// Pre-load voices to ensure they are available when speak is called
if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}