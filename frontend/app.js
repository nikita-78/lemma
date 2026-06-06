/**
 * Lemma Frontend Engine (Vanilla JS)
 */

document.addEventListener("DOMContentLoaded", () => {
    // API URL configuration
    const API_BASE_URL = "http://localhost:8000";
    const API_UPLOAD_URL = `${API_BASE_URL}/api/v1/documents/upload`;
    const API_HEALTH_URL = `${API_BASE_URL}/api/v1/health`;

    // DOM Elements
    const serverStatusDot = document.getElementById("server-status-dot");
    const serverStatusText = document.getElementById("server-status-text");
    const dropZone = document.getElementById("drop-zone");
    const fileInput = document.getElementById("file-input");
    const documentViewer = document.getElementById("document-viewer");
    const documentRender = document.getElementById("document-content-render");
    const viewerFilename = document.getElementById("viewer-filename");
    const viewerDocType = document.getElementById("viewer-doc-type");
    const btnReupload = document.getElementById("btn-reupload");
    const btnRunAnalysis = document.getElementById("btn-run-analysis");
    const toastContainer = document.getElementById("toast-container");

    // Metadata Elements
    const metaChars = document.getElementById("meta-chars");
    const metaSentences = document.getElementById("meta-sentences");
    const metaFilename = document.getElementById("meta-filename");
    const metaStatus = document.getElementById("meta-status");

    // Inspector Elements
    const inspectorPlaceholder = document.getElementById("inspector-placeholder");
    const inspectorData = document.getElementById("inspector-data");
    const inspectStart = document.getElementById("inspect-start");
    const inspectEnd = document.getElementById("inspect-end");
    const inspectText = document.getElementById("inspect-text");
    const btnQuickParaphrase = document.getElementById("btn-quick-paraphrase");

    // App State
    let activeFile = null;
    let uploadResponseData = null;

    // Initialize Page
    checkServerHealth();
    setInterval(checkServerHealth, 10000); // Check health every 10 seconds

    /* -------------------------------------------------------------
     * Server Health Checking
     * ------------------------------------------------------------- */
    async function checkServerHealth() {
        try {
            const response = await fetch(API_HEALTH_URL, { signal: AbortSignal.timeout(3000) });
            if (response.ok) {
                serverStatusDot.className = "status-indicator online";
                serverStatusText.textContent = "Server: Online";
            } else {
                throw new Error("Server status abnormal");
            }
        } catch (error) {
            serverStatusDot.className = "status-indicator offline";
            serverStatusText.textContent = "Server: Offline";
        }
    }

    /* -------------------------------------------------------------
     * Toast Notifications Helper
     * ------------------------------------------------------------- */
    function showToast(message, type = "info") {
        const toast = document.createElement("div");
        toast.className = `toast toast-${type}`;
        
        let icon = '<i class="fa-solid fa-circle-info"></i>';
        if (type === "error") icon = '<i class="fa-solid fa-circle-exclamation"></i>';
        if (type === "success") icon = '<i class="fa-solid fa-circle-check"></i>';

        toast.innerHTML = `
            ${icon}
            <div class="toast-message">${message}</div>
        `;
        
        toastContainer.appendChild(toast);

        // Slide out and remove
        setTimeout(() => {
            toast.style.animation = "slide-in 0.3s reverse forwards";
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    /* -------------------------------------------------------------
     * Ingestion / Drag-and-Drop Handlers
     * ------------------------------------------------------------- */
    // Open file dialog on click
    dropZone.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
            handleFileSelection(e.target.files[0]);
        }
    });

    // Drag over styling
    dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZone.classList.add("dragover");
    });

    dropZone.addEventListener("dragleave", () => {
        dropZone.classList.remove("dragover");
    });

    dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.classList.remove("dragover");
        if (e.dataTransfer.files.length > 0) {
            handleFileSelection(e.dataTransfer.files[0]);
        }
    });

    function handleFileSelection(file) {
        const allowedExtensions = ["txt", "docx", "pdf"];
        const fileExt = file.name.split(".").pop().toLowerCase();

        if (!allowedExtensions.includes(fileExt)) {
            showToast(`Unsupported file type: .${fileExt}. Please upload PDF, DOCX, or TXT.`, "error");
            return;
        }

        if (file.size > 100 * 1024 * 1024) {
            showToast("File size exceeds 100MB limit.", "error");
            return;
        }

        activeFile = file;
        uploadDocument(file);
    }

    /* -------------------------------------------------------------
     * Document Upload Service Call
     * ------------------------------------------------------------- */
    async function uploadDocument(file) {
        // Update Metadata sidebar indicators
        metaFilename.textContent = file.name;
        metaStatus.innerHTML = '<span class="badge badge-dim">Uploading...</span>';
        
        // Show loading progress
        showToast(`Uploading and parsing ${file.name}...`, "info");
        
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch(API_UPLOAD_URL, {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Failed to parse document");
            }

            uploadResponseData = data;
            showToast("Document segmented successfully!", "success");
            
            // Render Document Viewer
            renderDocument(data);
            
            // Enable analysis button trigger (Phase 2)
            btnRunAnalysis.disabled = false;
        } catch (error) {
            console.error("Upload Error:", error);
            showToast(error.message, "error");
            
            // Reset metadata card on failure
            metaFilename.textContent = "No file uploaded";
            metaStatus.innerHTML = '<span class="badge badge-dim">Idle</span>';
        }
    }

    /* -------------------------------------------------------------
     * Document Rendering & Highlight Setup
     * ------------------------------------------------------------- */
    function renderDocument(data) {
        // Update details card
        viewerFilename.textContent = data.filename;
        const fileExt = data.filename.split(".").pop().toUpperCase();
        viewerDocType.textContent = fileExt;
        
        metaChars.textContent = data.char_count.toLocaleString();
        metaSentences.textContent = data.sentence_count.toLocaleString();
        metaStatus.innerHTML = '<span class="badge badge-dim">Segmented</span>';

        // Clear contents
        documentRender.innerHTML = "";

        // If no sentences were parsed
        if (!data.sentences || data.sentences.length === 0) {
            documentRender.textContent = data.text || "Empty document.";
            return;
        }

        // We construct the HTML dynamically using segments and coordinate index spans
        // Let's rebuild the text using sentence bounds to ensure coordinates align exactly
        let fullText = data.text;
        let lastOffset = 0;

        data.sentences.forEach((sentence, index) => {
            const start = sentence.start_char;
            const end = sentence.end_char;

            // Append any raw text between sentences (like original spaces or newlines)
            if (start > lastOffset) {
                const intermediateText = fullText.substring(lastOffset, start);
                const textSpan = document.createTextNode(intermediateText);
                documentRender.appendChild(textSpan);
            }

            // Create sentence highlights
            const sentSpan = document.createElement("span");
            sentSpan.className = "doc-sentence";
            sentSpan.textContent = sentence.text;
            sentSpan.dataset.index = index;
            sentSpan.dataset.start = start;
            sentSpan.dataset.end = end;

            // Hover interactions
            sentSpan.addEventListener("mouseenter", () => {
                highlightSentence(sentSpan, sentence);
            });

            // Click interactions (persists coordinates details in inspector)
            sentSpan.addEventListener("click", (e) => {
                e.stopPropagation();
                // Toggle active selection state
                document.querySelectorAll(".doc-sentence").forEach(s => s.classList.remove("active"));
                sentSpan.classList.add("active");
                inspectSentence(sentence, true);
            });

            documentRender.appendChild(sentSpan);
            lastOffset = end;
        });

        // Append remaining tail text
        if (lastOffset < fullText.length) {
            const tailText = fullText.substring(lastOffset);
            const textSpan = document.createTextNode(tailText);
            documentRender.appendChild(textSpan);
        }

        // Show viewer, hide upload panel
        dropZone.classList.add("hidden");
        documentViewer.classList.remove("hidden");
    }

    /* -------------------------------------------------------------
     * Coordinate Inspection Handlers
     * ------------------------------------------------------------- */
    function highlightSentence(element, sentence) {
        // If there's no clicked sentence active, update on hover
        const hasActiveClick = document.querySelector(".doc-sentence.active") !== null;
        if (!hasActiveClick) {
            inspectSentence(sentence, false);
        }
    }

    function inspectSentence(sentence, isClicked) {
        inspectorPlaceholder.classList.add("hidden");
        inspectorData.classList.remove("hidden");

        inspectStart.textContent = sentence.start_char;
        inspectEnd.textContent = sentence.end_char;
        inspectText.textContent = `"${sentence.text}"`;
    }

    // Reset Viewer/Upload Ingestion state
    btnReupload.addEventListener("click", () => {
        documentViewer.classList.add("hidden");
        dropZone.classList.remove("hidden");
        fileInput.value = ""; // clear input stream
        
        // Reset Metadata stats
        metaChars.textContent = "-";
        metaSentences.textContent = "-";
        metaFilename.textContent = "No file uploaded";
        metaStatus.innerHTML = '<span class="badge badge-dim">Idle</span>';
        
        // Reset Inspector state
        inspectorPlaceholder.classList.remove("hidden");
        inspectorData.classList.add("hidden");
        document.querySelectorAll(".doc-sentence").forEach(s => s.classList.remove("active"));

        activeFile = null;
        uploadResponseData = null;
        btnRunAnalysis.disabled = true;
    });

    // Trigger analysis toast (Phase 2 Preview callback)
    btnRunAnalysis.addEventListener("click", () => {
        showToast("Phase 2 Matcher Engine running (Lexical & Semantic)...", "info");
        
        // Mock a matching analysis update for WOW styling
        const lexicalChk = document.getElementById("chk-lexical");
        const semanticChk = document.getElementById("chk-semantic");
        const progressScore = document.getElementById("plagiarism-score-text");
        const progressCircle = document.querySelector(".circular-progress");

        lexicalChk.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Checking Lexical Database...';
        lexicalChk.className = "checklist-item done";

        setTimeout(() => {
            lexicalChk.innerHTML = '<i class="fa-regular fa-circle-check"></i> Lexical Match Complete';
            semanticChk.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Indexing Semantic Vectors...';
            semanticChk.className = "checklist-item done";
            
            // Set mock circular progress values
            progressScore.textContent = "37%";
            progressCircle.style.background = `conic-gradient(var(--accent-purple) ${37 * 3.6}deg, var(--border-color) 0deg)`;
            
            setTimeout(() => {
                semanticChk.innerHTML = '<i class="fa-regular fa-circle-check"></i> Semantic Matching Complete';
                showToast("Analysis complete. Found 37% plagiarism match profile.", "success");
            }, 1500);
        }, 1500);
    });

    // Paraphrase button triggers UI alert
    btnQuickParaphrase.addEventListener("click", () => {
        const sentenceText = inspectText.textContent.replace(/"/g, "");
        showToast(`Sending segment to local Ollama rewriter: "${sentenceText.substring(0, 30)}..."`, "info");
    });

    /* -------------------------------------------------------------
     * Sidebar Nav Navigation & Theme Styling Mock
     * ------------------------------------------------------------- */
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            navItems.forEach(n => n.classList.remove("active"));
            item.classList.add("active");
            
            const tabId = item.id;
            if (tabId === "nav-dashboard" || tabId === "nav-plagiarism") {
                // Keep showing dashboard
            } else {
                showToast(`${item.textContent.trim()} workspace module is coming in Phase 3/4.`, "info");
            }
        });
    });

    // Mock theme toggle (pure black stays, toggle adds styling glow shift)
    let isPurpleAccent = true;
    const themeToggleBtn = document.getElementById("theme-toggle-btn");
    themeToggleBtn.addEventListener("click", () => {
        isPurpleAccent = !isPurpleAccent;
        const bodyRoot = document.documentElement;
        if (isPurpleAccent) {
            bodyRoot.style.setProperty("--accent-purple", "#8b5cf6");
            themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
            showToast("Accent shifted to Royal Purple glow.", "info");
        } else {
            bodyRoot.style.setProperty("--accent-purple", "#10b981"); // Emerald green accent alternative
            themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
            showToast("Accent shifted to Emerald Green glow.", "info");
        }
    });
});
