// ============================================
// SCRIPT.JS - Complete Frontend Logic with ALL Features
// ============================================

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
    API_URL: 'https://code-quality-api.onrender.com',
    TOAST_DURATION: 4000,
    MAX_HISTORY: 20,
};

// ============================================
// DOM REFERENCES - Complete
// ============================================

const DOM = {
    // Code editor elements
    codeDisplay: document.getElementById('codeDisplay'),
    analyzeBtn: document.getElementById('analyzeBtn'),
    clearBtn: document.getElementById('clearBtn'),
    exampleBtn: document.getElementById('exampleBtn'),
    loadingState: document.getElementById('loadingState'),
    resultsContent: document.getElementById('resultsContent'),
    emptyState: document.getElementById('emptyState'),
    resultTimestamp: document.getElementById('resultTimestamp'),
    lineCount: document.getElementById('lineCount'),
    
    // Results
    qualityScore: document.getElementById('qualityScore'),
    qualityProgress: document.getElementById('qualityProgress'),
    qualityBadge: document.getElementById('qualityBadge'),
    
    bugScore: document.getElementById('bugScore'),
    bugProgress: document.getElementById('bugProgress'),
    bugBadge: document.getElementById('bugBadge'),
    
    complexityScore: document.getElementById('complexityScore'),
    complexityProgress: document.getElementById('complexityProgress'),
    complexityBadge: document.getElementById('complexityBadge'),
    
    maintainabilityScore: document.getElementById('maintainabilityScore'),
    maintainabilityProgress: document.getElementById('maintainabilityProgress'),
    maintainabilityBadge: document.getElementById('maintainabilityBadge'),
    
    metricLines: document.getElementById('metricLines'),
    metricFunctions: document.getElementById('metricFunctions'),
    metricClasses: document.getElementById('metricClasses'),
    metricComments: document.getElementById('metricComments'),
    
    // History
    historyModal: document.getElementById('historyModal'),
    historyToggle: document.getElementById('historyToggle'),
    historyClose: document.getElementById('historyClose'),
    historyCloseBtn: document.getElementById('historyCloseBtn'),
    historyRefresh: document.getElementById('historyRefresh'),
    historyList: document.getElementById('historyList'),
    
    // Theme
    themeToggle: document.getElementById('themeToggle'),
    
    // Toast
    toastContainer: document.getElementById('toastContainer'),
    
    // ===== NEW: Share & PDF Elements =====
    actionSection: document.getElementById('actionSection'),
    shareBtn: document.getElementById('shareBtn'),
    pdfBtn: document.getElementById('pdfBtn'),
    copyLinkBtn: document.getElementById('copyLinkBtn'),
    
    shareModal: document.getElementById('shareModal'),
    shareClose: document.getElementById('shareClose'),
    shareCloseBtn: document.getElementById('shareCloseBtn'),
    shareSummary: document.getElementById('shareSummary'),
    shareLinkInput: document.getElementById('shareLinkInput'),
    shareCopyLinkBtn: document.getElementById('shareCopyLinkBtn'),
    qrCodeContainer: document.getElementById('qrcode'),
};

// ============================================
// STATE MANAGEMENT
// ============================================

const state = {
    isAnalyzing: false,
    currentResults: null,
    darkMode: localStorage.getItem('darkMode') === 'true',
};

// ============================================
// SYNTAX HIGHLIGHTING HELPERS
// ============================================

function highlightCode() {
    if (typeof Prism !== 'undefined' && DOM.codeDisplay) {
        Prism.highlightElement(DOM.codeDisplay);
    }
}

function getCode() {
    if (!DOM.codeDisplay) return '';
    return DOM.codeDisplay.textContent || '';
}

function setCode(code) {
    if (!DOM.codeDisplay) return;
    DOM.codeDisplay.textContent = code || '';
    highlightCode();
    updateLineCount();
}

function clearCode() {
    if (!DOM.codeDisplay) return;
    DOM.codeDisplay.textContent = '';
    highlightCode();
    updateLineCount();
    DOM.codeDisplay.focus();
}

function updateLineCount() {
    if (!DOM.codeDisplay || !DOM.lineCount) return;
    const lines = DOM.codeDisplay.textContent.split('\n').length;
    DOM.lineCount.textContent = `${lines} lines`;
}

// ============================================
// CODE EDITOR EVENT HANDLERS
// ============================================

function handleCodeInput(e) {
    const selection = window.getSelection();
    if (!selection.rangeCount) {
        updateLineCount();
        return;
    }
    
    const range = selection.getRangeAt(0);
    const textNode = DOM.codeDisplay.firstChild;
    let startOffset = 0;
    
    if (textNode) {
        startOffset = range.startOffset;
    }
    
    updateLineCount();
    highlightCode();
    
    try {
        if (textNode) {
            const newRange = document.createRange();
            const safeOffset = Math.min(startOffset, textNode.length);
            newRange.setStart(textNode, safeOffset);
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);
        }
    } catch (e) {
        try {
            const range = document.createRange();
            range.selectNodeContents(DOM.codeDisplay);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        } catch (err) {}
    }
}

function handleCodeKeydown(e) {
    if (e.key === 'Tab') {
        e.preventDefault();
        
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        const range = selection.getRangeAt(0);
        const textNode = DOM.codeDisplay.firstChild;
        
        if (!textNode) return;
        
        const start = range.startOffset;
        const end = range.endOffset;
        const text = textNode.textContent || '';
        
        const newText = text.substring(0, start) + '    ' + text.substring(end);
        textNode.textContent = newText;
        
        try {
            const newRange = document.createRange();
            const newPosition = Math.min(start + 4, textNode.length);
            newRange.setStart(textNode, newPosition);
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);
        } catch (err) {
            const newRange = document.createRange();
            newRange.selectNodeContents(DOM.codeDisplay);
            newRange.collapse(false);
            selection.removeAllRanges();
            selection.addRange(newRange);
        }
        
        highlightCode();
        updateLineCount();
    }
}

// ============================================
// THEME TOGGLE
// ============================================

function initTheme() {
    if (state.darkMode) {
        document.body.classList.add('dark-mode');
        DOM.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    setTimeout(highlightCode, 100);
}

function toggleTheme() {
    state.darkMode = !state.darkMode;
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', state.darkMode);
    DOM.themeToggle.innerHTML = state.darkMode 
        ? '<i class="fas fa-sun"></i>' 
        : '<i class="fas fa-moon"></i>';
    setTimeout(highlightCode, 100);
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

function showToast(message, type = 'info', title = '') {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-triangle-exclamation',
        info: 'fa-info-circle',
    };
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas ${icons[type] || icons.info} toast-icon"></i>
        <div class="toast-content">
            <div class="toast-title">${title || type.charAt(0).toUpperCase() + type.slice(1)}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close"><i class="fas fa-times"></i></button>
    `;
    
    DOM.toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('toast-out');
        setTimeout(() => toast.remove(), 300);
    }, CONFIG.TOAST_DURATION);
    
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.classList.add('toast-out');
        setTimeout(() => toast.remove(), 300);
    });
}

// ============================================
// EXAMPLE CODE
// ============================================

const EXAMPLE_CODES = [
    `def calculate_average(numbers):
    """Calculate the average of a list of numbers."""
    if not numbers:
        return 0
    total = sum(numbers)
    count = len(numbers)
    return total / count`,
    
    `def process_user_data(user_id, user_data):
    """Process and validate user data."""
    try:
        if not user_id or not user_data:
            raise ValueError("Invalid input")
        processed = {}
        for key, value in user_data.items():
            if key in ['name', 'email', 'age']:
                processed[key] = value.strip() if isinstance(value, str) else value
        return processed
    except Exception as e:
        print(f"Error processing data: {e}")
        return None`,
    
    `def find_max_value(data):
    """Find the maximum value in a dataset."""
    if not data:
        return None
    max_val = data[0]
    for item in data:
        if item > max_val:
            max_val = item
    return max_val`
];

let exampleIndex = 0;

function loadExample() {
    const code = EXAMPLE_CODES[exampleIndex % EXAMPLE_CODES.length];
    setCode(code);
    exampleIndex++;
    showToast('Example code loaded!', 'success', 'Ready');
}

// ============================================
// API CALLS
// ============================================

async function analyzeCode() {
    const code = getCode();
    
    if (!code || code.trim() === '') {
        showToast('Please paste some code to analyze.', 'warning', 'Empty Input');
        DOM.codeDisplay.focus();
        return;
    }
    
    if (state.isAnalyzing) return;
    
    state.isAnalyzing = true;
    DOM.analyzeBtn.disabled = true;
    DOM.analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
    
    DOM.loadingState.classList.add('active');
    DOM.resultsContent.style.display = 'none';
    DOM.emptyState.style.display = 'none';
    
    try {
        const response = await fetch(`${CONFIG.API_URL}/predict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Analysis failed');
        }
        
        const data = await response.json();
        displayResults(data);
        showToast('Code analyzed successfully!', 'success', 'Complete');
        
    } catch (error) {
        console.error('Analysis error:', error);
        showToast(error.message || 'Failed to analyze code. Please try again.', 'error', 'Error');
        DOM.emptyState.style.display = 'flex';
    } finally {
        state.isAnalyzing = false;
        DOM.analyzeBtn.disabled = false;
        DOM.analyzeBtn.innerHTML = '<i class="fas fa-rocket"></i> Analyze Code';
        DOM.loadingState.classList.remove('active');
    }
}

// ============================================
// DISPLAY RESULTS
// ============================================

function displayResults(data) {
    state.currentResults = data;
    
    DOM.emptyState.style.display = 'none';
    DOM.resultsContent.style.display = 'grid';
    
    // Show action section (Share, PDF, Copy)
    DOM.actionSection.style.display = 'flex';
    
    const now = new Date();
    DOM.resultTimestamp.textContent = `Analyzed at ${now.toLocaleTimeString()}`;
    
    // Quality Score
    const quality = data.quality_score;
    DOM.qualityScore.textContent = quality;
    DOM.qualityProgress.style.width = `${quality}%`;
    DOM.qualityBadge.textContent = data.quality_category;
    DOM.qualityBadge.className = `result-badge ${data.quality_category.toLowerCase()}`;
    
    // Bug Probability
    const bug = data.bug_probability;
    DOM.bugScore.textContent = bug;
    DOM.bugProgress.style.width = `${bug}%`;
    const bugLevel = bug < 20 ? 'Low' : bug < 50 ? 'Medium' : 'High';
    DOM.bugBadge.textContent = bugLevel;
    DOM.bugBadge.className = `result-badge ${bugLevel.toLowerCase()}`;
    
    // Complexity
    const complexity = data.complexity_score;
    const complexityPercent = complexity * 100;
    DOM.complexityScore.textContent = complexity.toFixed(2);
    DOM.complexityProgress.style.width = `${Math.min(complexityPercent, 100)}%`;
    DOM.complexityBadge.textContent = data.complexity_category;
    DOM.complexityBadge.className = `result-badge ${data.complexity_category.toLowerCase()}`;
    
    // Maintainability
    const maintain = data.maintainability_index;
    DOM.maintainabilityScore.textContent = maintain;
    DOM.maintainabilityProgress.style.width = `${maintain}%`;
    const maintainLevel = maintain >= 80 ? 'Good' : maintain >= 50 ? 'Medium' : 'Poor';
    DOM.maintainabilityBadge.textContent = maintainLevel;
    DOM.maintainabilityBadge.className = `result-badge ${maintainLevel.toLowerCase()}`;
    
    if (data.code_metrics) {
        DOM.metricLines.textContent = data.code_metrics.line_count || '--';
        DOM.metricFunctions.textContent = data.code_metrics.function_count || '--';
        DOM.metricClasses.textContent = data.code_metrics.class_count || '--';
        DOM.metricComments.textContent = data.code_metrics.comment_count || '--';
    }
    
    saveToHistory(data);
}

// ============================================
// HISTORY
// ============================================

function saveToHistory(data) {
    const history = JSON.parse(localStorage.getItem('codeHistory') || '[]');
    history.unshift({
        ...data,
        code: getCode().slice(0, 200),
        timestamp: new Date().toISOString(),
    });
    
    if (history.length > 50) history.pop();
    localStorage.setItem('codeHistory', JSON.stringify(history));
}

function renderHistory() {
    const history = JSON.parse(localStorage.getItem('codeHistory') || '[]');
    
    if (history.length === 0) {
        DOM.historyList.innerHTML = `
            <div class="history-empty">
                <i class="fas fa-inbox"></i>
                <p>No analysis history yet</p>
                <span>Run your first analysis to see results here</span>
            </div>
        `;
        return;
    }
    
    DOM.historyList.innerHTML = history.slice(0, CONFIG.MAX_HISTORY).map(item => `
        <div class="history-item">
            <div class="history-item-header">
                <span class="history-score">${item.quality_score}/100</span>
                <span class="history-badge ${item.quality_category.toLowerCase()}">${item.quality_category}</span>
            </div>
            <div class="history-code">${item.code || 'No code preview'}</div>
            <div class="history-time">${new Date(item.timestamp).toLocaleString()}</div>
        </div>
    `).join('');
}

function openHistory() {
    renderHistory();
    DOM.historyModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeHistory() {
    DOM.historyModal.classList.remove('active');
    document.body.style.overflow = '';
}

// ============================================
// ===== NEW: TOOLTIPS =====
// ============================================

function initTooltips() {
    const triggers = document.querySelectorAll('.tooltip-trigger');
    
    triggers.forEach(trigger => {
        trigger.addEventListener('mouseenter', function(e) {
            const tooltipText = this.getAttribute('data-tooltip');
            if (!tooltipText) return;
            
            // Remove existing tooltips
            document.querySelectorAll('.custom-tooltip').forEach(el => el.remove());
            
            const tooltip = document.createElement('div');
            tooltip.className = 'custom-tooltip';
            tooltip.textContent = tooltipText;
            
            const rect = this.getBoundingClientRect();
            tooltip.style.left = `${rect.left + rect.width / 2}px`;
            tooltip.style.top = `${rect.bottom + 8}px`;
            tooltip.style.transform = 'translateX(-50%)';
            
            document.body.appendChild(tooltip);
        });
        
        trigger.addEventListener('mouseleave', function() {
            document.querySelectorAll('.custom-tooltip').forEach(el => el.remove());
        });
    });
}

// ============================================
// ===== NEW: SHARE RESULTS =====
// ============================================

function generateShareLink(data) {
    const payload = {
        quality: data.quality_score,
        category: data.quality_category,
        bug: data.bug_probability,
        complexity: data.complexity_score,
        complexityCategory: data.complexity_category,
        maintainability: data.maintainability_index,
        timestamp: new Date().toISOString()
    };
    
    const jsonString = JSON.stringify(payload);
    const encoded = btoa(encodeURIComponent(jsonString));
    const url = new URL(window.location.href);
    url.searchParams.set('share', encoded);
    return url.toString();
}

function openShareModal() {
    if (!state.currentResults) {
        showToast('No results to share. Analyze some code first!', 'warning', 'No Data');
        return;
    }
    
    const data = state.currentResults;
    
    DOM.shareSummary.innerHTML = `
        <div class="share-result-item">
            <span class="label">Quality</span>
            <span class="value ${data.quality_category.toLowerCase()}">${data.quality_score}</span>
        </div>
        <div class="share-result-item">
            <span class="label">Bug Risk</span>
            <span class="value">${data.bug_probability}%</span>
        </div>
        <div class="share-result-item">
            <span class="label">Complexity</span>
            <span class="value">${data.complexity_category}</span>
        </div>
        <div class="share-result-item">
            <span class="label">Maintainability</span>
            <span class="value">${data.maintainability_index}</span>
        </div>
    `;
    
    const shareLink = generateShareLink(data);
    DOM.shareLinkInput.value = shareLink;
    
    // Generate QR Code
    DOM.qrCodeContainer.innerHTML = '';
    if (typeof QRCode !== 'undefined') {
        new QRCode(DOM.qrCodeContainer, {
            text: shareLink,
            width: 200,
            height: 200,
            colorDark: '#1E293B',
            colorLight: '#FFFFFF',
            correctLevel: QRCode.CorrectLevel.H
        });
    } else {
        DOM.qrCodeContainer.innerHTML = '<p>QR Code library not loaded</p>';
    }
    
    DOM.shareModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeShareModal() {
    DOM.shareModal.classList.remove('active');
    document.body.style.overflow = '';
}

function copyShareLink() {
    const link = DOM.shareLinkInput.value;
    if (!link) {
        showToast('No link to copy.', 'warning', 'Empty');
        return;
    }
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(link).then(() => {
            showToast('Share link copied to clipboard!', 'success', 'Copied!');
        }).catch(() => {
            fallbackCopy(link);
        });
    } else {
        fallbackCopy(link);
    }
}

function fallbackCopy(text) {
    DOM.shareLinkInput.select();
    try {
        document.execCommand('copy');
        showToast('Share link copied to clipboard!', 'success', 'Copied!');
    } catch (e) {
        showToast('Failed to copy link. Please copy manually.', 'error', 'Error');
    }
}

function checkForSharedData() {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('share');
    
    if (encoded) {
        try {
            const jsonString = decodeURIComponent(atob(encoded));
            const data = JSON.parse(jsonString);
            
            DOM.emptyState.style.display = 'none';
            DOM.resultsContent.style.display = 'grid';
            DOM.actionSection.style.display = 'flex';
            
            const sharedData = {
                quality_score: data.quality,
                quality_category: data.category,
                bug_probability: data.bug,
                complexity_score: data.complexity,
                complexity_category: data.complexityCategory,
                maintainability_index: data.maintainability,
                code_metrics: { line_count: '--', function_count: '--', class_count: '--', comment_count: '--' }
            };
            
            displayResults(sharedData);
            showToast('Shared results loaded!', 'success', 'Viewing Shared Analysis');
            
            history.replaceState({}, '', window.location.pathname);
        } catch (e) {
            console.error('Failed to parse shared data:', e);
            showToast('Invalid share link.', 'error', 'Error');
        }
    }
}

// ============================================
// ===== NEW: PDF REPORT =====
// ============================================

async function generatePDF() {
    if (!state.currentResults) {
        showToast('No results to export. Analyze some code first!', 'warning', 'No Data');
        return;
    }
    
    const data = state.currentResults;
    const codeSnippet = getCode().slice(0, 500);
    
    showToast('Generating PDF report...', 'info', 'Please wait');
    
    try {
        // Create a temporary container for the PDF content
        const container = document.createElement('div');
        container.style.cssText = `
            position: fixed; left: -9999px; top: 0; width: 800px; 
            background: white; padding: 40px; font-family: Arial, sans-serif;
        `;
        container.innerHTML = `
            <div style="text-align: center; border-bottom: 3px solid #6366F1; padding-bottom: 20px; margin-bottom: 20px;">
                <h1 style="color: #6366F1; margin: 0;">Code Quality Report</h1>
                <p style="color: #666; margin: 5px 0 0;">Generated on ${new Date().toLocaleString()}</p>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div style="background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 12px; color: #888; text-transform: uppercase;">Quality Score</div>
                    <div style="font-size: 28px; font-weight: bold; color: ${data.quality_category === 'Good' ? '#10B981' : data.quality_category === 'Medium' ? '#F59E0B' : '#EF4444'}">
                        ${data.quality_score}/100
                    </div>
                    <div style="font-size: 14px; color: #555;">${data.quality_category}</div>
                </div>
                <div style="background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 12px; color: #888; text-transform: uppercase;">Bug Probability</div>
                    <div style="font-size: 28px; font-weight: bold; color: ${data.bug_probability < 20 ? '#10B981' : data.bug_probability < 50 ? '#F59E0B' : '#EF4444'}">
                        ${data.bug_probability}%
                    </div>
                    <div style="font-size: 14px; color: #555;">${data.bug_probability < 20 ? 'Low' : data.bug_probability < 50 ? 'Medium' : 'High'} Risk</div>
                </div>
                <div style="background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 12px; color: #888; text-transform: uppercase;">Complexity</div>
                    <div style="font-size: 28px; font-weight: bold; color: ${data.complexity_category === 'Low' ? '#10B981' : data.complexity_category === 'Medium' ? '#F59E0B' : '#EF4444'}">
                        ${data.complexity_score.toFixed(2)}
                    </div>
                    <div style="font-size: 14px; color: #555;">${data.complexity_category}</div>
                </div>
                <div style="background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 12px; color: #888; text-transform: uppercase;">Maintainability</div>
                    <div style="font-size: 28px; font-weight: bold; color: ${data.maintainability_index >= 80 ? '#10B981' : data.maintainability_index >= 50 ? '#F59E0B' : '#EF4444'}">
                        ${data.maintainability_index}/100
                    </div>
                    <div style="font-size: 14px; color: #555;">${data.maintainability_index >= 80 ? 'Good' : data.maintainability_index >= 50 ? 'Medium' : 'Poor'}</div>
                </div>
            </div>
            
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px; color: #333; font-size: 14px;">Code Metrics</h3>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); text-align: center; gap: 10px;">
                    <div><span style="color: #888; font-size: 12px;">Lines</span><br><strong>${data.code_metrics?.line_count || '--'}</strong></div>
                    <div><span style="color: #888; font-size: 12px;">Functions</span><br><strong>${data.code_metrics?.function_count || '--'}</strong></div>
                    <div><span style="color: #888; font-size: 12px;">Classes</span><br><strong>${data.code_metrics?.class_count || '--'}</strong></div>
                    <div><span style="color: #888; font-size: 12px;">Comments</span><br><strong>${data.code_metrics?.comment_count || '--'}</strong></div>
                </div>
            </div>
            
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px;">
                <h3 style="margin: 0 0 10px; color: #333; font-size: 14px;">Analyzed Code Snippet</h3>
                <pre style="background: #1e1e2e; color: #cdd6f4; padding: 15px; border-radius: 6px; overflow-x: auto; font-size: 12px; font-family: monospace; max-height: 300px; overflow-y: auto; white-space: pre-wrap; word-wrap: break-word;">${codeSnippet}${getCode().length > 500 ? '\n... (truncated)' : ''}</pre>
            </div>
            
            <div style="text-align: center; color: #888; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
                Generated by CodeQuality Predictor • ${new Date().toLocaleString()}
            </div>
        `;
        
        document.body.appendChild(container);
        
        // Use html2canvas to render the content
        if (typeof html2canvas !== 'undefined') {
            const canvas = await html2canvas(container, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
            });
            
            document.body.removeChild(container);
            
            const imgData = canvas.toDataURL('image/png');
            
            if (typeof window.jspdf !== 'undefined') {
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = 210;
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`code-quality-report-${new Date().toISOString().slice(0,10)}.pdf`);
                
                showToast('PDF report downloaded successfully!', 'success', 'Download Complete');
            } else {
                // Fallback: Download as image
                const link = document.createElement('a');
                link.download = `code-quality-report-${new Date().toISOString().slice(0,10)}.png`;
                link.href = imgData;
                link.click();
                showToast('PNG report downloaded (PDF library not available)', 'success', 'Download Complete');
            }
        } else {
            document.body.removeChild(container);
            showToast('PDF library not loaded. Please refresh and try again.', 'error', 'Error');
        }
    } catch (error) {
        console.error('PDF generation error:', error);
        showToast('Failed to generate PDF report.', 'error', 'Error');
    }
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        analyzeCode();
    }
    
    if (e.key === 'Escape') {
        if (DOM.historyModal.classList.contains('active')) {
            closeHistory();
        }
        if (DOM.shareModal.classList.contains('active')) {
            closeShareModal();
        }
    }
});

// ============================================
// EVENT LISTENERS
// ============================================

// Code editor events
if (DOM.codeDisplay) {
    DOM.codeDisplay.addEventListener('input', handleCodeInput);
    DOM.codeDisplay.addEventListener('keydown', handleCodeKeydown);
    DOM.codeDisplay.addEventListener('paste', () => {
        setTimeout(updateLineCount, 10);
    });
}

// Buttons
DOM.analyzeBtn.addEventListener('click', analyzeCode);
DOM.clearBtn.addEventListener('click', clearCode);
DOM.exampleBtn.addEventListener('click', loadExample);

// Theme
DOM.themeToggle.addEventListener('click', toggleTheme);

// History
DOM.historyToggle.addEventListener('click', openHistory);
DOM.historyClose.addEventListener('click', closeHistory);
DOM.historyCloseBtn.addEventListener('click', closeHistory);
DOM.historyRefresh.addEventListener('click', renderHistory);
DOM.historyModal.querySelector('.modal-overlay').addEventListener('click', closeHistory);

// ===== NEW: Share & PDF Event Listeners =====
if (DOM.shareBtn) {
    DOM.shareBtn.addEventListener('click', openShareModal);
}
if (DOM.shareClose) {
    DOM.shareClose.addEventListener('click', closeShareModal);
}
if (DOM.shareCloseBtn) {
    DOM.shareCloseBtn.addEventListener('click', closeShareModal);
}
if (DOM.shareCopyLinkBtn) {
    DOM.shareCopyLinkBtn.addEventListener('click', copyShareLink);
}
if (DOM.copyLinkBtn) {
    DOM.copyLinkBtn.addEventListener('click', copyShareLink);
}
if (DOM.pdfBtn) {
    DOM.pdfBtn.addEventListener('click', generatePDF);
}
if (DOM.shareModal) {
    DOM.shareModal.querySelector('.modal-overlay').addEventListener('click', closeShareModal);
}

// ============================================
// INITIALIZATION
// ============================================

function init() {
    initTheme();
    updateLineCount();
    
    setTimeout(highlightCode, 100);
    
    // Check for shared data
    checkForSharedData();
    
    // Initialize tooltips
    initTooltips();
    
    if (!localStorage.getItem('codeHistory')) {
        setTimeout(loadExample, 500);
    }
    
    console.log('🚀 Code Quality Predictor initialized!');
    console.log(`📡 API URL: ${CONFIG.API_URL}`);
    console.log('💡 Press Ctrl+Enter to analyze code');
    console.log('💡 Press Tab for indentation');
    console.log('📤 Share results with QR codes');
    console.log('📄 Download PDF reports');
}

// Start the app
init();

// ============================================
// EXPOSE FOR TESTING
// ============================================

window.__app = {
    CONFIG,
    analyzeCode,
    clearCode,
    loadExample,
    toggleTheme,
    openHistory,
    closeHistory,
    getCode,
    setCode,
    highlightCode,
    openShareModal,
    closeShareModal,
    copyShareLink,
    generatePDF,
};
