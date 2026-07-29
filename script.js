/* ==========================================================================
   DYNAMIC GITHUB PAGES DOCUMENTATION PORTAL - APPLICATION LOGIC
   ========================================================================== */

// --------------------------------------------------------------------------
// 1. Application Configuration & State
// --------------------------------------------------------------------------
const CONFIG = {
  OWNER: 'Dileep-kumawat',
  REPO: 'Resources-Documentations',
  BRANCH: 'main',
  CACHE_KEY: 'gh_doc_tree_cache_v3',
  CACHE_TTL_MS: 30 * 60 * 1000, // 30 Minutes
  PAT_KEY: 'gh_doc_pat_token'
};

const STATE = {
  items: [],              // All discovered repository files
  folders: new Set(),     // Unique folder paths
  tree: {},               // Hierarchical tree representation
  filteredItems: [],      // Currently visible items after search/filter/sort
  activeFolder: '',       // Active folder path filter (empty string = root)
  activeType: 'all',      // File extension type filter
  activeSort: 'name-asc', // Current sort order
  searchQuery: '',        // Active search term
  viewMode: 'grid',       // 'grid' or 'list'
  activeView: 'grid',     // 'grid', 'reader', 'pdf'
  currentFile: null,      // File object currently open in reader/pdf/image
  repoMeta: {
    description: '',
    lastUpdated: '',
    sizeKB: 0
  },
  zoomLevel: 1,
  panPosition: { x: 0, y: 0 }
};

// --------------------------------------------------------------------------
// 2. Initial Setup & Event Listeners
// --------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  initLucideIcons();
  initTheme();
  setupEventListeners();
  initMarkdownParser();
  loadRepositoryData();
});

function initLucideIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// --------------------------------------------------------------------------
// 3. Theme Toggle & Persistence
// --------------------------------------------------------------------------
function initTheme() {
  const savedTheme = localStorage.getItem('gh_doc_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme || (prefersDark ? 'dark' : 'light');
  
  document.documentElement.setAttribute('data-theme', theme);
  updateHljsTheme(theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('gh_doc_theme', next);
  updateHljsTheme(next);
}

function updateHljsTheme(theme) {
  const hljsLink = document.getElementById('hljs-theme');
  if (hljsLink) {
    hljsLink.href = theme === 'dark' 
      ? 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css'
      : 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css';
  }
}

// --------------------------------------------------------------------------
// 4. Main Event Listeners
// --------------------------------------------------------------------------
function setupEventListeners() {
  // Theme Switcher
  document.getElementById('btn-theme')?.addEventListener('click', toggleTheme);

  // Search Inputs
  const headerSearch = document.getElementById('header-search-input');
  const heroSearch = document.getElementById('hero-search-input');
  const heroClear = document.getElementById('hero-search-clear');

  const handleSearchInput = (e) => {
    const val = e.target.value;
    if (headerSearch && headerSearch !== e.target) headerSearch.value = val;
    if (heroSearch && heroSearch !== e.target) heroSearch.value = val;
    
    if (heroClear) {
      if (val.length > 0) heroClear.classList.remove('hidden');
      else heroClear.classList.add('hidden');
    }

    debounceSearch(val);
  };

  headerSearch?.addEventListener('input', handleSearchInput);
  heroSearch?.addEventListener('input', handleSearchInput);
  
  heroClear?.addEventListener('click', () => {
    if (headerSearch) headerSearch.value = '';
    if (heroSearch) heroSearch.value = '';
    heroClear.classList.add('hidden');
    debounceSearch('');
  });

  // Refresh & Stats Modals
  document.getElementById('btn-refresh')?.addEventListener('click', () => {
    const icon = document.getElementById('refresh-icon');
    icon?.classList.add('spinning');
    fetchRepositoryTree(true).finally(() => {
      setTimeout(() => icon?.classList.remove('spinning'), 600);
    });
  });

  document.getElementById('btn-stats')?.addEventListener('click', openStatsModal);
  document.getElementById('btn-stats-close')?.addEventListener('click', closeStatsModal);
  
  document.getElementById('btn-pat')?.addEventListener('click', openPatModal);
  document.getElementById('btn-pat-close')?.addEventListener('click', closePatModal);
  document.getElementById('btn-pat-save')?.addEventListener('click', savePatToken);
  document.getElementById('btn-pat-clear')?.addEventListener('click', clearPatToken);

  // Sort & View Toggles
  document.getElementById('sort-select')?.addEventListener('change', (e) => {
    STATE.activeSort = e.target.value;
    applyFiltersAndRender();
  });

  document.getElementById('btn-view-grid')?.addEventListener('click', () => setViewMode('grid'));
  document.getElementById('btn-view-list')?.addEventListener('click', () => setViewMode('list'));

  // Filter Chips
  document.getElementById('filter-chips')?.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;

    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    
    STATE.activeType = chip.dataset.type;
    applyFiltersAndRender();
  });

  // Clear Filter Badge
  document.getElementById('btn-clear-filter')?.addEventListener('click', () => {
    STATE.activeFolder = '';
    document.getElementById('active-filter-badge')?.classList.add('hidden');
    renderSidebarTree();
    applyFiltersAndRender();
  });

  document.getElementById('btn-reset-search')?.addEventListener('click', () => {
    STATE.searchQuery = '';
    STATE.activeFolder = '';
    STATE.activeType = 'all';
    
    if (headerSearch) headerSearch.value = '';
    if (heroSearch) heroSearch.value = '';
    heroClear?.classList.add('hidden');

    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    document.querySelector('.chip[data-type="all"]')?.classList.add('active');
    document.getElementById('active-filter-badge')?.classList.add('hidden');

    applyFiltersAndRender();
  });

  // Folder Tree Actions
  document.getElementById('btn-tree-expand')?.addEventListener('click', () => toggleAllFolders(true));
  document.getElementById('btn-tree-collapse')?.addEventListener('click', () => toggleAllFolders(false));

  // Back Buttons
  document.getElementById('btn-reader-back')?.addEventListener('click', () => showView('grid'));
  document.getElementById('btn-pdf-back')?.addEventListener('click', () => showView('grid'));
  
  // Lightbox Actions
  document.getElementById('btn-lightbox-close')?.addEventListener('click', closeLightbox);
  document.getElementById('btn-zoom-in')?.addEventListener('click', () => adjustZoom(0.2));
  document.getElementById('btn-zoom-out')?.addEventListener('click', () => adjustZoom(-0.2));
  document.getElementById('btn-zoom-reset')?.addEventListener('click', resetZoom);

  // Mobile Sidebar Toggle
  document.getElementById('btn-mobile-sidebar')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.toggle('open');
  });

  // Global Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    const isInInput = ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);
    const lightboxOpen = !document.getElementById('image-modal')?.classList.contains('hidden');

    // Ctrl + K or / to focus search
    if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && !isInInput)) {
      e.preventDefault();
      headerSearch?.focus();
      return;
    }
    // Escape: close modals or back to grid
    if (e.key === 'Escape') {
      if (lightboxOpen) { closeLightbox(); return; }
      closeStatsModal();
      closePatModal();
      if (STATE.activeView !== 'grid') showView('grid');
      return;
    }
    // Lightbox zoom shortcuts
    if (lightboxOpen) {
      if (e.key === '+' || e.key === '=') { e.preventDefault(); adjustZoom(0.2); }
      if (e.key === '-') { e.preventDefault(); adjustZoom(-0.2); }
      if (e.key === '0') { e.preventDefault(); resetZoom(); }
    }
  });

  // Close modals when clicking overlay backdrop
  document.getElementById('stats-modal')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('stats-modal')) closeStatsModal();
  });
  document.getElementById('pat-modal')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('pat-modal')) closePatModal();
  });

  // Browser History Navigation (PopState)
  window.addEventListener('popstate', handleUrlRouting);
}

// --------------------------------------------------------------------------
// 5. GitHub REST API Data Fetching & Caching
// --------------------------------------------------------------------------
async function loadRepositoryData() {
  // Update Repo Branding UI
  document.getElementById('nav-repo-owner').textContent = CONFIG.OWNER;
  document.getElementById('nav-repo-name').textContent = CONFIG.REPO;
  document.getElementById('hero-repo-title').textContent = CONFIG.REPO.replace(/-/g, ' ');
  document.getElementById('github-repo-link').href = `https://github.com/${CONFIG.OWNER}/${CONFIG.REPO}`;
  document.getElementById('footer-repo-name').textContent = `${CONFIG.OWNER}/${CONFIG.REPO}`;

  await fetchRepositoryTree(false);
  handleUrlRouting();
}

async function fetchRepositoryTree(forceRefresh = false) {
  const cachedData = localStorage.getItem(CONFIG.CACHE_KEY);
  const cachedTime = localStorage.getItem(`${CONFIG.CACHE_KEY}_time`);

  if (!forceRefresh && cachedData && cachedTime) {
    const age = Date.now() - parseInt(cachedTime, 10);
    if (age < CONFIG.CACHE_TTL_MS) {
      const parsed = JSON.parse(cachedData);
      processTreeItems(parsed.tree);
      if (parsed.meta) updateRepoMeta(parsed.meta);
      showToast('Loaded cached repository tree', 'info');
      return;
    }
  }

  showSkeletonLoader();

  try {
    const pat = localStorage.getItem(CONFIG.PAT_KEY);
    const headers = {};
    if (pat) headers['Authorization'] = `token ${pat}`;

    // Fetch repository main details
    const repoRes = await fetch(`https://api.github.com/repos/${CONFIG.OWNER}/${CONFIG.REPO}`, { headers });
    if (repoRes.status === 403) {
      openPatModal();
      throw new Error('GitHub API Rate Limit hit. Please provide a Personal Access Token.');
    }
    if (!repoRes.ok) throw new Error(`Repo details fetch failed: ${repoRes.statusText}`);

    const repoData = await repoRes.json();
    const defaultBranch = repoData.default_branch || CONFIG.BRANCH;
    CONFIG.BRANCH = defaultBranch;
    document.getElementById('hero-branch-badge').textContent = `Branch: ${defaultBranch}`;

    const meta = {
      description: repoData.description || 'Dynamic Documentation Repository',
      lastUpdated: new Date(repoData.updated_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
      sizeKB: repoData.size || 0
    };
    updateRepoMeta(meta);

    // Fetch recursive repository tree
    const treeRes = await fetch(`https://api.github.com/repos/${CONFIG.OWNER}/${CONFIG.REPO}/git/trees/${defaultBranch}?recursive=1`, { headers });
    if (!treeRes.ok) throw new Error(`Tree fetch failed: ${treeRes.statusText}`);

    const treeData = await treeRes.json();
    
    // Save to Cache
    localStorage.setItem(CONFIG.CACHE_KEY, JSON.stringify({ tree: treeData.tree, meta }));
    localStorage.setItem(`${CONFIG.CACHE_KEY}_time`, Date.now().toString());

    processTreeItems(treeData.tree);
    showToast('Repository tree updated successfully', 'success');
  } catch (err) {
    console.error('Error fetching tree:', err);
    showToast(err.message, 'error');
    
    // Fallback: If fetch failed but cached data exists, load cache regardless of TTL
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      processTreeItems(parsed.tree);
      if (parsed.meta) updateRepoMeta(parsed.meta);
    }
  }
}

function updateRepoMeta(meta) {
  STATE.repoMeta = meta;
  document.getElementById('hero-repo-desc').textContent = meta.description;
  document.getElementById('stat-last-updated').textContent = `Updated: ${meta.lastUpdated}`;
  document.getElementById('stat-repo-size').textContent = `Size: ${formatFileSize(meta.sizeKB * 1024)}`;
  document.getElementById('modal-last-synced').textContent = `Last Synced: ${meta.lastUpdated}`;
}

// --------------------------------------------------------------------------
// 6. Tree Processing & Data Classification
// --------------------------------------------------------------------------
function processTreeItems(rawItems) {
  STATE.items = [];
  STATE.folders.clear();

  rawItems.forEach(item => {
    if (item.type !== 'blob') return; // Only process files
    
    // Ignore hidden files / git internals
    if (item.path.startsWith('.') || item.path.includes('/.')) return;

    const pathParts = item.path.split('/');
    const filename = pathParts.pop();
    const folderPath = pathParts.join('/');
    const ext = filename.includes('.') ? filename.split('.').pop().toLowerCase() : '';

    if (folderPath) {
      // Index all parent folders
      let currentAcc = '';
      pathParts.forEach(part => {
        currentAcc = currentAcc ? `${currentAcc}/${part}` : part;
        STATE.folders.add(currentAcc);
      });
    }

    const type = categorizeExtension(ext);

    STATE.items.push({
      path: item.path,
      filename,
      folder: folderPath,
      ext,
      type,
      size: item.size || 0,
      sha: item.sha,
      rawUrl: `https://raw.githubusercontent.com/${CONFIG.OWNER}/${CONFIG.REPO}/${CONFIG.BRANCH}/${item.path}`
    });
  });

  buildHierarchicalTree();
  renderSidebarTree();
  updateStatisticsCounts();
  applyFiltersAndRender();
}

function categorizeExtension(ext) {
  switch (ext) {
    case 'md':
    case 'markdown':
      return 'md';
    case 'pdf':
      return 'pdf';
    case 'html':
    case 'htm':
      return 'html';
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'svg':
    case 'gif':
    case 'webp':
      return 'image';
    case 'txt':
    case 'js':
    case 'json':
    case 'css':
      return 'txt';
    default:
      return 'txt';
  }
}

// Build nested JS Object for Folder Tree
function buildHierarchicalTree() {
  STATE.tree = {};

  STATE.items.forEach(file => {
    const parts = file.path.split('/');
    let current = STATE.tree;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = { _isFolder: true, _children: {}, _count: 0 };
      }
      current[part]._count++;
      current = current[part]._children;
    }
  });
}

// --------------------------------------------------------------------------
// 7. Folder Tree Render (Sidebar)
// --------------------------------------------------------------------------
function renderSidebarTree() {
  const container = document.getElementById('sidebar-tree-container');
  if (!container) return;

  container.innerHTML = '';

  const rootFolderNode = document.createElement('div');
  rootFolderNode.className = `tree-folder-header ${STATE.activeFolder === '' ? 'active-folder' : ''}`;
  rootFolderNode.innerHTML = `
    <div class="tree-folder-left">
      <i data-lucide="home" class="tree-folder-icon"></i>
      <span class="tree-folder-name">All Files (Root)</span>
    </div>
    <span class="tree-count-pill">${STATE.items.length}</span>
  `;

  rootFolderNode.addEventListener('click', () => {
    STATE.activeFolder = '';
    document.getElementById('active-filter-badge')?.classList.add('hidden');
    renderSidebarTree();
    applyFiltersAndRender();
  });

  container.appendChild(rootFolderNode);

  function buildTreeHTML(nodeObj, parentPath = '') {
    const fragment = document.createDocumentFragment();

    Object.keys(nodeObj).sort().forEach(key => {
      const node = nodeObj[key];
      if (!node._isFolder) return;

      const currentPath = parentPath ? `${parentPath}/${key}` : key;
      const isExpanded = STATE.activeFolder.startsWith(currentPath);
      const isActive = STATE.activeFolder === currentPath;

      const nodeWrapper = document.createElement('div');
      nodeWrapper.className = 'tree-node';

      const folderHeader = document.createElement('div');
      folderHeader.className = `tree-folder-header ${isExpanded ? 'expanded' : ''} ${isActive ? 'active-folder' : ''}`;
      folderHeader.innerHTML = `
        <div class="tree-folder-left">
          <i data-lucide="chevron-right" class="tree-chevron"></i>
          <i data-lucide="folder" class="tree-folder-icon"></i>
          <span class="tree-folder-name" title="${key}">${key}</span>
        </div>
        <span class="tree-count-pill">${node._count}</span>
      `;

      const childrenContainer = document.createElement('div');
      childrenContainer.className = 'tree-children';
      if (isExpanded) childrenContainer.style.display = 'flex';

      folderHeader.addEventListener('click', (e) => {
        e.stopPropagation();
        const expanded = folderHeader.classList.toggle('expanded');
        childrenContainer.style.display = expanded ? 'flex' : 'none';

        STATE.activeFolder = currentPath;
        updateFilterBadge(`Folder: ${currentPath}`);
        renderSidebarTree();
        applyFiltersAndRender();
      });

      nodeWrapper.appendChild(folderHeader);
      
      const subTree = buildTreeHTML(node._children, currentPath);
      childrenContainer.appendChild(subTree);
      nodeWrapper.appendChild(childrenContainer);

      fragment.appendChild(nodeWrapper);
    });

    return fragment;
  }

  container.appendChild(buildTreeHTML(STATE.tree));
  initLucideIcons();
}

function toggleAllFolders(expand) {
  document.querySelectorAll('.tree-folder-header').forEach(header => {
    if (expand) {
      header.classList.add('expanded');
      const children = header.nextElementSibling;
      if (children && children.classList.contains('tree-children')) {
        children.style.display = 'flex';
      }
    } else {
      header.classList.remove('expanded');
      const children = header.nextElementSibling;
      if (children && children.classList.contains('tree-children')) {
        children.style.display = 'none';
      }
    }
  });
}

// --------------------------------------------------------------------------
// 8. Search, Filtering, and Sorting Engine
// --------------------------------------------------------------------------
let searchDebounceTimer;
function debounceSearch(query) {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    STATE.searchQuery = query.trim().toLowerCase();
    applyFiltersAndRender();
  }, 200);
}

function applyFiltersAndRender() {
  let result = STATE.items.filter(item => {
    // 1. Folder filter
    if (STATE.activeFolder && !item.folder.startsWith(STATE.activeFolder)) {
      return false;
    }

    // 2. Type filter
    if (STATE.activeType !== 'all' && item.type !== STATE.activeType) {
      return false;
    }

    // 3. Search Query
    if (STATE.searchQuery) {
      const q = STATE.searchQuery;
      const matchName = item.filename.toLowerCase().includes(q);
      const matchPath = item.path.toLowerCase().includes(q);
      const matchExt = item.ext.toLowerCase().includes(q);
      if (!matchName && !matchPath && !matchExt) return false;
    }

    return true;
  });

  // 4. Apply Sorting
  result.sort((a, b) => {
    switch (STATE.activeSort) {
      case 'name-asc':
        return a.filename.localeCompare(b.filename);
      case 'name-desc':
        return b.filename.localeCompare(a.filename);
      case 'ext':
        return a.ext.localeCompare(b.ext) || a.filename.localeCompare(b.filename);
      case 'folder':
        return a.folder.localeCompare(b.folder) || a.filename.localeCompare(b.filename);
      case 'size-desc':
        return b.size - a.size;
      case 'size-asc':
        return a.size - b.size;
      default:
        return 0;
    }
  });

  STATE.filteredItems = result;
  renderResourceGrid();
  updateBreadcrumbs();
}

// --------------------------------------------------------------------------
// 9. Resource Cards Grid Renderer
// --------------------------------------------------------------------------
function renderResourceGrid() {
  const grid = document.getElementById('cards-grid');
  const countEl = document.getElementById('result-count');
  const emptyState = document.getElementById('empty-state');

  if (!grid) return;

  grid.innerHTML = '';
  if (countEl) countEl.textContent = `Showing ${STATE.filteredItems.length} items`;

  if (STATE.filteredItems.length === 0) {
    emptyState?.classList.remove('hidden');
    grid.style.display = 'none';
    return;
  }

  emptyState?.classList.add('hidden');
  grid.style.display = 'grid';

  const fragment = document.createDocumentFragment();

  STATE.filteredItems.forEach(file => {
    const card = document.createElement('div');
    card.className = 'resource-card';
    
    // Highlight matching text if search active
    let displayName = escapeHtml(file.filename);
    if (STATE.searchQuery) {
      const regex = new RegExp(`(${escapeRegExp(STATE.searchQuery)})`, 'gi');
      displayName = displayName.replace(regex, '<mark>$1</mark>');
    }

    const fileIcon = getFileIconName(file.type);

    card.innerHTML = `
      <div class="card-top">
        <div class="card-icon-wrapper ${file.type}">
          <i data-lucide="${fileIcon}"></i>
        </div>
        <span class="card-ext-badge">${file.ext || 'FILE'}</span>
      </div>

      <div class="card-middle">
        <h4 class="card-filename" title="${escapeHtml(file.filename)}">${displayName}</h4>
        <div class="card-folder-path" title="${escapeHtml(file.folder || 'Root')}">
          <i data-lucide="folder"></i> ${escapeHtml(file.folder || 'Root Directory')}
        </div>
      </div>

      <div class="card-bottom">
        <div class="card-meta">
          <span>${formatFileSize(file.size)}</span>
        </div>
        <div class="card-action-btn">
          <span>${getCardActionText(file.type)}</span>
          <i data-lucide="arrow-right"></i>
        </div>
      </div>
    `;

    card.addEventListener('click', () => openResource(file));
    fragment.appendChild(card);
  });

  grid.appendChild(fragment);
  initLucideIcons();
}

function getFileIconName(type) {
  switch (type) {
    case 'md': return 'file-code-2';
    case 'pdf': return 'file-text';
    case 'html': return 'code';
    case 'image': return 'image';
    case 'txt': return 'file-lines';
    default: return 'file';
  }
}

function getCardActionText(type) {
  switch (type) {
    case 'md': return 'Read Document';
    case 'pdf': return 'View PDF';
    case 'image': return 'View Image';
    case 'html': return 'Open Web Page';
    default: return 'Open File';
  }
}

function setViewMode(mode) {
  STATE.viewMode = mode;
  const grid = document.getElementById('cards-grid');
  const btnGrid = document.getElementById('btn-view-grid');
  const btnList = document.getElementById('btn-view-list');

  if (mode === 'list') {
    grid?.classList.add('list-layout');
    btnList?.classList.add('active');
    btnGrid?.classList.remove('active');
  } else {
    grid?.classList.remove('list-layout');
    btnGrid?.classList.add('active');
    btnList?.classList.remove('active');
  }
}

// --------------------------------------------------------------------------
// 10. Opening Resources Handler (MD, PDF, Image, HTML)
// --------------------------------------------------------------------------
function openResource(file) {
  STATE.currentFile = file;
  updateUrlParams({ file: file.path });

  switch (file.type) {
    case 'md':
      renderMarkdownView(file);
      break;
    case 'pdf':
      renderPdfView(file);
      break;
    case 'image':
      // Don't push URL for lightbox — it overlays grid view
      updateUrlParams({});
      openLightbox(file);
      break;
    case 'html':
      // HTML files on GitHub Pages are served relative to repo root
      window.open(encodeURI(file.path), '_blank');
      break;
    default:
      // For JS, TXT, etc — open raw source in new tab
      window.open(file.rawUrl, '_blank');
      break;
  }
}

// --------------------------------------------------------------------------
// 11. Markdown Reader View & Renderer
// --------------------------------------------------------------------------
function initMarkdownParser() {
  if (!window.marked) return;

  const renderer = new marked.Renderer();

  // Custom Heading ID & Anchor Generator — supports both marked v4 (text, level, raw) and v5+ (token)
  renderer.heading = function (textOrToken, level) {
    let text, raw;
    if (typeof textOrToken === 'object' && textOrToken !== null) {
      // marked v5+ passes a token object as the first argument
      text = textOrToken.text || '';
      raw = textOrToken.raw || text;
      level = textOrToken.depth || level;
    } else {
      text = textOrToken;
      raw = text;
    }
    const slug = raw.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/[\s]+/g, '-');
    return `<h${level} id="${slug}">${text}<a href="#${slug}" class="heading-anchor" title="Link to section">#</a></h${level}>\n`;
  };

  marked.use({ renderer, gfm: true, breaks: true });
}

async function renderMarkdownView(file) {
  showView('reader');
  
  document.getElementById('reader-doc-title').textContent = file.filename;
  document.getElementById('reader-doc-path').textContent = file.path;
  document.getElementById('reader-doc-type').textContent = file.ext.toUpperCase();
  document.getElementById('btn-open-raw-file').href = file.rawUrl;

  const contentContainer = document.getElementById('markdown-content');
  contentContainer.innerHTML = '<div class="card-skeleton" style="height:300px;"></div>';

  try {
    const res = await fetch(file.rawUrl);
    if (!res.ok) throw new Error(`Could not fetch file: ${res.statusText}`);

    let rawMarkdown = await res.text();

    // 1. Pre-process LaTeX Math ($...$ and $$...$$) to avoid marked interference
    const mathBlocks = [];
    rawMarkdown = rawMarkdown.replace(/\$\$([\s\S]+?)\$\$/g, (match, math) => {
      mathBlocks.push({ type: 'block', math });
      return `__MATH_BLOCK_${mathBlocks.length - 1}__`;
    });

    rawMarkdown = rawMarkdown.replace(/\$([^\$\n]+?)\$/g, (match, math) => {
      mathBlocks.push({ type: 'inline', math });
      return `__MATH_INLINE_${mathBlocks.length - 1}__`;
    });

    // 2. Parse Markdown with marked.js
    let parsedHtml = marked.parse(rawMarkdown);

    // 3. Re-inject KaTeX rendered Math
    if (window.katex) {
      parsedHtml = parsedHtml.replace(/__MATH_BLOCK_(\d+)__/g, (match, idx) => {
        try {
          return katex.renderToString(mathBlocks[idx].math, { displayMode: true });
        } catch (e) {
          return match;
        }
      });

      parsedHtml = parsedHtml.replace(/__MATH_INLINE_(\d+)__/g, (match, idx) => {
        try {
          return katex.renderToString(mathBlocks[idx].math, { displayMode: false });
        } catch (e) {
          return match;
        }
      });
    }

    // 4. Sanitize with DOMPurify
    const cleanHtml = DOMPurify.sanitize(parsedHtml);
    contentContainer.innerHTML = cleanHtml;

    // 5. Wrap Code Blocks with Header & Copy Button
    postProcessCodeBlocks(contentContainer);

    // 6. Generate Table of Contents
    generateTableOfContents(contentContainer);

    // 7. Calculate Reading Time
    const wordCount = rawMarkdown.split(/\s+/).length;
    const readingMinutes = Math.max(1, Math.ceil(wordCount / 200));
    document.getElementById('reader-reading-time').innerHTML = `<i data-lucide="clock"></i> ~${readingMinutes} min read`;

    // 8. Attach Reading Progress Bar Listener
    setupReadingProgressBar();

    initLucideIcons();
  } catch (err) {
    console.error(err);
    contentContainer.innerHTML = `<div class="empty-state"><h3>Error loading document</h3><p>${err.message}</p></div>`;
  }
}

function postProcessCodeBlocks(container) {
  const codeBlocks = container.querySelectorAll('pre code');

  codeBlocks.forEach(codeEl => {
    const pre = codeEl.parentElement;
    const wrapper = document.createElement('div');
    wrapper.className = 'code-block-wrapper';

    const langClass = Array.from(codeEl.classList).find(c => c.startsWith('language-'));
    const lang = langClass ? langClass.replace('language-', '') : 'code';

    const header = document.createElement('div');
    header.className = 'code-block-header';
    header.innerHTML = `
      <span>${lang.toUpperCase()}</span>
      <button class="code-copy-btn">
        <i data-lucide="copy"></i> Copy
      </button>
    `;

    const copyBtn = header.querySelector('.code-copy-btn');
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(codeEl.textContent);
      copyBtn.innerHTML = `<i data-lucide="check"></i> Copied!`;
      setTimeout(() => {
        copyBtn.innerHTML = `<i data-lucide="copy"></i> Copy`;
        initLucideIcons();
      }, 2000);
    });

    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(header);
    wrapper.appendChild(pre);

    // Syntax Highlight
    if (window.hljs) {
      hljs.highlightElement(codeEl);
    }
  });
}

function generateTableOfContents(container) {
  const tocNav = document.getElementById('toc-nav');
  if (!tocNav) return;

  tocNav.innerHTML = '';

  const headings = container.querySelectorAll('h1, h2, h3');
  if (headings.length === 0) {
    document.getElementById('toc-sidebar')?.classList.add('hidden');
    return;
  }
  document.getElementById('toc-sidebar')?.classList.remove('hidden');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        document.querySelectorAll('.toc-link').forEach(link => link.classList.remove('active'));
        document.querySelector(`.toc-link[href="#${id}"]`)?.classList.add('active');
      }
    });
  }, { rootMargin: '-80px 0px -70% 0px' });

  headings.forEach(heading => {
    if (!heading.id) return;
    
    const link = document.createElement('a');
    link.className = `toc-link indent-${heading.tagName.toLowerCase()}`;
    link.href = `#${heading.id}`;
    link.textContent = heading.textContent.replace('#', '').trim();
    
    link.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById(heading.id)?.scrollIntoView({ behavior: 'smooth' });
    });

    tocNav.appendChild(link);
    observer.observe(heading);
  });
}

function setupReadingProgressBar() {
  const progressContainer = document.getElementById('reading-progress-container');
  const progressBar = document.getElementById('reading-progress-bar');
  if (!progressContainer || !progressBar) return;

  progressContainer.classList.remove('hidden');

  const updateProgress = () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight <= 0) {
      progressBar.style.width = '0%';
      return;
    }
    const progress = (window.scrollY / totalHeight) * 100;
    progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  };

  window.removeEventListener('scroll', updateProgress);
  window.addEventListener('scroll', updateProgress);
}

// --------------------------------------------------------------------------
// 12. PDF Viewer View
// --------------------------------------------------------------------------
function renderPdfView(file) {
  showView('pdf');

  document.getElementById('pdf-view-title').textContent = file.filename;
  document.getElementById('pdf-view-size').textContent = formatFileSize(file.size);

  // For PDFs, prefer the GitHub Pages served path first; rawUrl is fallback
  const pdfSrc = file.path;
  document.getElementById('btn-pdf-open-tab').href = pdfSrc;
  document.getElementById('btn-pdf-download').href = file.rawUrl;

  const iframe = document.getElementById('pdf-iframe');
  // Use inline object to trigger browser PDF viewer with best compatibility
  if (iframe) iframe.src = `${pdfSrc}#view=FitH`;
}

// --------------------------------------------------------------------------
// 13. Image Lightbox Modal & Zoom Controls
// --------------------------------------------------------------------------
function openLightbox(file) {
  const modal = document.getElementById('image-modal');
  const img = document.getElementById('lightbox-img');
  
  document.getElementById('lightbox-filename').textContent = file.filename;
  document.getElementById('btn-image-open-tab').href = file.path;

  img.src = file.path;
  img.onload = () => {
    document.getElementById('lightbox-dim').textContent = `${img.naturalWidth} × ${img.naturalHeight} px`;
  };

  resetZoom();
  modal?.classList.remove('hidden');
  initLucideIcons();
}

function closeLightbox() {
  document.getElementById('image-modal')?.classList.add('hidden');
}

function adjustZoom(delta) {
  STATE.zoomLevel = Math.max(0.4, Math.min(3, STATE.zoomLevel + delta));
  applyImageTransform();
}

function resetZoom() {
  STATE.zoomLevel = 1;
  STATE.panPosition = { x: 0, y: 0 };
  applyImageTransform();
}

function applyImageTransform() {
  const img = document.getElementById('lightbox-img');
  if (img) {
    img.style.transform = `translate(${STATE.panPosition.x}px, ${STATE.panPosition.y}px) scale(${STATE.zoomLevel})`;
  }
}

// --------------------------------------------------------------------------
// 14. View Switcher & Routing
// --------------------------------------------------------------------------
function showView(viewName) {
  STATE.activeView = viewName;

  const gridView = document.getElementById('grid-view');
  const readerView = document.getElementById('reader-view');
  const pdfView = document.getElementById('pdf-view');
  const heroSection = document.getElementById('hero-section');
  const progressContainer = document.getElementById('reading-progress-container');

  // Hide all panels first
  [gridView, readerView, pdfView].forEach(el => el?.classList.add('hidden'));
  progressContainer?.classList.add('hidden');

  if (viewName === 'grid') {
    gridView?.classList.remove('hidden');
    heroSection?.classList.remove('hidden');
    updateUrlParams({});
    // Clear any PDF iframe src to free resources
    const iframe = document.getElementById('pdf-iframe');
    if (iframe && iframe.src) iframe.src = '';
  } else if (viewName === 'reader') {
    readerView?.classList.remove('hidden');
    heroSection?.classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'instant' });
  } else if (viewName === 'pdf') {
    pdfView?.classList.remove('hidden');
    heroSection?.classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
}

function handleUrlRouting() {
  const params = new URLSearchParams(window.location.search);
  const filePath = params.get('file');
  const folderPath = params.get('folder');
  const searchQuery = params.get('search');

  if (filePath) {
    const file = STATE.items.find(i => i.path === filePath);
    if (file) {
      openResource(file);
      return;
    }
  }

  if (folderPath) {
    STATE.activeFolder = folderPath;
    updateFilterBadge(`Folder: ${folderPath}`);
    renderSidebarTree();
  }

  if (searchQuery) {
    STATE.searchQuery = searchQuery;
    const heroSearch = document.getElementById('hero-search-input');
    if (heroSearch) heroSearch.value = searchQuery;
  }

  showView('grid');
  applyFiltersAndRender();
}

function updateUrlParams(newParams) {
  const url = new URL(window.location);
  url.search = '';

  Object.keys(newParams).forEach(key => {
    if (newParams[key]) url.searchParams.set(key, newParams[key]);
  });

  window.history.pushState({}, '', url);
}

// --------------------------------------------------------------------------
// 15. Breadcrumbs & UI Badges
// --------------------------------------------------------------------------
function updateBreadcrumbs() {
  const list = document.getElementById('breadcrumb-list');
  if (!list) return;

  list.innerHTML = `
    <li class="breadcrumb-item">
      <a href="#" class="breadcrumb-link" data-folder="">
        <i data-lucide="home"></i> Home
      </a>
    </li>
  `;

  if (STATE.activeFolder) {
    const parts = STATE.activeFolder.split('/');
    let currentAcc = '';

    parts.forEach(part => {
      currentAcc = currentAcc ? `${currentAcc}/${part}` : part;
      const li = document.createElement('li');
      li.className = 'breadcrumb-item';
      li.innerHTML = `<a href="#" class="breadcrumb-link" data-folder="${currentAcc}">${escapeHtml(part)}</a>`;
      list.appendChild(li);
    });
  }

  list.querySelectorAll('.breadcrumb-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      STATE.activeFolder = link.dataset.folder;
      if (STATE.activeFolder) updateFilterBadge(`Folder: ${STATE.activeFolder}`);
      else document.getElementById('active-filter-badge')?.classList.add('hidden');
      
      renderSidebarTree();
      applyFiltersAndRender();
    });
  });

  initLucideIcons();
}

function updateFilterBadge(text) {
  const badge = document.getElementById('active-filter-badge');
  const badgeText = document.getElementById('filter-badge-text');
  if (badge && badgeText) {
    badgeText.textContent = text;
    badge.classList.remove('hidden');
  }
}

// --------------------------------------------------------------------------
// 16. Statistics Modal Calculator
// --------------------------------------------------------------------------
function updateStatisticsCounts() {
  let mdCount = 0, pdfCount = 0, htmlCount = 0, imgCount = 0;

  STATE.items.forEach(i => {
    if (i.type === 'md') mdCount++;
    else if (i.type === 'pdf') pdfCount++;
    else if (i.type === 'html') htmlCount++;
    else if (i.type === 'image') imgCount++;
  });

  document.getElementById('stat-total-files').textContent = `${STATE.items.length} Files`;
  document.getElementById('stat-total-folders').textContent = `${STATE.folders.size} Folders`;
  document.getElementById('footer-indexed-count').textContent = `Indexed: ${STATE.items.length} Files`;

  document.getElementById('modal-stat-total').textContent = STATE.items.length;
  document.getElementById('modal-stat-md').textContent = mdCount;
  document.getElementById('modal-stat-pdf').textContent = pdfCount;
  document.getElementById('modal-stat-html').textContent = htmlCount;
  document.getElementById('modal-stat-img').textContent = imgCount;
  document.getElementById('modal-stat-folders').textContent = STATE.folders.size;
}

function openStatsModal() {
  document.getElementById('stats-modal')?.classList.remove('hidden');
}

function closeStatsModal() {
  document.getElementById('stats-modal')?.classList.add('hidden');
}

// --------------------------------------------------------------------------
// 17. GitHub PAT Modal Handlers
// --------------------------------------------------------------------------
function openPatModal() {
  const input = document.getElementById('pat-input');
  if (input) input.value = localStorage.getItem(CONFIG.PAT_KEY) || '';
  document.getElementById('pat-modal')?.classList.remove('hidden');
}

function closePatModal() {
  document.getElementById('pat-modal')?.classList.add('hidden');
}

function savePatToken() {
  const token = document.getElementById('pat-input')?.value.trim();
  if (token) {
    localStorage.setItem(CONFIG.PAT_KEY, token);
    showToast('Token saved! Reloading tree...', 'success');
  } else {
    localStorage.removeItem(CONFIG.PAT_KEY);
  }
  closePatModal();
  fetchRepositoryTree(true);
}

function clearPatToken() {
  localStorage.removeItem(CONFIG.PAT_KEY);
  const input = document.getElementById('pat-input');
  if (input) input.value = '';
  showToast('Personal Access Token cleared', 'info');
  closePatModal();
  fetchRepositoryTree(true);
}

// --------------------------------------------------------------------------
// 18. Helper Utilities & Skeleton Loaders
// --------------------------------------------------------------------------
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, match => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[match]));
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function showSkeletonLoader() {
  const grid = document.getElementById('cards-grid');
  if (!grid) return;
  
  grid.innerHTML = `
    <div class="card-skeleton"></div>
    <div class="card-skeleton"></div>
    <div class="card-skeleton"></div>
    <div class="card-skeleton"></div>
    <div class="card-skeleton"></div>
    <div class="card-skeleton"></div>
  `;
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let iconName = 'info';
  if (type === 'success') iconName = 'check-circle';
  if (type === 'error') iconName = 'alert-triangle';

  toast.innerHTML = `<i data-lucide="${iconName}"></i> <span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);
  initLucideIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
