// ========== ERROR HANDLING & ENVIRONMENT CHECKS ========== //
function checkScreenSize() {
	var overlay = document.getElementById('responsive-overlay');
	if (window.innerWidth < 900) {
		overlay.classList.add('active');
		document.body.style.overflow = 'hidden';
	} else {
		overlay.classList.remove('active');
		document.body.style.overflow = '';
	}
}
window.addEventListener('resize', checkScreenSize);
window.addEventListener('DOMContentLoaded', checkScreenSize);

function showOfflineModal(show) {
	var modal = document.getElementById('offline-modal');
	if (show) {
		modal.classList.add('active');
		document.body.style.overflow = 'hidden';
	} else {
		modal.classList.remove('active');
		document.body.style.overflow = '';
	}
}
window.addEventListener('offline', function() { showOfflineModal(true); });
window.addEventListener('online', function() { showOfflineModal(false); });

// ========== CORE EDITOR FUNCTIONALITY ========== //
window.addEventListener('DOMContentLoaded', function() {
	if (!navigator.onLine) showOfflineModal(true);

	// ========== DRAFTS MANAGEMENT ========== //
	function getDrafts() {
		let drafts = [];
		try {
			drafts = JSON.parse(localStorage.getItem('readkei_drafts') || '[]');
		} catch (e) {}
		return drafts;
	}

	function saveDraft(content) {
		let drafts = getDrafts();
		const now = new Date();
		if (!content.trim()) return drafts;
		if (drafts.length > 0 && drafts[drafts.length-1].content === content) return drafts;
		drafts.push({
			content: content,
			time: now.toLocaleString(),
			id: 'draft-' + now.getTime()
		});
		localStorage.setItem('readkei_drafts', JSON.stringify(drafts));
		localStorage.setItem('readkei_draft', content);
		return drafts;
	}

	function updateDraftsList() {
		const drafts = getDrafts();
		const list = document.getElementById('drafts-list');
		if (!list) return;
		list.innerHTML = '';
		if (drafts.length === 0) {
			list.innerHTML = '<li style="color:#aaa;">No drafts saved</li>';
			return;
		}
		drafts.slice().reverse().forEach(function(draft, idx) {
			const li = document.createElement('li');
			const a = document.createElement('a');
			a.href = '#';
			a.textContent = draft.name ? (draft.name + ' (' + draft.time + ')') : ('Draft ' + (drafts.length - idx) + ' (' + draft.time + ')');
			a.title = draft.content.substring(0, 40);
			a.addEventListener('click', function(e) {
				e.preventDefault();
				var textarea = document.getElementById('markdown-input');
				var preview = document.getElementById('html-preview');
				if (textarea) {
					textarea.value = draft.content;
					if (preview && window.marked) {
						preview.innerHTML = window.marked.parse(draft.content);
					}
				}
			});
			// Right-click context menu for rename/delete
			a.addEventListener('contextmenu', function(e) {
				e.preventDefault();
				let oldMenu = document.getElementById('draft-context-menu');
				if (oldMenu) oldMenu.remove();
				const menu = document.createElement('div');
				menu.id = 'draft-context-menu';
				menu.style.position = 'fixed';
				menu.style.top = e.clientY + 'px';
				menu.style.left = e.clientX + 'px';
				menu.style.background = '#fff';
				menu.style.border = '1px solid #ccc';
				menu.style.borderRadius = '6px';
				menu.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
				menu.style.zIndex = 99999;
				menu.style.minWidth = '120px';
				menu.innerHTML = `
					<div style="padding:8px;cursor:pointer;" id="rename-draft">Rename</div>
					<div style="padding:8px;cursor:pointer;" id="delete-draft">Delete</div>
				`;
				document.body.appendChild(menu);
				menu.querySelector('#rename-draft').onclick = function() {
					let newName = prompt('Enter new name for draft:', draft.name || 'Draft');
					if (newName) {
						let allDrafts = getDrafts();
						let realIdx = allDrafts.length - 1 - idx;
						allDrafts[realIdx].name = newName;
						localStorage.setItem('readkei_drafts', JSON.stringify(allDrafts));
						updateDraftsList();
					}
					menu.remove();
				};
				menu.querySelector('#delete-draft').onclick = function() {
					if (confirm('Delete this draft?')) {
						let allDrafts = getDrafts();
						let realIdx = allDrafts.length - 1 - idx;
						allDrafts.splice(realIdx, 1);
						localStorage.setItem('readkei_drafts', JSON.stringify(allDrafts));
						updateDraftsList();
					}
					menu.remove();
				};
				setTimeout(function() {
					document.addEventListener('click', function handler() {
						menu.remove();
						document.removeEventListener('click', handler);
					});
				}, 10);
			});
			li.appendChild(a);
			list.appendChild(li);
		});
	}
	updateDraftsList();

	// ========== CORE EDITOR FUNCTIONALITY ========== //
	var textarea = document.getElementById('markdown-input');
	var preview = document.getElementById('html-preview');
	var autosaveIndicator = document.getElementById('autosave-indicator');
	var saveBtn = document.getElementById('save-btn-bottom');
	var publishBtn = document.getElementById('publish-btn');

	if (textarea) {
		if (localStorage.getItem('readkei_draft')) {
			textarea.value = localStorage.getItem('readkei_draft');
		}
		function updatePreview() {
			var markdown = textarea.value;
			preview.innerHTML = window.marked ? window.marked.parse(markdown) : markdown;
		}
		function autosaveDraft() {
			localStorage.setItem('readkei_draft', textarea.value);
			var now = new Date();
			if (autosaveIndicator) autosaveIndicator.textContent = 'Autosave: ' + now.toLocaleTimeString();
		}
		textarea.addEventListener('input', function() {
			updatePreview();
			autosaveDraft();
		});
		updatePreview();
		autosaveDraft();
		if (saveBtn) {
			saveBtn.addEventListener('click', function() {
				saveDraft(textarea.value);
				if (autosaveIndicator) autosaveIndicator.textContent = 'Saved: ' + new Date().toLocaleTimeString();
				updateDraftsList();
			});
		}
		if (publishBtn) {
			publishBtn.addEventListener('click', function() {
				localStorage.setItem('readkei_published', textarea.value);
				if (autosaveIndicator) autosaveIndicator.textContent = 'Published: ' + new Date().toLocaleTimeString();
			});
		}
	}
});

// Responsive overlay
function checkScreenSize() {
	var overlay = document.getElementById('responsive-overlay');
	if (window.innerWidth < 900) {
		overlay.classList.add('active');
		document.body.style.overflow = 'hidden';
	} else {
		overlay.classList.remove('active');
		document.body.style.overflow = '';
	}
}
window.addEventListener('resize', checkScreenSize);
window.addEventListener('DOMContentLoaded', checkScreenSize);

// Offline modal
function showOfflineModal(show) {
	var modal = document.getElementById('offline-modal');
	if (show) {
		modal.classList.add('active');
		document.body.style.overflow = 'hidden';
	} else {
		modal.classList.remove('active');
		document.body.style.overflow = '';
	}
}
window.addEventListener('offline', function() { showOfflineModal(true); });
window.addEventListener('online', function() { showOfflineModal(false); });
window.addEventListener('DOMContentLoaded', function() {
	if (!navigator.onLine) showOfflineModal(true);

	// Drafts logic
	function getDrafts() {
		let drafts = [];
		try {
			drafts = JSON.parse(localStorage.getItem('readkei_drafts') || '[]');
		} catch (e) {}
		return drafts;
	}

	function updateDraftsList() {
		const drafts = getDrafts();
		const list = document.getElementById('drafts-list');
		if (!list) return;
		list.innerHTML = '';
		if (drafts.length === 0) {
			list.innerHTML = '<li style="color:#aaa;">No drafts saved</li>';
			return;
		}
		drafts.slice().reverse().forEach(function(draft, idx) {
			const li = document.createElement('li');
			const a = document.createElement('a');
			a.href = '#';
			a.textContent = draft.name ? (draft.name + ' (' + draft.time + ')') : ('Draft ' + (drafts.length - idx) + ' (' + draft.time + ')');
			a.title = draft.content.substring(0, 40);
			a.addEventListener('click', function(e) {
				e.preventDefault();
				var textarea = document.getElementById('markdown-input');
				var preview = document.getElementById('html-preview');
				if (textarea) {
					textarea.value = draft.content;
					if (preview && window.marked) {
						preview.innerHTML = window.marked.parse(draft.content);
					}
				}
			});

			// Right-click context menu for rename/delete
			a.addEventListener('contextmenu', function(e) {
				e.preventDefault();
				// Remove any existing context menu
				let oldMenu = document.getElementById('draft-context-menu');
				if (oldMenu) oldMenu.remove();

				const menu = document.createElement('div');
				menu.id = 'draft-context-menu';
				menu.style.position = 'fixed';
				menu.style.top = e.clientY + 'px';
				menu.style.left = e.clientX + 'px';
				menu.style.background = '#fff';
				menu.style.border = '1px solid #ccc';
				menu.style.borderRadius = '6px';
				menu.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
				menu.style.zIndex = 99999;
				menu.style.minWidth = '120px';
				menu.innerHTML = `
					<div style="padding:8px;cursor:pointer;" id="rename-draft">Rename</div>
					<div style="padding:8px;cursor:pointer;" id="delete-draft">Delete</div>
				`;
				document.body.appendChild(menu);

				// Rename
				menu.querySelector('#rename-draft').onclick = function() {
					let newName = prompt('Enter new name for draft:', draft.name || 'Draft');
					if (newName) {
						// Find and update draft
						let allDrafts = getDrafts();
						let realIdx = allDrafts.length - 1 - idx;
						allDrafts[realIdx].name = newName;
						localStorage.setItem('readkei_drafts', JSON.stringify(allDrafts));
						updateDraftsList();
					}
					menu.remove();
				};
				// Delete
				menu.querySelector('#delete-draft').onclick = function() {
					if (confirm('Delete this draft?')) {
						let allDrafts = getDrafts();
						let realIdx = allDrafts.length - 1 - idx;
						allDrafts.splice(realIdx, 1);
						localStorage.setItem('readkei_drafts', JSON.stringify(allDrafts));
						updateDraftsList();
					}
					menu.remove();
				};

				// Remove menu on click elsewhere
				setTimeout(function() {
					document.addEventListener('click', function handler() {
						menu.remove();
						document.removeEventListener('click', handler);
					});
				}, 10);
			});

			li.appendChild(a);
			list.appendChild(li);
		});
	}

	updateDraftsList();

	// Markdown editor logic (only if textarea exists)
	var textarea = document.getElementById('markdown-input');
	var preview = document.getElementById('html-preview');
	var autosaveIndicator = document.getElementById('autosave-indicator');
	var saveBtn = document.getElementById('save-btn-bottom');
	var publishBtn = document.getElementById('publish-btn');

	function saveDraft(content) {
		let drafts = getDrafts();
		const now = new Date();
		if (!content.trim()) return drafts; // Don't save empty drafts
		// Prevent duplicate consecutive drafts
		if (drafts.length > 0 && drafts[drafts.length-1].content === content) return drafts;
		drafts.push({
			content: content,
			time: now.toLocaleString(),
			id: 'draft-' + now.getTime()
		});
		localStorage.setItem('readkei_drafts', JSON.stringify(drafts));
		localStorage.setItem('readkei_draft', content); // for autosave
		return drafts;
	}

	if (textarea) {
		// Load last draft from localStorage
		if (localStorage.getItem('readkei_draft')) {
			textarea.value = localStorage.getItem('readkei_draft');
		}

		function updatePreview() {
			var markdown = textarea.value;
			preview.innerHTML = window.marked ? window.marked.parse(markdown) : markdown;
		}

		function autosaveDraft() {
			localStorage.setItem('readkei_draft', textarea.value);
			var now = new Date();
			if (autosaveIndicator) autosaveIndicator.textContent = 'Autosave: ' + now.toLocaleTimeString();
		}

		textarea.addEventListener('input', function() {
			updatePreview();
			autosaveDraft();
		});
		updatePreview(); // Initial render
		autosaveDraft();

		// Save button
		if (saveBtn) {
			saveBtn.addEventListener('click', function() {
				saveDraft(textarea.value);
				if (autosaveIndicator) autosaveIndicator.textContent = 'Saved: ' + new Date().toLocaleTimeString();
				updateDraftsList();
			});
		}

		// Publish button
		if (publishBtn) {
			publishBtn.addEventListener('click', function() {
				localStorage.setItem('readkei_published', textarea.value);
				if (autosaveIndicator) autosaveIndicator.textContent = 'Published: ' + new Date().toLocaleTimeString();
				// You can add more logic here to send to server, etc.
			});
		}
	}
});
