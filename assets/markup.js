const input = document.getElementById('markdown-input');
const preview = document.getElementById('html-preview');
const autosaveIndicator = document.getElementById('autosave-indicator');
const resetBtn = document.getElementById('reset-btn');
const CACHE_KEY = 'readkei_markdown';
let autosaveTimer = null;

// Load from cache
function loadCache() {
	const cached = localStorage.getItem(CACHE_KEY);
	if (cached !== null) {
		input.value = cached;
		updatePreview();
	}
}

// Update HTML preview
function updatePreview() {
	preview.innerHTML = marked.parse(input.value, { gfm: true, breaks: true });
}

// Autosave function
function autosave() {
	localStorage.setItem(CACHE_KEY, input.value);
	autosaveIndicator.textContent = 'Autosave: ' + new Date().toLocaleTimeString();
}

// Start autosave timer
function startAutosave() {
	if (autosaveTimer) clearInterval(autosaveTimer);
	autosaveTimer = setInterval(autosave, 30000);
}

// Reset function
function resetEditor() {
	input.value = '';
	updatePreview();
	localStorage.removeItem(CACHE_KEY);
	autosaveIndicator.textContent = 'Autosave: reset';
}

// Event listeners
input.addEventListener('input', updatePreview);
resetBtn.addEventListener('click', resetEditor);
// Allow tabbing inside textarea
input.addEventListener('keydown', function(e) {
	if (e.key === 'Tab') {
		e.preventDefault();
		const start = input.selectionStart;
		const end = input.selectionEnd;
		// Set textarea value to: text before caret + tab + text after caret
		input.value = input.value.substring(0, start) + '\t' + input.value.substring(end);
		// Move caret after the tab
		input.selectionStart = input.selectionEnd = start + 1;
		updatePreview();
	}
});

// Initial load
loadCache();
updatePreview();
startAutosave();
autosave();

// Info modal logic
const infoBtn = document.getElementById('info-btn');
const infoModal = document.getElementById('info-modal');
const infoClose = document.getElementById('info-close');

infoBtn.addEventListener('click', function() {
	infoModal.style.display = 'flex';
});

infoClose.addEventListener('click', function() {
	infoModal.style.display = 'none';
});

// Optional: close modal when clicking outside content
infoModal.addEventListener('click', function(e) {
	if (e.target === infoModal) {
		infoModal.style.display = 'none';
	}
});

// Copy button logic
const copyBtn = document.getElementById('copy-btn');
copyBtn.addEventListener('click', function() {
	input.select();
	document.execCommand('copy');
	copyBtn.textContent = 'Copied!';
	setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1200);
});

// Download button logic
const downloadBtn = document.getElementById('download-btn');
downloadBtn.addEventListener('click', function() {
	const blob = new Blob([input.value], { type: 'text/markdown' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = 'README.md';
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
	downloadBtn.textContent = 'Downloaded!';
	setTimeout(() => { downloadBtn.textContent = 'Download'; }, 1200);
});
