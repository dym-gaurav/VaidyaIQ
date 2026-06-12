(function () {
    const STORAGE_KEY = "vaidyaiq_shared_history";
    const pageNames = {
        doctor: "Doctor",
        prescription: "Prescription",
        therapist: "Therapy"
    };

    function readItems() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        } catch (_) {
            return [];
        }
    }

    function writeItems(items) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }

    function stripHtml(html) {
        const tmp = document.createElement("div");
        tmp.innerHTML = html || "";
        return (tmp.textContent || tmp.innerText || "").trim();
    }

    function titleFrom(text, fallback) {
        const clean = (text || "").replace(/\s+/g, " ").trim();
        if (!clean) return fallback;
        return clean.length > 42 ? clean.slice(0, 42) + "..." : clean;
    }

    function escapeHtml(text) {
        return String(text || "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }

    function ensureSidebar() {
        if (document.getElementById("shared-chat-sidebar")) return;

        const aside = document.createElement("aside");
        aside.className = "shared-chat-sidebar";
        aside.id = "shared-chat-sidebar";
        aside.innerHTML = `
            <div class="shared-chat-header">
                <strong>Saved Chats</strong>
                <button class="shared-chat-close" type="button" onclick="VaidyaHistory.toggleSidebar(false)">Close</button>
            </div>
            <div class="shared-chat-list" id="shared-chat-list"></div>
        `;
        document.body.appendChild(aside);
    }

    function renderSidebar() {
        ensureSidebar();
        const list = document.getElementById("shared-chat-list");
        const items = readItems().sort((a, b) => b.updatedAt - a.updatedAt);

        if (!items.length) {
            list.innerHTML = `<div class="shared-chat-empty">No saved chats yet.</div>`;
            return;
        }

        list.innerHTML = items.map(item => `
            <div class="shared-chat-item" data-id="${item.id}">
                <div class="shared-chat-item-content" onclick="VaidyaHistory.loadChat('${item.type}', \`${escapeHtml(item.html).replace(/`/g, '\\`').replace(/\$/g, '$$$$')}\`, '${item.id}')">
                    <span class="shared-chat-item-title">${escapeHtml(item.title)}</span>
                    <span class="shared-chat-item-meta">${pageNames[item.type] || "Chat"} · ${new Date(item.updatedAt).toLocaleDateString()}</span>
                </div>
                <button class="shared-chat-delete" data-id="${item.id}" onclick="event.stopPropagation(); VaidyaHistory.deleteItem('${item.id}')" aria-label="Delete chat">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6l-1 14H6L5 6"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                        <path d="M9 6V4h6v2"></path>
                    </svg>
                </button>
            </div>
        `).join("");
    }

    function renderHamburgerChats() {
        const el = document.getElementById("hamburger-chat-list");
        if (!el) return;
        const items = readItems().sort((a, b) => b.updatedAt - a.updatedAt);
        if (!items.length) {
            el.innerHTML = '<div style="font-size:12px;color:var(--text-muted);padding:8px 14px;">No saved chats yet.</div>';
            return;
        }
        el.innerHTML = items.map(item => `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 8px 6px 14px; border-radius: var(--radius-xs);">
                <a href="javascript:void(0)" onclick="VaidyaHistory.loadChat('${item.type}', \`${escapeHtml(item.html).replace(/`/g, '\\`').replace(/\$/g, '$$$$')}\`, '${item.id}')" style="flex: 1; color: var(--text-dim); text-decoration: none; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${escapeHtml(item.title)}
                </a>
                <button onclick="event.stopPropagation(); VaidyaHistory.deleteItem('${item.id}')" style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 6px; border-radius: 4px; display: flex; align-items: center; justify-content: center;" aria-label="Delete chat">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6l-1 14H6L5 6"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                        <path d="M9 6V4h6v2"></path>
                    </svg>
                </button>
            </div>
        `).join("");
    }

    function createOrUpdate(id, data) {
        const items = readItems();
        const existing = items.find(item => item.id === id);
        const now = Date.now();

        if (existing) {
            existing.title = data.title || existing.title;
            existing.html = data.html || existing.html;
            existing.type = data.type || existing.type;
            existing.page = data.page || existing.page;
            existing.updatedAt = now;
        } else {
            items.push({
                id,
                type: data.type,
                title: data.title,
                html: data.html || "",
                page: data.page,
                createdAt: now,
                updatedAt: now
            });
        }

        writeItems(items);
        renderSidebar();
        renderHamburgerChats();
    }

    window.VaidyaHistory = {
        init() {
            ensureSidebar();
            renderSidebar();
            renderHamburgerChats();

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    const sidebar = document.getElementById("shared-chat-sidebar");
                    if (sidebar && sidebar.classList.contains('open')) {
                        sidebar.classList.remove('open');
                    }
                    const hamburger = document.getElementById('hamburger-sidebar');
                    if (hamburger && hamburger.classList.contains('open')) {
                        hamburger.classList.remove('open');
                        document.body.classList.remove('hamburger-open');
                    }
                }
            });
        },

        toggleSidebar(force) {
            ensureSidebar();
            const sidebar = document.getElementById("shared-chat-sidebar");
            const open = typeof force === "boolean" ? force : !sidebar.classList.contains("open");
            sidebar.classList.toggle("open", open);
        },

        deleteItem(id) {
            const items = readItems().filter(item => item.id !== id);
            writeItems(items);
            renderSidebar();
            renderHamburgerChats();
        },

        saveSnapshot(type, titleText, html, page) {
            if (!html || html.length < 50) return;

            let id = sessionStorage.getItem("vaidyaiq_" + type + "_session");
            if (!id) {
                id = `${type}-${Date.now()}`;
                sessionStorage.setItem("vaidyaiq_" + type + "_session", id);
            }

            createOrUpdate(id, {
                type,
                page,
                title: titleFrom(titleText || stripHtml(html), pageNames[type] || "Chat"),
                html
            });
        },

        loadChat(type, html, id) {
            const decodedHtml = html.replace(/\\`/g, '`').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

            let chatWindow = null;
            if (type === "doctor" && window.location.pathname.includes("chat-doctor.html")) {
                chatWindow = document.getElementById("chat-window");
                if (chatWindow && decodedHtml) {
                    chatWindow.innerHTML = decodedHtml;
                    if (window.resetDoctorChat) window.resetDoctorChat(decodedHtml);
                }
            } else if (type === "therapist" && window.location.pathname.includes("therapist.html")) {
                chatWindow = document.getElementById("chat-window");
                if (chatWindow && decodedHtml) {
                    chatWindow.innerHTML = decodedHtml;
                    if (window.resetTherapistChat) window.resetTherapistChat(decodedHtml);
                }
            } else {
                let targetPage = type === "doctor" ? "chat-doctor.html" : "therapist.html";
                if (type === "prescription") targetPage = "prescription.html";
                localStorage.setItem("vaidyaiq_load_chat", JSON.stringify({ type, html: decodedHtml, id }));
                window.location.href = targetPage;
                return;
            }

            const sidebar = document.getElementById("shared-chat-sidebar");
            if (sidebar) sidebar.classList.remove("open");

            if (chatWindow) chatWindow.scrollTop = chatWindow.scrollHeight;
        },

        savePrescription(resultHtml) {
            createOrUpdate(`prescription-${Date.now()}`, {
                type: "prescription",
                page: "prescription.html",
                title: "Prescription result",
                html: resultHtml
            });
        }
    };

    const pendingChat = localStorage.getItem("vaidyaiq_load_chat");
    if (pendingChat) {
        try {
            const chat = JSON.parse(pendingChat);
            localStorage.removeItem("vaidyaiq_load_chat");
            setTimeout(() => {
                if (window.VaidyaHistory) {
                    window.VaidyaHistory.loadChat(chat.type, chat.html, chat.id);
                }
            }, 500);
        } catch (e) { }
    }

    document.addEventListener("DOMContentLoaded", () => window.VaidyaHistory.init());
})();

function toggleHamburger() {
    const sidebar = document.getElementById('hamburger-sidebar');
    const body = document.body;

    sidebar.classList.toggle('open');
    body.classList.toggle('hamburger-open');

    const sharedSidebar = document.getElementById('shared-chat-sidebar');
    if (sharedSidebar && sharedSidebar.classList.contains('open')) {
        sharedSidebar.classList.remove('open');
    }

    if (window.innerWidth <= 768) {
        if (sidebar.classList.contains('open')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }
}

document.addEventListener('click', function (e) {
    const sidebar = document.getElementById('hamburger-sidebar');
    const btn = document.querySelector('.hamburger-btn');
    const sharedSidebar = document.getElementById('shared-chat-sidebar');

    if (sidebar && sidebar.classList.contains('open') &&
        !sidebar.contains(e.target) &&
        !btn.contains(e.target) &&
        (!sharedSidebar || !sharedSidebar.contains(e.target))) {
        sidebar.classList.remove('open');
        document.body.classList.remove('hamburger-open');
        document.body.style.overflow = '';
    }
});

window.addEventListener('resize', function () {
    if (window.innerWidth > 768) {
        const sidebar = document.getElementById('hamburger-sidebar');
        if (sidebar && sidebar.classList.contains('open')) {
            document.body.style.overflow = '';
        }
    }
});