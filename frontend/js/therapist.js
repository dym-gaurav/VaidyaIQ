let messages = [];
let voiceActive = false;
let therapistAge = null;
let ageAsked = false;

// Chat History State
let currentSessionId = Date.now().toString();
let sessions = JSON.parse(localStorage.getItem('therapist_sessions') || '{}');

// Helpers
function scrollChat() {
    const win = document.getElementById("chat-window");
    win.scrollTop = win.scrollHeight;
}

function showTypingIndicator() {
    const win = document.getElementById("chat-window");
    const t = document.createElement("div");
    t.className = "typing-indicator";
    t.id = "typing-indicator";
    t.innerHTML = "<span></span><span></span><span></span>";
    win.appendChild(t);
    scrollChat();
}

function removeTypingIndicator() {
    const t = document.getElementById("typing-indicator");
    if (t) t.remove();
}

function addBubble(role, htmlContent, save = true) {
    const win = document.getElementById("chat-window");
    const bubble = document.createElement("div");
    bubble.className = role === "user"
        ? "chat-bubble-user fade-in"
        : "chat-bubble-ai fade-in";
    bubble.innerHTML = htmlContent;
    win.appendChild(bubble);
    scrollChat();

    // Save to history if this isn't a history load
    if (save && (role === "user" || role === "ai")) {
        saveChatHistory(role, htmlContent);
    }

    return bubble;
}

// Render structured reply as inline HTML via addBubble
function renderStructuredReply(data) {
    var sections = [
        { key: "verdict",        color: "var(--text)" },
        { key: "psychology",     color: "var(--text)" },
        { key: "consequences",   color: "var(--text)" },
        { key: "recommendation", color: "var(--text)" }
    ];

    var html = '<div style="display:flex;flex-direction:column;gap:8px;">';

    for (var i = 0; i < sections.length; i++) {
        var s = sections[i];
        if (data[s.key]) {
            var text = data[s.key].split("\n").join("<br>");
            html += '<div style="font-size:14px;line-height:1.75;color:' + s.color + ';">' + text + '</div>';
        }
    }

    html += '</div>';
    addBubble("ai", html);
}

// History Management
function saveChatHistory(role, htmlContent) {
    if (!sessions[currentSessionId]) {
        let title = "New Chat";
        if (role === "user") {
            // strip html tags for title
            const tmp = document.createElement("DIV");
            tmp.innerHTML = htmlContent;
            title = tmp.textContent || tmp.innerText || "";
            title = title.substring(0, 30) + (title.length > 30 ? "..." : "");
        }
        sessions[currentSessionId] = { id: currentSessionId, title: title, bubbles: [] };
    }
    
    // Only update title if it's the first user message
    if (role === "user" && sessions[currentSessionId].bubbles.length < 3) {
        const tmp = document.createElement("DIV");
        tmp.innerHTML = htmlContent;
        let title = tmp.textContent || tmp.innerText || "";
        title = title.substring(0, 30) + (title.length > 30 ? "..." : "");
        sessions[currentSessionId].title = title;
    }

    sessions[currentSessionId].bubbles.push({ role, htmlContent });
    localStorage.setItem('therapist_sessions', JSON.stringify(sessions));
    if (window.VaidyaHistory) {
        sessionStorage.setItem("vaidyaiq_therapist_session", "therapist-" + currentSessionId);
        const allHtml = sessions[currentSessionId].bubbles
            .map(b => `<div class="${b.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"}">${b.htmlContent}</div>`)
            .join("");
        window.VaidyaHistory.saveSnapshot("therapist", sessions[currentSessionId].title, allHtml, "therapist.html");
    }
    renderSidebar();
}

function loadChatSession(sessionId) {
    currentSessionId = sessionId;
    const session = sessions[sessionId];
    
    // Reset state
    messages = [];
    therapistAge = null;
    ageAsked = true; // Skip age asking since we're loading history
    
    const win = document.getElementById("chat-window");
    win.innerHTML = ""; // Clear current chat

    if (session && session.bubbles) {
        session.bubbles.forEach(b => {
            // Re-add without saving again
            addBubble(b.role, b.htmlContent, false);
            // Re-build message context for AI
            if (b.role === "user") {
                const tmp = document.createElement("DIV");
                tmp.innerHTML = b.htmlContent;
                messages.push({ role: "user", content: tmp.textContent || tmp.innerText || "" });
            } else {
                // Approximate AI context
                const tmp = document.createElement("DIV");
                tmp.innerHTML = b.htmlContent;
                messages.push({ role: "assistant", content: tmp.textContent || tmp.innerText || "" });
            }
        });
        
        // Assume age is 22 for restored sessions if we need to send new messages
        // (A robust app would save therapistAge in the session object)
        therapistAge = 22; 
    }

    // Close sidebar on mobile
    document.getElementById('chat-sidebar').classList.remove('open');
    renderSidebar();
}

function startNewChat() {
    currentSessionId = Date.now().toString();
    messages = [];
    therapistAge = null;
    ageAsked = false;
    
    const win = document.getElementById("chat-window");
    win.innerHTML = `
        <div class="chat-bubble-ai slide-up">
            Hello, I'm glad you're here. 🌿 This is a safe, private space. What's been on your mind lately? You can share anything — feelings, situations, or something that's been bothering you.
        </div>
    `;
    
    // Re-trigger age asking
    askAge();

    // Close sidebar on mobile
    document.getElementById('chat-sidebar').classList.remove('open');
    renderSidebar();
}

function renderSidebar() {
    const list = document.getElementById('chat-list');
    list.innerHTML = "";
    
    // Sort sessions by ID (timestamp) descending
    const sortedIds = Object.keys(sessions).sort((a, b) => b - a);
    
    sortedIds.forEach(id => {
        const s = sessions[id];
        const div = document.createElement('div');
        div.className = "chat-list-item " + (id === currentSessionId ? "active" : "");
        div.innerText = s.title || "Chat";
        div.onclick = () => loadChatSession(id);
        list.appendChild(div);
    });
}

// Age Selection
function askAge() {
    if (ageAsked) return;
    ageAsked = true;

    var bubble = document.createElement("div");
    bubble.className = "chat-bubble-ai fade-in";
    bubble.innerHTML =
        '<p style="margin-bottom:14px; line-height:1.6;">Hi! Before we start, could you tell me your age group? This helps me understand you better.</p>' +
        '<div style="display:flex; flex-direction:column; gap:8px;">' +
        '<button onclick="setAge(15, \'Teen (13-17)\', this)" class="answer-btn">Teen (13-17)</button>' +
        '<button onclick="setAge(22, \'Young Adult (18-24)\', this)" class="answer-btn">Young Adult (18-24)</button>' +
        '<button onclick="setAge(30, \'Working Pro (25-34)\', this)" class="answer-btn">Working Pro (25-34)</button>' +
        '<button onclick="setAge(42, \'Mid-Career (35-49)\', this)" class="answer-btn">Mid-Career (35-49)</button>' +
        '<button onclick="setAge(55, \'Senior (50+)\', this)" class="answer-btn">Senior (50+)</button>' +
        '</div>';
    document.getElementById("chat-window").appendChild(bubble);
    scrollChat();
}

window.addEventListener("DOMContentLoaded", function() {
    renderSidebar();
    askAge();
});

function setAge(age, label, btn) {
    therapistAge = age;

    var btns = btn.closest(".chat-bubble-ai").querySelectorAll("button");
    for (var i = 0; i < btns.length; i++) {
        btns[i].disabled = true;
        btns[i].style.opacity = "0.4";
    }

    addBubble("user", label, false); // Don't save system setup to chat history

    var greetings = {
        15: "Hey! I'm here for you. Feel free to share what's been going on - no judgment here.",
        22: "Hi! Life can feel like a lot right now. I'm here to listen and help you sort through it.",
        30: "Hi! Balancing everything isn't easy. I'm here to help you find some clarity.",
        42: "Hello! I value your perspective and I'm here to help you navigate whatever's on your mind.",
        55: "Hello! I'm honored you're here. Take your time and share whatever feels right."
    };

    setTimeout(function() {
        addBubble("ai", greetings[age] || "Hello! I'm here to listen.", false); // Don't save greeting
    }, 500);
}

// Voice Modal Logic
function openVoiceModal() {
    if (!therapistAge) {
        addBubble("ai", "Please select your age group first so I can support you better.");
        return;
    }
    document.getElementById('voice-modal').classList.add('active');
    startVoiceInteraction();
}

function closeVoiceModal() {
    document.getElementById('voice-modal').classList.remove('active');
    stopVoiceInteraction();
}

function startVoiceInteraction() {
    voiceActive = true;
    document.getElementById('voice-status').innerText = "Listening...";
    document.getElementById('voice-orb').classList.add('listening');
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    // Start mic via voice.js
    startListening((transcript) => {
        // Got result
        document.getElementById('voice-status').innerText = "Thinking...";
        document.getElementById('voice-orb').classList.remove('listening');
        handleVoiceInput(transcript);
    }, () => {
        // On end (no transcript caught, or timeout)
        if (voiceActive && document.getElementById('voice-status').innerText === "Listening...") {
            document.getElementById('voice-status').innerText = "Tap to listen";
            document.getElementById('voice-orb').classList.remove('listening');
            voiceActive = false; // pause until tapped again
        }
    }, getSpeechCode());
}

function stopVoiceInteraction() {
    voiceActive = false;
    stopListening();
    window.speechSynthesis.cancel();
}

function toggleVoiceListening() {
    if (document.getElementById('voice-status').innerText === "Tap to listen") {
        startVoiceInteraction();
    } else {
        stopVoiceInteraction();
        document.getElementById('voice-status').innerText = "Tap to listen";
        document.getElementById('voice-orb').classList.remove('listening');
    }
}

function changeVoiceGender(gender) {
    setVoiceGender(gender);
    document.getElementById('voice-btn-female').classList.remove('active');
    document.getElementById('voice-btn-male').classList.remove('active');
    document.getElementById('voice-btn-' + gender).classList.add('active');
}

async function handleVoiceInput(userText) {
    if (!userText) return;
    
    // Add to chat window in background
    messages.push({ role: "user", content: userText });
    addBubble("user", userText);
    showTypingIndicator();

    let result;
    try {
        result = await sendTherapistMessage(messages, currentLanguage, therapistAge);
    } catch (err) {
        removeTypingIndicator();
        addBubble("ai", "Could not reach the server.");
        document.getElementById('voice-status').innerText = "Network Error. Tap to try again.";
        voiceActive = false;
        return;
    }

    removeTypingIndicator();

    if (!result || result.error) {
        addBubble("ai", "Something went wrong.");
        document.getElementById('voice-status').innerText = "Error. Tap to try again.";
        voiceActive = false;
        return;
    }

    var reply = result.reply;
    
    // Read the output
    var speakText = typeof reply === "object" ? 
        [reply.verdict, reply.psychology, reply.consequences, reply.recommendation].filter(Boolean).join(". ") : 
        reply;
        
    document.getElementById('voice-status').innerText = "Speaking...";
    document.getElementById('voice-orb').classList.add('listening'); // Animate while speaking
    
    speak(speakText, getSpeechCode(), () => {
        // When done speaking, go back to listening automatically
        if (document.getElementById('voice-modal').classList.contains('active')) {
            startVoiceInteraction();
        }
    });

    // Render structured reply in the background chat window
    if (result.structured && reply && typeof reply === "object") {
        var summary = (reply.verdict || "") + " " + (reply.recommendation || "");
        messages.push({ role: "assistant", content: summary });
        renderStructuredReply(reply);
    } else {
        var plainText = typeof reply === "string" ? reply : JSON.stringify(reply);
        messages.push({ role: "assistant", content: plainText });
        addBubble("ai", plainText);
    }
}

// Send Message from text input
async function sendMessage() {
    if (!therapistAge) {
        addBubble("ai", "Please select your age group first so I can support you better.");
        return;
    }

    var input = document.getElementById("chat-input");
    var userText = input.value.trim();
    if (!userText) return;
    input.value = "";

    messages.push({ role: "user", content: userText });
    addBubble("user", userText);
    showTypingIndicator();

    var result;
    try {
        result = await sendTherapistMessage(messages, currentLanguage, therapistAge);
    } catch (err) {
        removeTypingIndicator();
        addBubble("ai", "Could not reach the server. Please make sure the backend is running.");
        return;
    }

    removeTypingIndicator();

    if (!result || result.error) {
        addBubble("ai", "Something went wrong. Please try again.");
        return;
    }

    var reply = result.reply;

    if (result.structured && reply && typeof reply === "object") {
        var summary = (reply.verdict || "") + " " + (reply.recommendation || "");
        messages.push({ role: "assistant", content: summary });
        renderStructuredReply(reply);
    } else {
        var plainText = typeof reply === "string" ? reply : JSON.stringify(reply);
        messages.push({ role: "assistant", content: plainText });
        addBubble("ai", plainText);
    }
}
// Reset function for loading saved therapist chats
window.resetTherapistChat = function(savedHtml) {
    // Extract messages from saved HTML to rebuild messages array
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = savedHtml;
    const bubbles = tempDiv.querySelectorAll('.chat-bubble-user, .chat-bubble-ai');
    
    messages = [];
    bubbles.forEach(bubble => {
        const role = bubble.classList.contains('chat-bubble-user') ? 'user' : 'assistant';
        // Extract text content without HTML
        const text = bubble.textContent || bubble.innerText;
        if (text && text.trim()) {
            messages.push({ role: role, content: text.trim() });
        }
    });
    
    // Set default age for loaded chats
    therapistAge = 22;
    ageAsked = true;
    
    // Re-enable input
    const chatInput = document.getElementById("chat-input");
    if (chatInput) {
        chatInput.disabled = false;
        chatInput.placeholder = "Share what's on your mind...";
    }
    
    // Remove any existing typing indicators
    removeTypingIndicator();
    
    // Create a new session ID for loaded chat
    currentSessionId = Date.now().toString();
    sessions[currentSessionId] = {
        id: currentSessionId,
        title: messages[0]?.content?.substring(0, 30) || "Loaded Chat",
        bubbles: []
    };
    
    // Rebuild bubbles in session
    const win = document.getElementById("chat-window");
    if (win) {
        const allBubbles = win.querySelectorAll('.chat-bubble-user, .chat-bubble-ai');
        allBubbles.forEach(bubble => {
            const role = bubble.classList.contains('chat-bubble-user') ? 'user' : 'ai';
            const html = bubble.innerHTML;
            sessions[currentSessionId].bubbles.push({ role, htmlContent: html });
        });
    }
    
    // Save to localStorage
    localStorage.setItem('therapist_sessions', JSON.stringify(sessions));
    if (window.VaidyaHistory) {
        const allHtml = sessions[currentSessionId].bubbles
            .map(b => `<div class="${b.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"}">${b.htmlContent}</div>`)
            .join("");
        window.VaidyaHistory.saveSnapshot("therapist", sessions[currentSessionId].title, allHtml, "therapist.html");
    }
    
    renderSidebar();
    console.log("Therapist chat reset, loaded saved conversation");
};
