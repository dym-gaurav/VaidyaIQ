let selectedFile = null;

// Drag and drop
const dropZone = document.getElementById("drop-zone");

dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.style.background = "var(--primary-light)";
});

dropZone.addEventListener("dragleave", () => {
    dropZone.style.background = "";
});

dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.style.background = "";
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
});

function handleFile(file) {
    selectedFile = file;
    const preview = document.getElementById("preview");
    preview.src = URL.createObjectURL(file);
    preview.style.display = "block";
    dropZone.style.display = "none";
}

async function submitPrescription() {
    if (!selectedFile) {
        alert("Please upload a prescription image first.");
        return;
    }

    const note = document.getElementById("user-note").value;

    document.getElementById("upload-section").style.display = "none";
    document.getElementById("loading-section").style.display = "block";

    const result = await uploadPrescription(selectedFile, note);

    document.getElementById("loading-section").style.display = "none";

    if (result.error) {
        alert("Could not read prescription. Please try a clearer image.");
        location.reload();
        return;
    }

    // Mismatch warning
    if (result.mismatch_warning) {
        document.getElementById("mismatch-text").textContent = result.mismatch_warning;
        document.getElementById("mismatch-section").style.display = "block";
    }

    // Render medicines
    const medicinesList = document.getElementById("medicines-list");
    medicinesList.innerHTML = "";
    (result.medicines || []).forEach(med => {
        medicinesList.innerHTML += `
            <div class="medicine-card">
                <div class="medicine-header">💊 ${med.name}</div>
                <div class="medicine-body">
                    <p><strong>Purpose:</strong> ${med.purpose}</p>
                    <p><strong>Commonly treats:</strong> ${med.common_conditions}</p>
                </div>
            </div>
        `;
    });

    // Render routine table
    const routineBody = document.getElementById("routine-body");
    routineBody.innerHTML = "";
    (result.routine || []).forEach(r => {
        routineBody.innerHTML += `
            <tr style="border-bottom:1px solid #eee;">
                <td style="padding:10px;">${r.medicine}</td>
                <td style="padding:10px;">${r.times_per_day}</td>
                <td style="padding:10px;">${r.schedule}</td>
            </tr>
        `;
    });

    // Go buttons
    renderGoButtons(document.getElementById("results-section"));

    document.getElementById("results-section").style.display = "block";
    if (window.VaidyaHistory) {
        window.VaidyaHistory.savePrescription(document.getElementById("results-section").innerHTML);
    }
}

function renderGoButtons(container) {
    const MEDICAL_TERMS = [
        "fever", "diabetes", "blood pressure", "infection", "antibiotic",
        "paracetamol", "ibuprofen", "insulin", "cholesterol", "kidney",
        "liver", "heart", "thyroid", "anemia", "vitamin", "calcium",
        "hemoglobin", "allergy", "asthma", "migraine", "inflammation",
        "Dolo", "Crocin", "Azithromycin", "Metformin", "Atorvastatin"
    ];

    container.querySelectorAll("p, td").forEach(el => {
        let html = el.innerHTML;
        MEDICAL_TERMS.forEach(term => {
            const regex = new RegExp(`\\b(${term})\\b`, "gi");
            html = html.replace(regex, (match) => {
                const query = encodeURIComponent(match + " medicine information");
                return `${match} <a class="go-button" href="https://www.google.com/search?q=${query}" target="_blank">Go →</a>`;
            });
        });
        el.innerHTML = html;
    });
}
