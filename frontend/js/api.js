const BASE_URL = "http://127.0.0.1:5000";

async function askChatDoctor(questions, answers) {
    try {
        const res = await fetch(`${BASE_URL}/api/chat-doctor`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ questions, answers })
        });
        return await res.json();
    } catch (e) {
        return { error: e.message };
    }
}

async function uploadPrescription(imageFile, note) {
    try {
        const formData = new FormData();
        formData.append("image", imageFile);
        formData.append("note", note);
        const res = await fetch(`${BASE_URL}/api/prescription`, {
            method: "POST",
            body: formData
        });
        return await res.json();
    } catch (e) {
        return { error: e.message };
    }
}

async function sendTherapistMessage(messages, language, age) {
    try {
        const res = await fetch(`${BASE_URL}/api/therapist`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages, language, age })
        });
        return await res.json();
    } catch (e) {
        return { error: e.message };
    }
}