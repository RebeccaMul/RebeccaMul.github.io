const itemsContainer = document.getElementById('wardrobeItems');
const loader = document.getElementById('loader');
const pageIndicator = document.getElementById('pageIndicator');
const prevButton = document.getElementById('prevPage');
const nextButton = document.getElementById('nextPage');
const title = document.querySelector('.wardrobe-title');

let allItems = [];
let currentPage = 1;
const itemsPerPage = 9;
let filteredItems = [];
let adminMode = false;

function getWardrobeAdminKey() {
  let key = localStorage.getItem("wardrobeAdminKey");

  if (!key) {
    key = prompt("Wardrobe admin key:");

    if (key) {
      localStorage.setItem("wardrobeAdminKey", key);
    }
  }

  return key;
}

if (wardrobeRes.status === 401) {
  localStorage.removeItem("wardrobeAdminKey");
  throw new Error("Incorrect wardrobe admin key.");
}

fetch('https://silent-tree-4c97.rebecca-mulholland.workers.dev/items')
  .then(res => res.json())
  .then(data => {
    if (data.length) {
      allItems = data;
      const categorySelect = document.getElementById('filterCategory');
      const subcategorySelect = document.getElementById('filterSubcategory');

      const categories = [...new Set(allItems.map(item => item.category))].filter(Boolean).sort();
      categorySelect.innerHTML += categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');

      // Enable subcategory on category change
      categorySelect.addEventListener('change', () => {
        const selected = categorySelect.value;
        subcategorySelect.disabled = !selected;

        if (selected) {
          const subcats = [...new Set(allItems
            .filter(i => i.category === selected)
            .map(i => i.subcategory)
          )].filter(Boolean).sort();

          subcategorySelect.innerHTML = `<option value="">Subcategory</option>` +
            subcats.map(s => `<option value="${s}">${s}</option>`).join('');
        } else {
          subcategorySelect.innerHTML = `<option value="">Subcategory</option>`;
        }

        applyFilters();
      });

      subcategorySelect.addEventListener('change', applyFilters);

      applyFilters();
    } else {
      itemsContainer.innerHTML = `
        <div class="item-card empty">
          Nothing lingers here… yet 🕯️
        </div>`;
    }

    setTimeout(() => {
      loader.style.display = 'none';
      itemsContainer.style.opacity = '1';
      title.style.opacity = '1';
    }, 1000);
  });

prevButton.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    renderFiltered(filteredItems);
  }
});
nextButton.addEventListener('click', () => {
  if (currentPage * itemsPerPage < (filteredItems.length ? filteredItems : allItems).length) {
    currentPage++;
    renderFiltered(filteredItems);
  }
});

const toggleBtn = document.getElementById('themeToggle');
toggleBtn.addEventListener('click', () => {
  const isCandle = document.body.getAttribute('data-theme') === 'candlelit';
  document.body.setAttribute('data-theme', isCandle ? '' : 'candlelit');
  toggleBtn.textContent = isCandle ? '🕯️' : '🌙';
});

document.getElementById('themeToggle').addEventListener('click', () => {
  document.body.classList.toggle('candlelit');
  const isCandlelit = document.body.classList.contains('candlelit');
  document.getElementById('themeToggle').setAttribute('data-lit', isCandlelit);
});

document.querySelectorAll('#filterCategory, #filterSubcategory, #filterValue, #sortBy').forEach(el =>
  el.addEventListener('change', applyFilters)
);

document.getElementById('searchInput').addEventListener('input', applyFilters);

function applyFilters() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const cat = document.getElementById('filterCategory').value;
  const subcat = document.getElementById('filterSubcategory').value;
  const secondary = document.getElementById('secondaryFilter').value;
  const filterVal = document.getElementById('filterValue').value;
  const sort = document.getElementById('sortBy').value;

  let filtered = allItems.filter(item => {

    const isMakeup = item.category === "Makeup";
    const showingMakeup = cat === "Makeup";
    if (isMakeup && !showingMakeup) return false;

    const matchesSearch = !searchTerm || item.name?.toLowerCase().includes(searchTerm) || item.brand?.toLowerCase().includes(searchTerm);
    const matchesCategory = !cat || item.category === cat;
    const matchesSubcategory = !subcat || item.subcategory === subcat;

    let matchesSecondary = true;
    if (secondary && filterVal) {
      if (secondary === 'fav') {
        matchesSecondary = item.fav === true;
      } else if (secondary === 'colour') {
        matchesSecondary = item.colour?.includes(filterVal);
      } else {
        matchesSecondary = item[secondary] === filterVal;
      }
    }

    return matchesSearch && matchesCategory && matchesSubcategory && matchesSecondary;
  });

  // Sorting
  if (sort === 'score') filtered.sort((a, b) => (b.score || 0) - (a.score || 0));
  else if (sort === 'brand') filtered.sort((a, b) => (a.brand || '').localeCompare(b.brand || ''));
  else if (sort === 'colour') filtered.sort((a, b) => (a.colour?.[0] || '').localeCompare(b.colour?.[0] || ''));

  filteredItems = filtered;
  currentPage = 1;
  renderFiltered(filteredItems);
}

function renderFiltered(filteredItems) {
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageItems = filteredItems.slice(start, end);

  itemsContainer.innerHTML = pageItems.map(item => `
  <div class="item-card">
    ${adminMode ? `<span class="delete-btn" data-id="${item.id}">🔪</span>` : ""}
    <img src="${item.photo}" alt="${item.name}" />
    <div class="item-category">${item.category}</div>
    <div class="item-brand">
      ${item.brand}
      ${item.zone === "Danger Zone" ? `<span class="danger-icon">⚰️</span>` : ""}
    </div>
  </div>
  `).join('');

  pageIndicator.textContent = `Page ${currentPage}`;
  prevButton.disabled = currentPage === 1;
  nextButton.disabled = end >= filteredItems.length;
}

document.getElementById('secondaryFilter').addEventListener('change', function () {
  const selected = this.value;
  const filterValue = document.getElementById('filterValue');

  if (selected === 'fav') {
    filterValue.style.display = 'none';
    filterValue.innerHTML = '';
    applyFilters(); // Apply immediately
    return;
  }

  filterValue.style.display = selected ? 'inline-block' : 'none';
  filterValue.innerHTML = '';

  if (!selected) return;

  const uniqueVals = [...new Set(allItems.flatMap(item => {
    const val = item[selected];
    return Array.isArray(val) ? val : val ? [val] : [];
  }))].filter(Boolean).sort();

  filterValue.innerHTML = `<option value="">Select ${selected}…</option>` +
    uniqueVals.map(val => `<option value="${val}">${val}</option>`).join('');
});

function clearFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('filterCategory').value = '';
  document.getElementById('filterSubcategory').value = '';
  document.getElementById('filterSubcategory').disabled = true;
  document.getElementById('secondaryFilter').value = '';
  document.getElementById('filterValue').value = '';
  document.getElementById('filterValue').style.display = 'none';
  document.getElementById('sortBy').value = '';

  applyFilters();
}

document.getElementById('clearFilters').addEventListener('click', clearFilters);

document.getElementById('clearFiltersMobile').addEventListener('click', () => {
  clearFilters();
  document.querySelector('.filter-bar-row').classList.remove('show-search', 'show-sort', 'show-filters');

  document.getElementById('toggleSearch').removeAttribute('data-lit');
  document.getElementById('toggleSort').removeAttribute('data-lit');
  document.getElementById('toggleFilters').removeAttribute('data-lit');
});

const filterRow = document.querySelector('.filter-bar-row');
const filterBar = document.querySelector('.filter-bar-row');
const searchBtn = document.getElementById('toggleSearch');
const sortBtn = document.getElementById('toggleSort');
const filtersBtn = document.getElementById('toggleFilters');
const drawerBtn = document.getElementById('toggleDrawer');

function toggleSection(sectionClass, activeBtn, otherBtns) {
  const isAlreadyActive = filterBar.classList.contains(sectionClass);

  // Reset all
  filterBar.classList.remove('show-search', 'show-sort', 'show-filters');
  [searchBtn, sortBtn, filtersBtn].forEach(btn => btn.removeAttribute('data-lit'));

  if (!isAlreadyActive) {
    filterBar.classList.add(sectionClass);
    activeBtn.setAttribute('data-lit', true);
  }
}

searchBtn.addEventListener('click', () => {
  toggleSection('show-search', searchBtn, [sortBtn, filtersBtn]);
});

sortBtn.addEventListener('click', () => {
  toggleSection('show-sort', sortBtn, [searchBtn, filtersBtn]);
});

filtersBtn.addEventListener('click', () => {
  toggleSection('show-filters', filtersBtn, [searchBtn, sortBtn]);
});

drawerBtn.addEventListener('click', () => {
  const isOpen = filterBar.classList.toggle('drawer-visible');
  filterBar.classList.toggle('drawer-hidden', !isOpen);
  drawerBtn.setAttribute('data-lit', isOpen);
});

const modal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImage');
const modalClose = document.querySelector('.modal-close');
const modalBackdrop = document.querySelector('.modal-backdrop');

itemsContainer.addEventListener('click', (e) => {
  if (e.target.tagName === 'IMG') {
    modalImg.src = e.target.src;
    modalImg.alt = e.target.alt;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
});

function closeModal() {
  modal.classList.add('hidden');
  modalImg.src = '';
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', closeModal);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

document.getElementById('adminToggle').addEventListener('click', () => {
  adminMode = !adminMode;
  document.body.classList.toggle('admin-mode', adminMode);
  document.getElementById('adminToggle').textContent = adminMode ? 'Exit Mode 🔪' : 'Admin mode 🔪';
  renderFiltered(filteredItems);
});

itemsContainer.addEventListener('click', async (e) => {
  if (e.target.classList.contains('delete-btn')) {
    const id = e.target.dataset.id;

    const confirmed = confirm("Send to the void? 🌌");
    if (!confirmed) return;

    try {
      const deleteRes = await fetch(
        `https://silent-tree-4c97.rebecca-mulholland.workers.dev/items/${id}`,
        {
          method: "DELETE",
          headers: {
            "X-Wardrobe-Key": getWardrobeAdminKey()
          }
        }
      );

      if (wardrobeRes.status === 401) {
        localStorage.removeItem("wardrobeAdminKey");
        throw new Error("Incorrect wardrobe admin key.");
      }

      if (!deleteRes.ok) {
        const errorText = await deleteRes.text();
        throw new Error(errorText);
      }

      allItems = allItems.filter(item => item.id != id);
      applyFilters();

    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Something went wrong while deleting the item.");
    }
  }
});