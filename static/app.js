// TM-Roadmap Application Logic

const API_BASE = './api';
let treeData = [];
let allNodesList = [];
let selectedNodeId = null;
const currentFilters = new Set(['draft', 'in progress', 'pending']);
const nodeExpandedStates = new Map(); // id -> boolean (expanded state)

// Hierarchy restrictions
const ALLOWED_CHILD_TYPES = {
    root: ['product'], // If parent is null
    product: ['initiative', 'rfc', 'decision', 'spike'],
    initiative: ['epic', 'rfc', 'decision', 'spike'],
    epic: ['story', 'bug', 'spike', 'decision'],
    story: [],
    bug: [],
    rfc: ['decision', 'spike'],
    decision: ['spike'],
    spike: ['decision']
};

const TYPE_LABELS = {
    product: 'Produto',
    initiative: 'Iniciativa',
    epic: 'Épico',
    story: 'User Story',
    bug: 'Bug',
    decision: 'Decision',
    rfc: 'RFC',
    spike: 'Spike'
};

// Dynamically filter allowed child types based on selected parent
function updateAllowedTypesDropdown() {
    const parentIdVal = document.getElementById('form-parent-id').value;
    const typeSelect = document.getElementById('form-type');
    const currentTypeValue = typeSelect.value;
    
    let parentType = 'root';
    if (parentIdVal) {
        const parentNode = allNodesList.find(n => n.id === parentIdVal);
        if (parentNode) {
            parentType = parentNode.type;
        }
    }
    
    const allowed = ALLOWED_CHILD_TYPES[parentType] || ['story'];
    
    // Clear and rebuild options
    typeSelect.innerHTML = '';
    allowed.forEach(type => {
        const opt = document.createElement('option');
        opt.value = type;
        opt.textContent = TYPE_LABELS[type] || type;
        typeSelect.appendChild(opt);
    });
    
    // Attempt to restore previous value if allowed, else use first
    if (allowed.includes(currentTypeValue)) {
        typeSelect.value = currentTypeValue;
    } else if (allowed.length > 0) {
        typeSelect.value = allowed[0];
    }
}

const FOLDER_NAMES = {
    initiative: 'Iniciativas',
    epic: 'Épicos',
    story: 'User Stories',
    bug: 'Bugs',
    decision: 'Decisões',
    rfc: 'RFCs',
    spike: 'Spikes',
    product: 'Produtos'
};

// Virtual grouping helper for children by type (purely frontend presentation)
function groupChildren(children, parentNodeId) {
    if (!children || children.length === 0) return [];
    if (parentNodeId === 'root') return children;
    
    // Group children by type
    const groups = {};
    children.forEach(child => {
        const type = child.type;
        if (!groups[type]) {
            groups[type] = [];
        }
        groups[type].push(child);
    });
    
    const result = [];
    
    // Order to render groups
    const order = ['initiative', 'epic', 'story', 'bug', 'rfc', 'decision', 'spike'];
    
    order.forEach(type => {
        if (groups[type] && groups[type].length > 0) {
            const items = groups[type];
            result.push({
                id: `virtual-folder-${type}-${parentNodeId}`,
                title: `${FOLDER_NAMES[type] || type} (${items.length})`,
                type: `folder-${type}`,
                children: items,
                parent_id: parentNodeId
            });
        }
    });
    
    // Fallback for custom types
    Object.keys(groups).forEach(type => {
        if (!order.includes(type) && groups[type].length > 0) {
            const items = groups[type];
            result.push({
                id: `virtual-folder-${type}-${parentNodeId}`,
                title: `${type} (${items.length})`,
                type: `folder-${type}`,
                children: items,
                parent_id: parentNodeId
            });
        }
    });
    
    return result;
}

// Status matching logic
function matchStatus(nodeStatus, activeFilters) {
    if (!nodeStatus) return false;
    const status = nodeStatus.toLowerCase();
    
    if (activeFilters.has('draft') && status.includes('draft')) return true;
    if (activeFilters.has('in progress') && (status.includes('in progress') || status.includes('active') || status.includes('ativo') || status.includes('progresso') || status.includes('desenvolvimento') || status.includes('piloto') || status.includes('pilot'))) return true;
    if (activeFilters.has('completed') && (status.includes('completed') || status.includes('finalizado') || status.includes('concluido') || status.includes('concluído') || status.includes('done') || status.includes('entregue') || status.includes('sucesso'))) return true;
    if (activeFilters.has('pending') && (status.includes('pending') || status.includes('pendente') || status.includes('aprovação') || status.includes('aprovacao') || status.includes('approval'))) return true;
    
    return false;
}

// Recursive Tree Filtering by Status
function filterTreeByStatus(nodes, activeFilters) {
    if (activeFilters.size === 0) return [];
    return nodes.map(node => {
        const isProduct = node.type === 'product';
        const isFolder = node.type.startsWith('folder-');
        
        const matches = (isProduct || isFolder) ? false : matchStatus(node.status, activeFilters);
        const filteredChildren = filterTreeByStatus(node.children || [], activeFilters);
        
        if (matches || filteredChildren.length > 0) {
            return {
                ...node,
                children: filteredChildren
            };
        }
        return null;
    }).filter(Boolean);
}

// DOM Elements
const treeRoot = document.getElementById('tree-root');
const detailsPanel = document.getElementById('details-panel');
const emptyState = document.getElementById('empty-state');
const detailsContent = document.getElementById('details-content');

const nodeTitleDisplay = document.getElementById('node-title-display');
const nodeIdTag = document.getElementById('node-id');
const badgeType = document.getElementById('badge-type');
const badgeStatus = document.getElementById('badge-status');
const nodeUpdatedAt = document.getElementById('node-updated-at');
const nodeBody = document.getElementById('node-body');

const btnNewNode = document.getElementById('btn-new-node');
const btnSeed = document.getElementById('btn-seed');
const btnEdit = document.getElementById('btn-edit');
const btnDelete = document.getElementById('btn-delete');
const btnExpandAll = document.getElementById('btn-expand-all');
const btnCollapseAll = document.getElementById('btn-collapse-all');

const nodeModal = document.getElementById('node-modal');
const nodeForm = document.getElementById('node-form');
const modalTitle = document.getElementById('modal-title');
const btnCloseModal = document.getElementById('btn-close-modal');
const btnCancelModal = document.getElementById('btn-cancel-modal');

const searchInput = document.getElementById('search-input');
const toastEl = document.getElementById('toast');

// Map node types to icons & CSS classes
const TYPE_CONFIG = {
    product: { icon: 'fa-cubes', class: 'icon-product', label: 'Produto' },
    initiative: { icon: 'fa-bolt', class: 'icon-initiative', label: 'Iniciativa' },
    epic: { icon: 'fa-box', class: 'icon-epic', label: 'Épico' },
    story: { icon: 'fa-file-lines', class: 'icon-story', label: 'User Story' },
    bug: { icon: 'fa-bug', class: 'icon-bug', label: 'Bug' },
    rfc: { icon: 'fa-lightbulb', class: 'icon-rfc', label: 'RFC' },
    decision: { icon: 'fa-circle-check', class: 'icon-decision', label: 'Decision' },
    spike: { icon: 'fa-compass', class: 'icon-spike', label: 'Spike' },
    
    // Virtual folder styles
    'folder-initiative': { icon: 'fa-folder', class: 'icon-initiative', label: 'Pasta de Iniciativas' },
    'folder-epic': { icon: 'fa-folder', class: 'icon-epic', label: 'Pasta de Épicos' },
    'folder-story': { icon: 'fa-folder', class: 'icon-story', label: 'Pasta de User Stories' },
    'folder-bug': { icon: 'fa-folder', class: 'icon-bug', label: 'Pasta de Bugs' },
    'folder-rfc': { icon: 'fa-folder', class: 'icon-rfc', label: 'Pasta de RFCs' },
    'folder-decision': { icon: 'fa-folder', class: 'icon-decision', label: 'Pasta de Decisões' },
    'folder-spike': { icon: 'fa-folder', class: 'icon-spike', label: 'Pasta de Spikes' }
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    fetchTree();
    fetchFlatNodes();
    setupEventListeners();
});

// Toast Notifications
function showToast(message, type = 'success') {
    toastEl.textContent = message;
    toastEl.className = `toast show ${type}`;
    setTimeout(() => {
        toastEl.classList.remove('show');
    }, 3000);
}

// Fetch tree structure
async function fetchTree() {
    try {
        const res = await fetch(`${API_BASE}/tree`);
        if (!res.ok) throw new Error('Falha ao buscar árvore');
        treeData = await res.ok ? await res.json() : [];
        renderTree();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// Fetch flat list of nodes for parent selectors, search, etc.
async function fetchFlatNodes() {
    try {
        const res = await fetch(`${API_BASE}/nodes`);
        if (!res.ok) throw new Error('Falha ao carregar catálogo de nós');
        allNodesList = await res.json();
        populateParentSelect();
    } catch (err) {
        console.error(err);
    }
}

// Populate parent selector in modal
function populateParentSelect() {
    const select = document.getElementById('form-parent-id');
    const currentVal = select.value;
    
    // Clear and add default
    select.innerHTML = '<option value="">Nenhum (Nível Raiz)</option>';
    
    // Sort nodes alphabetically
    const sorted = [...allNodesList].sort((a, b) => a.title.localeCompare(b.title));
    
    sorted.forEach(node => {
        const option = document.createElement('option');
        option.value = node.id;
        option.textContent = `[${node.type.toUpperCase()}] ${node.title}`;
        select.appendChild(option);
    });
    
    select.value = currentVal;
}

// Render Tree structure recursively
function renderTree() {
    treeRoot.innerHTML = '';
    if (treeData.length === 0) {
        treeRoot.innerHTML = '<div class="empty-state" style="padding: 20px 0;"><p>Nenhum nó cadastrado. Clique em Novo ou Re-importar Seed.</p></div>';
        return;
    }
    
    const filteredData = filterTreeByStatus(treeData, currentFilters);
    if (filteredData.length === 0) {
        treeRoot.innerHTML = '<div class="empty-state" style="padding: 20px 0;"><p>Nenhum item correspondente ao filtro de status selecionado.</p></div>';
        return;
    }
    
    const fragment = document.createDocumentFragment();
    const groupedData = groupChildren(filteredData, 'root');
    groupedData.forEach(node => {
        fragment.appendChild(createTreeNodeElement(node));
    });
    treeRoot.appendChild(fragment);
}

// Create a DOM tree node element
function createTreeNodeElement(node) {
    const wrapper = document.createElement('div');
    wrapper.className = 'tree-node-wrapper';
    
    const nodeEl = document.createElement('div');
    nodeEl.className = 'tree-node';
    if (selectedNodeId === node.id) {
        nodeEl.classList.add('selected');
    }
    nodeEl.dataset.id = node.id;
    
    // Expander Icon
    const expander = document.createElement('span');
    expander.className = 'tree-expander';
    const hasChildren = node.children && node.children.length > 0;
    
    if (hasChildren) {
        expander.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
        
        // Initialize default expanded state: open for products and virtual folders
        if (!nodeExpandedStates.has(node.id)) {
            const defaultExpanded = (node.type === 'product' || node.type.startsWith('folder-'));
            nodeExpandedStates.set(node.id, defaultExpanded);
        }
        
        const isExpanded = nodeExpandedStates.get(node.id);
        if (isExpanded) {
            expander.classList.add('expanded');
        }
    } else {
        expander.innerHTML = '';
    }
    
    // Node Type Icon
    const config = TYPE_CONFIG[node.type] || { icon: 'fa-circle', class: 'icon-primary' };
    const icon = document.createElement('span');
    icon.className = `tree-node-icon ${config.class}`;
    icon.innerHTML = `<i class="fa-solid ${config.icon}"></i>`;
    
    // Node Title
    const title = document.createElement('span');
    title.className = 'tree-node-title';
    title.textContent = (node.type === 'product' || node.type.startsWith('folder-')) ? node.title : `[${node.id}] ${node.title}`;
    
    nodeEl.appendChild(expander);
    nodeEl.appendChild(icon);
    nodeEl.appendChild(title);
    
    // Node Actions (appears on hover)
    if (!node.type.startsWith('folder-')) {
        const actionsEl = document.createElement('span');
        actionsEl.className = 'tree-node-actions';
        
        // Add child button (only if not a story/bug)
        if (node.type !== 'story' && node.type !== 'bug') {
            const addBtn = document.createElement('button');
            addBtn.className = 'tree-action-btn btn-add-child';
            addBtn.title = 'Adicionar item filho';
            addBtn.innerHTML = '<i class="fa-solid fa-plus"></i>';
            addBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openModal(null, node.id, node.type);
            });
            actionsEl.appendChild(addBtn);
        }
        
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'tree-action-btn btn-delete-node';
        deleteBtn.title = 'Excluir item';
        deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteNodeDirectly(node.id);
        });
        
        actionsEl.appendChild(deleteBtn);
        nodeEl.appendChild(actionsEl);
    }
    
    wrapper.appendChild(nodeEl);
    
    // Render children if exists
    if (hasChildren) {
        const childrenContainer = document.createElement('div');
        childrenContainer.className = 'tree-children';
        
        if (!nodeExpandedStates.has(node.id)) {
            const defaultExpanded = (node.type === 'product' || node.type.startsWith('folder-'));
            nodeExpandedStates.set(node.id, defaultExpanded);
        }
        
        const isExpanded = nodeExpandedStates.get(node.id);
        if (isExpanded) {
            childrenContainer.classList.add('visible');
        }
        
        const isFolder = node.type.startsWith('folder-');
        const childrenToRender = isFolder ? node.children : groupChildren(node.children, node.id);
        childrenToRender.forEach(child => {
            childrenContainer.appendChild(createTreeNodeElement(child));
        });
        wrapper.appendChild(childrenContainer);
        
        // Setup toggle folder click
        expander.addEventListener('click', (e) => {
            e.stopPropagation();
            const expanded = !nodeExpandedStates.get(node.id);
            nodeExpandedStates.set(node.id, expanded);
            if (expanded) {
                expander.classList.add('expanded');
                childrenContainer.classList.add('visible');
            } else {
                expander.classList.remove('expanded');
                childrenContainer.classList.remove('visible');
            }
        });
    }
    
    // Selection click
    nodeEl.addEventListener('click', () => {
        if (node.type.startsWith('folder-')) {
            if (expander) expander.click();
        } else {
            selectNode(node.id);
        }
    });
    
    return wrapper;
}

// Handle node selection
async function selectNode(nodeId) {
    selectedNodeId = nodeId;
    
    // Update selected class in DOM
    document.querySelectorAll('.tree-node').forEach(el => {
        el.classList.remove('selected');
        if (el.dataset.id === nodeId) {
            el.classList.add('selected');
        }
    });
    
    // Load Details
    try {
        const res = await fetch(`${API_BASE}/nodes/${nodeId}`);
        if (!res.ok) throw new Error('Nó não encontrado');
        const node = await res.json();
        
        // Show panel
        emptyState.classList.add('hidden');
        detailsContent.classList.remove('hidden');
        
        // Map details
        nodeIdTag.textContent = `[${node.id}]`;
        nodeTitleDisplay.textContent = node.title;
        
        const typeConfig = TYPE_CONFIG[node.type] || { label: node.type };
        badgeType.textContent = typeConfig.label;
        badgeType.className = `badge badge-type`;
        
        badgeStatus.textContent = node.status || 'Draft';
        
        // Format Date
        const date = new Date(node.updated_at);
        nodeUpdatedAt.textContent = date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        
        // Render Markdown Description using marked.js
        if (node.description) {
            nodeBody.innerHTML = marked.parse(node.description);
        } else {
            nodeBody.innerHTML = '<p class="text-secondary"><em>Sem descrição detalhada.</em></p>';
        }
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// Event Listeners Setup
function setupEventListeners() {
    // Status Filters
    const filterTabs = document.querySelectorAll('#status-filters .filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const status = tab.dataset.status;
            if (currentFilters.has(status)) {
                currentFilters.delete(status);
                tab.classList.remove('active');
            } else {
                currentFilters.add(status);
                tab.classList.add('active');
            }
            renderTree();
        });
    });

    // Parent change restriction
    document.getElementById('form-parent-id').addEventListener('change', updateAllowedTypesDropdown);

    // New Node Button
    btnNewNode.addEventListener('click', () => {
        openModal(null);
    });
    
    // Close Modal Button
    btnCloseModal.addEventListener('click', closeModal);
    btnCancelModal.addEventListener('click', closeModal);
    
    // Modal Form Submit
    nodeForm.addEventListener('submit', handleFormSubmit);
    
    // Edit Button
    btnEdit.addEventListener('click', () => {
        if (selectedNodeId) {
            openModal(selectedNodeId);
        }
    });
    
    // Delete Button
    btnDelete.addEventListener('click', handleDeleteNode);
    
    // Seed Re-Import Button
    btnSeed.addEventListener('click', handleSeedImport);
    
    // Global Search
    searchInput.addEventListener('input', handleSearch);
    
    // Tree Expansion actions
    btnExpandAll.addEventListener('click', () => {
        const setAllExpanded = (nodes, parentId) => {
            const grouped = parentId === 'root' ? nodes : groupChildren(nodes, parentId);
            grouped.forEach(n => {
                if (n.children && n.children.length > 0) {
                    nodeExpandedStates.set(n.id, true);
                    setAllExpanded(n.children, n.id);
                }
            });
        };
        setAllExpanded(treeData, 'root');
        renderTree();
    });
    
    btnCollapseAll.addEventListener('click', () => {
        const setAllCollapsed = (nodes, parentId) => {
            const grouped = parentId === 'root' ? nodes : groupChildren(nodes, parentId);
            grouped.forEach(n => {
                if (n.children && n.children.length > 0) {
                    nodeExpandedStates.set(n.id, false);
                    setAllCollapsed(n.children, n.id);
                }
            });
        };
        setAllCollapsed(treeData, 'root');
        renderTree();
    });
}

// Modal handling
async function openModal(id = null, parentId = null, parentType = null) {
    nodeForm.reset();
    populateParentSelect();
    
    if (id) {
        modalTitle.textContent = 'Editar Item';
        try {
            const res = await fetch(`${API_BASE}/nodes/${id}`);
            if (!res.ok) throw new Error('Não foi possível obter dados do nó');
            const node = await res.json();
            
            document.getElementById('form-node-id').value = node.id;
            document.getElementById('form-code').value = node.id || '';
            document.getElementById('form-title').value = node.title;
            document.getElementById('form-type').value = node.type;
            document.getElementById('form-status').value = node.status || '';
            document.getElementById('form-parent-id').value = node.parent_id || '';
            document.getElementById('form-description').value = node.description || '';
            
            // Block type change when editing existing item
            document.getElementById('form-type').disabled = true;
        } catch (err) {
            showToast(err.message, 'error');
            return;
        }
    } else {
        modalTitle.textContent = 'Novo Item no Roadmap';
        document.getElementById('form-node-id').value = '';
        document.getElementById('form-code').value = '';
        
        // Enable type select for new items
        document.getElementById('form-type').disabled = false;
        
        // Preset parent
        if (parentId) {
            document.getElementById('form-parent-id').value = parentId;
            
            // Preset type based on parent type
            const typeSelect = document.getElementById('form-type');
            if (parentType === 'product') {
                typeSelect.value = 'initiative';
            } else if (parentType === 'initiative') {
                typeSelect.value = 'epic';
            } else if (parentType === 'epic') {
                typeSelect.value = 'story';
            } else {
                typeSelect.value = 'story';
            }
        } else if (selectedNodeId) {
            document.getElementById('form-parent-id').value = selectedNodeId;
        }
    }
    
    // Dynamically update allowed child types dropdown
    updateAllowedTypesDropdown();
    
    nodeModal.classList.remove('hidden');
}

function closeModal() {
    nodeModal.classList.add('hidden');
}

// Form Submit (Create/Update)
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('form-node-id').value;
    const title = document.getElementById('form-title').value;
    const type = document.getElementById('form-type').value;
    const status = document.getElementById('form-status').value;
    const parentIdVal = document.getElementById('form-parent-id').value;
    const parent_id = parentIdVal ? parentIdVal : null;
    const description = document.getElementById('form-description').value;
    
    const payload = { title, type, status, parent_id, description };
    
    try {
        let res;
        if (id) {
            // Update
            res = await fetch(`${API_BASE}/nodes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } else {
            // Create
            res = await fetch(`${API_BASE}/nodes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        }
        
        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.detail || 'Erro ao salvar nó');
        }
        
        showToast(id ? 'Item atualizado!' : 'Item criado com sucesso!');
        closeModal();
        
        const node = await res.json();
        selectedNodeId = node.id;
        
        await fetchTree();
        await fetchFlatNodes();
        selectNode(node.id);
        
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// Delete Node
async function handleDeleteNode() {
    if (!selectedNodeId) return;
    
    if (!confirm('Deseja realmente excluir este item? Todos os itens filhos serão removidos permanentemente.')) {
        return;
    }
    
    try {
        const res = await fetch(`${API_BASE}/nodes/${selectedNodeId}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Erro ao excluir item');
        
        showToast('Item excluído.');
        selectedNodeId = null;
        
        // Hide details
        detailsContent.classList.add('hidden');
        emptyState.classList.remove('hidden');
        
        fetchTree();
        fetchFlatNodes();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// Delete Node by ID directly
async function deleteNodeDirectly(nodeId) {
    if (!confirm('Deseja realmente excluir este item? Todos os itens filhos serão removidos de forma recursiva.')) {
        return;
    }
    
    try {
        const res = await fetch(`${API_BASE}/nodes/${nodeId}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Erro ao excluir item');
        
        showToast('Item excluído com sucesso.');
        if (selectedNodeId === nodeId) {
            selectedNodeId = null;
            detailsContent.classList.add('hidden');
            emptyState.classList.remove('hidden');
        }
        
        fetchTree();
        fetchFlatNodes();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// Seed Import Trigger
async function handleSeedImport() {
    btnSeed.disabled = true;
    btnSeed.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Importando...';
    
    try {
        const res = await fetch(`${API_BASE}/seed`, { method: 'POST' });
        if (!res.ok) throw new Error('Falha ao rodar seed de importação');
        const data = await res.json();
        
        showToast(data.message || 'Dados importados com sucesso!');
        selectedNodeId = null;
        detailsContent.classList.add('hidden');
        emptyState.classList.remove('hidden');
        
        await fetchTree();
        await fetchFlatNodes();
    } catch (err) {
        showToast(err.message, 'error');
    } finally {
        btnSeed.disabled = false;
        btnSeed.innerHTML = '<i class="fa-solid fa-database"></i> Re-importar Seed';
    }
}

// Search filter
function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    if (!query) {
        renderTree();
        return;
    }
    
    // Find all nodes matching query
    const matches = allNodesList.filter(n => 
        n.title.toLowerCase().includes(query) || 
        (n.description && n.description.toLowerCase().includes(query)) ||
        n.type.toLowerCase().includes(query)
    );
    
    // Render flat list in treeContainer just for search results
    treeRoot.innerHTML = '';
    if (matches.length === 0) {
        treeRoot.innerHTML = '<div class="empty-state" style="padding: 20px 0;"><p>Nenhum resultado encontrado.</p></div>';
        return;
    }
    
    matches.forEach(node => {
        const nodeEl = document.createElement('div');
        nodeEl.className = 'tree-node';
        if (selectedNodeId === node.id) {
            nodeEl.classList.add('selected');
        }
        nodeEl.dataset.id = node.id;
        
        // Blank space where expander would be
        const expander = document.createElement('span');
        expander.className = 'tree-expander';
        expander.innerHTML = '';
        
        const config = TYPE_CONFIG[node.type] || { icon: 'fa-circle', class: 'icon-primary' };
        const icon = document.createElement('span');
        icon.className = `tree-node-icon ${config.class}`;
        icon.innerHTML = `<i class="fa-solid ${config.icon}"></i>`;
        
        const title = document.createElement('span');
        title.className = 'tree-node-title';
        title.textContent = node.title;
        
        nodeEl.appendChild(expander);
        nodeEl.appendChild(icon);
        nodeEl.appendChild(title);
        
        nodeEl.addEventListener('click', () => {
            selectNode(node.id);
        });
        
        treeRoot.appendChild(nodeEl);
    });
}
