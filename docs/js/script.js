// ============================================
// SCRIPT.JS - Complete Frontend Logic with Syntax Highlighting
// ============================================

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
    // Change this to your Render URL when deployed
    API_URL: 'https://code-quality-api.onrender.com',
    TOAST_DURATION: 4000,
    MAX_HISTORY: 20,
};

// ============================================
// DOM REFERENCES - Updated for contenteditable
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

/**
 * Highlight the code in the display element using Prism.js
 */
function highlightCode() {
    if (typeof Prism !== 'undefined' && DOM.codeDisplay) {
        Prism.highlightElement(DOM.codeDisplay);
    }
}

/**
 * Get the current code from the contenteditable element
 */
function getCode() {
    if (!DOM.codeDisplay) return '';
    return DOM.codeDisplay.textContent || '';
}

/**
 * Set code in the contenteditable element and highlight it
 */
function setCode(code) {
    if (!DOM.codeDisplay) return;
    DOM.codeDisplay.textContent = code || '';
    highlightCode();
    updateLineCount();
}

/**
 * Clear the code editor
 */
function clearCode() {
    if (!DOM.codeDisplay) return;
    DOM.codeDisplay.textContent = '';
    highlightCode();
    updateLineCount();
    DOM.codeDisplay.focus();
}

/**
 * Update the line count display
 */
function updateLineCount() {
    if (!DOM.codeDisplay || !DOM.lineCount) return;
    const lines = DOM.codeDisplay.textContent.split('\n').length;
    DOM.lineCount.textContent = `${lines} lines`;
}

// ============================================
// CODE EDITOR EVENT HANDLERS
// ============================================

/**
 * Handle input events on the contenteditable code editor
 */
function handleCodeInput(e) {
    // Save cursor position
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
    
    // Update line count
    updateLineCount();
    
    // Re-apply highlighting
    highlightCode();
    
    // Restore cursor position
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
        // If cursor restoration fails, put cursor at the end
        try {
            const range = document.createRange();
            range.selectNodeContents(DOM.codeDisplay);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        } catch (err) {
            // Fallback: do nothing
        }
    }
}

/**
 * Handle Tab key for code indentation
 */
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
        
        // Insert 4 spaces
        const newText = text.substring(0, start) + '    ' + text.substring(end);
        textNode.textContent = newText;
        
        // Move cursor after the inserted spaces
        try {
            const newRange = document.createRange();
            const newPosition = Math.min(start + 4, textNode.length);
            newRange.setStart(textNode, newPosition);
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);
        } catch (err) {
            // Fallback: select all content
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
    // Re-apply highlighting after theme change
    setTimeout(highlightCode, 100);
}

function toggleTheme() {
    state.darkMode = !state.darkMode;
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', state.darkMode);
    DOM.themeToggle.innerHTML = state.darkMode 
        ? '<i class="fas fa-sun"></i>' 
        : '<i class="fas fa-moon"></i>';
    // Re-apply highlighting after theme change
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
    
    // Auto remove
    setTimeout(() => {
        toast.classList.add('toast-out');
        setTimeout(() => toast.remove(), 300);
    }, CONFIG.TOAST_DURATION);
    
    // Manual close
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
    
    // Show loading
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
    
    // Show results
    DOM.emptyState.style.display = 'none';
    DOM.resultsContent.style.display = 'grid';
    
    // Timestamp
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
    
    // Code Metrics
    if (data.code_metrics) {
        DOM.metricLines.textContent = data.code_metrics.line_count || '--';
        DOM.metricFunctions.textContent = data.code_metrics.function_count || '--';
        DOM.metricClasses.textContent = data.code_metrics.class_count || '--';
        DOM.metricComments.textContent = data.code_metrics.comment_count || '--';
    }
    
    // Auto-save to history
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
    
    // Keep only last 50
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
// KEYBOARD SHORTCUTS
// ============================================

document.addEventListener('keydown', (e) => {
    // Ctrl+Enter or Cmd+Enter to analyze
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        analyzeCode();
    }
    
    // Escape to close modal
    if (e.key === 'Escape' && DOM.historyModal.classList.contains('active')) {
        closeHistory();
    }
});

// ============================================
// EVENT LISTENERS
// ============================================

// Code editor events
if (DOM.codeDisplay) {
    DOM.codeDisplay.addEventListener('input', handleCodeInput);
    DOM.codeDisplay.addEventListener('keydown', handleCodeKeydown);
    // Also update line count on paste
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

// Close modal on overlay click
DOM.historyModal.querySelector('.modal-overlay').addEventListener('click', closeHistory);

// ============================================
// INITIALIZATION
// ============================================

function init() {
    initTheme();
    updateLineCount();
    
    // Apply initial highlighting
    setTimeout(highlightCode, 100);
    
    // Load example on first visit
    if (!localStorage.getItem('codeHistory')) {
        setTimeout(loadExample, 500);
    }
    
    console.log('🚀 Code Quality Predictor initialized!');
    console.log(`📡 API URL: ${CONFIG.API_URL}`);
    console.log('💡 Press Ctrl+Enter to analyze code');
    console.log('💡 Press Tab for indentation');
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
};
