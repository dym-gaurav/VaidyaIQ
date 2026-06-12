let conversationMessages = [];
let answers = [];
let generatedQuestions = [];
let currentQuestion = 0;
let phase = "problem"; // problem → questions → result → consultation
let rankedDiseases = [];
let consultationHistory = [];
let allDiseasesDB = {};

// Track current consultation state
let consultation = {
    initialProblem: "",
    initialAnswers: [],
    followUpQuestions: [],
    followUpAnswers: [],
    diseaseEliminations: []
};

// ── Render a bubble ──────────────────────────────────────────
function addBubble(role, html, isLarge = false) {
    const win = document.getElementById("chat-window");
    const bubble = document.createElement("div");
    bubble.className = role === "user" ? "chat-bubble-user fade-in" : "chat-bubble-ai fade-in";
    if (isLarge) bubble.style.maxWidth = "100%";
    bubble.innerHTML = html;
    win.appendChild(bubble);
    win.scrollTop = win.scrollHeight;
    if (window.VaidyaHistory && role !== "system") {
        const title = consultation.initialProblem || (role === "user" ? html : "Doctor chat");
        window.VaidyaHistory.saveSnapshot("doctor", title, win.innerHTML, "chat-doctor.html");
    }
}

function showTyping() {
    const win = document.getElementById("chat-window");
    const t = document.createElement("div");
    t.className = "chat-bubble-ai";
    t.id = "typing-indicator";
    t.innerHTML = `<span style="color:var(--text-dim); font-style:italic;">Analyzing<span id="dots">...</span></span>`;
    win.appendChild(t);
    win.scrollTop = win.scrollHeight;
    animateDots();
}

function animateDots() {
    let count = 0;
    window._dotsInterval = setInterval(() => {
        const d = document.getElementById("dots");
        if (d) d.textContent = ".".repeat((count % 3) + 1);
        count++;
    }, 400);
}

function removeTyping() {
    clearInterval(window._dotsInterval);
    const t = document.getElementById("typing-indicator");
    if (t) t.remove();
}

// ── Scroll to show question properly ─────────────────────
function scrollToQuestion() {
    const chatWindow = document.getElementById("chat-window");
    if (chatWindow) {
        setTimeout(() => {
            const bubbles = chatWindow.querySelectorAll('.chat-bubble-ai');
            if (bubbles.length > 0) {
                const lastQuestion = bubbles[bubbles.length - 1];
                lastQuestion.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    }
}

// ── Show answer option chips ─────────────────────
function showAnswerChips() {
    const chips = document.getElementById("answer-chips");
    chips.style.display = "flex";
    setTimeout(() => {
        chips.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
}

function hideAnswerChips() {
    document.getElementById("answer-chips").style.display = "none";
}

// ── Load all diseases on startup ─────────────────
async function loadDiseasesDatabase() {
    try {
        const res = await fetch("http://127.0.0.1:5000/api/diseases-comprehensive");
        const data = await res.json();
        allDiseasesDB = data.diseases || {};
    } catch (e) {
        console.error("Failed to load diseases database:", e);
    }
}

// ── User sends free text (problem description) ───────────────
async function sendUserMessage() {
    const input = document.getElementById("chat-input");
    const text = input.value.trim();
    if (!text) return;
    input.value = "";

    if (phase === "problem") {
        addBubble("user", text);
        consultation.initialProblem = text;
        await handleProblemPhase(text);
    } else if (phase === "consultation") {
        addBubble("user", text);
        await handleConsultationMessage(text);
    }
}

// ── Phase 1: User describes problem → generate 10 questions ──
async function handleProblemPhase(problemText) {
    showTyping();

    const res = await fetch("http://127.0.0.1:5000/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem: problemText })
    });
    const data = await res.json();
    removeTyping();

    if (data.error || !data.questions) {
        addBubble("ai", "Sorry, I couldn't understand that. Can you describe your problem again?");
        return;
    }

    generatedQuestions = data.questions;
    phase = "questions";

    addBubble("ai", `Got it! I understand you're experiencing <strong>${problemText}</strong>.<br><br>
        I'll ask you <strong>10 quick questions</strong> to better understand your symptoms. Just tap Yes, No, or Not Sure for each one.`);

    setTimeout(() => askQuestion(0), 600);
}

// ── Phase 2: Ask questions one by one ────────────────────────
function askQuestion(index) {
    currentQuestion = index;

    const pct = Math.round(((index) / 10) * 100);
    document.getElementById("progress-bar").style.width = pct + "%";
    document.getElementById("progress-label").textContent = `Question ${index + 1} of 10`;

    addBubble("ai", `<strong>Q${index + 1}:</strong> ${generatedQuestions[index]}`);
    showAnswerChips();
    document.getElementById("chat-input").disabled = true;
    document.getElementById("send-btn").disabled = true;
    
    // Scroll to show the question properly
    scrollToQuestion();
}

// ── User taps Yes / No / Not Sure ────────────────────────────
function submitAnswer(answer) {
    hideAnswerChips();
    addBubble("user", answer);
    answers.push(answer);
    consultation.initialAnswers.push(answer);

    const next = currentQuestion + 1;

    if (next < 10) {
        setTimeout(() => askQuestion(next), 500);
    } else {
        document.getElementById("progress-bar").style.width = "100%";
        document.getElementById("progress-label").textContent = "Generating comprehensive analysis...";
        document.getElementById("chat-input").disabled = false;
        document.getElementById("send-btn").disabled = false;
        phase = "result";
        setTimeout(() => generateComprehensiveReport(), 600);
    }
    
    setTimeout(() => {
        const chatWindow = document.getElementById("chat-window");
        if (chatWindow) {
            chatWindow.scrollTop = chatWindow.scrollHeight;
        }
    }, 100);
}

// ── Phase 3: Generate comprehensive disease report ───────────────────────────
async function generateComprehensiveReport() {
    showTyping();

    const res = await fetch("http://127.0.0.1:5000/api/chat-doctor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            questions: generatedQuestions,
            answers: answers
        })
    });
    const result = await res.json();
    removeTyping();

    if (result.error) {
        addBubble("ai", "Something went wrong generating your analysis. Please try again.");
        return;
    }

    rankedDiseases = result.ranked_diseases || [];

    let html = `<div style="width:100%;">`;

    if (result.analysis) {
        html += `<div class="report-section blue" style="margin-bottom:16px;">
            <h3>📋 Analysis</h3>
            <p style="line-height:1.8;">${result.analysis}</p>
        </div>`;
    }

    if (result.emergency_warning && (result.emergency_warning.toLowerCase().includes("hospital") ||
        result.emergency_warning.toLowerCase().includes("emergency"))) {
        html += `<div class="warning-banner" style="margin-bottom:16px; background:var(--surface2); color:var(--text); padding:12px; border-radius:8px;">
            🚨 <strong>EMERGENCY WARNING:</strong> ${result.emergency_warning}
        </div>`;
    }

    html += `<div class="report-section purple" style="margin-bottom:16px;">
        <h3>🔍 Possible Conditions (Ranked by Likelihood)</h3>
        <div style="display:flex; flex-direction:column; gap:12px;">`;

    rankedDiseases.forEach((disease, idx) => {
        const diseaseKey = disease.name.toLowerCase().replace(/\s+/g, '_').replace(/[\/()]/g, '');
        html += `
        <div onclick="showDiseaseDetails('${diseaseKey}')" style="cursor:pointer; padding:12px; border-radius:8px; border:2px solid var(--border-hover); background:var(--surface2); transition:all 0.2s; position:relative;" onmouseover="this.style.background='var(--surface3)'" onmouseout="this.style.background='var(--surface2)'">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <strong style="font-size:16px;">${idx+1}. ${disease.name}</strong>
                    <div style="color:var(--text-dim); font-size:13px; margin-top:4px;">
                        Confidence: <span style="color:var(--text); font-weight:600;">${disease.confidence || 0}%</span>
                    </div>
                    <div style="color:var(--text-dim); font-size:13px; margin-top:6px;">
                        ${disease.reasoning || ""}
                    </div>
                </div>
                <a class="go-button" href="https://www.google.com/search?q=${encodeURIComponent(disease.name + ' symptoms medical information')}" target="_blank" style="white-space:nowrap; margin-left:12px;">🔍 Google</a>
            </div>
        </div>`;
    });

    html += `</div></div>`;

    html += `<div id="disease-modal" style="display:none; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.7); z-index:1000; padding:20px; overflow-y:auto;">
        <div style="background:var(--surface); border-radius:12px; max-width:600px; margin:auto; padding:20px;">
            <button onclick="closeDiseaseModal()" style="float:right; background:none; border:none; font-size:24px; cursor:pointer; color:var(--text-dim);">✕</button>
            <div id="disease-details-content"></div>
        </div>
    </div>`;

    html += `<div class="warning-banner" style="margin-top:16px; font-size:13px;">
        ⚠️ ${result.disclaimer || "This is for informational purposes only. Please consult a real doctor for proper diagnosis and treatment."}
    </div>`;

    html += `</div>`;

    addBubble("ai", html, true);

    setTimeout(() => {
        const win = document.getElementById("chat-window");

        const followUpBtn = document.createElement("button");
        followUpBtn.className = "btn-primary fade-in";
        followUpBtn.style.marginTop = "12px";
        followUpBtn.innerHTML = "🎯 Ask Follow-up Questions to Narrow Down";
        followUpBtn.onclick = () => generateFollowUpQuestions();
        win.appendChild(followUpBtn);

        const newConsultationBtn = document.createElement("button");
        newConsultationBtn.className = "btn-primary fade-in";
        newConsultationBtn.style.marginTop = "8px";
        newConsultationBtn.innerHTML = "🔄 Start New Consultation";
        newConsultationBtn.onclick = () => location.reload();
        win.appendChild(newConsultationBtn);

        win.scrollTop = win.scrollHeight;
    }, 600);

    phase = "consultation";
    document.getElementById("chat-input").placeholder = "Describe your feelings or ask for more details...";
}

function showDiseaseDetails(diseaseKey) {
    const disease = allDiseasesDB[diseaseKey];
    if (!disease) return;

    let detailsHtml = `
    <div style="text-align:center; margin-bottom:20px;">
        <h2 style="margin:0; color:var(--text); font-size:24px;">${disease.name}</h2>
    </div>
    
    <div style="margin-bottom:16px;">
        <h3 style="color:var(--text); font-size:16px;">📖 What is it?</h3>
        <p style="line-height:1.8; font-size:14px;">${disease.description}</p>
    </div>
    
    <div style="margin-bottom:16px;">
        <h3 style="color:var(--text); font-size:16px;">🔍 Main Symptoms to Watch</h3>
        <ul style="padding-left:20px; line-height:2; font-size:14px;">
            ${disease.main_symptoms.map(sym => `<li>${sym}</li>`).join("")}
        </ul>
    </div>
    
    <div style="margin-bottom:16px;">
        <h3 style="color:var(--text); font-size:16px;">⚠️ Worst Case Scenario</h3>
        <p style="line-height:1.8; font-size:14px; color:var(--text-dim);">${disease.worst_case}</p>
    </div>
    
    <div style="margin-bottom:16px;">
        <h3 style="color:var(--text); font-size:16px;">📊 Severity Level</h3>
        <p style="font-size:14px; font-weight:600; color:var(--text);">${disease.severity.toUpperCase()}</p>
    </div>
    
    <div style="display:flex; gap:10px; margin-top:20px;">
        <a href="https://www.google.com/search?q=${encodeURIComponent(disease.name + ' symptoms treatment')}" target="_blank" class="go-button" style="flex:1; text-align:center; padding:10px;">🔍 Google Search</a>
        <a href="https://www.google.com/search?q=${encodeURIComponent(disease.name)}&tbm=isch" target="_blank" class="go-button" style="flex:1; text-align:center; padding:10px;">🖼️ Images</a>
    </div>
    `;

    document.getElementById("disease-details-content").innerHTML = detailsHtml;
    document.getElementById("disease-modal").style.display = "block";
}

function closeDiseaseModal() {
    document.getElementById("disease-modal").style.display = "none";
}

document.addEventListener("click", (e) => {
    const modal = document.getElementById("disease-modal");
    if (modal && e.target === modal) {
        modal.style.display = "none";
    }
});

async function generateFollowUpQuestions() {
    showTyping();

    const res = await fetch("http://127.0.0.1:5000/api/generate-followup-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ranked_diseases: rankedDiseases,
            symptom_history: consultation.initialProblem
        })
    });
    const result = await res.json();
    removeTyping();

    if (result.error || !result.questions) {
        addBubble("ai", "Couldn't generate follow-up questions. Please describe your symptoms or feelings.");
        return;
    }

    consultation.followUpQuestions = result.questions || [];

    let html = `<div style="background:var(--surface2); padding:12px; border-radius:8px; border-left:4px solid var(--border-hover);">
        <p style="margin:0; color:var(--text-dim); font-size:14px;">
            <strong>Smart Questions to Narrow Down:</strong><br>
            ${result.rationale || "These questions will help us identify the most likely condition."}
        </p>
    </div>`;
    addBubble("ai", html);

    showFollowUpQuestion(0, consultation.followUpQuestions);
}

let currentFollowUpIndex = 0;

function showFollowUpQuestion(index, questions) {
    if (index >= questions.length) {
        setTimeout(() => reRankDiseasesBasedOnFollowUp(), 600);
        return;
    }

    currentFollowUpIndex = index;
    const pct = Math.round(((index) / questions.length) * 100);
    document.getElementById("progress-bar").style.width = pct + "%";
    document.getElementById("progress-label").textContent = `Follow-up Q${index + 1} of ${questions.length}`;

    addBubble("ai", `<strong>Follow-up Q${index + 1}:</strong> ${questions[index]}`);
    showAnswerChips();
    document.getElementById("chat-input").disabled = true;
    document.getElementById("send-btn").disabled = true;
    
    scrollToQuestion();
}

function submitFollowUpAnswer(answer) {
    hideAnswerChips();
    addBubble("user", answer);
    consultation.followUpAnswers.push(answer);

    const next = currentFollowUpIndex + 1;
    if (next < consultation.followUpQuestions.length) {
        setTimeout(() => showFollowUpQuestion(next, consultation.followUpQuestions), 500);
    } else {
        document.getElementById("progress-bar").style.width = "100%";
        document.getElementById("progress-label").textContent = "Re-analyzing with new information...";
        document.getElementById("chat-input").disabled = false;
        document.getElementById("send-btn").disabled = false;
        showFollowUpQuestion(next, consultation.followUpQuestions);
    }
}

async function reRankDiseasesBasedOnFollowUp() {
    showTyping();

    const res = await fetch("http://127.0.0.1:5000/api/eliminate-diseases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ranked_diseases: rankedDiseases,
            new_answers: consultation.followUpAnswers,
            elimination_questions: consultation.followUpQuestions
        })
    });
    const result = await res.json();
    removeTyping();

    if (result.error) {
        addBubble("ai", "Couldn't re-analyze. Please try again.");
        return;
    }

    rankedDiseases = result.re_ranked_diseases || rankedDiseases;

    let html = `<div style="width:100%;">`;

    if (result.eliminated_diseases && result.eliminated_diseases.length > 0) {
        html += `<div class="report-section blue" style="margin-bottom:16px;">
            <h3>✓ Eliminated Conditions</h3>
            <p style="line-height:1.8;">Based on your answers, these conditions are less likely:</p>
            <ul style="padding-left:18px; line-height:2;">
            ${result.eliminated_diseases.slice(0, 5).map(d => `<li>${d}</li>`).join("")}
            </ul>
        </div>`;
    }

    if (result.re_ranked_diseases && result.re_ranked_diseases.length > 0) {
        html += `<div class="report-section green" style="margin-bottom:16px;">
            <h3>📊 Updated Diagnosis (Most Likely First)</h3>
            <div style="display:flex; flex-direction:column; gap:12px;">`;

        result.re_ranked_diseases.slice(0, 8).forEach((disease, idx) => {
            const diseaseKey = disease.name.toLowerCase().replace(/\s+/g, '_').replace(/[\/()]/g, '');
            html += `
            <div onclick="showDiseaseDetails('${diseaseKey}')" style="cursor:pointer; padding:12px; border-radius:8px; border:2px solid var(--border-hover); background:var(--surface2); transition:all 0.2s;" onmouseover="this.style.background='var(--surface3)'" onmouseout="this.style.background='var(--surface2)'">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <strong style="font-size:16px;">${idx+1}. ${disease.name}</strong>
                        <div style="color:var(--text-dim); font-size:13px; margin-top:4px;">
                            Confidence: <span style="color:var(--text); font-weight:600;">${disease.confidence || 0}%</span>
                        </div>
                        <div style="color:var(--text-dim); font-size:13px; margin-top:6px;">
                            ${disease.reason || ""}
                        </div>
                    </div>
                    <a class="go-button" href="https://www.google.com/search?q=${encodeURIComponent(disease.name)}" target="_blank" style="white-space:nowrap; margin-left:12px;">🔍 Google</a>
                </div>
            </div>`;
        });

        html += `</div></div>`;
    }

    if (result.next_steps) {
        html += `<div class="report-section orange" style="margin-bottom:16px;">
            <h3>📋 Next Steps</h3>
            <p style="line-height:1.8;">${result.next_steps}</p>
        </div>`;
    }

    html += `</div>`;

    addBubble("ai", html, true);

    setTimeout(() => {
        const win = document.getElementById("chat-window");

        const continueBtn = document.createElement("button");
        continueBtn.className = "btn-primary fade-in";
        continueBtn.style.marginTop = "12px";
        continueBtn.innerHTML = "💬 Continue Consultation";
        continueBtn.onclick = () => {
            document.getElementById("chat-input").placeholder = "Tell me more about your condition...";
            document.getElementById("chat-input").focus();
        };
        win.appendChild(continueBtn);

        const newConsultationBtn = document.createElement("button");
        newConsultationBtn.className = "btn-primary fade-in";
        newConsultationBtn.style.marginTop = "8px";
        newConsultationBtn.innerHTML = "🔄 Start New Consultation";
        newConsultationBtn.onclick = () => location.reload();
        win.appendChild(newConsultationBtn);

        win.scrollTop = win.scrollHeight;
    }, 600);

    phase = "consultation";
}

async function handleConsultationMessage(userMessage) {
    addBubble("ai", `<span style="color:var(--text-dim); font-style:italic;">Processing your input...</span>`);
    showTyping();

    setTimeout(() => {
        removeTyping();

        let responseHtml = `<div style="background:var(--surface2); padding:12px; border-radius:8px;">
            <p style="line-height:1.8; margin:0;">
                Thank you for the additional information. Based on what you've shared, the analysis above should be helpful.
                <br><br>
                <strong>Remember:</strong> This assessment is informational only. Please consult a qualified doctor for proper diagnosis and treatment.
            </p>
        </div>`;

        addBubble("ai", responseHtml);

        const win = document.getElementById("chat-window");

        const exploreBtn = document.createElement("button");
        exploreBtn.className = "btn-primary fade-in";
        exploreBtn.style.marginTop = "12px";
        exploreBtn.innerHTML = "🔍 Explore More Conditions";
        exploreBtn.onclick = () => {
            addBubble("ai", `Here are more details about all ${Object.keys(allDiseasesDB).length} possible conditions. Scroll up to see all diseases listed, or describe other symptoms you're experiencing.`);
        };
        win.appendChild(exploreBtn);

        const newConsultationBtn = document.createElement("button");
        newConsultationBtn.className = "btn-primary fade-in";
        newConsultationBtn.style.marginTop = "8px";
        newConsultationBtn.innerHTML = "🔄 Start New Consultation";
        newConsultationBtn.onclick = () => location.reload();
        win.appendChild(newConsultationBtn);

        win.scrollTop = win.scrollHeight;
    }, 1200);
}

document.addEventListener("DOMContentLoaded", () => {
    window.submitAnswerChip = function (answer) {
        if (phase === "questions") {
            submitAnswer(answer);
        } else if (phase === "follow-up") {
            submitFollowUpAnswer(answer);
        }
    };
});

async function init() {
    await loadDiseasesDatabase();

    addBubble("ai", `Hello 👋 I'm your <strong>AI Health Assistant</strong>.<br><br>
        I can help analyze your symptoms and provide information about possible conditions.
        <br><br>
        Tell me what problem or symptom you're experiencing right now, and I'll guide you through a comprehensive assessment.`);

    document.getElementById("chat-input")
        .addEventListener("keydown", e => {
            if (e.key === "Enter" && phase === "problem") sendUserMessage();
            else if (e.key === "Enter" && phase === "consultation") sendUserMessage();
        });

    document.getElementById("answer-chips").innerHTML = `
        <button class="chip yes"    onclick="phase === 'questions' ? submitAnswer('Yes') : submitFollowUpAnswer('Yes')">✅ Yes</button>
        <button class="chip no"     onclick="phase === 'questions' ? submitAnswer('No') : submitFollowUpAnswer('No')">❌ No</button>
        <button class="chip unsure" onclick="phase === 'questions' ? submitAnswer('Not sure') : submitFollowUpAnswer('Not sure')">🤔 Not Sure</button>
    `;
}

window.resetDoctorChat = function(savedHtml) {
    conversationMessages = [];
    answers = [];
    generatedQuestions = [];
    currentQuestion = 0;
    phase = "consultation";
    rankedDiseases = [];
    consultationHistory = [];
    
    consultation = {
        initialProblem: "",
        initialAnswers: [],
        followUpQuestions: [],
        followUpAnswers: [],
        diseaseEliminations: []
    };
    
    const chatInput = document.getElementById("chat-input");
    const sendBtn = document.getElementById("send-btn");
    if (chatInput) {
        chatInput.disabled = false;
        chatInput.placeholder = "Describe your symptoms or ask for more details...";
    }
    if (sendBtn) sendBtn.disabled = false;
    
    hideAnswerChips();
    
    const progressBar = document.getElementById("progress-bar");
    const progressLabel = document.getElementById("progress-label");
    if (progressBar) progressBar.style.width = "0%";
    if (progressLabel) progressLabel.textContent = "Chat loaded";
    
    const stepDots = document.querySelectorAll(".step-dot");
    stepDots.forEach((dot, idx) => {
        if (idx === 0) {
            dot.classList.add("active");
            dot.classList.remove("done");
        } else {
            dot.classList.remove("active", "done");
        }
    });
    
    console.log("Doctor chat reset, loaded saved conversation");
};

init();