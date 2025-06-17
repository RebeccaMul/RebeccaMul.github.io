  const itemsContainer = document.getElementById('supabaseItems');
  const loader = document.getElementById('loader');
  const pageIndicator = document.getElementById('pageIndicator');
  const prevButton = document.getElementById('prevPage');
  const nextButton = document.getElementById('nextPage');
  const title = document.querySelector('.wardrobe-title');

  let allItems = [];
  let currentPage = 1;
  const itemsPerPage = 9;
  let filteredItems = [];


  fetch('https://viaecfkrsnraazgsmdet.supabase.co/rest/v1/wardrobe', {
    headers: {
      apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpYWVjZmtyc25yYWF6Z3NtZGV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0OTk2MzAsImV4cCI6MjA2NTA3NTYzMH0.uuj2PoKfN5-D7GQc363vYWo5kWLxkLbKDUSWSjr9n1k',
      'Content-Type': 'application/json'
    }
  })
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

      renderPage(currentPage);
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

  function renderPage(page) {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = allItems.slice(start, end);

    itemsContainer.innerHTML = pageItems.map(item => `
      <div class="item-card">
        <img src="${item.photo}" alt="${item.name}" />
        <div class="item-category">${item.category}</div>
        <div class="item-brand">${item.brand}</div>
      </div>
    `).join('');

    pageIndicator.textContent = `Page ${currentPage}`;
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = end >= allItems.length;
  }

prevButton.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    renderFiltered(filteredItems.length ? filteredItems : allItems);
  }
});
nextButton.addEventListener('click', () => {
  if (currentPage * itemsPerPage < (filteredItems.length ? filteredItems : allItems).length) {
    currentPage++;
    renderFiltered(filteredItems.length ? filteredItems : allItems);
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
      <img src="${item.photo}" alt="${item.name}" />
      <div class="item-category">${item.category}</div>
      <div class="item-brand">${item.brand}</div>
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

document.getElementById('clearFilters').addEventListener('click', () => {
  document.getElementById('searchInput').value = '';
  document.getElementById('filterCategory').value = '';
  document.getElementById('filterSubcategory').value = '';
  document.getElementById('filterSubcategory').disabled = true;
  document.getElementById('secondaryFilter').value = '';
  document.getElementById('filterValue').value = '';
  document.getElementById('filterValue').style.display = 'none';
  document.getElementById('sortBy').value = '';

  applyFilters();
});

const filterRow = document.querySelector('.filter-bar-row');

const filterBar = document.querySelector('.filter-bar-row');
const searchBtn = document.getElementById('toggleSearch');
const sortBtn = document.getElementById('toggleSort');
const filtersBtn = document.getElementById('toggleFilters');

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



