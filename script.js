// Конфігурація Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAF4fWjkdNCUH-1lhfSF3rjqhEV8Anaj_Q",
  authDomain: "instruforge.firebaseapp.com",
  projectId: "instruforge",
  storageBucket: "instruforge.firebasestorage.app",
  messagingSenderId: "343370200187",
  appId: "1:343370200187:web:852f32b4fb1fb53836dede"
};

// Константи для EmailJS
const EMAILJS_SERVICE_ID = "boltmaster-2025";
const EMAILJS_TEMPLATE_ID = "template_2csi2fp";
const EMAILJS_USER_ID = "hYmYimcQ5x5Mu_skB";

// Массив файлов с товарами
const PRODUCT_FILES = [
    'products1.json',
    'products2.json', 
    'products3.json',
    'products4.json',
    'products5.json',
    'products6.json'
];

// Ініціалізація Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Константи додатка
const ADMIN_PASSWORD = "Lenok1378@";
const CART_STORAGE_KEY = "electrotools_cart";
const FAVORITES_STORAGE_KEY = "electrotools_favorites";
const FEED_URL_KEY = "electrotools_feed_url";
const FEED_UPDATE_TIME_KEY = "electrotools_feed_update";
const VIEW_MODE_KEY = "electrotools_view_mode";
const ADMINS_STORAGE_KEY = "electrotools_admins";

// ===== СЛОВНИК ПЕРЕКЛАДУ КАТЕГОРІЙ =====
const categoryTranslations = {
    "Инструменты": "Інструменти",
    "Насосы": "Насоси",
    "Сантехника": "Сантехніка",
    "Крепеж": "Кріплення",
    "Электроинструменты": "Електроінструменти",
    "Садовый инвентарь": "Садовий інвентар",
    "Отделочные материалы": "Оздоблювальні матеріали",
    "Хозтовары": "Господарські товари",
    "Стройматериалы": "Будматеріали",
    "Автоинструменты": "Автоінструменти",
    "Без категории": "Без категорії",
    "Все для кухни": "Все для кухні",
    "Красота и здоровье": "Красота і здоров'я",
    "Товары для дома и сада": "Товари для дому та саду",
    "Фонари, лампы, зажигалки": "Ліхтарі, лампи, запальнички",
    "Часы, смарт, фитнес браслеты": "Годинники, смарт, фітнес браслети",
    "Обувь": "Взуття",
    "Комплекты товаров": "Комплекти товарів",
    "Автотовары": "Автотовари",
    "Товары для детей": "Товари для дітей",
    "Электроника": "Електроніка",
    "Сумки, клатчи, кошельки, очки": "Сумки, клатчі, гаманці, окуляри",
    "Электронки": "Електронні пристрої",
    "Колонки и акустика": "Колонки та акустика",
    "Спорт, здоровье, отдых": "Спорт, здоров'я, відпочинок",
    "Наушники и гарнитура": "Навушники та гарнітура",
    "Мобильные аксессуары": "Мобільні аксесуари",
    "Косметика": "Косметика",
    "Товары для животных": "Товари для тварин",
    "Застосувати": "Застосувати"
};

// Функция для перевода категорий
function translateCategory(category) {
    if (!category) return '';
    return categoryTranslations[category] || category;
}

// Додаємо змінні для покращеного пошуку
let searchTimeout = null;
const SEARCH_DELAY = 300;

// ===== УЛУЧШЕННЫЕ ФУНКЦИИ ПОИСКА ДЛЯ ДЕСКТОПА И МОБИЛЬНЫХ =====

// Кэширование результатов поиска
const searchCache = new Map();
const MAX_CACHE_SIZE = 100;

function clearSearchCache() {
  searchCache.clear();
}

// Расширенный словарь синонимов для поиска
const searchSynonyms = {
  // Русские синонимы
  'болгарка': ['ушм', 'углошлифовальная'],
  'ушм': ['болгарка', 'углошлифовальная'],
  'дрель': ['сверлильный', 'перфоратор'],
  'шуруповерт': ['дрель', 'винтоверт'],
  'шуруповёрт': ['дрель', 'винтоверт'],
  'насос': ['помпа'],
  'кран': ['вентиль', 'затвор'],
  'отвертка': ['шуруповерт'],
  'пила': ['ножовка', 'циркулярка'],
  'молоток': ['кувалда'],
  'перфоратор': ['дрель', 'отбойный'],
  'лобзик': ['пила'],
  'рубанок': ['строгальный'],
  'фрезер': ['фрезерный'],
  'шлифмашина': ['шлифовальный'],
  'паяльник': ['паяльный'],
  
  // Украинские синонимы
  'болгарка': ['ушм', 'кутошлифувальна'],
  'ушм': ['болгарка', 'кутошлифувальна'],
  'дриль': ['свердлильний', 'перфоратор'],
  'шуруповерт': ['дриль', 'гвинтокрил'],
  'насос': ['помпа'],
  'кран': ['вентиль', 'затвор'],
  'викрутка': ['шуруповерт'],
  'пила': ['ножівка', 'циркулярка'],
  'молоток': ['кувалда'],
  'перфоратор': ['дриль', 'відбійний'],
  'лобзик': ['пила'],
  'рубанок': ['стругальний'],
  'фрезер': ['фрезерний'],
  'шліфмашина': ['шліфувальний'],
  'паяльник': ['паяльний']
};

// Улучшенная нормализация текста
function normalizeSearchTerm(term) {
  if (!term) return '';
  
  let normalized = term.toLowerCase()
    // Заменяем украинские буквы на русские аналоги
    .replace(/[є]/g, 'е')
    .replace(/[ї]/g, 'и') 
    .replace(/[і]/g, 'и')
    .replace(/[ґ]/g, 'г')
    // Заменяем русские буквы на украинские аналоги
    .replace(/[ё]/g, 'е')
    .replace(/[ы]/g, 'и')
    .replace(/[э]/g, 'е')
    // Удаляем мягкие и твердые знаки
    .replace(/[ъь]/g, '')
    // Оставляем только буквы, цифры, дефисы, пробелы и апострофы
    .replace(/[^а-яa-z0-9\-\s']/g, '')
    // Убираем множественные пробелы
    .replace(/\s+/g, ' ')
    .trim();
  
  return normalized;
}

// Функция для транслитерации текста
function transliterateText(text) {
  const transliterationMap = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
  };
  
  let result = '';
  for (let char of text.toLowerCase()) {
    result += transliterationMap[char] || char;
  }
  return result;
}

// Расширение поискового запроса синонимами
function expandSearchQuery(query) {
  const words = query.split(' ');
  const expanded = [...words];
  
  words.forEach(word => {
    const normalizedWord = normalizeSearchTerm(word);
    
    // Добавляем синонимы
    if (searchSynonyms[normalizedWord]) {
      expanded.push(...searchSynonyms[normalizedWord]);
    }
  });
  
  // Удаляем дубликаты
  return [...new Set(expanded)].join(' ');
}

// Улучшенная функция для получения поисковых подсказок
function getSearchSuggestions(query) {
  try {
    if (!query || query.length < 1) return [];
    
    const normalizedQuery = normalizeSearchTerm(query);
    
    if (searchCache.has(normalizedQuery)) {
      return searchCache.get(normalizedQuery);
    }
    
    const suggestions = [];
    const seen = new Set();
    
    // Ограничиваем количество проверяемых товаров для производительности
    const maxProductsToCheck = Math.min(products.length, 200);
    
    for (let i = 0; i < maxProductsToCheck; i++) {
      const product = products[i];
      if (!product || typeof product !== 'object') continue;
      
      // Проверяем только основные поля
      const fieldsToCheck = [
        { field: 'title', type: 'Назва', icon: '📦', relevance: 10 },
        { field: 'brand', type: 'Бренд', icon: '🏷️', relevance: 8 },
        { field: 'category', type: 'Категорія', icon: '📂', relevance: 6 }
      ];
      
      for (const { field, type, icon, relevance } of fieldsToCheck) {
        if (product[field] && !seen.has(product[field])) {
          const fieldValue = String(product[field]);
          const normalizedField = normalizeSearchTerm(fieldValue);
          
          if (normalizedField.includes(normalizedQuery)) {
            seen.add(product[field]);
            suggestions.push({ 
              value: product[field], 
              type: type, 
              icon: icon,
              productId: product.id,
              relevance: relevance + (field === 'title' ? 5 : 0)
            });
          }
        }
      }
      
      if (suggestions.length >= 5) break;
    }
    
    // Сортируем по релевантности
    suggestions.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));
    
    // Обновляем кэш
    if (searchCache.size > MAX_CACHE_SIZE) {
      const firstKey = searchCache.keys().next().value;
      searchCache.delete(firstKey);
    }
    
    const finalSuggestions = suggestions.slice(0, 5);
    searchCache.set(normalizedQuery, finalSuggestions);
    return finalSuggestions;
  } catch (error) {
    console.error("Ошибка в поиске подсказок:", error);
    return [];
  }
}

// Упрощенная функция фильтрации товаров
function searchProducts(searchTerm) {
  if (!searchTerm || searchTerm.trim().length < 1) {
    return products;
  }
  
  const normalizedSearch = normalizeSearchTerm(searchTerm);
  const searchWords = normalizedSearch.split(/\s+/).filter(word => word.length >= 1);
  
  if (searchWords.length === 0) {
    return products;
  }
  
  return products.filter(product => {
    if (!product.searchIndex) return false;
    
    // Проверяем все слова запроса в searchIndex
    return searchWords.every(word => 
      product.searchIndex.includes(word)
    );
  });
}

// Функция для экранирования HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ===== УЛУЧШЕННЫЕ ФУНКЦИИ ПОИСКА ДЛЯ ДЕСКТОПА И МОБИЛЬНЫХ =====

function setupSearchHandler() {
  const searchInput = document.getElementById('search');
  const searchMobileInput = document.getElementById('search-mobile');
  let lastSearchValue = '';
  
  function handleSearch(value, isMobile = false) {
    if (value === lastSearchValue) return;
    
    clearTimeout(searchTimeout);
    
    searchTimeout = setTimeout(() => {
      lastSearchValue = value;
      currentFilters.search = value;
      
      if (value.length >= 1) {  // Изменено с 2 на 1 символ
        showSearchSuggestions(value, isMobile);
      } else {
        hideSearchSuggestions(isMobile);
      }
      
      applyFilters();
    }, SEARCH_DELAY);
  }
  
  // Обработчик для десктопного поиска
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      const currentValue = this.value.trim();
      handleSearch(currentValue, false);
      // Синхронизируем с мобильным полем
      if (searchMobileInput) {
        searchMobileInput.value = currentValue;
      }
    });
    
    searchInput.addEventListener('keydown', function(e) {
      const suggestionsContainer = document.getElementById('search-suggestions');
      if (!suggestionsContainer || suggestionsContainer.style.display === 'none') return;
      
      const suggestions = suggestionsContainer.querySelectorAll('.search-suggestion');
      let activeSuggestion = suggestionsContainer.querySelector('.search-suggestion.active');
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (!activeSuggestion) {
            suggestions[0]?.classList.add('active');
          } else {
            activeSuggestion.classList.remove('active');
            const next = activeSuggestion.nextElementSibling || suggestions[0];
            next.classList.add('active');
          }
          break;
          
        case 'ArrowUp':
          e.preventDefault();
          if (!activeSuggestion) {
            suggestions[suggestions.length - 1]?.classList.add('active');
          } else {
            activeSuggestion.classList.remove('active');
            const prev = activeSuggestion.previousElementSibling || suggestions[suggestions.length - 1];
            prev.classList.add('active');
          }
          break;
          
        case 'Enter':
          e.preventDefault();
          if (activeSuggestion) {
            activeSuggestion.click();
          }
          break;
          
        case 'Escape':
          hideSearchSuggestions(false);
          this.value = '';
          currentFilters.search = '';
          applyFilters();
          break;
      }
    });
  }
  
  // Обработчик для мобильного поиска
  if (searchMobileInput) {
    searchMobileInput.addEventListener('input', function() {
      const currentValue = this.value.trim();
      handleSearch(currentValue, true);
      // Синхронизируем с десктопным полем
      if (searchInput) {
        searchInput.value = currentValue;
      }
    });
    
    searchMobileInput.addEventListener('keydown', function(e) {
      const suggestionsContainer = document.getElementById('search-suggestions-mobile');
      if (!suggestionsContainer || suggestionsContainer.style.display === 'none') return;
      
      const suggestions = suggestionsContainer.querySelectorAll('.search-suggestion');
      let activeSuggestion = suggestionsContainer.querySelector('.search-suggestion.active');
      
      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          if (activeSuggestion) {
            activeSuggestion.click();
          }
          break;
          
        case 'Escape':
          hideSearchSuggestions(true);
          this.value = '';
          currentFilters.search = '';
          applyFilters();
          break;
      }
    });
  }
  
  // Добавьте обработчик для клика вне области поиска
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.search-container') && !e.target.closest('.search-container-mobile')) {
      hideSearchSuggestions(false);
      hideSearchSuggestions(true);
    }
  });
}

// Функция для сброса поиска
function clearSearch() {
  const searchInput = document.getElementById('search');
  searchInput.value = '';
  currentFilters.search = '';
  hideSearchSuggestions();
  applyFilters();
  searchInput.focus();
}

// Улучшенная функция показа подсказок для десктопа и мобильных
function showSearchSuggestions(query, isMobile = false) {
  if (!query || query.length < 1) {
    hideSearchSuggestions(isMobile);
    return;
  }
  
  const suggestions = getSearchSuggestions(query);
  const searchContainer = isMobile 
    ? document.querySelector('.search-container-mobile') 
    : document.querySelector('.search-container');
  
  if (!searchContainer) return;
  
  const suggestionsId = isMobile ? 'search-suggestions-mobile' : 'search-suggestions';
  let suggestionsContainer = document.getElementById(suggestionsId);
  
  if (!suggestionsContainer) {
    suggestionsContainer = document.createElement('div');
    suggestionsContainer.id = suggestionsId;
    suggestionsContainer.className = 'search-suggestions' + (isMobile ? ' mobile-suggestions' : '');
    searchContainer.appendChild(suggestionsContainer);
  }
  
  if (suggestions.length > 0) {
    suggestionsContainer.innerHTML = '';
    
    suggestions.forEach((suggestion, index) => {
      const div = document.createElement('div');
      div.className = `search-suggestion ${index === 0 ? 'active' : ''}`;
      div.innerHTML = `
        ${suggestion.icon} 
        <span class="suggestion-text">${escapeHtml(suggestion.value)}</span>
        <span class="suggestion-type">${suggestion.type}</span>
      `;
      
      div.addEventListener('click', () => {
        if (isMobile) {
          document.getElementById('search-mobile').value = suggestion.value;
        } else {
          document.getElementById('search').value = suggestion.value;
        }
        currentFilters.search = suggestion.value;
        applyFilters();
        hideSearchSuggestions(isMobile);
        
        if (suggestion.productId) {
          showProductDetail(suggestion.productId);
        }
      });
      
      div.addEventListener('mouseenter', () => {
        suggestionsContainer.querySelectorAll('.search-suggestion').forEach(s => 
          s.classList.remove('active')
        );
        div.classList.add('active');
      });
      
      suggestionsContainer.appendChild(div);
    });
    
    suggestionsContainer.style.display = 'block';
  } else {
    suggestionsContainer.style.display = 'none';
  }
}

// Функция для скрытия подсказок
function hideSearchSuggestions(isMobile = false) {
  const suggestionsId = isMobile ? 'search-suggestions-mobile' : 'search-suggestions';
  const suggestionsContainer = document.getElementById(suggestionsId);
  if (suggestionsContainer) {
    suggestionsContainer.style.display = 'none';
    suggestionsContainer.querySelectorAll('.search-suggestion').forEach(s => 
      s.classList.remove('active')
    );
  }
}

// Улучшенная предобработка товаров с весами для поиска
function preprocessProducts(productsArray) {
  return productsArray.map(product => {
    if (!product || typeof product !== 'object') return product;
    
    // Создаем расширенный поисковый индекс с весами
    const searchFields = [
      product.title || '', product.title || '', product.title || '', // высокая важность (повторяем 3 раза)
      product.brand || '', product.brand || '', // средняя важность (повторяем 2 раза)
      product.category || '',
      product.description || '',
      product.specifications || '',
      product.model || '',
      product.sku || ''
    ];
    
    // Нормализуем каждое поле отдельно
    const normalizedFields = searchFields.map(field => 
      normalizeSearchTerm(String(field))
    );
    
    const searchIndex = normalizedFields.join(' ').toLowerCase();
    
    return {
      ...product,
      searchIndex,
      title: product.title || 'Без названия',
      brand: product.brand || '',
      category: product.category || '',
      description: product.description || '',
      price: Number(product.price) || 0,
      image: product.image || '',
      inStock: product.inStock !== undefined ? product.inStock : true,
      specifications: product.specifications || '',
      model: product.model || '',
      sku: product.sku || ''
    };
  });
}

// Улучшенная функция поиска с использованием синонимов
function searchProductsEnhanced(searchTerm) {
  if (!searchTerm || searchTerm.trim().length < 1) {
    return products;
  }
  
  const normalizedSearch = normalizeSearchTerm(searchTerm);
  const searchWords = normalizedSearch.split(/\s+/).filter(word => word.length >= 1);
  
  if (searchWords.length === 0) {
    return products;
  }
  
  // Используем расширенный запрос с синонимами
  const expandedQuery = expandSearchQuery(normalizedSearch);
  const expandedWords = expandedQuery.split(/\s+/).filter(word => word.length >= 1);
  
  return products.filter(product => {
    if (!product.searchIndex) return false;
    
    // Проверяем все исходные слова запроса в searchIndex
    const allWordsMatch = searchWords.every(word => 
      product.searchIndex.includes(word)
    );
    
    // Если не все исходные слова найдены, проверяем расширенный запрос
    if (!allWordsMatch && expandedWords.length > searchWords.length) {
      return expandedWords.some(word => 
        product.searchIndex.includes(word)
      );
    }
    
    return allWordsMatch;
  });
}

// Заменяем оригинальную функцию поиска на улучшенную версию
const originalSearchProducts = searchProducts;
searchProducts = function(searchTerm) {
  return searchProductsEnhanced(searchTerm);
};

// Добавляем CSS для улучшенных подсказок (десктоп и мобильные)
function addSearchStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .search-container {
      position: relative;
      width: 100%;
    }
    
    .search-container-mobile {
      position: relative;
      width: 100%;
      margin: 10px 0;
    }
    
    .search-suggestions {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      max-height: 300px;
      overflow-y: auto;
      display: none;
    }
    
    .mobile-suggestions {
      position: fixed;
      top: auto;
      bottom: 0;
      left: 10px;
      right: 10px;
      max-height: 50vh;
      border-radius: 8px 8px 0 0;
    }
    
    .search-suggestion {
      padding: 12px 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      border-bottom: 1px solid #f0f0f0;
      transition: background-color 0.2s;
    }
    
    .search-suggestion:hover,
    .search-suggestion.active {
      background-color: #f8f9fa;
    }
    
    .search-suggestion:last-child {
      border-bottom: none;
    }
    
    .suggestion-text {
      flex: 1;
      font-weight: 500;
      font-size: 14px;
    }
    
    .suggestion-type {
      font-size: 0.75em;
      color: #6c757d;
      background: #e9ecef;
      padding: 2px 6px;
      border-radius: 4px;
    }
    
    .search-loading {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: #6c757d;
    }
    
    .clear-search {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: #6c757d;
      cursor: pointer;
      padding: 5px;
    }
    
    .clear-search:hover {
      color: #333;
    }
    
    @media (max-width: 768px) {
      .search-container {
        display: none;
      }
      .search-container-mobile {
        display: block;
      }
    }
    
    @media (min-width: 769px) {
      .search-container-mobile {
        display: none;
      }
    }
  `;
  document.head.appendChild(style);
}

// Синхронизация поисковых полей при загрузке
function syncSearchFieldsOnLoad() {
  const searchDesktop = document.getElementById('search');
  const searchMobile = document.getElementById('search-mobile');
  
  if (searchDesktop && searchMobile) {
    // Синхронизация значений при загрузке
    searchMobile.value = searchDesktop.value;
    
    // Обработчик очистки для мобильного поиска
    searchMobile.addEventListener('input', function() {
      if (this.value === '') {
        currentFilters.search = '';
        applyFilters();
      }
    });
  }
}

// Очистка таймера при закрытии страницы
function cleanupSearch() {
  clearTimeout(searchTimeout);
  searchTimeout = null;
}

window.addEventListener('beforeunload', cleanupSearch);

// Функция для оптимизации модальных окон на мобильных устройствах
function optimizeModalForMobile() {
  const modal = document.getElementById('modal');
  const modalContent = document.querySelector('.modal-content');
  
  if (window.innerWidth <= 768) {
    modal.classList.add('mobile-modal');
    document.body.style.overflow = 'hidden';
    
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeModal();
      }
    });
  }
}

// Функція для завантаження всіх товарів з JSON-файлів
async function loadAllProducts() {
  let allProducts = [];

  for (const file of PRODUCT_FILES) {
    try {
      const response = await fetch(file);
      const data = await response.json();
      allProducts = allProducts.concat(data);
    } catch (e) {
      console.warn(`Не вдалося завантажити ${file}`, e);
    }
  }

  return allProducts;
}

let products = [];
let cart = {};
let favorites = {};
let adminMode = false;
let showingFavorites = false;
let currentUser = null;
let currentPage = 1;
const productsPerPage = 32;
let isProductsLoading = false;
let currentFilters = {
  category: '',
  brand: '',
  minPrice: null,
  maxPrice: null,
  sort: 'default',
  search: '',
  availability: '',
  source: ''
};

// Глобальная переменная для рейтинга
let currentRating = 0;

// Функція для налаштування лічильника переглядів
function setupPageCounter() {
  const params = new URLSearchParams({
      style: 'flat-square',
      label: 'Views',
      color: 'blue',
      logo: 'firebase'
  });

  // Беремо шлях поточної сторінки
  const currentPath = window.location.pathname;

  // Робимо лічильник для boltmaster-2025.web.app
  const counterURL = `https://hits.sh/boltmaster-2025.web.app${currentPath}.svg?${params.toString()}`;
  const pageViewsElement = document.getElementById('page-views');
  if (pageViewsElement) {
      pageViewsElement.src = counterURL;
  }
}

// Функція отправки email с данными заказа
function sendOrderEmail(orderId, order) {
  let itemsList = '';
  for (const [productId, quantity] of Object.entries(order.items)) {
    const product = products.find(p => p.id === productId);
    if (product) {
      itemsList += `
        <tr>
          <td>${product.title}</td>
          <td>${quantity}</td>
          <td>${formatPrice(product.price)} ₴</td>
          <td>${formatPrice(product.price * quantity)} ₴</td>
        </tr>
      `;
    }
  }
  
  const templateParams = {
    to_email: "korovinkonstantin0@gmail.com",
    order_id: orderId,
    customer_name: order.userName,
    customer_email: order.userEmail,
    customer_phone: order.userPhone,
    delivery_service: order.delivery.service,
    delivery_city: order.delivery.city,
    delivery_warehouse: order.delivery.warehouse,
    payment_method: order.paymentMethod === 'cash' ? 'Готівкою при отриманні' : 'Онлайн-оплата карткою',
    total_amount: formatPrice(order.total),
    items: itemsList,
    order_date: new Date().toLocaleString('uk-UA')
  };

  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
    .then(function(response) {
      console.log('Email успешно отправлен!', response.status, response.text);
    }, function(error) {
      console.error('Ошибка отправки email:', error);
    });
}

// Функція для завантаження товарів з JSON файлу
function loadProductsFromJson() {
  isProductsLoading = true;
  renderProducts(); // Показать скелетоны при начале загрузки
  
  const promises = PRODUCT_FILES.map(file => 
      fetch(file)
          .then(response => {
              if (!response.ok) {
                  console.warn(`Файл ${file} не найден, пропускаем`);
                  return [];
              }
              return response.json();
          })
          .then(productsArray => {
              return productsArray.map(product => ({
                  ...product,
                  source: file,
                  isPopular: product.isPopular || false
              }));
          })
          .catch(error => {
              console.warn(`Ошибка загрузки файла ${file}:`, error);
              return [];
          })
  );

  return Promise.all(promises)
      .then(results => {
          let allProducts = [];
          results.forEach(productsArray => {
              if (Array.isArray(productsArray)) {
                  allProducts = allProducts.concat(productsArray);
              }
          });
          
          if (allProducts.length === 0) {
              const backup = localStorage.getItem('products_backup');
              if (backup) {
                  const backupProducts = JSON.parse(backup);
                  isProductsLoading = false;
                  return backupProducts;
              }
              throw new Error('Не вдалося завантажити товари з жодного файлу');
          }
          
          isProductsLoading = false;
          return shuffleArray(allProducts);
      })
      .catch(error => {
          isProductsLoading = false;
          throw error;
      });
}

// Функция проверки доступности JSON файлов
async function checkFilesAvailability() {
    const availability = {};
    
    for (const file of PRODUCT_FILES) {
        try {
            const response = await fetch(file, { method: 'HEAD' });
            availability[file] = response.ok;
        } catch (error) {
            availability[file] = false;
        }
    }
    
    document.querySelectorAll('.source-tab').forEach(tab => {
        const onclickAttr = tab.getAttribute('onclick');
        const match = onclickAttr.match(/switchSource\('([^']+)'/);
        if (match && match[1] !== 'all') {
            const file = match[1];
            if (!availability[file]) {
                tab.style.display = 'none';
            }
        }
    });
}

// Ініціалізація додатка
function initApp() {
  emailjs.init(EMAILJS_USER_ID);
  
  addSearchStyles();

  // Показать скелетоны сразу при инициализации
  showEnhancedLoadingSkeleton();
  
  auth.onAuthStateChanged(user => {
    if (user) {
      currentUser = user;
      document.getElementById('login-btn').style.display = 'none';
      document.getElementById('user-menu').style.display = 'inline-block';
      document.getElementById('admin-access-btn').style.display = 'inline-block';
      document.getElementById('user-name').textContent = user.displayName || user.email;
      
      checkAdminStatus(user.uid);
    } else {
      currentUser = null;
      document.getElementById('login-btn').style.display = 'inline-block';
      document.getElementById('user-menu').style.display = 'none';
      document.getElementById('admin-access-btn').style.display = 'none';
      document.getElementById("admin-panel").style.display = "none";
      adminMode = false;
    }
  });
  
  // Загрузка товаров
  loadProducts().catch(error => {
    console.error("Помилка завантаження з Firestore, пробуємо завантажити з JSON:", error);
    
    loadProductsFromJson()
      .then(jsonProducts => {
        products = preprocessProducts(jsonProducts);
        window.currentProducts = products;
        updateCartCount();
        renderProducts();
        renderFeaturedProducts();
        renderCategories();
        renderBrands();
        showNotification(`Товари завантажено з ${PRODUCT_FILES.length} файлів`);
        
        localStorage.setItem('products_backup', JSON.stringify(products));
      })
      .catch(jsonError => {
        console.error("Помилка завантаження з JSON:", jsonError);
        showNotification("Не вдалося завантажити товари", "error");
        isProductsLoading = false;
        renderProducts(); // Показать сообщение об ошибке
      });
  }).finally(() => {
      checkFilesAvailability();
  });
  
  const cartData = localStorage.getItem(CART_STORAGE_KEY);
  if(cartData) cart = JSON.parse(cartData);
  
  const favoritesData = localStorage.getItem(FAVORITES_STORAGE_KEY);
  if(favoritesData) favorites = JSON.parse(favoritesData);
  
  const viewMode = localStorage.getItem(VIEW_MODE_KEY) || 'grid';
  setViewMode(viewMode);
  
  updateCartCount();
  
  const feedUrl = localStorage.getItem(FEED_URL_KEY);
  if (feedUrl) {
    document.getElementById("feed-url").value = feedUrl;
  }
  
  document.getElementById("year").innerText = new Date().getFullYear();
  
  setupSearchHandler();
  syncSearchFieldsOnLoad(); // Добавьте эту строку
  
  document.getElementById('category').addEventListener('change', function() {
    currentFilters.category = this.value;
    applyFilters();
  });
  
  document.getElementById('brand').addEventListener('change', function() {
    currentFilters.brand = this.value;
    applyFilters();
  });
  
  document.getElementById('sort').addEventListener('change', function() {
    currentFilters.sort = this.value;
    applyFilters();
  });
  
  document.getElementById('availability').addEventListener('change', function() {
    currentFilters.availability = this.value;
    applyFilters();
  });
  
  document.getElementById('price-min').addEventListener('change', function() {
    currentFilters.minPrice = this.value ? parseInt(this.value) : null;
    applyFilters();
  });
  
  document.getElementById('price-max').addEventListener('change', function() {
    currentFilters.maxPrice = this.value ? parseInt(this.value) : null;
    applyFilters();
  });
  
  window.addEventListener('resize', adjustHeaderTitle);
  adjustHeaderTitle();
  
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.search-container') && !e.target.closest('.search-container-mobile')) {
      hideSearchSuggestions(false);
      hideSearchSuggestions(true);
    }
  });

  // Синхронизация фильтров при загрузке
  setTimeout(() => {
    document.getElementById('mobile-price-min').value = document.getElementById('price-min').value;
    document.getElementById('mobile-price-max').value = document.getElementById('price-max').value;
    document.getElementById('mobile-brand').value = document.getElementById('brand').value;
    document.getElementById('mobile-availability').value = document.getElementById('availability').value;
    document.getElementById('mobile-sort').value = document.getElementById('sort').value;
  }, 1000);
}

// Функции для мобильных фильтров
function toggleMobileFilters() {
    const mobileFilters = document.getElementById('mobile-filters');
    mobileFilters.classList.toggle('active');
    
    // Блокируем прокрутку body при открытых фильтрах
    if (mobileFilters.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

function closeMobileFilters() {
    const mobileFilters = document.getElementById('mobile-filters');
    mobileFilters.classList.remove('active');
    document.body.style.overflow = '';
}

function applyMobileFilters() {
    // Синхронизируем значения из мобильных фильтров в основные
    document.getElementById('price-min').value = document.getElementById('mobile-price-min').value;
    document.getElementById('price-max').value = document.getElementById('mobile-price-max').value;
    document.getElementById('brand').value = document.getElementById('mobile-brand').value;
    document.getElementById('availability').value = document.getElementById('mobile-availability').value;
    document.getElementById('sort').value = document.getElementById('mobile-sort').value;
    
    // Применяем фильтры
    applyFilters();
    
    // Закрываем мобильные фильтры
    closeMobileFilters();
}

function resetMobileFilters() {
    // Сбрасываем мобильные фильтры
    document.getElementById('mobile-price-min').value = '';
    document.getElementById('mobile-price-max').value = '';
    document.getElementById('mobile-brand').value = '';
    document.getElementById('mobile-availability').value = '';
    document.getElementById('mobile-sort').value = 'default';
    
    // Сбрасываем основные фильтры
    resetFilters();
    
    // Закрываем мобильные фильтры
    closeMobileFilters();
}

function loadProducts() {
  isProductsLoading = true;
  renderProducts(); // Показать скелетоны сразу при начале загрузки
  
  const cachedProducts = localStorage.getItem('products_cache');
  const cacheTime = localStorage.getItem('products_cache_time');
  
  if (cachedProducts && cacheTime && Date.now() - cacheTime < 300000) {
    products = preprocessProducts(JSON.parse(cachedProducts));
    products = shuffleArray(products);
    window.currentProducts = products;
    isProductsLoading = false;
    updateCartCount();
    renderProducts();
    renderFeaturedProducts();
    renderCategories();
    renderBrands();
    return Promise.resolve();
  }
  
  return db.collection("products")
        .get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
        const data = localStorage.getItem('products_backup');
        if (data) {
          products = preprocessProducts(JSON.parse(data));
          products = shuffleArray(products);
          window.currentProducts = products;
          isProductsLoading = false;
          updateCartCount();
          renderProducts();
          renderFeaturedProducts();
          renderCategories();
          renderBrands();
          return Promise.resolve();
        } else {
          return loadProductsFromJson()
            .then(jsonProducts => {
              products = preprocessProducts(jsonProducts);
              products = shuffleArray(products);
              window.currentProducts = products;
              isProductsLoading = false;
              updateCartCount();
              renderProducts();
              renderFeaturedProducts();
              renderCategories();
              renderBrands();
              showNotification("Товари завантажено з локального файлу");
              
              localStorage.setItem('products_backup', JSON.stringify(products));
            });
        }
      } else {
                products = [];
                querySnapshot.forEach((doc) => {
                    products.push({ id: doc.id, ...doc.data() });
                });
                
                products = preprocessProducts(products);
                products = shuffleArray(products);
                window.currentProducts = products;
        
        localStorage.setItem('products_cache', JSON.stringify(products));
        localStorage.setItem('products_cache_time', Date.now());
        
        isProductsLoading = false;
        updateCartCount();
        renderProducts();
        renderFeaturedProducts();
        renderCategories();
        renderBrands();
        return Promise.resolve();
      }
    })
    .catch((error) => {
      console.error("", error);
      showNotification("", "error");
      isProductsLoading = false;
      
      const data = localStorage.getItem('products_backup');
      if (data) {
        products = preprocessProducts(JSON.parse(data));
        products = shuffleArray(products);
        window.currentProducts = products;
        updateCartCount();
        renderProducts();
        renderFeaturedProducts();
        renderCategories();
        renderBrands();
        return Promise.resolve();
      } else {
        return Promise.reject(error);
      }
    });
}

// ===== ФУНКЦІЇ ПАГІНАЦІЇ =====

function changePage(page) {
  currentPage = page;
  showLoadingSkeleton();
  
  setTimeout(() => {
    renderProducts();
    updatePagination();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 100);
}

function updatePagination() {
  const paginationContainer = document.getElementById("pagination");
  if (!paginationContainer) return;
  
  let filteredProducts = getFilteredProducts();
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  
  if (totalPages <= 1) {
    paginationContainer.style.display = 'none';
    return;
  }
  
  paginationContainer.style.display = 'flex';
  paginationContainer.innerHTML = '';
  
  const prevButton = document.createElement('button');
  prevButton.innerHTML = '&laquo;';
  prevButton.disabled = currentPage === 1;
  prevButton.onclick = () => changePage(currentPage - 1);
  paginationContainer.appendChild(prevButton);
  
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + 4);
  
  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    const button = document.createElement('button');
    button.textContent = i;
    button.classList.toggle('active', i === currentPage);
    button.onclick = () => changePage(i);
    paginationContainer.appendChild(button);
  }
  
  const nextButton = document.createElement('button');
    nextButton.innerHTML = '&raquo;';
    nextButton.disabled = currentPage === totalPages;
    nextButton.onclick = () => changePage(currentPage + 1);
    paginationContainer.appendChild(nextButton);
}

function getFilteredProducts() {
  let filteredProducts = [...products];
  
  if (showingFavorites) {
    filteredProducts = filteredProducts.filter(product => favorites[product.id]);
  }
  
  if (currentFilters.search) {
    filteredProducts = searchProducts(currentFilters.search);
  }
  
  if (currentFilters.category) {
    filteredProducts = filteredProducts.filter(product => 
      product.category === currentFilters.category
    );
  }
  
  if (currentFilters.brand) {
    filteredProducts = filteredProducts.filter(product => 
      product.brand === currentFilters.brand
    );
  }
  
  if (currentFilters.minPrice) {
    filteredProducts = filteredProducts.filter(product => 
      product.price >= currentFilters.minPrice
    );
  }
  
  if (currentFilters.maxPrice) {
    filteredProducts = filteredProducts.filter(product => 
      product.price <= currentFilters.maxPrice
    );
  }
  
  if (currentFilters.availability) {
    filteredProducts = filteredProducts.filter(product => 
      currentFilters.availability === 'in-stock' ? product.inStock : !product.inStock
    );
  }
  
  if (currentFilters.source) {
    filteredProducts = filteredProducts.filter(product => 
      product.source === currentFilters.source
    );
  }
  
  switch (currentFilters.sort) {
    case 'price-asc':
      filteredProducts.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      filteredProducts.sort((a, b) => b.price - a.price);
      break;
    case 'name-asc':
      filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'name-desc':
      filteredProducts.sort((a, b) => b.title.localeCompare(a.title));
      break;
    default:
      filteredProducts.sort((a, b) => {
        if (a.isPopular && !b.isPopular) return -1;
        if (!a.isPopular && b.isPopular) return 1;
        return 0;
      });
      break;
  }
  
  return filteredProducts;
}

// ===== КІНЕЦЬ ФУНКЦІЇ ПАГІНАЦІЇ =====

// Функція для завантаження XML-фіду
async function loadFromFeed() {
  const messageElement = document.getElementById("feed-message");
  messageElement.textContent = "Завантаження даних...";
  
  const feedUrl = localStorage.getItem(FEED_URL_KEY) || document.getElementById("feed-url").value;
  
  if (!feedUrl) {
    messageElement.textContent = "Введіть URL фіду";
    showNotification("Введіть URL фіду для завантаження");
    return;
  }
  
  if (document.getElementById("feed-url").value) {
    localStorage.setItem(FEED_URL_KEY, document.getElementById("feed-url").value);
  }
  
  try {
    const proxyUrl = 'https://corsproxy.io/?';
    const response = await fetch(proxyUrl + encodeURIComponent(feedUrl));
    
    if (!response.ok) {
      throw new Error(`Помилка HTTP: ${response.status}`);
    }
    
    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    
    if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
      throw new Error("Помилка парсингу XML");
    }
    
    let items = [];
    const offers = xmlDoc.getElementsByTagName("offer");
    
    for (let i = 0; i < offers.length; i++) {
      const offer = offers[i];
      const id = offer.getAttribute("id") || `feed-${i}`;
      const getValue = (tagName) => {
        const element = offer.getElementsByTagName(tagName)[0];
        return element ? element.textContent.trim() : "";
      };
      
      const title = getValue("name") || getValue("title") || getValue("model");
      const priceText = getValue("price");
      const price = priceText ? parseFloat(priceText.replace(/[^0-9.,]/g, "").replace(",", ".")) : 0;
      const description = getValue("description") || "";
      const brand = getValue("vendor") || getValue("brand") || "Невідомо";
      
      let image = "";
      const pictureElement = offer.getElementsByTagName("picture")[0];
      if (pictureElement) {
        image = pictureElement.textContent.trim();
      }
      
      const category = getValue("category") || "Без категорії";
      
      items.push({
        id,
        title,
        price,
        description,
        image: image,
        category,
        brand,
        fromFeed: true,
        inStock: true,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    }
    
    if (items.length === 0) {
      throw new Error("Не знайдено товарів у фіді");
    }
    
    const batch = db.batch();
    const productsRef = db.collection("products");
    
    for (const item of items) {
      const productRef = productsRef.doc(item.id);
      batch.set(productRef, item, { merge: true });
    }
    
    await batch.commit();
    
    localStorage.setItem(FEED_UPDATE_TIME_KEY, new Date().getTime());
    
    messageElement.textContent = `Завантажено ${items.length} товарів`;
    showNotification("Дані успішно завантажені з фіду");
    
  } catch (error) {
    console.error("Помилка завантаження фіду:", error);
    messageElement.textContent = `Помилка: ${error.message}`;
    showNotification("Помилка завантаження даних з фіду", "error");
  }
}

// Збереження продуктів в Firestore
function saveProduct(product) {
  const productData = {
    ...product,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  
  if (!product.id) {
    productData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    productData.id = generateId();
  }
  
  const productRef = db.collection("products").doc(productData.id);
  
  return productRef.set(productData, { merge: true })
    .then(() => {
      showNotification("Товар успішно збережено");
      loadProducts();
      return productData.id;
    })
    .catch((error) => {
      console.error("Помилка збереження товару: ", error);
      showNotification("Помилка збереження товару", "error");
      
      if (!product.id) {
        product.id = generateId();
        products.push(product);
      } else {
        const index = products.findIndex(p => p.id === product.id);
        if (index !== -1) {
          products[index] = product;
        } else {
          products.push(product);
        }
      }
      
      localStorage.setItem('products_backup', JSON.stringify(products));
      renderProducts();
      
      return product.id;
    });
}

// Генерація ID для нового товару
function generateId() {
  return 'product-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// Показати скелетон завантаження
function showLoadingSkeleton() {
  const grid = document.getElementById("product-grid");
  grid.innerHTML = '';
  
  for (let i = 0; i < 8; i++) {
    const skeleton = document.createElement("div");
    skeleton.className = "card";
    skeleton.innerHTML = `
      <div class="skeleton-img"></div>
      <div class="skeleton-title"></div>
      <div class="skeleton-text"></div>
      <div class="skeleton-text" style="width: 80%;"></div>
      <div class="skeleton-price"></div>
      <div class="skeleton-text" style="height: 36px; margin-top: 15px;"></div>
    `;
    grid.appendChild(skeleton);
  }
}

// Добавьте эту функцию для улучшенного отображения скелетонов
function showEnhancedLoadingSkeleton() {
  const grid = document.getElementById("product-grid");
  if (!grid) return;
  
  grid.innerHTML = '';
  
  // Показать больше скелетонов для лучшего UX
  const skeletonCount = window.innerWidth <= 768 ? 4 : 8;
  
  for (let i = 0; i < skeletonCount; i++) {
    const skeleton = document.createElement("div");
    skeleton.className = "card skeleton-item";
    skeleton.innerHTML = `
      <div class="skeleton-img"></div>
      <div class="skeleton-title"></div>
      <div class="skeleton-text"></div>
      <div class="skeleton-text" style="width: 80%;"></div>
      <div class="skeleton-price"></div>
      <div class="skeleton-text" style="height: 36px; margin-top: 15px;"></div>
    `;
    grid.appendChild(skeleton);
  }
  
  document.getElementById('products-count').textContent = 'Завантаження товарів...';
}

// Рендеринг продуктів
function renderProducts() {
  const grid = document.getElementById("product-grid");
  if (!grid) return;
  
  grid.innerHTML = '';
  
  // Показать скелетоны если товары еще загружаются
  if (isProductsLoading) {
    showLoadingSkeleton();
    document.getElementById('products-count').textContent = 'Завантаження товарів...';
    return;
  }
  
  let filteredProducts = getFilteredProducts();
  
  document.getElementById('products-title').textContent = showingFavorites ? 'Обрані товари' : '';
  document.getElementById('products-count').textContent = `Знайдено: ${filteredProducts.length}`;
  
  const startIndex = (currentPage - 1) * productsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);
  
  if (paginatedProducts.length === 0) {
    grid.innerHTML = `
      <div class="empty-cart">
        <i class="fas fa-search"></i>
        <h3>Товари не знайдено</h3>
        <p>Спробуйте змінити параметри фільтрации</p>
      </div>
    `;
    updatePagination();
    return;
  }
  
  const viewMode = localStorage.getItem(VIEW_MODE_KEY) || 'grid';
  const isListView = viewMode === 'list';
  
  if (isListView) {
    grid.classList.add('list-view');
  } else {
    grid.classList.remove('list-view');
  }
  
  paginatedProducts.forEach(product => {
    const card = document.createElement("div");
    card.className = "card";
    
    const isFavorite = favorites[product.id];
    
    card.innerHTML = `
  ${product.discount ? `<div class="card-discount">-${product.discount}%</div>` : ''}
  ${product.isNew ? '<div class="card-badge">Новинка</div>' : ''}
  <img src="${product.image || 'https://via.placeholder.com/300x200?text=No+Image'}" alt="${product.title}" loading="lazy">
  <h3>${product.title}</h3>
  <div class="price-container">
    <span class="price">${formatPrice(product.price)} ₴</span>
    ${product.oldPrice ? `<span class="old-price">${formatPrice(product.oldPrice)} ₴</span>` : ''}
  </div>
  
  <div class="card-actions">
    <button class="btn btn-buy" onclick="addToCart('${product.id}')">
      <i class="fas fa-shopping-cart"></i> Купити
    </button>
    <button class="btn btn-detail" onclick="showProductDetail('${product.id}')">
      <i class="fas fa-info"></i> Детальніше
    </button>
    <button class="btn-favorite ${isFavorite ? 'active' : ''}" onclick="toggleFavorite('${product.id}')">
      <i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>
    </button>
  </div>
`;
    
    grid.appendChild(card);
  });
  
  updatePagination();
}

// Рендеринг популярных товаров
function renderFeaturedProducts() {
  const featuredContainer = document.getElementById("featured-products");
  featuredContainer.innerHTML = '';
  
  let featuredProducts = [];
  
  const popularProducts = products.filter(product => product.isPopular);
  
  if (popularProducts.length >= 3) {
    featuredProducts = shuffleArray(popularProducts).slice(0, 5);
  } else {
    featuredProducts = shuffleArray([...products]).slice(0, 5);
  }
  
  featuredProducts.forEach(product => {
    const item = document.createElement("div");
    item.className = "featured-item";
    item.innerHTML = `
      <img src="${product.image || 'https://via.placeholder.com/60x60?text=No+Image'}" alt="${product.title}">
      <div class="featured-item-info">
        <h4 class="featured-item-title">${product.title}</h4>
        <div class="featured-item-price">${formatPrice(product.price)} ₴</div>
      </div>
    `;
    
    item.addEventListener('click', () => showProductDetail(product.id));
    featuredContainer.appendChild(item);
  });
}

// Рендеринг категорії
function renderCategories() {
  const categorySelect = document.getElementById("category");
  
  while (categorySelect.options.length > 1) {
    categorySelect.remove(1);
  }
  
  const categories = [...new Set(products.map(product => product.category))].filter(Boolean);
  
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = translateCategory(category);
    categorySelect.appendChild(option);
  });
  
  renderCategoriesList();
}

// Функция для рендеринга списка категорий
function renderCategoriesList() {
    const categoriesList = document.getElementById('categories-list');
    const mobileCategoriesList = document.getElementById('mobile-categories-list');
    
    if (!categoriesList || !mobileCategoriesList) return;

    const categoryCounts = {};
    products.forEach(product => {
        if (product.category) {
            categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1;
        }
    });

    const sortedCategories = Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a]);

    let categoriesHTML = '';
    let mobileCategoriesHTML = '';

    // Для десктопной версии
    categoriesHTML += `
        <div class="category-item active" onclick="selectCategory('')">
            Всі категорії
            <span class="category-count">${products.length}</span>
        </div>
    `;

    // Для мобильной версии
    mobileCategoriesHTML += `
        <div class="category-item active" onclick="selectMobileCategory('')">
            Всі категорії
            <span class="category-count">${products.length}</span>
        </div>
    `;

    sortedCategories.forEach(category => {
        categoriesHTML += `
            <div class="category-item" onclick="selectCategory('${category}')">
                ${translateCategory(category)}
                <span class="category-count">${categoryCounts[category]}</span>
            </div>
        `;
        
        mobileCategoriesHTML += `
            <div class="category-item" onclick="selectMobileCategory('${category}')">
                ${translateCategory(category)}
                <span class="category-count">${categoryCounts[category]}</span>
            </div>
        `;
    });

    categoriesList.innerHTML = categoriesHTML;
    mobileCategoriesList.innerHTML = mobileCategoriesHTML;
}

// Функция выбора категории
function selectCategory(category) {
    document.getElementById('category').value = category;
    
    document.querySelectorAll('.category-item').forEach(item => {
        item.classList.remove('active');
    });
    
    if (category === '') {
        document.querySelectorAll('.category-item')[0].classList.add('active');
    } else {
        const categoryItems = document.querySelectorAll('.category-item');
        for (let item of categoryItems) {
            if (item.textContent.includes(translateCategory(category))) {
                item.classList.add('active');
                break;
            }
        }
    }
    
    currentFilters.category = category;
    applyFilters();
}

// Функция выбора категории для мобильной версии
function selectMobileCategory(category) {
    document.getElementById('category').value = category;
    
    document.querySelectorAll('#mobile-categories-list .category-item').forEach(item => {
        item.classList.remove('active');
    });
    
    if (category === '') {
        document.querySelectorAll('#mobile-categories-list .category-item')[0].classList.add('active');
    } else {
        const categoryItems = document.querySelectorAll('#mobile-categories-list .category-item');
        for (let item of categoryItems) {
            if (item.textContent.includes(translateCategory(category))) {
                item.classList.add('active');
                break;
            }
        }
    }
    
    currentFilters.category = category;
}

// Рендеринг брендів
function renderBrands() {
  const brandSelect = document.getElementById("brand");
  
  while (brandSelect.options.length > 1) {
    brandSelect.remove(1);
  }
  
  const brands = [...new Set(products.map(product => product.brand))].filter(Boolean);
  
  brands.forEach(brand => {
    const option = document.createElement("option");
    option.value = brand;
    option.textContent = brand;
    brandSelect.appendChild(option);
  });
}

// Форматування ціни
function formatPrice(price) {
  return new Intl.NumberFormat('uk-UA').format(price);
}

// Показати сповіщення
function showNotification(message, type = "success") {
  const notification = document.getElementById("notification");
  const text = document.getElementById("notification-text");
  text.textContent = message;
  notification.className = `notification ${type}`;
  notification.classList.add("show");
  
  setTimeout(() => {
    notification.classList.remove("show");
  }, 3000);
}

// Додавання товару в кошик
function addToCart(productId) {
  if (!cart[productId]) {
    cart[productId] = 0;
  }
  cart[productId]++;
  
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  
  updateCartCount();
  showNotification("Товар додано до кошика");
}

// Оновлення лічильника кошика
function updateCartCount() {
  const count = Object.values(cart).reduce((total, qty) => total + qty, 0);
  document.getElementById("cart-count").textContent = count;
}

// Додавання/видалення з обраного
function toggleFavorite(productId) {
  if (favorites[productId]) {
    delete favorites[productId];
  } else {
    favorites[productId] = true;
  }
  
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  
  if (showingFavorites) {
    renderProducts();
  } else {
    const heartIcon = document.querySelector(`button[onclick="toggleFavorite('${productId}')"] i`);
    if (heartIcon) {
      heartIcon.className = favorites[productId] ? 'fas fa-heart' : 'far fa-heart';
      heartIcon.parentElement.className = `btn-favorite ${favorites[productId] ? 'active' : ''}`;
    }
  }
  
  showNotification(favorites[productId] ? "Додано в обране" : "Видалено з обраного");
}

// Переключення режиму відображення обраного
function toggleFavorites() {
  showingFavorites = !showingFavorites;
  
  const favButton = document.getElementById("favorites-btn");
  if (showingFavorites) {
    favButton.innerHTML = '<i class="fas fa-heart"></i>';
    favButton.style.color = '#e74c3c';
  } else {
    favButton.innerHTML = '<i class="far fa-heart"></i>';
    favButton.style.color = '';
  }
  
  applyFilters();
}

// Застосування фільтрів
function applyFilters() {
  const minPrice = document.getElementById("price-min").value ? parseInt(document.getElementById("price-min").value) : null;
  const maxPrice = document.getElementById("price-max").value ? parseInt(document.getElementById("price-max").value) : null;
  
  currentFilters.minPrice = minPrice;
  currentFilters.maxPrice = maxPrice;
  currentFilters.category = document.getElementById("category").value;
  currentFilters.brand = document.getElementById("brand").value;
  currentFilters.availability = document.getElementById("availability").value;
  currentFilters.sort = document.getElementById("sort").value;
  
  const currentCategory = currentFilters.category;
  document.querySelectorAll('.category-item').forEach(item => {
    item.classList.remove('active');
  });
  
  if (currentCategory === '') {
    document.querySelectorAll('.category-item')[0].classList.add('active');
  } else {
    const categoryItems = document.querySelectorAll('.category-item');
    for (let item of categoryItems) {
      if (item.textContent.includes(translateCategory(currentCategory))) {
        item.classList.add('active');
        break;
      }
    }
  }
  
  currentPage = 1;
  
  // Показать скелетоны при применении фильтров (если товары загружаются)
  if (isProductsLoading) {
    showEnhancedLoadingSkeleton();
  } else {
    renderProducts();
  }
  
  const filteredProducts = getFilteredProducts();
  if (!isProductsLoading) {
    document.getElementById('products-count').textContent = `Знайдено: ${filteredProducts.length}`;
  }
  
  // Закрываем мобильные фильтры после применения (если они открыты)
  closeMobileFilters();
}

// Скидання фільтрів
function resetFilters() {
  document.getElementById("price-min").value = '';
  document.getElementById("price-max").value = '';
  document.getElementById("category").value = '';
  document.getElementById("brand").value = '';
  document.getElementById("availability").value = '';
  document.getElementById("sort").value = 'default';
  document.getElementById("search").value = '';
  
  selectCategory('');
  
  currentFilters = {
    category: '',
    brand: '',
    minPrice: null,
    maxPrice: null,
    sort: 'default',
    search: '',
    availability: '',
    source: ''
  };
  
  applyFilters();
}

// Встановлення режиму перегляду
function setViewMode(mode) {
  localStorage.setItem(VIEW_MODE_KEY, mode);
  
  const gridBtn = document.getElementById("grid-view");
  const listBtn = document.getElementById("list-view");
  
  if (mode === 'grid') {
    gridBtn.classList.add('active');
    listBtn.classList.remove('active');
  } else {
    gridBtn.classList.remove('active');
    listBtn.classList.add('active');
  }
  
  renderProducts();
}

// Показати деталі товару
function showProductDetail(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  
  const modalContent = document.getElementById("modal-content");
  modalContent.innerHTML = `
    <button class="modal-close" onclick="closeModal()" aria-label="Закрити"><i class="fas fa-times" aria-hidden="true"></i></button>
    <h3>${product.title}</h3>
    <div class="product-detail">
      <div class="product-image">
        <img src="${product.image || 'https://via.placeholder.com/400x300?text=No+Image'}" alt="${product.title}">
      </div>
      <div class="product-info">
        <div class="price-container">
          <span class="detail-price">${formatPrice(product.price)} ₴</span>
          ${product.oldPrice ? `<span class="old-price">${formatPrice(product.oldPrice)} ₴</span>` : ''}
        </div>
        <div class="product-meta">
          <div><i class="fas fa-box"></i> ${product.inStock ? 'В наявності' : 'Немає в наявності'}</div>
          <div><i class="fas fa-truck"></i> Доставка за 1-3 дні</div>
        </div>
        <div class="product-description">
          <h4>Опис</h4>
          <p>${product.description || 'Опис відсутній'}</p>
        </div>
        <div class="quantity-control">
          <button class="quantity-btn" onclick="changeQuantity(-1)">-</button>
          <input type="number" class="quantity-input" id="product-quantity" value="1" min="1">
          <button class="quantity-btn" onclick="changeQuantity(1)">+</button>
        </div>
        <div class="detail-actions">
          <button class="btn btn-buy" onclick="addToCartWithQuantity('${product.id}')">
            <i class="fas fa-shopping-cart"></i> Додати до кошика
          </button>
          <button class="btn-favorite ${favorites[product.id] ? 'active' : ''}" onclick="toggleFavorite('${product.id}')">
            <i class="${favorites[product.id] ? 'fas' : 'far'} fa-heart"></i>
          </button>
        </div>
      </div>
    </div>
    <div class="product-reviews">
      <h4>Відгуки про товар</h4>
      <div id="reviews-container-${product.id}"></div>
      
      ${currentUser ? `
        <div class="add-review-section">
          <h4>Залишити відгук</h4>
          <form onsubmit="addReview(event, '${product.id}')">
            <div class="form-group">
              <label>Ваша оцінка</label>
              <div class="rating-stars">
                <span onclick="setRating(1)">★</span>
                <span onclick="setRating(2)">★</span>
                <span onclick="setRating(3)">★</span>
                <span onclick="setRating(4)">★</span>
                <span onclick="setRating(5)">★</span>
              </div>
            </div>
            <div class="form-group">
              <label>Ваш відгук</label>
              <textarea id="review-text" required></textarea>
            </div>
            <button type="submit" class="btn">Залишити відгук</button>
          </form>
        </div>
      ` : `
        <p>Увійдіть, щоб залишити відгук</p>
      `}
    </div>
  `;
  
  loadReviews(product.id);
  
  currentRating = 0;
  updateRatingStars();
  
  openModal();
  
  setTimeout(optimizeModalForMobile, 100);
}

// Функция для установки рейтинга
function setRating(rating) {
  currentRating = rating;
  updateRatingStars();
}

// Функция для обновления отображения звезд рейтинга
function updateRatingStars() {
  const stars = document.querySelectorAll('.rating-stars span');
  stars.forEach((star, index) => {
    if (index < currentRating) {
      star.classList.add('active');
    } else {
      star.classList.remove('active');
    }
  });
}

// Функция загрузки отзывов для товара
function loadReviews(productId) {
  const reviewsContainer = document.getElementById(`reviews-container-${productId}`);
  if (!reviewsContainer) return;
  
  reviewsContainer.innerHTML = '<p>Завантаження відгуків...</p>';
  
  db.collection("reviews")
    .where("productId", "==", productId)
    .where("approved", "==", true)
    .orderBy("createdAt", "desc")
    .get()
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        reviewsContainer.innerHTML = "<p>Ще немає відгуків про цей товар</p>";
        return;
      }
      
      let reviewsHTML = "";
      querySnapshot.forEach((doc) => {
        const review = doc.data();
        const reviewDate = review.createdAt ? review.createdAt.toDate().toLocaleDateString('uk-UA') : '';
        
        reviewsHTML += `
          <div class="review-item">
            <div class="review-header">
              <strong>${review.userName}</strong>
              <div class="review-rating">${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</div>
              <span class="review-date">${reviewDate}</span>
            </div>
            <p>${review.text}</p>
          </div>
        `;
      });
      
      reviewsContainer.innerHTML = reviewsHTML;
    })
    .catch((error) => {
      console.error("Помилка завантаження відгуків: ", error);
      reviewsContainer.innerHTML = "<p>Помилка завантаження відгуків</p>";
    });
}

// Функция добавления отзыва
function addReview(event, productId) {
  event.preventDefault();
  
  if (!currentUser) {
    showNotification("Увійдіть, щоб залишити відгук", "warning");
    return;
  }
  
  if (currentRating === 0) {
    showNotification("Будь ласка, оберіть рейтинг", "warning");
    return;
  }
  
  const text = document.getElementById('review-text').value;
  
  const newReview = {
    productId,
    userId: currentUser.uid,
    userName: currentUser.displayName || currentUser.email,
    rating: currentRating,
    text,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    approved: false
  };
  
  db.collection("reviews").add(newReview)
    .then(() => {
      showNotification("Відгук додано і відправиться на модерацію");
      document.getElementById('review-text').value = "";
      currentRating = 0;
      updateRatingStars();
      loadReviews(productId);
    })
    .catch((error) => {
      console.error("Помилка додавання відгуку: ", error);
      showNotification("Помилка додавання відгуку", "error");
    });
}

// Додавання товару в кошик із зазначеною кількістю
function addToCartWithQuantity(productId) {
  const quantity = parseInt(document.getElementById("product-quantity").value) || 1;
  
  if (!cart[productId]) {
    cart[productId] = 0;
  }
  cart[productId] += quantity;
  
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  
  updateCartCount();
  showNotification("Товар додано до кошика");
  closeModal();
}

// Зміна кількості товару
function changeQuantity(delta) {
  const input = document.getElementById("product-quantity");
  let value = parseInt(input.value) || 1;
  value += delta;
  
  if (value < 1) value = 1;
  
  input.value = value;
}

// Відкриття кошика
function openCart() {
  const modalContent = document.getElementById("modal-content");
  
  if (Object.keys(cart).length === 0) {
    modalContent.innerHTML = `
      <button class="modal-close" onclick="closeModal()" aria-label="Закрити"><i class="fas fa-times" aria-hidden="true"></i></button>
      <h3>Кошик</h3>
      <div class="empty-cart">
        <i class="fas fa-shopping-cart"></i>
        <h3>Кошик порожній</h3>
        <p>Додайте товари з каталогу</p>
      </div>
    `;
  } else {
    let total = 0;
    let cartItemsHTML = '';
    
    for (const [productId, quantity] of Object.entries(cart)) {
      const product = products.find(p => p.id === productId);
      if (product) {
        const itemTotal = product.price * quantity;
        total += itemTotal;
        
        cartItemsHTML += `
          <div class="cart-item">
            <img src="${product.image || 'https://via.placeholder.com/80x80?text=No+Image'}" alt="${product.title}" class="cart-item-image">
            <div class="cart-item-details">
              <h4 class="cart-item-title">${product.title}</h4>
              <div class="cart-item-price">${formatPrice(product.price)} ₴ x ${quantity} = ${formatPrice(itemTotal)} ₴</div>
              <div class="cart-item-actions">
                <button class="btn" onclick="changeCartQuantity('${productId}', -1)">-</button>
                <span>${quantity}</span>
                <button class="btn" onclick="changeCartQuantity('${productId}', 1)">+</button>
                <button class="btn" onclick="removeFromCart('${productId}')"><i class="fas fa-trash"></i></button>
              </div>
            </div>
          </div>
        `;
      }
    }
    
    modalContent.innerHTML = `
      <button class="modal-close" onclick="closeModal()" aria-label="Закрити"><i class="fas fa-times" aria-hidden="true"></i></button>
      <h3>Кошик</h3>
      <div class="cart-items">
        ${cartItemsHTML}
      </div>
      <div class="cart-footer">
        <div class="cart-total">Разом: ${formatPrice(total)} ₴</div>
        <button class="btn btn-buy" onclick="checkout()">Оформити замовлення</button>
      </div>
    `;
  }
  
  openModal();
  
  setTimeout(optimizeModalForMobile, 100);
}

// Зміна кількості товару в кошику
function changeCartQuantity(productId, delta) {
  if (!cart[productId] && delta < 1) return;
  
  cart[productId] += delta;
  
  if (cart[productId] < 1) {
    delete cart[productId];
  }
  
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  
  updateCartCount();
  openCart();
}

// Видалення товару з кошика
function removeFromCart(productId) {
  delete cart[productId];
  
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  
  updateCartCount();
  openCart();
}

// ===== ОФОРМЛЕННЯ ЗАМОВЛЕННЯ =====
function checkout() {
  if (!currentUser) {
    closeModal();
    openAuthModal();
    showNotification("Для оформлення замовлення необхідно авторизуватися", "warning");
    return;
  }

  const modalContent = document.getElementById("modal-content");
  modalContent.innerHTML = `
    <button class="modal-close" onclick="closeModal()" aria-label="Закрити"><i class="fas fa-times" aria-hidden="true"></i></button>
    <h3>Оформлення замовлення</h3>
    <form class="checkout-form" onsubmit="placeOrder(event)">
      <div class="form-row">
        <div class="form-group">
          <label>Ім'я та прізвище*</label>
          <input type="text" id="order-name" required value="${currentUser.displayName || ''}">
        </div>
        <div class="form-group">
          <label>Телефон*</label>
          <input type="tel" id="order-phone" required placeholder="+380XXXXXXXXX">
        </div>
      </div>
      <div class="form-group">
        <label>Email*</label>
        <input type="email" id="order-email" required value="${currentUser.email || ''}">
      </div>
      
      <div class="delivery-section">
        <h4>Доставка Новою Поштою</h4>
        <div class="delivery-notice">
          <i class="fas fa-info-circle"></i>
          <p>Доставка здійснюється за тарифами перевізника. Вартість доставки розраховується окремо та оплачується при отриманні замовлення.</p>
        </div>
        <div class="form-group">
          <label>Місто*</label>
          <input type="text" id="np-city" required placeholder="Введіть ваше місто">
        </div>
        <div class="form-group">
          <label>Відділення Нової Пошти*</label>
          <input type="text" id="np-warehouse" required placeholder="Номер відділення">
        </div>
      </div>
      
      <div class="payment-section">
        <h4>Спосіб оплати</h4>
        <div class="payment-options">
          <label class="payment-option">
            <input type="radio" name="payment" value="cash" checked>
            <span>Готівкою при отриманні</span>
          </label>
          <label class="payment-option">
            <input type="radio" name="payment" value="card">
            <span>Онлайн-оплата карткою</span>
          </label>
        </div>
      </div>
      
      <div class="order-summary">
        <h4>Ваше замовлення</h4>
        <div class="order-items">
          ${generateOrderSummary()}
        </div>
        <div class="order-total">
          <div class="total-line">
            <span>Сума замовлення:</span>
            <span>${formatPrice(calculateCartTotal())} ₴</span>
          </div>
          <div class="total-line">
            <span>Доставка:</span>
            <span>Згідно тарифів перевізника</span>
          </div>
          <div class="total-line final-total">
            <span>Разом:</span>
            <span>${formatPrice(calculateCartTotal())} ₴</span>
          </div>
        </div>
      </div>
      
      <button type="submit" class="btn btn-buy">Підтвердити замовлення</button>
    </form>
  `;
  
  openModal();
  
  setTimeout(optimizeModalForMobile, 100);
}

// ===== ЗБЕРЕЖЕННЯ ЗАМОВЛЕННЯ В FIREBASE =====
function placeOrder(event) {
  event.preventDefault();
  
  if (!currentUser || !currentUser.uid) {
    closeModal();
    openAuthModal();
    showNotification("Для оформлення замовлення необхідно авторизуватися", "warning");
    return;
  }
  
  const name = document.getElementById('order-name').value.trim();
  const phone = document.getElementById('order-phone').value.trim();
  const email = document.getElementById('order-email').value.trim();
  const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showNotification("Введіть коректну email адресу", "error");
    return;
  }
  
  const phoneRegex = /^[\+]?[0-9]{10,15}$/;
  const cleanPhone = phone.replace(/\D/g, '');
  if (!phoneRegex.test(cleanPhone)) {
    showNotification("Введіть коректний номер телефону", "error");
    return;
  }
  
  const city = document.getElementById('np-city').value.trim();
  const warehouse = document.getElementById('np-warehouse').value.trim();
  
  if (!city || !warehouse) {
    showNotification('Заповніть всі поля для доставки Новою Поштою', 'error');
    return;
  }
  
  const deliveryDetails = { 
    service: 'Нова Пошта', 
    city, 
    warehouse 
  };
  
  if (!name || !phone || !email) {
    showNotification('Заповніть всі обов\'язкові поля', 'error');
    return;
  }
  
  if (Object.keys(cart).length === 0) {
    showNotification('Кошик порожній', 'error');
    return;
  }
  
  const order = {
    userId: currentUser.uid,
    userName: name,
    userPhone: cleanPhone,
    userEmail: email,
    items: {...cart},
    total: calculateCartTotal(),
    delivery: deliveryDetails,
    paymentMethod,
    status: 'new',
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  
  db.collection("orders").add(order)
    .then((docRef) => {
      cart = {};
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      updateCartCount();
      
      sendOrderEmail(docRef.id, order);
      
      showNotification(`Замовлення успішно оформлено. Номер вашого замовлення: ${docRef.id}`);
      closeModal();
      showOrderConfirmation(docRef.id, order);
    })
    .catch(error => {
      console.error("Помилка оформлення замовлення: ", error);
      showNotification("Помилка оформлення замовлення", "error");
    });
}

// Генерація підсумку замовлення
function generateOrderSummary() {
  let summaryHTML = '';
  
  for (const [productId, quantity] of Object.entries(cart)) {
    const product = products.find(p => p.id === productId);
    if (product) {
      summaryHTML += `
        <div class="order-item">
          <span>${product.title} x${quantity}</span>
          <span>${formatPrice(product.price * quantity)} ₴</span>
        </div>
      `;
    }
  }
  
  return summaryHTML;
}

// Розрахунок загальної вартості кошика
function calculateCartTotal() {
  return Object.entries(cart).reduce((sum, [productId, quantity]) => {
    const product = products.find(p => p.id === productId);
    return sum + (product ? product.price * quantity : 0);
  }, 0);
}

// ===== ПОКАЗ ПІДТВЕРДЖЕННЯ ЗАКАЗА =====
function showOrderConfirmation(orderId, order) {
  const modalContent = document.getElementById("modal-content");
  
  modalContent.innerHTML = `
    <button class="modal-close" onclick="closeModal()" aria-label="Закрити"><i class="fas fa-times" aria-hidden="true"></i></button>
    <div class="order-confirmation">
      <div class="confirmation-header">
        <i class="fas fa-check-circle"></i>
        <h3>Замовлення успішно оформлено!</h3>
      </div>
      <div class="confirmation-details">
        <p><strong>Номер замовлення:</strong> ${orderId}</p>
        <p><strong>Ім'я:</strong> ${order.userName}</p>
        <p><strong>Телефон:</strong> ${order.userPhone}</p>
        <p><strong>Email:</strong> ${order.userEmail}</p>
        <p><strong>Спосіб доставки:</strong> ${order.delivery.service}</p>
        <div class="delivery-notice">
          <i class="fas fa-info-circle"></i>
          <p>Доставка здійснюється за тарифами перевізника. Вартість доставки розраховується окремо та оплачується при отриманні замовлення.</p>
        </div>
        <p><strong>Місто:</strong> ${order.delivery.city}</p>
        <p><strong>Відділенние:</strong> ${order.delivery.warehouse}</p>
        <p><strong>Спосіб оплати:</strong> ${order.paymentMethod === 'cash' ? 'Готівкою при отриманні' : 'Онлайн-оплата карткою'}</p>
        <p><strong>Сума товарів:</strong> ${formatPrice(order.total)} ₴</p>
        
        <div class="manager-notice" style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 8px; border-left: 4px solid #007bff;">
          <i class="fas fa-phone" style="color: #007bff; margin-right: 10px;"></i>
          <strong>Наш менеджер зв'яжеться з вами протягом години для підтвердження замовлення та уточнення деталей.</strong>
        </div>
      </div>
      <div class="confirmation-actions">
        <button class="btn btn-detail" onclick="closeModal()">Продовжити покупки</button>
        <button class="btn" onclick="viewOrders()">Мої замовлення</button>
      </div>
    </div>
  `;
  
  openModal();
}

// Відкриття модального вікна
function openModal() {
  document.getElementById("modal").classList.add("active");
}

// Закриття модального вікна
function closeModal() {
  const modal = document.getElementById("modal");
  modal.classList.remove("active");
  modal.classList.remove("mobile-modal");
  document.body.style.overflow = '';
}

// Відкриття модального вікна авторизації
function openAuthModal() {
  const modalContent = document.getElementById("modal-content");
  modalContent.innerHTML = `
    <button class="modal-close" onclick="closeModal()" aria-label="Закрити"><i class="fas fa-times" aria-hidden="true"></i></button>
    <h3>Вхід в систему</h3>
    <div class="auth-tabs">
      <div class="auth-tab active" onclick="switchAuthTab('login')">Вхід</div>
      <div class="auth-tab" onclick="switchAuthTab('register')">Реєстрація</div>
      <div class="auth-tab" onclick="switchAuthTab('admin')">Адміністратор</div>
    </div>
    <form id="login-form" onsubmit="login(event)">
      <div class="form-group">
        <label>Email</label>
        <input type="email" required>
      </div>
      <div class="form-group">
        <label>Пароль</label>
        <input type="password" required>
      </div>
      <button type="submit" class="btn btn-detail">Увійти</button>
    </form>
    <form id="register-form" style="display:none;" onsubmit="register(event)">
      <div class="form-group">
        <label>Ім'я</label>
        <input type="text" required>
      </div>
      <div class="form-group">
        <label>Email</label>
        <input type="email" required>
      </div>
      <div class="form-group">
        <label>Пароль</label>
        <input type="password" required minlength="6">
      </div>
      <button type="submit" class="btn btn-detail">Зареєструватися</button>
    </form>
    <div id="admin-auth-form" style="display:none;">
      <p>Для доступу до панелі адміністратора введіть пароль:</p>
      <div class="form-group">
        <label>Пароль адміністратора</label>
        <input type="password" id="admin-password" required>
      </div>
      <button class="btn btn-admin" onclick="verifyAdminPassword()">Отримати права адміністратора</button>
    </div>
  `;
  
  openModal();
  
  setTimeout(optimizeModalForMobile, 100);
}

// Переключення вкладок авторизации
function switchAuthTab(tab) {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const adminForm = document.getElementById("admin-auth-form");
  const tabs = document.querySelectorAll(".auth-tab");
  
  tabs.forEach(tab => tab.classList.remove('active'));
  
  if (tab === 'login') {
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    adminForm.style.display = 'none';
    tabs[0].classList.add('active');
  } else if (tab === 'register') {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    adminForm.style.display = 'none';
    tabs[1].classList.add('active');
  } else if (tab === 'admin') {
    loginForm.style.display = 'none';
    registerForm.style.display = 'none';
    adminForm.style.display = 'block';
    tabs[2].classList.add('active');
  }
}

// Вхід в систему
function login(event) {
  event.preventDefault();
  const email = event.target.querySelector('input[type="email"]').value;
  const password = event.target.querySelector('input[type="password"]').value;
  
  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      showNotification("Вхід виконано успішно");
      closeModal();
    })
    .catch(error => {
      let message = "Помилка входу";
      switch (error.code) {
        case 'auth/user-not-found':
          message = "Користувач не знайдений";
          break;
        case 'auth/wrong-password':
          message = "Невірний пароль";
          break;
      }
      showNotification(message, "error");
    });
}

// Реєстрація
function register(event) {
  event.preventDefault();
  const name = event.target.querySelector('input[type="text"]').value;
  const email = event.target.querySelector('input[type="email"]').value;
  const password = event.target.querySelector('input[type="password"]').value;
  
  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Оновлюємо профіль користувача
      return userCredential.user.updateProfile({
        displayName: name
      });
    })
    .then(() => {
      showNotification("Реєстрація виконана успішно");
      closeModal();
    })
    .catch(error => {
      console.error("Помилка реєстрації: ", error);
      showNotification("Помилка реєстрації: " + error.message, "error");
    });
}

// Функція перевірки пароля адміністратора
function verifyAdminPassword() {
  const password = document.getElementById("admin-password").value;
  if (password === ADMIN_PASSWORD) {
    if (!currentUser) {
      showNotification("Спочатку увійдіть в систему", "error");
      switchAuthTab('login');
      return;
    }
    
    // Зберігаємо користувача як адміністратора
    const admins = JSON.parse(localStorage.getItem(ADMINS_STORAGE_KEY) || '{}');
    admins[currentUser.uid] = true;
    localStorage.setItem(ADMINS_STORAGE_KEY, JSON.stringify(admins));
    
    document.getElementById("admin-panel").style.display = "block";
    adminMode = true;
    showNotification("Права адміністратора отримані");
    closeModal();
    
    // Завантажуємо замовлення для адмін-панелі
    loadAdminOrders();
    
    // Показуємо лічильник переглядів
    document.getElementById("page-views-container").style.display = "block";
    setupPageCounter();
    
    // Добавляем вкладку для модерации отзывов
    addReviewsTabIfNotExists();
  } else {
    showNotification("Невірний пароль адміністратора", "error");
  }
}

// Функція для введення пароля адміністратора
function promptAdminPassword() {
  const password = prompt("Введіть пароль адміністратора:");
  if (password === ADMIN_PASSWORD) {
    if (!currentUser) {
      showNotification("Спочатку увійдіть в систему", "error");
      openAuthModal();
      return;
    }
    
    // Зберігаємо користувача як адміністратора
    const admins = JSON.parse(localStorage.getItem(ADMINS_STORAGE_KEY) || '{}');
    admins[currentUser.uid] = true;
    localStorage.setItem(ADMINS_STORAGE_KEY, JSON.stringify(admins));
    
    document.getElementById("admin-panel").style.display = "block";
    adminMode = true;
    showNotification("Права адміністратора отримані");
    
    // Завантажуємо замовлення для адмін-панелі
    loadAdminOrders();
    
    // Показуємо лічильник переглядів
    document.getElementById("page-views-container").style.display = "block";
    setupPageCounter();
    
    // Добавляем вкладку для модерации отзывов
    addReviewsTabIfNotExists();
  } else if (password) {
    showNotification("Невірний пароль адміністратора", "error");
  }
}

// Перевірка статусу адміністратора
function checkAdminStatus(userId) {
  db.collection("admins").doc(userId).get()
    .then((doc) => {
      if (doc.exists) {
        document.getElementById("admin-panel").style.display = "block";
        adminMode = true;
        loadAdminOrders();
        
        // Показуємо лічильник переглядів
        document.getElementById("page-views-container").style.display = "block";
        setupPageCounter();
        
        // Добавляем вкладку для модерации отзывов
        addReviewsTabIfNotExists();
      }
    })
    .catch((error) => {
      console.error("Помилка перевірки прав адміністратора: ", error);
    });
}

// Вихід з системи
function logout() {
  // Не видаляємо права адміністратора при виході, щоб не вводити пароль кожного разу
  auth.signOut()
    .then(() => {
      showNotification("Вихід виконано успішно");
    })
    .catch(error => {
      console.error("Помилка виходу: ", error);
      showNotification("Помилка виходу", "error");
    });
}

// Переключення вкладок в адмін-панелі
function switchTab(tabId) {
  const tabs = document.querySelectorAll(".tab");
  const tabContents = document.querySelectorAll(".tab-content");
  
  tabs.forEach(tab => tab.classList.remove("active"));
  tabContents.forEach(content => content.classList.remove("active"));
  
  document.querySelector(`.tab[onclick="switchTab('${tabId}')"]`).classList.add("active");
  document.getElementById(tabId).classList.add("active");
  
  // Якщо переключилися на вкладку товарів, завантажуємо їх
  if (tabId === 'products-tab') {
    loadAdminProducts();
  }
  
  // Якщо переключилися на вкладку замовлень, завантажуємо їх
  if (tabId === 'orders-tab') {
    loadAdminOrders();
  }
  
  // Если переключились на вкладку отзывов, загружаем их
  if (tabId === 'reviews-tab-content') {
    loadReviewsForModeration();
  }
}

// ===== ЗАВАНТАЖЕННЯ ЗАМОВЛЕНЬ В АДМІН-ПАНЕЛІ =====
function loadAdminOrders() {
  const ordersList = document.getElementById("admin-orders-list");
  ordersList.innerHTML = '<p>Завантаження замовлень...</p>';
  
  // Слухаємо оновлення в реальному часі
  db.collection("orders")
    .orderBy("createdAt", "desc")
    .onSnapshot((querySnapshot) => {
      if (querySnapshot.empty) {
        ordersList.innerHTML = '<p>Замовлень немає</p>';
        return;
      }
      
      ordersList.innerHTML = '';
      
      querySnapshot.forEach((doc) => {
        const order = { id: doc.id, ...doc.data() };
        const orderDate = order.createdAt ? order.createdAt.toDate().toLocaleString('uk-UA') : 'Дата не вказана';
        
        // Визначаємо статус замовлення
        let statusClass = 'status-new';
        let statusText = 'Новий';
        
        if (order.status === 'processing') {
          statusClass = 'status-processing';
          statusText = 'В обробці';
        } else if (order.status === 'shipped') {
          statusClass = 'status-shipped';
          statusText = 'Відправлено';
        } else if (order.status === 'delivered') {
          statusClass = 'status-delivered';
          statusText = 'Доставлено';
        } else if (order.status === 'cancelled') {
          statusClass = 'status-cancelled';
          statusText = 'Скасовано';
        }
        
        const orderElement = document.createElement('div');
        orderElement.className = 'admin-order-item';
        orderElement.innerHTML = `
          <div class="order-header">
            <h4>Замовлення #${order.id}</h4>
            <span class="order-date">${orderDate}</span>
          </div>
          <div class="order-info">
            <p><strong>Клієнт:</strong> ${order.userName} (${order.userEmail}, ${order.userPhone})</p>
            <p><strong>Сума:</strong> ${formatPrice(order.total)} ₴</p>
            <p><strong>Доставка:</strong> ${order.delivery.service}</p>
            <p><strong>Статус:</strong> <span class="order-status ${statusClass}">${statusText}</span></p>
            ${order.ttn ? `<p><strong>ТТН:</strong> ${order.ttn}</p>` : ''}
          </div>
          <div class="admin-order-actions">
            <button class="btn btn-detail" onclick="viewOrderDetails('${order.id}')">Деталі</button>
            <select onchange="changeOrderStatus('${order.id}', this.value)">
              <option value="new" ${order.status === 'new' ? 'selected' : ''}>Новий</option>
              <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>В обробці</option>
              <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Відправлено</option>
              <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Доставлено</option>
              <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Скасовано</option>
            </select>
            <button class="btn" onclick="addTTNToOrder('${order.id}')">ТТН</button>
            <button class="btn btn-danger" onclick="deleteOrder('${order.id}')">Видалити</button>
          </div>
        `;
        
        ordersList.appendChild(orderElement);
      });
    }, (error) => {
      console.error("Помилка завантаження замовлень: ", error);
      ordersList.innerHTML = '<p>Помилка завантаження замовлень</p>';
    });
}

// ===== ФУНКЦІЯ ДОДАВАННЯ ТТН ДО ЗАМОВЛЕННЯ =====
function addTTNToOrder(orderId) {
  const ttn = prompt('Введіть ТТН (трек-номер) для цього замовлення:');
  
  if (ttn && ttn.trim() !== '') {
    db.collection("orders").doc(orderId).update({
      ttn: ttn.trim(),
      ttnAddedAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
      showNotification("ТТН успішно додано до замовлення");
      
      // Отправляем email с уведомлением о ТТН
      db.collection("orders").doc(orderId).get()
        .then((doc) => {
          if (doc.exists) {
            const order = { id: doc.id, ...doc.data() };
            sendTTNEmail(orderId, order);
          }
        });
      
      // Обновляем список заказов
      loadAdminOrders();
    })
    .catch((error) => {
      console.error("Помилка додавання ТТН: ", error);
      showNotification("Помилка додавання ТТН", "error");
    });
  }
}

// ===== ФУНКЦІЯ ВІДПРАВКИ EMAIL ПРО ТТН =====
function sendTTNEmail(orderId, order) {
  if (!order.ttn) return;
  
  const templateParams = {
    to_email: order.userEmail,
    order_id: orderId,
    customer_name: order.userName,
    ttn_number: order.ttn,
    delivery_service: order.delivery.service,
    delivery_city: order.delivery.city,
    delivery_warehouse: order.delivery.warehouse,
    tracking_url: `https://tracking.novaposhta.ua/#/uk/search/${order.ttn}`
  };

  // Используем другой шаблон для уведомления о ТТН
  emailjs.send(EMAILJS_SERVICE_ID, "template_ttn_notification", templateParams)
    .then(function(response) {
      console.log('Email с ТТН успешно отправлен!', response.status, response.text);
    }, function(error) {
      console.error('Ошибка отправки email с ТТН:', error);
    });
}

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ СТАТУСОВ =====
function getStatusClass(status) {
  const statusClasses = {
    'new': 'status-new',
    'processing': 'status-processing',
    'shipped': 'status-shipped',
    'delivered': 'status-delivered',
    'cancelled': 'status-cancelled'
  };
  return statusClasses[status] || 'status-new';
}

function getStatusText(status) {
  const statusTexts = {
    'new': 'Новий',
    'processing': 'В обробці',
    'shipped': 'Відправлено',
    'delivered': 'Доставлено',
    'cancelled': 'Скасовано'
  };
  return statusTexts[status] || 'Новий';
}

// ===== ЗМІНА СТАТУСУ ЗАМОВЛЕННЯ =====
function changeOrderStatus(orderId, status) {
  db.collection("orders").doc(orderId).update({
    status,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  })
  .then(() => {
    showNotification("Статус замовлення оновлено");
  })
  .catch((error) => {
    console.error("Помилка оновлення статусу замовлення: ", error);
    showNotification("Помилка оновлення статусу замовлення", "error");
  });
}

// ===== ВИДАЛЕННЯ ЗАМОВЛЕННЯ =====
function deleteOrder(orderId) {
  if (confirm("Ви впевнені, що хочете видалити це замовлення? Цю дію не можна скасувати.")) {
    db.collection("orders").doc(orderId).delete()
      .then(() => {
        showNotification("Замовлення успішно видалено");
      })
      .catch((error) => {
        console.error("Помилка видалення замовлення: ", error);
        showNotification("Помилка видалення замовлення", "error");
      });
  }
}

// ===== ПЕРЕГЛЯД ДЕТАЛЕЙ ЗАМОВЛЕННЯ =====
function viewOrderDetails(orderId) {
  db.collection("orders").doc(orderId).get()
    .then((doc) => {
      if (!doc.exists) {
        showNotification("Замовлення не знайдено", "error");
        return;
      }
      
      const order = { id: doc.id, ...doc.data() };
      const modalContent = document.getElementById("modal-content");
      
      let itemsHTML = '';
      for (const [productId, quantity] of Object.entries(order.items)) {
        const product = products.find(p => p.id === productId);
        if (product) {
          itemsHTML += `
            <div class="cart-item">
              <img src="${product.image || 'https://via.placeholder.com/80x80?text=No+Image'}" alt="${product.title}" class="cart-item-image">
              <div class="cart-item-details">
                <h4 class="cart-item-title">${product.title}</h4>
                <div class="cart-item-price">${formatPrice(product.price)} ₴ x ${quantity} = ${formatPrice(product.price * quantity)} ₴</div>
              </div>
            </div>
          `;
        }
      }
      
      const orderDate = order.createdAt ? order.createdAt.toDate().toLocaleString('uk-UA') : 'Дата не вказана';
      const updatedDate = order.updatedAt ? order.updatedAt.toDate().toLocaleString('uk-UA') : 'Дата не вказана';
      const ttnDate = order.ttnAddedAt ? order.ttnAddedAt.toDate().toLocaleString('uk-UA') : '';
      
      const ttnSection = order.ttn ? `
        <div class="ttn-section" style="margin: 1rem 0; padding: 1rem; background: #f0f8ff; border-radius: 8px; border-left: 4px solid #007bff;">
          <h4>Інформація про відправлення</h4>
          <p><strong>ТТН (трек-номер):</strong> ${order.ttn}</p>
          <p><strong>Дата додавання ТТН:</strong> ${ttnDate}</p>
          <p><strong>Служба доставки:</strong> Нова Пошта</p>
          <p><a href="https://tracking.novaposhta.ua/#/uk/search/${order.ttn}" target="_blank" style="color: #007bff; text-decoration: none;">
            <i class="fas fa-external-link-alt"></i> Відстежити посилку
          </a></p>
        </div>
      ` : `
        <div class="ttn-section" style="margin: 1rem 0; padding: 1rem; background: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
          <p><i class="fas fa-info-circle"></i> ТТН ще не додано до цього замовлення</p>
        </div>
      `;
      
      const ttnButton = adminMode ? `
        <div style="margin: 1rem 0;">
          <button class="btn btn-detail" onclick="addTTNToOrder('${order.id}')">
            <i class="fas fa-truck"></i> ${order.ttn ? 'Змінити ТТН' : 'Додати ТТН'}
          </button>
        </div>
      ` : '';
      
      modalContent.innerHTML = `
        <button class="modal-close" onclick="closeModal()" aria-label="Закрити"><i class="fas fa-times" aria-hidden="true"></i></button>
        <h3>Деталі замовлення #${order.id}</h3>
        <div class="order-details">
          ${ttnSection}
          ${ttnButton}
          
          <div class="customer-info">
            <h4>Інформація про клієнта</h4>
            <p><strong>Ім'я:</strong> ${order.userName}</p>
            <p><strong>Email:</strong> ${order.userEmail}</p>
            <p><strong>Телефон:</strong> ${order.userPhone}</p>
          </div>
          
          <div class="order-meta">
            <h4>Інформація про замовлення</h4>
            <p><strong>Дата створення:</strong> ${orderDate}</p>
            <p><strong>Дата оновлення:</strong> ${updatedDate}</p>
            <p><strong>Спосіб оплати:</strong> ${order.paymentMethod === 'cash' ? 'Готівкою при отриманні' : 'Онлайн-оплата карткою'}</p>
            <p><strong>Статус:</strong> <span class="order-status ${getStatusClass(order.status)}">${getStatusText(order.status)}</span></p>
          </div>
          
          <div class="delivery-info">
            <h4>Доставка</h4>
            <p><strong>Служба:</strong> ${order.delivery.service}</p>
            ${order.delivery.city ? `<p><strong>Місто:</strong> ${order.delivery.city}</p>` : ''}
            ${order.delivery.warehouse ? `<p><strong>Відділення:</strong> ${order.delivery.warehouse}</p>` : ''}
            ${order.delivery.address ? `<p><strong>Адреса:</strong> ${order.delivery.address}</p>` : ''}
          </div>
          
          <div class="order-items">
            <h4>Товари</h4>
            ${itemsHTML}
          </div>
          
          <div class="order-total">
            <h4>Разом: ${formatPrice(order.total)} ₴</h4>
          </div>
        </div>
      `;
      
      openModal();
      optimizeModalForMobile();
    })
    .catch((error) => {
      console.error("Помилка завантаження деталей замовлення: ", error);
      showNotification("Помилка завантаження деталей замовлення", "error");
    });
}

// ===== ЗАГРУЗКА ОТЗЫВОВ ДЛЯ МОДЕРАЦИИ =====
function loadReviewsForModeration() {
  const reviewsContainer = document.getElementById("reviews-moderation-container");
  if (!reviewsContainer) return;
  
  reviewsContainer.innerHTML = "<p>Завантаження відгуків для модерації...</p>";
  
  db.collection("reviews")
    .where("approved", "==", false)
    .orderBy("createdAt", "desc")
    .get()
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        reviewsContainer.innerHTML = "<p>Немає відгуків для модерації</p>";
        return;
      }
      
      let reviewsHTML = "";
      querySnapshot.forEach((doc) => {
        const review = { id: doc.id, ...doc.data() };
        const reviewDate = review.createdAt ? review.createdAt.toDate().toLocaleDateString('uk-UA') : '';
        
        const product = products.find(p => p.id === review.productId);
        const productName = product ? product.title : review.productId;
        
        reviewsHTML += `
          <div class="moderation-review-item">
            <h4>Відгук на товар: ${productName}</h4>
            <p><strong>Від:</strong> ${review.userName}</p>
            <div class="review-rating">${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</div>
            <p><strong>Дата:</strong> ${reviewDate}</p>
            <p>${review.text}</p>
            <div class="moderation-actions">
              <button class="btn btn-success" onclick="approveReview('${doc.id}')">Затвердити</button>
              <button class="btn btn-danger" onclick="deleteReview('${doc.id}')">Видалити</button>
            </div>
          </div>
        `;
      });
      
      reviewsContainer.innerHTML = reviewsHTML;
    })
    .catch((error) => {
      console.error("Помилка завантаження відгуків для модерації: ", error);
      reviewsContainer.innerHTML = "<p>Помилка завантаження відгуків</p>";
    });
}

// ===== ОДОБРЕНИЕ ОТЗЫВА =====
function approveReview(reviewId) {
  db.collection("reviews").doc(reviewId).update({
    approved: true,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  })
  .then(() => {
    showNotification("Відгук затверджено");
    loadReviewsForModeration();
  })
  .catch((error) => {
    console.error("Помилка затвердження відгуку: ", error);
    showNotification("Помилка затвердження відгуку", "error");
  });
}

// ===== УДАЛЕНИЕ ОТЗЫВА =====
function deleteReview(reviewId) {
  if (confirm("Ви впевнені, що хочете видалити цей відгук? Цю дію не можна скасувати.")) {
    db.collection("reviews").doc(reviewId).delete()
      .then(() => {
        showNotification("Відгук успішно видалено");
        loadReviewsForModeration();
      })
      .catch((error) => {
        console.error("Помилка видалення відгуку: ", error);
        showNotification("Помилка видалення відгуку", "error");
      });
  }
}

// Збереження URL фіду
function saveFeedUrl() {
  const feedUrl = document.getElementById("feed-url").value;
  localStorage.setItem(FEED_URL_KEY, feedUrl);
  showNotification("URL фіду збережено");
}

// Очищення каталогу
function clearCatalog() {
  if (confirm("Ви впевнені, що хочете очистити каталог? Цю дію не можна скасувати.")) {
    showLoadingSkeleton();
    
    db.collection("products").get()
      .then((querySnapshot) => {
        const batch = db.batch();
        querySnapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });
        return batch.commit();
      })
      .then(() => {
        products = [];
        localStorage.removeItem('products_backup');
        renderProducts();
        renderFeaturedProducts();
        renderCategories();
        renderBrands();
        showNotification("Каталог очищено");
      })
      .catch((error) => {
        console.error("Помилка при очищенні каталогу: ", error);
        showNotification("Помилка при очищенні каталогу", "error");
      });
  }
}

// Експорт в JSON
function exportJSON() {
  const dataStr = JSON.stringify(products, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = 'products.json';
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
  
  showNotification("Дані експортовано в JSON");
}

// Функція відкриття модального вікна додавання товару
function openAddProductModal() {
  const modalContent = document.getElementById("modal-content");
  modalContent.innerHTML = `
    <button class="modal-close" onclick="closeModal()" aria-label="Закрити"><i class="fas fa-times" aria-hidden="true"></i></button>
    <h3>Додати новий товар</h3>
    <form onsubmit="saveNewProduct(event)">
      <div class="form-group">
        <label>Назва товару</label>
        <input type="text" id="product-title" required>
      </div>
      <div class="form-group">
        <label>Опис</label>
        <textarea id="product-description" rows="3"></textarea>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Ціна, ₴</label>
          <input type="number" id="product-price" min="0" step="0.01" required>
        </div>
        <div class="form-group">
          <label>Стара ціна, ₴</label>
          <input type="number" id="product-old-price" min="0" step="0.01">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Категорія</label>
          <input type="text" id="product-category" required>
        </div>
        <div class="form-group">
          <label>Бренд</label>
          <input type="text" id="product-brand" required>
        </div>
      </div>
      <div class="form-group">
        <label>URL зображення</label>
        <input type="url" id="product-image">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>
            <input type="checkbox" id="product-in-stock"> В наявності
          </label>
        </div>
        <div class="form-group">
          <label>
            <input type="checkbox" id="product-is-new"> Новинка
          </label>
        </div>
      </div>
      <div class="form-group">
        <label>Знижка, %</label>
        <input type="number" id="product-discount" min="0" max="100">
      </div>
      <button type="submit" class="btn btn-detail">Зберегти товар</button>
    </form>
  `;
  
  openModal();
  
  setTimeout(optimizeModalForMobile, 100);
}

// Функція збереження нового товару
function saveNewProduct(event) {
  event.preventDefault();
  
  const newProduct = {
    title: document.getElementById('product-title').value,
    description: document.getElementById('product-description').value,
    price: parseFloat(document.getElementById('product-price').value),
    oldPrice: document.getElementById('product-old-price').value ? parseFloat(document.getElementById('product-old-price').value) : null,
    category: document.getElementById('product-category').value,
    brand: document.getElementById('product-brand').value,
    image: document.getElementById('product-image').value || '',
    inStock: document.getElementById('product-in-stock').checked,
    isNew: document.getElementById('product-is-new').checked,
    discount: document.getElementById('product-discount').value ? parseInt(document.getElementById('product-discount').value) : null
  };
  
  saveProduct(newProduct)
    .then(() => {
      closeModal();
      switchTab('products-tab');
    });
}

// Функція завантаження товарів в адмін-панелі
function loadAdminProducts() {
  const productsList = document.getElementById("admin-products-list");
  productsList.innerHTML = '<p>Завантаження товарів...</p>';
  
  db.collection("products")
    .orderBy("createdAt", "desc")
    .get()
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        productsList.innerHTML = '<p>Товарів немає</p>';
        return;
      }
      
      productsList.innerHTML = `
        <div style="margin-bottom: 15px;">
          <input type="text" id="admin-products-search" placeholder="Пошук товарів..." oninput="searchAdminProducts(this.value)" style="padding: 8px; width: 100%; border: 1px solid #ddd; border-radius: var(--border-radius);">
        </div>
        <div class="admin-products-container"></div>
      `;
      
      const productsContainer = productsList.querySelector('.admin-products-container');
      
      querySnapshot.forEach((doc) => {
        const product = { id: doc.id, ...doc.data() };
        const productElement = document.createElement('div');
        productElement.className = 'admin-product-item';
        productElement.style.border = '1px solid #eee';
        productElement.style.padding = '15px';
        productElement.style.marginBottom = '15px';
        productElement.style.borderRadius = '8px';
        
        productElement.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div style="flex: 1;">
              <h4>${product.title}</h4>
              <p>${product.description || 'Опис відсутній'}</p>
              <p><strong>Ціна:</strong> ${formatPrice(product.price)} ₴</p>
              <p><strong>Категорія:</strong> ${translateCategory(product.category)}</p>
              <p><strong>Бренд:</strong> ${product.brand}</p>
              <p><strong>Статус:</strong> ${product.inStock ? 'В наявності' : 'Немає в наявності'}</p>
            </div>
            <div>
              <img src="${product.image || 'https://via.placeholder.com/100x100?text=No+Image'}" alt="${product.title}" style="width: 100px; height: 100px; object-fit: cover; border-radius: var(--border-radius);">
            </div>
          </div>
          <div style="margin-top: 15px; display: flex; gap: 10px;">
            <button class="btn btn-detail" onclick="editProduct('${product.id}')">Редагувати</button>
            <button class="btn" style="background: var(--danger); color: white;" onclick="deleteProduct('${product.id}')">Видалити</button>
          </div>
        `;
        
        productsContainer.appendChild(productElement);
      });
    })
    .catch((error) => {
      console.error("Помилка завантаження товарів: ", error);
      productsList.innerHTML = '<p>Помилка завантаження товарів</p>';
    });
}

// Функція пошуку товарів в адмін-панелі
function searchAdminProducts(query) {
  const productItems = document.querySelectorAll('.admin-product-item');
  
  productItems.forEach(item => {
    const title = item.querySelector('h4').textContent.toLowerCase();
    const description = item.querySelector('p').textContent.toLowerCase();
    const searchText = query.toLowerCase();
    
    if (title.includes(searchText) || description.includes(searchText)) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
}

// Функція редагування товару
function editProduct(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  
  const modalContent = document.getElementById("modal-content");
  modalContent.innerHTML = `
    <button class="modal-close" onclick="closeModal()" aria-label="Закрити"><i class="fas fa-times" aria-hidden="true"></i></button>
    <h3>Редагувати товар</h3>
    <form onsubmit="updateProduct(event, '${productId}')">
      <div class="form-group">
        <label>Назва товару</label>
        <input type="text" id="edit-product-title" value="${product.title}" required>
      </div>
      <div class="form-group">
        <label>Опис</label>
        <textarea id="edit-product-description" rows="3">${product.description || ''}</textarea>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Ціна, ₴</label>
          <input type="number" id="edit-product-price" min="0" step="0.01" value="${product.price}" required>
        </div>
        <div class="form-group">
          <label>Стара ціна, ₴</label>
          <input type="number" id="edit-product-old-price" min="0" step="0.01" value="${product.oldPrice || ''}">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Категорія</label>
          <input type="text" id="edit-product-category" value="${product.category}" required>
        </div>
        <div class="form-group">
          <label>Бренд</label>
          <input type="text" id="edit-product-brand" value="${product.brand}" required>
        </div>
      </div>
      <div class="form-group">
        <label>URL зображення</label>
        <input type="url" id="edit-product-image" value="${product.image || ''}">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>
            <input type="checkbox" id="edit-product-in-stock" ${product.inStock ? 'checked' : ''}> В наявності
          </label>
        </div>
        <div class="form-group">
          <label>
            <input type="checkbox" id="edit-product-is-new" ${product.isNew ? 'checked' : ''}> Новинка
          </label>
        </div>
      </div>
      <div class="form-group">
        <label>Знижка, %</label>
        <input type="number" id="edit-product-discount" min="0" max="100" value="${product.discount || ''}">
      </div>
      <button type="submit" class="btn btn-detail">Оновити товар</button>
    </form>
  `;
  
  openModal();
  
  setTimeout(optimizeModalForMobile, 100);
}

// Функція оновлення товару
function updateProduct(event, productId) {
  event.preventDefault();
  
  const updatedProduct = {
    id: productId,
    title: document.getElementById('edit-product-title').value,
    description: document.getElementById('edit-product-description').value,
    price: parseFloat(document.getElementById('edit-product-price').value),
    oldPrice: document.getElementById('edit-product-old-price').value ? parseFloat(document.getElementById('edit-product-old-price').value) : null,
    category: document.getElementById('edit-product-category').value,
    brand: document.getElementById('edit-product-brand').value,
    image: document.getElementById('edit-product-image').value || '',
    inStock: document.getElementById('edit-product-in-stock').checked,
    isNew: document.getElementById('edit-product-is-new').checked,
    discount: document.getElementById('edit-product-discount').value ? parseInt(document.getElementById('edit-product-discount').value) : null
  };
  
  saveProduct(updatedProduct)
    .then(() => {
      closeModal();
      switchTab('products-tab');
    });
}

// Функція видалення товару
function deleteProduct(productId) {
  if (confirm("Ви впевнені, що хочете видалити цей товар? Цю дію не можна скасувати.")) {
    db.collection("products").doc(productId).delete()
      .then(() => {
        showNotification("Товар успішно видалено");
        loadAdminProducts();
      })
      .catch((error) => {
        console.error("Помилка видалення товару: ", error);
        showNotification("Помилка видалення товару", "error");
      });
  }
}

// Функція перегляду замовлень користувача
function viewOrders() {
  if (!currentUser) {
    openAuthModal();
    showNotification("Увійдіть в систему для перегляду замовлень", "warning");
    return;
  }
  
  const modalContent = document.getElementById("modal-content");
  modalContent.innerHTML = `
    <button class="modal-close" onclick="closeModal()" aria-label="Закрити"><i class="fas fa-times" aria-hidden="true"></i></button>
    <h3>Мої замовлення</h3>
    <div id="user-orders-list"></div>
  `;
  
  const ordersList = document.getElementById("user-orders-list");
  ordersList.innerHTML = '<p>Завантаження замовлень...</p>';
  
  db.collection("orders")
    .where("userId", "==", currentUser.uid)
    .orderBy("createdAt", "desc")
    .get()
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        ordersList.innerHTML = '<p>У вас немає замовлень</p>';
        return;
      }
      
      ordersList.innerHTML = '';
      
      querySnapshot.forEach((doc) => {
        const order = { id: doc.id, ...doc.data() };
        const orderDate = order.createdAt ? order.createdAt.toDate().toLocaleString('uk-UA') : 'Дата не вказана';
        const ttnSection = order.ttn ? `
          <div class="ttn-info" style="margin-top: 10px; padding: 10px; background: #f0f8ff; border-radius: 5px;">
            <p><strong>ТТН:</strong> ${order.ttn}</p>
            <p><a href="https://tracking.novaposhta.ua/#/uk/search/${order.ttn}" target="_blank" style="color: #007bff; text-decoration: none;">
              <i class="fas fa-external-link-alt"></i> Відстежити посилку
            </a></p>
          </div>
        ` : '';
        
        const orderElement = document.createElement('div');
        orderElement.className = 'user-order-item';
        orderElement.style.border = '1px solid #eee';
        orderElement.style.padding = '15px';
        orderElement.style.marginBottom = '15px';
        orderElement.style.borderRadius = '8px';
        
        orderElement.innerHTML = `
          <div class="order-header">
            <h4>Замовлення #${order.id}</h4>
            <span class="order-date">${orderDate}</span>
          </div>
          <div class="order-info">
            <p><strong>Сума:</strong> ${formatPrice(order.total)} ₴</p>
            <p><strong>Статус:</strong> <span class="order-status ${getStatusClass(order.status)}">${getStatusText(order.status)}</span></p>
            <p><strong>Спосіб доставки:</strong> ${order.delivery.service}</p>
            <p><strong>Місто:</strong> ${order.delivery.city}</p>
            <p><strong>Відділення:</strong> ${order.delivery.warehouse}</p>
          </div>
          ${ttnSection}
          <button class="btn btn-detail" onclick="viewOrderDetails('${order.id}')">Деталі замовлення</button>
        `;
        
        ordersList.appendChild(orderElement);
      });
    })
    .catch((error) => {
      console.error("Помилка завантаження замовлень: ", error);
      ordersList.innerHTML = '<p>Помилка завантаження замовлень</p>';
    });
  
  openModal();
  
  setTimeout(optimizeModalForMobile, 100);
}

// Функція для перемішування масиву
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Функція для адаптації заголовка
function adjustHeaderTitle() {
  const headerTitle = document.getElementById("header-title");
  if (window.innerWidth <= 768) {
    headerTitle.textContent = "BoltMaster";
  } else {
    headerTitle.textContent = "BoltMaster - Інтернет-магазин інструментів";
  }
}

// Функція для переключення джерела товарів
function switchSource(source) {
  currentFilters.source = source;
  applyFilters();
  
  // Обновляем активную вкладку
  document.querySelectorAll('.source-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  
  const activeTab = document.querySelector(`.source-tab[onclick="switchSource('${source}')"]`);
  if (activeTab) {
    activeTab.classList.add('active');
  }
}

// Добавляем вкладку для модерации отзывов
function addReviewsTabIfNotExists() {
  const tabsContainer = document.querySelector('.admin-tabs');
  if (!tabsContainer) return;
  
  // Проверяем, существует ли уже вкладка отзывов
  const existingReviewsTab = tabsContainer.querySelector('[onclick="switchTab(\'reviews-tab-content\')"]');
  if (existingReviewsTab) return;
  
  // Добавляем вкладку отзывов
  const reviewsTab = document.createElement('div');
  reviewsTab.className = 'tab';
  reviewsTab.textContent = 'Модерація відгуків';
  reviewsTab.onclick = () => switchTab('reviews-tab-content');
  tabsContainer.appendChild(reviewsTab);
  
  // Добавляем контент для вкладки отзывов
  const tabContents = document.querySelector('.tab-contents');
  if (tabContents) {
    const reviewsContent = document.createElement('div');
    reviewsContent.id = 'reviews-tab-content';
    reviewsContent.className = 'tab-content';
    reviewsContent.innerHTML = `
      <h3>Модерація відгуків</h3>
      <div id="reviews-moderation-container"></div>
    `;
    tabContents.appendChild(reviewsContent);
  }
}

// Функция переключения источника товаров
function switchSource(source, element) {
    document.querySelectorAll('.source-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    if (element) {
        element.classList.add('active');
    } else {
        const tabButton = document.querySelector(`.source-tab[onclick*="${source}"]`);
        if (tabButton) {
            tabButton.classList.add('active');
        }
    }
    
    currentFilters.source = source === 'all' ? '' : source;
    currentPage = 1;
    
    const titles = {
        'all': 'Всі товари',
        'products1.json': 'Інструменти',
        'products2.json': 'Насоси та сантехніка',
        'products3.json': 'Кріплення та витратні матеріали',
        'products4.json': 'Електроінструменти',
        'products5.json': 'Спеціальні товари',
        'products6.json': 'Швидкий ремонт'
    };
    
    document.getElementById('products-title').textContent = titles[source] || 'Товари';
    
    applyFilters();
}

// Функція для відкриття модального вікна з правилами
function openRules() {
  document.getElementById("rules-modal").classList.add("active");
  document.body.style.overflow = 'hidden';
}

// Функція для закриття модального вікна з правилами
function closeRulesModal() {
  document.getElementById("rules-modal").classList.remove("active");
  document.body.style.overflow = '';
}

// Додаємо обробник подій для закриття модального вікна при кліку на фон
document.addEventListener('DOMContentLoaded', function() {
  const rulesModal = document.getElementById('rules-modal');
  if (rulesModal) {
    rulesModal.addEventListener('click', function(e) {
      if (e.target === rulesModal) {
        closeRulesModal();
      }
    });
  }
});

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
  initApp();
  
  // Синхронизация полей поиска
  syncSearchFieldsOnLoad();
  
  // Загружаем товары из всех JSON файлов
  loadAllProducts().then(allProducts => {
    products = preprocessProducts(allProducts);
    window.currentProducts = products;
    updateCartCount();
    renderProducts();
    renderFeaturedProducts();
    renderCategories();
    renderBrands();
    showNotification(`Товари завантажено з ${PRODUCT_FILES.length} файлів`);
    
    localStorage.setItem('products_backup', JSON.stringify(products));
  }).catch(error => {
    console.error("Помилка завантаження товарів:", error);
    showNotification("Не вдалося завантажити товари", "error");
  });
});