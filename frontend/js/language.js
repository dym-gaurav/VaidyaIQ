const languages = {
    english:  { label: "English",  speechCode: "en-IN", strings: { send: "Send", upload: "Upload", submit: "Submit", placeholder: "Type here...", loading: "Please wait...", mic: "🎤 Voice" }},
    hindi:    { label: "हिन्दी",    speechCode: "hi-IN", strings: { send: "भेजें", upload: "अपलोड", submit: "जमा करें", placeholder: "यहाँ लिखें...", loading: "कृपया प्रतीक्षा करें...", mic: "🎤 आवाज़" }},
    hinglish: { label: "Hinglish", speechCode: "hi-IN", strings: { send: "Bhejo", upload: "Upload karo", submit: "Submit karo", placeholder: "Yahan likho...", loading: "Thoda ruko...", mic: "🎤 Awaaz" }},
    bengali:  { label: "বাংলা",    speechCode: "bn-IN", strings: { send: "পাঠান", upload: "আপলোড", submit: "জমা দিন", placeholder: "এখানে লিখুন...", loading: "অপেক্ষা করুন...", mic: "🎤 ভয়েস" }},
    marathi:  { label: "मराठी",    speechCode: "mr-IN", strings: { send: "पाठवा", upload: "अपलोड", submit: "सबमिट", placeholder: "येथे लिहा...", loading: "कृपया थांबा...", mic: "🎤 आवाज" }},
    telugu:   { label: "తెలుగు",   speechCode: "te-IN", strings: { send: "పంపు", upload: "అప్‌లోడ్", submit: "సమర్పించు", placeholder: "ఇక్కడ టైప్ చేయండి...", loading: "దయచేసి వేచి ఉండండి...", mic: "🎤 వాయిస్" }},
    tamil:    { label: "தமிழ்",    speechCode: "ta-IN", strings: { send: "அனுப்பு", upload: "பதிவேற்று", submit: "சமர்ப்பி", placeholder: "இங்கே தட்டச்சு செய்யவும்...", loading: "காத்திருங்கள்...", mic: "🎤 குரல்" }}
};

let currentLanguage = "english";

function setLanguage(lang) {
    currentLanguage = lang;
    const strings = languages[lang].strings;
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (strings[key]) el.textContent = strings[key];
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
        const key = el.getAttribute("data-i18n-placeholder");
        if (strings[key]) el.placeholder = strings[key];
    });
    window.dispatchEvent(new CustomEvent("languageChanged", { detail: lang }));
}

function getCurrentStrings() {
    return languages[currentLanguage].strings;
}

function getSpeechCode() {
    return languages[currentLanguage].speechCode;
}