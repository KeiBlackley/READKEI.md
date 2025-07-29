
window.addEventListener('load', () => {
    const mainLoader = document.getElementById('main-loader');
    const mainLoaderContent = document.getElementById('main-loader-content');
    function showError() {
        if (mainLoaderContent) mainLoaderContent.innerHTML = '<span style="color:red;text-align:center;">No internet connection detected.<br>Please check your connection and refresh.</span>';
    }
    function hideLoader() {
        if (mainLoader) mainLoader.style.display = 'none';
    }
    if (!navigator.onLine) {
        showError();
    } else {
        fetch('https://cdn.jsdelivr.net/npm/marked/marked.min.js', { method: 'HEAD' })
            .then(hideLoader)
            .catch(showError);
    }
    window.addEventListener('online', hideLoader);
    window.addEventListener('offline', showError);
});

document.addEventListener('DOMContentLoaded', () => {
    const previewContent = document.getElementById('preview');
    const copyHtmlBtn = document.getElementById('copy-html-btn');
    if (copyHtmlBtn && previewContent) {
        copyHtmlBtn.addEventListener('click', () => {
            const html = previewContent.innerHTML;
            if (navigator.clipboard) {
                navigator.clipboard.writeText(html).then(() => {
                    copyHtmlBtn.textContent = 'Copied!';
                    setTimeout(() => { copyHtmlBtn.textContent = 'Copy HTML'; }, 1200);
                }, () => { alert('Failed to copy HTML.'); });
            } else {
                const textarea = document.createElement('textarea');
                textarea.value = html;
                document.body.appendChild(textarea);
                textarea.select();
                try {
                    document.execCommand('copy');
                    copyHtmlBtn.textContent = 'Copied!';
                    setTimeout(() => { copyHtmlBtn.textContent = 'Copy HTML'; }, 1200);
                } catch (err) {
                    alert('Failed to copy HTML.');
                }
                document.body.removeChild(textarea);
            }
        });
    }

    const darkBtn = document.getElementById('darkmode-toggle');
    if (darkBtn) {
        darkBtn.addEventListener('click', () => {
            const theme = document.documentElement.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-bs-theme', theme);
            localStorage.setItem('theme', theme);
        });
    }
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) document.documentElement.setAttribute('data-bs-theme', savedTheme);

    const templateSelect = document.getElementById('template-select');
    const markdownInput = document.getElementById('markdown-input');
    const previewBtn = document.getElementById('preview-btn');
    const previewOverlay = document.getElementById('preview-overlay');
    const previewModal = document.getElementById('preview-modal');
    function updatePreviewBtnState() {
        if (previewBtn && markdownInput) previewBtn.disabled = !markdownInput.value.trim();
    }
    if (templateSelect && markdownInput && previewBtn) {
        templateSelect.addEventListener('change', async e => {
            const val = e.target.value;
            if (val) {
                let content = '';
                try {
                    content = await fetchTemplate(val);
                    if (!content) throw new Error('No template content loaded');
                    markdownInput.value = content;
                } catch (err) {
                    markdownInput.value = '';
                    markdownInput.placeholder = 'Failed to load template: ' + err.message;
                    setTimeout(() => { markdownInput.placeholder = 'Write your markdown here...'; }, 3000);
                }
                updatePreviewBtnState();
            }
        });
        markdownInput.addEventListener('input', updatePreviewBtnState);
        updatePreviewBtnState();
        previewBtn.addEventListener('click', () => {
            const loader = document.getElementById('loader');
            if (loader) loader.style.display = 'flex';
            setTimeout(() => {
                const markdownText = markdownInput.value;
                let html = '';
                try {
                    html = marked.parse(markdownText);
                } catch (err) {
                    html = `<div style="color:red;font-weight:bold;">Markdown parse error: ${err.message}</div>`;
                }
                if (!markdownText.trim()) {
                    html = '<div style="color:orange;font-weight:bold;">No markdown input provided.</div>';
                }
                previewContent.innerHTML = html;
                previewContent.style.overflowY = 'auto';
                previewContent.style.maxHeight = '70vh';
                previewOverlay.style.display = 'flex';
                if (loader) loader.style.display = 'none';
            }, 600);
        });
    }

    function closeOverlay() {
        if (previewOverlay) previewOverlay.style.display = 'none';
    }
    const closePreviewBtn = document.getElementById('close-preview');
    if (closePreviewBtn) closePreviewBtn.addEventListener('click', closeOverlay);
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && previewOverlay && previewOverlay.style.display === 'flex') closeOverlay();
    });
    if (previewOverlay && previewModal) {
        previewOverlay.addEventListener('mousedown', e => {
            if (!previewModal.contains(e.target)) closeOverlay();
        });
    }

    const downloadBtn = document.getElementById('download-md-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            const text = markdownInput.value;
            const blob = new Blob([text], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'README.md';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }
});

async function fetchTemplate(name) {
    const map = {
        'basic': 'templates/basic.md',
        'application': 'templates/application.md',
        'styled': 'templates/styled.md'
    };
    const fallback = {
        'basic': '# Project Name\n\nA brief description of your project.\n\n## Features\n- Feature 1\n- Feature 2\n\n## Usage\n\nInstructions here.\n',
        'application': '# Application Project\n\nDescribe your application here.\n\n## Install\n\nSteps to install.\n',
        'styled': '# Styled README\n\nThis template uses custom styles.\n\n## Example\n\nStyled content here.\n'
    };
    if (!map[name]) return '';
    try {
        const res = await fetch(map[name]);
        if (res.ok) return await res.text();
    } catch (e) {
        return fallback[name] || '';
    }
    return fallback[name] || '';
}
