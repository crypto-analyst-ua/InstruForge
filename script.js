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

// Названия поставщиков для отображения
const SUPPLIER_NAMES = {
    'products1.json': 'Поставщик інструментів',
    'products2.json': 'Поставщик миючих засобів',
    'products3.json': 'Поставщик масел',
    'products4.json': 'Поставщик дрібниць для дому',
    'products5.json': 'Поставщик сувенірів',
    'products6.json': 'Поставщик матеріалів для ремонту'
};

// ===== СИСТЕМА РЕКЛАМЫ =====
const ADS_CONFIG = {
  ENABLED: true,
  MIN_PRODUCTS_TO_SHOW_ADS: 10,
  AD_POSITIONS: [
    'after_first_row',
    'after_mid_page',
    'before_pagination'
  ],
  AD_TYPES: {
    PRODUCTS: 'products',
    BANNER: 'banner',
    TEXT: 'text'
  },
  AD_REFRESH_INTERVAL: 30 * 60 * 1000
};

// Глобальная переменная для отслеживания показанных баннеров
let shownBannerIds = new Set();

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

// ===== УЛУЧШЕННАЯ СИСТЕМА ПОИСКА =====
const SEARCH_CONFIG = {
  MAX_RESULTS: 1000,
  DEBOUNCE_DELAY: 150,
  MAX_HISTORY: 10,
  MAX_CACHE_SIZE: 200,
  MIN_QUERY_LENGTH: 2
};

const searchSynonyms = {
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

const searchTypos = {
  'дрель': ['дриль', 'дрель', 'дрелей', 'дрелю'],
  'шуруповерт': ['шураповерт', 'шуруповерт', 'шуруповерта', 'шуруповертом'],
  'болгарка': ['болгарка', 'болгарок', 'болгарку', 'болгаркой'],
  'перфоратор': ['перфоратор', 'перфоратора', 'перфоратором', 'перфораторов'],
  'лобзик': ['лобзик', 'лобзика', 'лобзиком', 'лобзиков'],
  'фрезер': ['фрезер', 'фрезера', 'фрезером', 'фрезеров'],
  'шлифмашина': ['шлифмашина', 'шлифмашин', 'шлифмашиной', 'шлифмашину'],
  'насос': ['насос', 'насоса', 'насосом', 'насосов']
};

let searchTimeout = null;
const searchCache = new Map();
let searchLoading = false;
const SEARCH_HISTORY_KEY = "instruforge_search_history";

let recognition = null;
let isListening = false;

// ===== УЛУЧШЕННАЯ СИСТЕМА РЕКОМЕНДАЦИЙ =====
const RECOMMENDATION_CONFIG = {
  MAX_RECOMMENDATIONS: 4,
  VIEW_HISTORY_LIMIT: 20,
  CART_HISTORY_LIMIT: 10,
  PURCHASE_HISTORY_LIMIT: 10
};

const RECOMMENDATION_TYPES = {
  RELATED: 'related',
  FREQUENTLY_BOUGHT: 'frequent',
  TRENDING: 'trending',
  PERSONALIZED: 'personalized',
  CART_SUGGESTIONS: 'cart_suggestions'
};

let userBehavior = {
  viewedProducts: [],
  addedToCart: [],
  purchasedProducts: []
};

// ===== РЕКЛАМНЫЕ ФУНКЦИИ =====
function canShowAds() {
  if (!ADS_CONFIG.ENABLED) return false;
  
  const productsLoaded = products && products.length > 0;
  const enoughProducts = products.length >= ADS_CONFIG.MIN_PRODUCTS_TO_SHOW_ADS;
  const notOnProductDetail = !window.location.href.includes('product.html');
  const notInAdminMode = !adminMode;
  
  return productsLoaded && enoughProducts && notOnProductDetail && notInAdminMode;
}

function getRandomAdBanner() {
  if (!AD_BANNERS.length) return null;
  
  // Фильтруем баннеры, которые еще не были показаны
  const availableBanners = AD_BANNERS.filter(banner => !shownBannerIds.has(banner.id));
  
  // Если все баннеры уже были показаны, сбрасываем список
  if (availableBanners.length === 0) {
    shownBannerIds.clear();
    return AD_BANNERS[Math.floor(Math.random() * AD_BANNERS.length)];
  }
  
  // Выбираем случайный баннер из доступных
  const randomIndex = Math.floor(Math.random() * availableBanners.length);
  const selectedBanner = availableBanners[randomIndex];
  
  // Добавляем ID в список показанных
  shownBannerIds.add(selectedBanner.id);
  
  return selectedBanner;
}

function resetShownBanners() {
  shownBannerIds.clear();
}

function getAdProducts(count = 4) {
  return products
    .filter(product => product.isPopular || (product.discount && product.discount > 0))
    .sort((a, b) => {
      if (a.discount && !b.discount) return -1;
      if (!a.discount && b.discount) return 1;
      if (a.isNew && !b.isNew) return -1;
      if (!a.isNew && b.isNew) return 1;
      return 0;
    })
    .slice(0, count);
}

function renderAdBanner(ad, positionClass = '') {
  if (!ad) return '';
  
  // Проверяем, не был ли этот баннер уже отображен на странице
  const existingAd = document.querySelector(`.ad-container[data-ad-id="${ad.id}"]`);
  if (existingAd) return '';
  
  if (ad.type === 'banner') {
    return `
      <div class="ad-container ${positionClass}" data-ad-id="${ad.id}">
        <a href="${ad.link || '#'}" class="ad-banner" target="_blank" 
           style="background: ${ad.backgroundColor}; color: ${ad.textColor};">
          <div class="ad-banner-content">
            <h3>${ad.title}</h3>
            <p>${ad.text}</p>
          </div>
          <img src="${ad.image}" alt="${ad.title}" class="ad-banner-image">
        </a>
        <div class="ad-label">Реклама</div>
      </div>
    `;
  }
  
  if (ad.type === 'text') {
    return `
      <div class="ad-container ${positionClass}" data-ad-id="${ad.id}">
        <div class="ad-text" style="background: ${ad.backgroundColor}; color: ${ad.textColor};">
          <h3>${ad.title}</h3>
          <p>${ad.text}</p>
          ${ad.link ? `<a href="${ad.link}" class="ad-text-link">Детальніше →</a>` : ''}
        </div>
        <div class="ad-label">Реклама</div>
      </div>
    `;
  }
  
  return '';
}

function renderAdProducts(products, positionClass = '') {
  if (!products || products.length === 0) return '';
  
  return `
    <div class="ad-container ${positionClass}">
      <div class="ad-products">
        <div class="ad-header">
          <h3><i class="fas fa-star"></i> Рекомендуємо</h3>
          <p>Популярні товари серед покупців</p>
        </div>
        <div class="ad-products-grid">
          ${products.map(product => `
            <div class="ad-product-card" onclick="showProductDetail('${product.id}')">
              ${product.discount ? `<div class="ad-badge">-${product.discount}%</div>` : ''}
              <img src="${product.image || 'https://via.placeholder.com/200x200?text=No+Image'}" 
                   alt="${product.title}" 
                   loading="lazy">
              <div class="ad-product-info">
                <h4>${product.title.length > 40 ? product.title.substring(0, 40) + '...' : product.title}</h4>
                <div class="ad-product-price">
                  <span>${formatPrice(product.price)} ₴</span>
                  ${product.oldPrice ? `<span class="old-price">${formatPrice(product.oldPrice)} ₴</span>` : ''}
                </div>
                <button class="btn btn-buy" onclick="event.stopPropagation(); addToCart('${product.id}')">
                  <i class="fas fa-shopping-cart"></i> Купити
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="ad-label">Рекламні пропозиції</div>
    </div>
  `;
}

function checkForDuplicateAds() {
  const adContainers = document.querySelectorAll('.ad-container');
  const seenIds = new Set();
  
  adContainers.forEach(container => {
    const adId = container.getAttribute('data-ad-id');
    if (adId) {
      if (seenIds.has(adId)) {
        // Удаляем дубликат
        container.remove();
      } else {
        seenIds.add(adId);
      }
    }
  });
}

function insertAdsIntoProductGrid() {
  if (!canShowAds()) return;
  
  const grid = document.getElementById('product-grid');
  if (!grid) return;
  
  const productCards = grid.querySelectorAll('.card');
  if (productCards.length < ADS_CONFIG.MIN_PRODUCTS_TO_SHOW_ADS) return;
  
  // Очищаем предыдущие рекламные блоки
  const existingAds = grid.querySelectorAll('.ad-container');
  existingAds.forEach(ad => ad.remove());
  
  const positions = {
    after_first_row: Math.min(4, productCards.length),
    after_mid_page: Math.floor(productCards.length / 2),
    before_pagination: productCards.length - 2
  };
  
  // Обрабатываем каждую позицию
  ADS_CONFIG.AD_POSITIONS.forEach((position, index) => {
    const positionIndex = positions[position];
    
    if (positionIndex && productCards[positionIndex]) {
      let adHTML = '';
      
      // Чередуем типы рекламы
      if (index % 2 === 0) {
        // Текстовый баннер
        const adBanner = getRandomAdBanner();
        if (adBanner) {
          adHTML = renderAdBanner(adBanner, `ad-${position.replace(/_/g, '-')}`);
        }
      } else {
        // Рекламные товары
        const adProducts = getAdProducts(2);
        if (adProducts.length > 0) {
          adHTML = renderAdProducts(adProducts, `ad-${position.replace(/_/g, '-')}`);
        }
      }
      
      // Вставляем рекламу
      if (adHTML) {
        const currentCards = grid.querySelectorAll('.card');
        if (currentCards[positionIndex]) {
          currentCards[positionIndex].insertAdjacentHTML('afterend', adHTML);
        }
      }
    }
  });
  
  // Проверяем и удаляем дубликаты
  setTimeout(checkForDuplicateAds, 100);
}

function addAdStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .ad-container {
      position: relative;
      margin: 20px 0;
      grid-column: 1 / -1;
      width: 100%;
    }
    
    .ad-label {
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(0,0,0,0.7);
      color: white;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 0.7rem;
      z-index: 2;
    }
    
    .ad-banner {
      display: block;
      border-radius: 12px;
      overflow: hidden;
      text-decoration: none;
      position: relative;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .ad-banner:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0,0,0,0.2);
    }
    
    .ad-banner-content {
      position: absolute;
      top: 50%;
      left: 30px;
      transform: translateY(-50%);
      z-index: 1;
      max-width: 50%;
    }
    
    .ad-banner-content h3 {
      margin: 0 0 10px 0;
      font-size: 1.8rem;
      text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
    }
    
    .ad-banner-content p {
      margin: 0;
      font-size: 1.2rem;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
    }
    
    .ad-banner-image {
      width: 100%;
      height: 300px;
      object-fit: cover;
    }
    
    .ad-text {
      padding: 30px;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    
    .ad-text h3 {
      margin: 0 0 15px 0;
      font-size: 1.5rem;
    }
    
    .ad-text p {
      margin: 0 0 20px 0;
      font-size: 1rem;
      line-height: 1.6;
    }
    
    .ad-text-link {
      display: inline-block;
      color: inherit;
      text-decoration: underline;
      font-weight: bold;
      font-size: 1.1rem;
    }
    
    .ad-products {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 25px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.05);
    }
    
    .ad-header {
      text-align: center;
      margin-bottom: 25px;
    }
    
    .ad-header h3 {
      color: #2c3e50;
      margin: 0 0 10px 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }
    
    .ad-header p {
      color: #666;
      margin: 0;
    }
    
    .ad-products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }
    
    .ad-product-card {
      background: white;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 3px 10px rgba(0,0,0,0.08);
      transition: transform 0.3s ease;
      cursor: pointer;
      position: relative;
    }
    
    .ad-product-card:hover {
      transform: translateY(-5px);
    }
    
    .ad-badge {
      position: absolute;
      top: 10px;
      left: 10px;
      background: #e74c3c;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: bold;
      z-index: 2;
    }
    
    .ad-product-card img {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }
    
    .ad-product-info {
      padding: 15px;
    }
    
    .ad-product-info h4 {
      margin: 0 0 10px 0;
      font-size: 0.95rem;
      color: #2c3e50;
      height: 40px;
      overflow: hidden;
    }
    
    .ad-product-price {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 15px;
    }
    
    .ad-product-price span {
      font-weight: bold;
      font-size: 1.2rem;
      color: #2c3e50;
    }
    
    .ad-product-price .old-price {
      font-size: 0.9rem;
      color: #95a5a6;
      text-decoration: line-through;
    }
    
    @media (max-width: 768px) {
      .ad-banner-content {
        position: relative;
        top: auto;
        left: auto;
        transform: none;
        max-width: 100%;
        padding: 20px;
        text-align: center;
        background: rgba(0,0,0,0.7);
      }
      
      .ad-banner-content h3 {
        font-size: 1.3rem;
      }
      
      .ad-banner-content p {
        font-size: 1rem;
      }
      
      .ad-banner-image {
        height: 200px;
      }
      
      .ad-products-grid {
        grid-template-columns: 1fr;
      }
      
      .ad-after-first-row {
        margin-top: 20px;
      }
    }
  `;
  document.head.appendChild(style);
}

// ===== ФУНКЦІЯ ДЛЯ ВХОДА ЧЕРЕЗ GOOGLE =====
function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    
    provider.addScope('profile');
    provider.addScope('email');
    
    auth.signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            const isNewUser = result.additionalUserInfo?.isNewUser || false;
            
            if (isNewUser) {
                showNotification("Реєстрація через Google успішна!");
            } else {
                showNotification("Вхід через Google успішний!");
            }
            
            closeModal();
            checkAdminStatus(user.uid);
        })
        .catch((error) => {
            console.error("Помилка входу через Google: ", error);
            
            let errorMessage = "Помилка входу через Google";
            switch (error.code) {
                case 'auth/popup-closed-by-user':
                    errorMessage = "Вікно авторизації закрито користувачем";
                    break;
                case 'auth/cancelled-popup-request':
                    errorMessage = "Запит авторизації скасовано";
                    break;
                case 'auth/popup-blocked':
                    errorMessage = "Вспливаюче вікно заблоковано браузером. Дозвольте спливаючі вікна для цього сайту";
                    break;
            }
            
            showNotification(errorMessage, "error");
        });
}

function translateCategory(category) {
    if (!category) return '';
    return categoryTranslations[category] || category;
}

function fixCommonTypos(query) {
  if (!query || query.length < 2) return query;
  
  let fixedQuery = query.toLowerCase();
  
  Object.entries(searchTypos).forEach(([correct, mistakes]) => {
    mistakes.forEach(mistake => {
      if (fixedQuery.includes(mistake)) {
        fixedQuery = fixedQuery.replace(mistake, correct);
      }
    });
  });
  
  return fixedQuery;
}

function normalizeSearchTerm(term) {
  if (!term) return '';
  
  let normalized = term.toLowerCase()
    .replace(/[єё]/g, 'е')
    .replace(/[ї]/g, 'и') 
    .replace(/[і]/g, 'и')
    .replace(/[ґ]/g, 'г')
    .replace(/[ы]/g, 'и')
    .replace(/[э]/g, 'е')
    .replace(/[ъь]/g, '')
    .replace(/[^а-яa-z0-9\-\s']/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  normalized = fixCommonTypos(normalized);
  
  return normalized;
}

function expandSearchQuery(query) {
  const words = query.split(' ');
  const expanded = [...words];
  
  words.forEach(word => {
    const normalizedWord = normalizeSearchTerm(word);
    
    if (searchSynonyms[normalizedWord]) {
      expanded.push(...searchSynonyms[normalizedWord]);
    }
  });
  
  return [...new Set(expanded)].join(' ');
}

function calculateRelevance(product, searchTerms) {
  if (!product || !searchTerms) return 0;
  
  let score = 0;
  const searchText = searchTerms.toLowerCase();
  
  if (product.title && product.title.toLowerCase().includes(searchText)) {
    score += 100;
    if (product.title.toLowerCase().startsWith(searchText)) score += 50;
  }
  
  if (product.brand && product.brand.toLowerCase().includes(searchText)) score += 50;
  if (product.category && product.category.toLowerCase().includes(searchText)) score += 30;
  if (product.description && product.description.toLowerCase().includes(searchText)) score += 10;
  
  if (product.sku && product.sku.toLowerCase().includes(searchText)) score += 80;
  
  if (product.isPopular) score += 20;
  if (product.isNew) score += 15;
  if (product.inStock) score += 10;
  if (product.discount) score += 5;
  
  return score;
}

function removeDuplicateResults(results) {
  const seen = new Set();
  const uniqueResults = [];
  
  for (const product of results) {
    const key = `${product.title}_${product.brand}_${product.price}_${product.sku || ''}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueResults.push(product);
    }
  }
  
  return uniqueResults;
}

function searchProductsEnhanced(searchTerm) {
  if (!searchTerm || searchTerm.trim().length < 1) {
    return products;
  }
  
  const normalizedSearch = normalizeSearchTerm(searchTerm);
  const searchWords = normalizedSearch.split(/\s+/).filter(word => word.length >= 1);
  
  if (searchWords.length === 0) {
    return products;
  }
  
  const expandedQuery = expandSearchQuery(normalizedSearch);
  const expandedWords = expandedQuery.split(/\s+/).filter(word => word.length >= 1);
  
  let results = products.filter(product => {
    if (!product.searchIndex) return false;
    
    const allWordsMatch = searchWords.every(word => 
      product.searchIndex.includes(word)
    );
    
    if (!allWordsMatch && expandedWords.length > searchWords.length) {
      return expandedWords.some(word => 
        product.searchIndex.includes(word)
      );
    }
    
    return allWordsMatch;
  });
  
  if (results.length > SEARCH_CONFIG.MAX_RESULTS) {
    results = results.slice(0, SEARCH_CONFIG.MAX_RESULTS);
  }
  
  results.forEach(product => {
    product.relevanceScore = calculateRelevance(product, searchTerm);
  });
  
  results.sort((a, b) => {
    if (b.relevanceScore !== a.relevanceScore) {
      return b.relevanceScore - a.relevanceScore;
    }
    
    if (a.isPopular && !b.isPopular) return -1;
    if (!a.isPopular && b.isPopular) return 1;
    if (a.isNew && !b.isNew) return -1;
    if (!a.isNew && b.isNew) return 1;
    
    return 0;
  });
  
  results = removeDuplicateResults(results);
  
  return results;
}

function searchProducts(searchTerm) {
  if (!searchTerm || searchTerm.trim().length < 1) {
    return products;
  }
  
  return searchProductsEnhanced(searchTerm);
}

function saveToSearchHistory(query) {
  if (!query || query.trim().length < 2) return;
  
  const cleanQuery = query.trim();
  const history = JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]');
  const newHistory = [cleanQuery, ...history.filter(item => item !== cleanQuery)].slice(0, SEARCH_CONFIG.MAX_HISTORY);
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
}

function getSearchHistory() {
  return JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]');
}

function clearSearchHistory() {
  localStorage.removeItem(SEARCH_HISTORY_KEY);
  showNotification('Історію пошуку очищено');
  
  hideSearchSuggestions(false);
  hideSearchSuggestions(true);
}

function removeFromSearchHistory(term) {
  const history = getSearchHistory();
  const newHistory = history.filter(item => item !== term);
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
}

function getEnhancedSearchSuggestions(query) {
  try {
    if (!query || query.length < 1) {
      return getSearchHistorySuggestions();
    }
    
    const normalizedQuery = normalizeSearchTerm(query);
    
    if (searchCache.has(normalizedQuery)) {
      return searchCache.get(normalizedQuery);
    }
    
    const suggestions = [];
    const seen = new Set();
    
    const maxProductsToCheck = Math.min(products.length, 200);
    
    for (let i = 0; i < maxProductsToCheck; i++) {
      const product = products[i];
      if (!product || typeof product !== 'object') continue;
      
      const fieldsToCheck = [
        { field: 'title', type: 'Назва', icon: '🔧', relevance: 10 },
        { field: 'brand', type: 'Бренд', icon: '🏷️', relevance: 8 },
        { field: 'category', type: 'Категорія', icon: '📂', relevance: 6 },
        { field: 'sku', type: 'Артикул', icon: '#️⃣', relevance: 9 }
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
      
      if (suggestions.length >= 8) break;
    }
    
    if (suggestions.length < 3) {
      suggestions.push({
        type: 'action',
        icon: '🔍',
        value: `Знайти "${query}"`,
        action: 'search',
        relevance: 100
      });
    }
    
    suggestions.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));
    
    if (searchCache.size > SEARCH_CONFIG.MAX_CACHE_SIZE) {
      const keys = Array.from(searchCache.keys()).slice(0, 20);
      keys.forEach(key => searchCache.delete(key));
    }
    
    const finalSuggestions = suggestions.slice(0, 6);
    searchCache.set(normalizedQuery, finalSuggestions);
    return finalSuggestions;
  } catch (error) {
    console.error("Ошибка в поиске подсказок:", error);
    return getFallbackSuggestions(query);
  }
}

function getSearchHistorySuggestions() {
  const history = getSearchHistory();
  return history.slice(0, 5).map(term => ({
    type: 'history',
    icon: '🕒',
    value: term,
    action: 'search',
    relevance: 100
  }));
}

function getFallbackSuggestions(query) {
  return [
    {
      type: 'action',
      icon: '🔍',
      value: `Знайти "${query}"`,
      action: 'search',
      relevance: 100
    }
  ];
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showSearchHistorySuggestions(isMobile = false) {
  const history = getSearchHistory();
  
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
  
  suggestionsContainer.innerHTML = '';
  
  if (history.length > 0) {
    const historyHeader = document.createElement('div');
    historyHeader.className = 'search-suggestion-header';
    historyHeader.innerHTML = `
      <span>Історія пошуку</span>
      <button class="clear-all-history-btn" onclick="event.stopPropagation(); clearSearchHistory()">
        <i class="fas fa-trash"></i> Очистити все
      </button>
    `;
    suggestionsContainer.appendChild(historyHeader);
  }
  
  if (history.length === 0) {
    const emptyHistory = document.createElement('div');
    emptyHistory.className = 'search-suggestion';
    emptyHistory.innerHTML = `
      <i class="fas fa-history"></i>
      <span class="suggestion-text">Історія пошуку порожня</span>
    `;
    suggestionsContainer.appendChild(emptyHistory);
    suggestionsContainer.style.display = 'block';
    return;
  }
  
  history.slice(0, 5).forEach((term, index) => {
    const div = document.createElement('div');
    div.className = `search-suggestion ${index === 0 ? 'active' : ''}`;
    div.innerHTML = `
      <i class="fas fa-history"></i>
      <span class="suggestion-text">${escapeHtml(term)}</span>
      <span class="suggestion-type">Історія</span>
      <button class="clear-history-btn" onclick="event.stopPropagation(); removeFromSearchHistory('${term}')">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    div.addEventListener('click', () => {
      if (isMobile) {
        document.getElementById('search-mobile').value = term;
      } else {
        document.getElementById('search').value = term;
      }
      currentFilters.search = term;
      applyFilters();
      hideSearchSuggestions(isMobile);
    });
    
    suggestionsContainer.appendChild(div);
  });
  
  suggestionsContainer.style.display = 'block';
}

function showSearchSuggestions(query, isMobile = false) {
  if (!query || query.length < 1) {
    showSearchHistorySuggestions(isMobile);
    return;
  }
  
  const suggestions = getEnhancedSearchSuggestions(query);
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
      div.className = `search-suggestion ${suggestion.type === 'action' ? 'suggestion-action' : ''} ${index === 0 ? 'active' : ''}`;
      
      if (suggestion.type === 'action') {
        div.innerHTML = `
          ${suggestion.icon} 
          <span class="suggestion-text">${escapeHtml(suggestion.value)}</span>
        `;
        
        div.addEventListener('click', () => {
          if (suggestion.action === 'search') {
            const searchValue = suggestion.value.replace(/^Знайти "/, '').replace(/"$/, '');
            if (isMobile) {
              document.getElementById('search-mobile').value = searchValue;
            } else {
              document.getElementById('search').value = searchValue;
            }
            currentFilters.search = searchValue;
            applyFilters();
          }
          hideSearchSuggestions(isMobile);
        });
      } else if (suggestion.type === 'history') {
        div.innerHTML = `
          ${suggestion.icon} 
          <span class="suggestion-text">${escapeHtml(suggestion.value)}</span>
          <span class="suggestion-type">Історія</span>
          <button class="clear-history-btn" onclick="event.stopPropagation(); removeFromSearchHistory('${suggestion.value}')">
            <i class="fas fa-times"></i>
          </button>
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
        });
      } else {
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
      }
      
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

function initVoiceSearch() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    console.log('Браузер не поддерживает распознавание речи');
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'uk-UA';

  recognition.onstart = function() {
    isListening = true;
    updateVoiceSearchUI(true);
    showNotification('Слухаю... Говоріть now', 'info');
  };

  recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript;
    
    const searchInput = document.getElementById('search');
    const searchMobileInput = document.getElementById('search-mobile');
    
    if (searchInput) {
      searchInput.value = transcript;
      searchInput.dispatchEvent(new Event('input'));
    }
    
    if (searchMobileInput) {
      searchMobileInput.value = transcript;
      searchMobileInput.dispatchEvent(new Event('input'));
    }
    
    saveToSearchHistory(transcript);
    
    showNotification(`Знайдено за запитом: "${transcript}"`, 'success');
  };

  recognition.onerror = function(event) {
    isListening = false;
    updateVoiceSearchUI(false);
    
    let errorMessage = 'Помилка розпізнавання мови';
    switch (event.error) {
      case 'no-speech':
        errorMessage = 'Мова не розпізнана. Спробуйте ще раз.';
        break;
      case 'audio-capture':
        errorMessage = 'Мікрофон не знайдено або відсутній дозвіл.';
        break;
      case 'not-allowed':
        errorMessage = 'Дозвіл на використання мікрофона не надано.';
        break;
      default:
        errorMessage = `Помилка: ${event.error}`;
    }
    
    showNotification(errorMessage, 'error');
  };

  recognition.onend = function() {
    isListening = false;
    updateVoiceSearchUI(false);
  };
}

function toggleVoiceSearch(isMobile = false) {
  if (!recognition) {
    showNotification('Аудіопошук не підтримується вашим браузером', 'error');
    return;
  }

  if (isListening) {
    recognition.stop();
    isListening = false;
    updateVoiceSearchUI(false);
    showNotification('Аудіопошук зупинено', 'info');
  } else {
    try {
      recognition.start();
    } catch (error) {
      console.error('Ошибка запуска распознавания:', error);
      showNotification('Помилка запуску аудіопошуку', 'error');
    }
  }
}

function updateVoiceSearchUI(listening) {
  const voiceButtons = document.querySelectorAll('.voice-search-btn');
  
  voiceButtons.forEach(btn => {
    if (listening) {
      btn.classList.add('listening');
      btn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
      btn.title = 'Зупинити аудіопошук';
    } else {
      btn.classList.remove('listening');
      btn.innerHTML = '<i class="fas fa-microphone"></i>';
      btn.title = 'Голосовий пошук';
    }
  });
}

function addVoiceSearchButtons() {
  const searchContainer = document.querySelector('.search-container');
  if (searchContainer) {
    const voiceBtn = document.createElement('button');
    voiceBtn.type = 'button';
    voiceBtn.className = 'voice-search-btn';
    voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
    voiceBtn.title = 'Голосовий пошук';
    voiceBtn.onclick = () => toggleVoiceSearch(false);
    
    const searchInput = document.getElementById('search');
    if (searchInput) {
      searchInput.parentNode.insertBefore(voiceBtn, searchInput.nextSibling);
    }
  }

  const searchMobileContainer = document.querySelector('.search-container-mobile');
  if (searchMobileContainer) {
    const voiceBtnMobile = document.createElement('button');
    voiceBtnMobile.type = 'button';
    voiceBtnMobile.className = 'voice-search-btn mobile';
    voiceBtnMobile.innerHTML = '<i class="fas fa-microphone"></i>';
    voiceBtnMobile.title = 'Голосовий пошук';
    voiceBtnMobile.onclick = () => toggleVoiceSearch(true);
    
    const searchMobileInput = document.getElementById('search-mobile');
    if (searchMobileInput) {
      searchMobileInput.parentNode.insertBefore(voiceBtnMobile, searchMobileInput.nextSibling);
    }
  }
}

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
      
      if (value.length >= 1) {
        showSearchSuggestions(value, isMobile);
      } else {
        showSearchHistorySuggestions(isMobile);
      }
      
      applyFilters();
    }, SEARCH_CONFIG.DEBOUNCE_DELAY);
  }
  
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      const currentValue = this.value.trim();
      handleSearch(currentValue, false);
      if (searchMobileInput) {
        searchMobileInput.value = currentValue;
      }
    });
    
    searchInput.addEventListener('focus', function() {
      if (this.value === '') {
        showSearchHistorySuggestions(false);
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
          } else {
            saveToSearchHistory(this.value);
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
  
  if (searchMobileInput) {
    searchMobileInput.addEventListener('input', function() {
      const currentValue = this.value.trim();
      handleSearch(currentValue, true);
      if (searchInput) {
        searchInput.value = currentValue;
      }
    });
    
    searchMobileInput.addEventListener('focus', function() {
      if (this.value === '') {
        showSearchHistorySuggestions(true);
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
          } else {
            saveToSearchHistory(this.value);
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
  
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.search-container') && !e.target.closest('.search-container-mobile')) {
      hideSearchSuggestions(false);
      hideSearchSuggestions(true);
    }
  });
}

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
    
    .suggestion-action {
      background-color: #f8f9fa;
      font-weight: bold;
    }
    
    .clear-history-btn {
      background: none;
      border: none;
      color: #999;
      cursor: pointer;
      padding: 2px 5px;
      border-radius: 3px;
      margin-left: auto;
    }
    
    .clear-history-btn:hover {
      background: #f0f0f0;
      color: #e74c3c;
    }
    
    .search-suggestion-header {
      padding: 8px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
      font-size: 0.8em;
      font-weight: 600;
      color: #6c757d;
    }
    
    .clear-all-history-btn {
      background: none;
      border: none;
      color: #e74c3c;
      cursor: pointer;
      font-size: 0.75em;
      padding: 2px 6px;
      border-radius: 3px;
    }
    
    .clear-all-history-btn:hover {
      background: #f8d7da;
    }
    
    .voice-search-btn {
      position: absolute;
      right: 40px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: #666;
      cursor: pointer;
      padding: 8px;
      border-radius: 50%;
      transition: all 0.3s ease;
      z-index: 2;
    }
    
    .voice-search-btn:hover {
      background: #f0f0f0;
      color: #333;
    }
    
    .voice-search-btn.listening {
      background: #e74c3c;
      color: white;
      animation: pulse 1.5s infinite;
    }
    
    .voice-search-btn.mobile {
      right: 40px;
    }
    
    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.7);
      }
      70% {
        box-shadow: 0 0 0 10px rgba(231, 76, 60, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(231, 76, 60, 0);
      }
    }
    
    .search-container input,
    .search-container-mobile input {
      padding-right: 80px !important;
    }
    
    @media (max-width: 768px) {
      .search-container {
        display: none;
      }
      
      .voice-search-btn:not(.mobile) {
        display: none;
      }
    }
    
    @media (min-width: 769px) {
      .search-container-mobile {
        display: none;
      }
      
      .voice-search-btn.mobile {
        display: none;
      }
    }
    
    .btn-google {
      background-color: #4285F4;
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: var(--border-radius);
      cursor: pointer;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      margin-bottom: 15px;
    }
    
    .btn-google:hover {
      background-color: #357ae8;
    }
    
    .auth-divider {
      text-align: center;
      margin: 15px 0;
      position: relative;
    }
    
    .auth-divider span {
      background: white;
      padding: 0 10px;
      color: #666;
    }
    
    .auth-divider:before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: #eee;
      z-index: -1;
    }
    
    .social-auth {
      margin-bottom: 20px;
    }
  `;
  document.head.appendChild(style);
}

function initEnhancedSearch() {
  addSearchStyles();
  setupSearchHandler();
  initVoiceSearch();
  addVoiceSearchButtons();
}

let products = [];
let cart = {};
let favorites = {};
let adminMode = false;
let showingFavorites = false;
let currentUser = null;
let currentPage = 1;
const productsPerPage = 36;
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

let currentRating = 0;

function setupPageCounter() {
  const params = new URLSearchParams({
      style: 'flat-square',
      label: 'Views',
      color: 'blue',
      logo: 'firebase'
  });

  const currentPath = window.location.pathname;
  const counterURL = `https://hits.sh/boltmaster-2025.web.app${currentPath}.svg?${params.toString()}`;
  const pageViewsElement = document.getElementById('page-views');
  if (pageViewsElement) {
      pageViewsElement.src = counterURL;
  }
}

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

function loadProductsFromJson() {
  isProductsLoading = true;
  renderProducts();
  
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

function preprocessProducts(productsArray) {
  console.log("🔧 Предобработка товаров для умного поиска...");
  
  const processedProducts = productsArray.map((product, index) => {
    if (!product || typeof product !== 'object') return product;
    
    if (!product.id) {
      product.id = `product_${Date.now()}_${index}`;
    }
    
    const searchFields = [
      product.title || '',
      product.title || '',
      product.title || '',
      product.brand || '',
      product.brand || '',
      product.category || '',
      product.description || '',
      product.specifications || '',
      product.model || '',
      product.sku || ''
    ];
    
    const normalizedFields = searchFields.map(field => 
      normalizeSearchTerm(String(field || ''))
    );
    
    const searchIndex = normalizedFields.join(' ').toLowerCase();
    
    return {
      ...product,
      searchIndex,
      title: product.title || 'Без назви',
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
  
  console.log(`✅ Обработано ${processedProducts.length} товаров`);
  return processedProducts;
}

function initUserBehavior() {
  userBehavior = {
    viewedProducts: JSON.parse(localStorage.getItem('user_viewed_products') || '[]'),
    addedToCart: JSON.parse(localStorage.getItem('user_cart_history') || '[]'),
    purchasedProducts: JSON.parse(localStorage.getItem('user_purchased_products') || '[]')
  };
}

function trackUserBehavior(action, productId) {
  if (!productId) return;
  
  let storageKey = '';
  let limit = 0;
  
  switch(action) {
    case 'view':
      storageKey = 'user_viewed_products';
      limit = RECOMMENDATION_CONFIG.VIEW_HISTORY_LIMIT;
      break;
    case 'add_to_cart':
      storageKey = 'user_cart_history';
      limit = RECOMMENDATION_CONFIG.CART_HISTORY_LIMIT;
      break;
    case 'purchase':
      storageKey = 'user_purchased_products';
      limit = RECOMMENDATION_CONFIG.PURCHASE_HISTORY_LIMIT;
      break;
  }
  
  if (storageKey) {
    const history = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const newHistory = [productId, ...history.filter(id => id !== productId)].slice(0, limit);
    localStorage.setItem(storageKey, JSON.stringify(newHistory));
    userBehavior[storageKey.replace('user_', '').replace('_history', '')] = newHistory;
  }
}

function getRelatedProducts(productId, count = RECOMMENDATION_CONFIG.MAX_RECOMMENDATIONS) {
  const product = products.find(p => p.id === productId);
  if (!product) return [];
  
  let relatedProducts = [];
  
  if (product.category) {
    relatedProducts = products.filter(p => 
      p.id !== productId && 
      p.category === product.category
    );
  }
  
  if (product.brand && relatedProducts.length < count) {
    const brandProducts = products.filter(p => 
      p.id !== productId && 
      p.brand === product.brand &&
      !relatedProducts.some(rp => rp.id === p.id)
    );
    relatedProducts = [...relatedProducts, ...brandProducts];
  }
  
  if (relatedProducts.length < count && product.title) {
    const keywords = product.title.toLowerCase().split(' ');
    const keywordProducts = products.filter(p => 
      p.id !== productId &&
      !relatedProducts.some(rp => rp.id === p.id) &&
      keywords.some(keyword => p.title.toLowerCase().includes(keyword))
    );
    relatedProducts = [...relatedProducts, ...keywordProducts];
  }
  
  if (relatedProducts.length < count) {
    const remainingCount = count - relatedProducts.length;
    const randomProducts = products.filter(p => 
      p.id !== productId &&
      !relatedProducts.some(rp => rp.id === p.id)
    );
    relatedProducts = [...relatedProducts, ...shuffleArray(randomProducts).slice(0, remainingCount)];
  }
  
  return shuffleArray(relatedProducts).slice(0, count);
}

function getFrequentlyBoughtTogether(productId, count = RECOMMENDATION_CONFIG.MAX_RECOMMENDATIONS) {
  const product = products.find(p => p.id === productId);
  if (!product) return [];
  
  const cartHistory = userBehavior.addedToCart;
  const productsInSameCategory = products.filter(p => 
    p.id !== productId && 
    p.category === product.category
  );
  
  const recommendations = productsInSameCategory
    .sort((a, b) => {
      if (a.isPopular && !b.isPopular) return -1;
      if (!a.isPopular && b.isPopular) return 1;
      if (a.isNew && !b.isNew) return -1;
      if (!a.isNew && b.isNew) return 1;
      return 0;
    })
    .slice(0, count);
  
  return recommendations;
}

function getTrendingProducts(count = RECOMMENDATION_CONFIG.MAX_RECOMMENDATIONS) {
  return products
    .filter(p => p.isPopular || p.isNew || (p.discount && p.discount > 0))
    .sort((a, b) => {
      if (a.discount && !b.discount) return -1;
      if (!a.discount && b.discount) return 1;
      if (a.isNew && !b.isNew) return -1;
      if (!a.isNew && b.isNew) return 1;
      return 0;
    })
    .slice(0, count);
}

function getPersonalizedRecommendations(count = RECOMMENDATION_CONFIG.MAX_RECOMMENDATIONS) {
  if (userBehavior.viewedProducts.length === 0 && 
      userBehavior.addedToCart.length === 0) {
    return getTrendingProducts(count);
  }
  
  const categoryCounts = {};
  const allInteractions = [...userBehavior.viewedProducts, ...userBehavior.addedToCart];
  
  allInteractions.forEach(productId => {
    const product = products.find(p => p.id === productId);
    if (product && product.category) {
      categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1;
    }
  });
  
  const favoriteCategory = Object.keys(categoryCounts).reduce((a, b) => 
    categoryCounts[a] > categoryCounts[b] ? a : b, ''
  );
  
  if (favoriteCategory) {
    return products
      .filter(p => p.category === favoriteCategory && !allInteractions.includes(p.id))
      .sort((a, b) => {
        if (a.isPopular && !b.isPopular) return -1;
        if (!a.isPopular && b.isPopular) return 1;
        return 0;
      })
      .slice(0, count);
  }
  
  return getTrendingProducts(count);
}

function getCartSuggestions(count = RECOMMENDATION_CONFIG.MAX_RECOMMENDATIONS) {
  const cartProductIds = Object.keys(cart);
  if (cartProductIds.length === 0) {
    return getTrendingProducts(count);
  }
  
  const cartCategories = {};
  cartProductIds.forEach(productId => {
    const product = products.find(p => p.id === productId);
    if (product && product.category) {
      cartCategories[product.category] = (cartCategories[product.category] || 0) + 1;
    }
  });
  
  const mostCommonCategory = Object.keys(cartCategories).reduce((a, b) => 
    cartCategories[a] > cartCategories[b] ? a : b, ''
  );
  
  let suggestions = [];
  
  if (mostCommonCategory) {
    suggestions = products.filter(p => 
      p.category === mostCommonCategory && 
      !cartProductIds.includes(p.id)
    ).slice(0, Math.ceil(count / 2));
  }
  
  const discountProducts = products
    .filter(p => p.discount > 0 && !cartProductIds.includes(p.id))
    .slice(0, Math.ceil(count / 2));
  
  suggestions = [...suggestions, ...discountProducts];
  
  return shuffleArray(suggestions).slice(0, count);
}

function renderRelatedProducts(productId, containerId = 'related-products') {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const relatedProducts = getRelatedProducts(productId);
  
  if (relatedProducts.length === 0) {
    container.style.display = 'none';
    return;
  }
  
  container.innerHTML = `
    <div class="recommendation-block">
      <div class="recommendation-header">
        <h3><i class="fas fa-lightbulb"></i> Може вас зацікавити</h3>
      </div>
      <div class="recommendation-products">
        ${relatedProducts.map(product => `
          <div class="recommendation-product-card" onclick="showProductDetail('${product.id}')">
            ${product.discount ? `<div class="recommendation-badge discount">-${product.discount}%</div>` : ''}
            ${product.isNew ? '<div class="recommendation-badge new">Новинка</div>' : ''}
            <img src="${product.image || 'https://via.placeholder.com/200x200?text=No+Image'}" 
                 alt="${product.title}" 
                 loading="lazy">
            <div class="recommendation-product-info">
              <h4>${product.title.length > 50 ? product.title.substring(0, 50) + '...' : product.title}</h4>
              <div class="recommendation-price">
                <span>${formatPrice(product.price)} ₴</span>
                ${product.oldPrice ? `<span class="old-price">${formatPrice(product.oldPrice)} ₴</span>` : ''}
              </div>
              <button class="btn btn-buy" onclick="event.stopPropagation(); addToCart('${product.id}')">
                <i class="fas fa-shopping-cart"></i> Купити
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  container.style.display = 'block';
}

function renderPeopleAlsoSearch(containerId = 'people-also-search') {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const searchHistory = getSearchHistory();
  if (searchHistory.length === 0) {
    container.style.display = 'none';
    return;
  }
  
  const popularSearches = searchHistory.slice(0, 4);
  
  container.innerHTML = `
    <div class="recommendation-block">
      <div class="recommendation-header">
        <h3><i class="fas fa-search"></i> Люди також шукають</h3>
        <p>Популярні запити інших покупців</p>
      </div>
      <div class="search-tags">
        ${popularSearches.map(search => `
          <div class="search-tag" onclick="document.getElementById('search').value = '${search}'; currentFilters.search = '${search}'; applyFilters()">
            <i class="fas fa-search"></i> ${search}
          </div>
        `).join('')}
      </div>
      <div class="trending-products">
        ${getTrendingProducts(3).map(product => `
          <div class="trending-product" onclick="showProductDetail('${product.id}')">
            <img src="${product.image || 'https://via.placeholder.com/60x60?text=No+Image'}" 
                 alt="${product.title}">
            <div class="trending-product-info">
              <span class="trending-product-title">${product.title.substring(0, 30)}...</span>
              <span class="trending-product-price">${formatPrice(product.price)} ₴</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  container.style.display = 'block';
}

function renderCartSuggestions(containerId = 'cart-suggestions') {
  const container = document.getElementById(containerId);
  if (!container || Object.keys(cart).length === 0) {
    if (container) container.style.display = 'none';
    return;
  }
  
  const cartSuggestions = getCartSuggestions();
  
  if (cartSuggestions.length === 0) {
    container.style.display = 'none';
    return;
  }
  
  container.innerHTML = `
    <div class="recommendation-block">
      <div class="recommendation-header">
        <h3><i class="fas fa-cart-plus"></i> Доповніть ваше замовлення</h3>
      </div>
      <div class="recommendation-products">
        ${cartSuggestions.map(product => `
          <div class="recommendation-product-card" onclick="showProductDetail('${product.id}')">
            ${product.discount ? `<div class="recommendation-badge discount">-${product.discount}%</div>` : ''}
            <img src="${product.image || 'https://via.placeholder.com/200x200?text=No+Image'}" 
                 alt="${product.title}" 
                 loading="lazy">
            <div class="recommendation-product-info">
              <h4>${product.title.length > 50 ? product.title.substring(0, 50) + '...' : product.title}</h4>
              <div class="recommendation-price">
                <span>${formatPrice(product.price)} ₴</span>
                ${product.oldPrice ? `<span class="old-price">${formatPrice(product.oldPrice)} ₴</span>` : ''}
              </div>
              <button class="btn btn-buy" onclick="event.stopPropagation(); addToCart('${product.id}')">
                <i class="fas fa-shopping-cart"></i> Додати
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  container.style.display = 'block';
}

function renderPersonalizedRecommendations(containerId = 'personalized-recommendations') {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const personalizedProducts = getPersonalizedRecommendations();
  
  if (personalizedProducts.length === 0) {
    container.style.display = 'none';
    return;
  }
  
  container.innerHTML = `
    <div class="recommendation-block">
      <div class="recommendation-header">
        <h3><i class="fas fa-user-check"></i> Персональні рекомендації</h3>
        <p>Спеціально для вас на основі ваших переглядів</p>
      </div>
      <div class="recommendation-products">
        ${personalizedProducts.map(product => `
          <div class="recommendation-product-card" onclick="showProductDetail('${product.id}')">
            ${product.discount ? `<div class="recommendation-badge discount">-${product.discount}%</div>` : ''}
            ${product.isNew ? '<div class="recommendation-badge new">Новинка</div>' : ''}
            <img src="${product.image || 'https://via.placeholder.com/200x200?text=No+Image'}" 
                 alt="${product.title}" 
                 loading="lazy">
            <div class="recommendation-product-info">
              <h4>${product.title.length > 50 ? product.title.substring(0, 50) + '...' : product.title}</h4>
              <div class="recommendation-price">
                <span>${formatPrice(product.price)} ₴</span>
                ${product.oldPrice ? `<span class="old-price">${formatPrice(product.oldPrice)} ₴</span>` : ''}
              </div>
              <button class="btn btn-buy" onclick="event.stopPropagation(); addToCart('${product.id}')">
                <i class="fas fa-shopping-cart"></i> Купити
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  container.style.display = 'block';
}

function renderAllRecommendations() {
  renderPersonalizedRecommendations();
  renderTrendingProducts();
  renderPeopleAlsoSearch();
}

function renderTrendingProducts(containerId = 'trending-products') {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const trendingProducts = getTrendingProducts(6);
  
  if (trendingProducts.length === 0) {
    container.style.display = 'none';
    return;
  }
  
  container.innerHTML = `
    <div class="recommendation-block">
      <div class="recommendation-header">
        <h3><i class="fas fa-fire"></i> Гарячі пропозиції</h3>
        <p>Найпопулярніші товари серед покупців</p>
      </div>
      <div class="recommendation-products">
        ${trendingProducts.map(product => `
          <div class="recommendation-product-card" onclick="showProductDetail('${product.id}')">
            ${product.discount ? `<div class="recommendation-badge discount">-${product.discount}%</div>` : ''}
            ${product.isNew ? '<div class="recommendation-badge new">Новинка</div>' : ''}
            <img src="${product.image || 'https://via.placeholder.com/200x200?text=No+Image'}" 
                 alt="${product.title}" 
                 loading="lazy">
            <div class="recommendation-product-info">
              <h4>${product.title.length > 50 ? product.title.substring(0, 50) + '...' : product.title}</h4>
              <div class="recommendation-price">
                <span>${formatPrice(product.price)} ₴</span>
                ${product.oldPrice ? `<span class="old-price">${formatPrice(product.oldPrice)} ₴</span>` : ''}
              </div>
              <button class="btn btn-buy" onclick="event.stopPropagation(); addToCart('${product.id}')">
                <i class="fas fa-shopping-cart"></i> Купити
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  container.style.display = 'block';
}

function addRecommendationStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .recommendation-container {
      margin: 30px 0;
    }
    
    .recommendation-block {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
      border-left: 4px solid #007bff;
    }
    
    .recommendation-header {
      margin-bottom: 20px;
    }
    
    .recommendation-header h3 {
      color: #2c3e50;
      margin: 0 0 5px 0;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1.3rem;
    }
    
    .recommendation-header p {
      color: #666;
      margin: 0;
      font-size: 0.95rem;
    }
    
    .recommendation-products {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 15px;
    }
    
    .recommendation-product-card {
      background: white;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 3px 10px rgba(0,0,0,0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      cursor: pointer;
      position: relative;
    }
    
    .recommendation-product-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0,0,0,0.15);
    }
    
    .recommendation-product-card img {
      width: 100%;
      height: 180px;
      object-fit: cover;
    }
    
    .recommendation-product-info {
      padding: 15px;
    }
    
    .recommendation-product-info h4 {
      margin: 0 0 10px 0;
      font-size: 0.95rem;
      color: #2c3e50;
      height: 40px;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    
    .recommendation-price {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
    }
    
    .recommendation-price span {
      font-weight: bold;
      font-size: 1.1rem;
      color: #2c3e50;
    }
    
    .recommendation-price .old-price {
      font-size: 0.9rem;
      color: #95a5a6;
      text-decoration: line-through;
    }
    
    .recommendation-badge {
      position: absolute;
      top: 10px;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: bold;
      z-index: 2;
    }
    
    .recommendation-badge.discount {
      left: 10px;
      background: #e74c3c;
      color: white;
    }
    
    .recommendation-badge.new {
      right: 10px;
      background: #2ecc71;
      color: white;
    }
    
    .search-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin: 15px 0;
    }
    
    .search-tag {
      background: white;
      border: 2px solid #007bff;
      color: #007bff;
      padding: 8px 15px;
      border-radius: 25px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
    }
    
    .search-tag:hover {
      background: #007bff;
      color: white;
    }
    
    .trending-products {
      display: grid;
      gap: 10px;
      margin-top: 20px;
    }
    
    .trending-product {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 12px;
      background: white;
      border-radius: 8px;
      cursor: pointer;
      transition: transform 0.2s ease;
    }
    
    .trending-product:hover {
      transform: translateX(5px);
      background: #f0f7ff;
    }
    
    .trending-product img {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 8px;
    }
    
    .trending-product-info {
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    
    .trending-product-title {
      font-weight: 500;
      font-size: 0.9rem;
      margin-bottom: 5px;
    }
    
    .trending-product-price {
      font-weight: bold;
      color: #007bff;
      font-size: 1rem;
    }
    
    .recommendation-product-card .btn-buy {
      width: 100%;
      padding: 8px;
      font-size: 0.9rem;
    }
    
    @media (max-width: 768px) {
      .recommendation-products {
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 10px;
      }
      
      .recommendation-product-card img {
        height: 140px;
      }
      
      .recommendation-product-info h4 {
        height: 35px;
        font-size: 0.85rem;
      }
      
      .search-tags {
        justify-content: center;
      }
      
      .search-tag {
        font-size: 0.85rem;
        padding: 6px 12px;
      }
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .recommendation-block {
      animation: fadeIn 0.5s ease-out;
    }
  `;
  document.head.appendChild(style);
}

function initRecommendationSystem() {
  addRecommendationStyles();
  initUserBehavior();
  
  if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
    setTimeout(renderAllRecommendations, 1000);
  }
}

// ===== ФУНКЦІЯ ДЛЯ ПЕРЕВІРКИ ПОСТАЧАЛЬНИКІВ В КОШИКУ =====
function getCartSuppliers() {
  const suppliers = new Set();
  
  for (const [productId, quantity] of Object.entries(cart)) {
    const product = products.find(p => p.id === productId);
    if (product && product.source) {
      suppliers.add(SUPPLIER_NAMES[product.source] || product.source);
    }
  }
  
  return suppliers;
}

// ===== ОНОВЛЕНА ФУНКЦІЯ ДОДАВАННЯ В КОШИК =====
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  
  if (!cart[productId]) {
    cart[productId] = 0;
  }
  cart[productId]++;
  
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  
  trackUserBehavior('add_to_cart', productId);
  
  updateCartCount();
  
  // Перевіряємо, скільки постачальників тепер в кошику
  const suppliers = getCartSuppliers();
  
  let message = "Товар додано до кошика";
  
  if (suppliers.size > 1 && product) {
    message += `. Увага! Товари від ${suppliers.size} різних постачальників. Кожен відправляє окрему посилку.`;
  }
  
  showNotification(message);
}

// ===== ОНОВЛЕНА ФУНКЦІЯ ВІДКРИТТЯ КОШИКА =====
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
      <div id="cart-suggestions" class="recommendation-container"></div>
    `;
    renderCartSuggestions('cart-suggestions');
  } else {
    let total = 0;
    let cartItemsHTML = '';
    
    // Визначаємо постачальників товарів в кошику
    const suppliers = getCartSuppliers();
    
    // Інформаційне повідомлення, якщо товари від різних постачальників
    let supplierWarning = '';
    if (suppliers.size > 1) {
      supplierWarning = `
        <div class="supplier-warning">
          <i class="fas fa-info-circle"></i>
          <div class="warning-content">
            <strong>Увага!</strong> Товари в кошику від <strong>${suppliers.size} різних постачальників</strong>.
            <br>Кожен постачальник відправляє товари окремою посилкою.
            <br>Доставка та упаковка розраховуються окремо для кожної посилки.
          </div>
        </div>
      `;
    }
    
    // Групуємо товари за постачальниками
    const itemsBySupplier = {};
    
    for (const [productId, quantity] of Object.entries(cart)) {
      const product = products.find(p => p.id === productId);
      if (product) {
        const itemTotal = product.price * quantity;
        total += itemTotal;
        
        const supplierName = SUPPLIER_NAMES[product.source] || 'Невідомий постачальник';
        
        if (!itemsBySupplier[supplierName]) {
          itemsBySupplier[supplierName] = [];
        }
        
        itemsBySupplier[supplierName].push({
          product,
          quantity,
          itemTotal
        });
      }
    }
    
    // Формуємо HTML з групуванням за постачальниками
    for (const [supplierName, items] of Object.entries(itemsBySupplier)) {
      cartItemsHTML += `
        <div class="supplier-section">
          <div class="supplier-header">
            <i class="fas fa-truck"></i>
            <h4>${supplierName}</h4>
            <span class="supplier-badge">Окрема посилка</span>
          </div>
      `;
      
      items.forEach(({product, quantity, itemTotal}) => {
        cartItemsHTML += `
          <div class="cart-item">
            <img src="${product.image || 'https://via.placeholder.com/80x80?text=No+Image'}" alt="${product.title}" class="cart-item-image">
            <div class="cart-item-details">
              <h4 class="cart-item-title">${product.title}</h4>
              <div class="cart-item-price">${formatPrice(product.price)} ₴ x ${quantity} = ${formatPrice(itemTotal)} ₴</div>
              <div class="cart-item-actions">
                <button class="btn" onclick="changeCartQuantity('${product.id}', -1)">-</button>
                <span>${quantity}</span>
                <button class="btn" onclick="changeCartQuantity('${product.id}', 1)">+</button>
                <button class="btn" onclick="removeFromCart('${product.id}')"><i class="fas fa-trash"></i></button>
              </div>
            </div>
          </div>
        `;
      });
      
      cartItemsHTML += `</div>`;
    }
    
    modalContent.innerHTML = `
      <button class="modal-close" onclick="closeModal()" aria-label="Закрити"><i class="fas fa-times" aria-hidden="true"></i></button>
      <h3>Кошик</h3>
      ${supplierWarning}
      <div class="cart-items">
        ${cartItemsHTML}
      </div>
      <div class="cart-footer">
        <div class="cart-summary">
          <div class="suppliers-count">
            <i class="fas fa-boxes"></i>
            Кількість посилок: <strong>${suppliers.size}</strong>
          </div>
          <div class="cart-total">Сума товарів: ${formatPrice(total)} ₴</div>
          <p class="delivery-note">*Вартість доставки розраховується окремо для кожної посилки</p>
        </div>
        <button class="btn btn-buy" onclick="checkout()">Оформити замовлення</button>
      </div>
      <div id="cart-suggestions" class="recommendation-container"></div>
    `;
    
    renderCartSuggestions('cart-suggestions');
  }
  
  openModal();
  setTimeout(optimizeModalForMobile, 100);
}

// ===== ОНОВЛЕНА ФУНКЦІЯ ОФОРМЛЕННЯ ЗАМОВЛЕННЯ =====
function checkout() {
  if (!currentUser) {
    closeModal();
    openAuthModal();
    showNotification("Для оформлення замовлення необхідно авторизуватися", "warning");
    return;
  }

  const modalContent = document.getElementById("modal-content");
  
  // Перевіряємо постачальників
  const suppliers = getCartSuppliers();
  
  let supplierWarning = '';
  if (suppliers.size > 1) {
    supplierWarning = `
      <div class="supplier-warning">
        <i class="fas fa-info-circle"></i>
        <div class="warning-content">
          <strong>Увага!</strong> Ваше замовлення містить товари від <strong>${suppliers.size} різних постачальників</strong>.
          <br>• Кожен постачальник відправляє товари окремою посилкою
          <br>• Доставка розраховується окремо для кожної посилки
          <br>• Ви отримаєте окремі ТТН-номери для кожної посилки
        </div>
      </div>
    `;
  }
  
  modalContent.innerHTML = `
    <button class="modal-close" onclick="closeModal()" aria-label="Закрити"><i class="fas fa-times" aria-hidden="true"></i></button>
    <h3>Оформлення замовлення</h3>
    ${supplierWarning}
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
      
      <div class="form-group">
        <label>Коментар до замовлення (необов'язково)</label>
        <textarea id="order-comment" placeholder="Ваші побажання щодо замовлення..." rows="3"></textarea>
      </div>
      
      <div class="order-summary">
        <h4>Ваше замовлення</h4>
        <div class="order-items">
          ${generateOrderSummary()}
        </div>
        <div class="suppliers-summary">
          <i class="fas fa-boxes"></i>
          Постачальників у замовленні: <strong>${suppliers.size}</strong>
          ${suppliers.size > 1 ? '<span class="multiple-parcels">(Кілька посилок)</span>' : ''}
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

function initApp() {
  emailjs.init(EMAILJS_USER_ID);
  
  initEnhancedSearch();
  initRecommendationSystem();
  addAdStyles();
  
  // Додаємо стилі для постачальників
  const supplierStyles = document.createElement('style');
  supplierStyles.textContent = `
    /* Стилі для відображення постачальників у кошику */
    .supplier-warning {
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 8px;
      padding: 12px 15px;
      margin-bottom: 20px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    
    .supplier-warning i {
      color: #f39c12;
      font-size: 1.2rem;
      margin-top: 2px;
    }
    
    .supplier-warning .warning-content {
      flex: 1;
      font-size: 0.9rem;
      line-height: 1.4;
    }
    
    .supplier-section {
      margin-bottom: 25px;
      border: 1px solid #e0e0e0;
      border-radius: 10px;
      overflow: hidden;
    }
    
    .supplier-header {
      background: #f8f9fa;
      padding: 12px 15px;
      display: flex;
      align-items: center;
      gap: 10px;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .supplier-header i {
      color: #3498db;
    }
    
    .supplier-header h4 {
      margin: 0;
      flex: 1;
      font-size: 1rem;
      color: #2c3e50;
    }
    
    .supplier-badge {
      background: #3498db;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    
    .cart-summary {
      margin-bottom: 15px;
    }
    
    .suppliers-count {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
      font-size: 0.95rem;
      color: #555;
    }
    
    .suppliers-count i {
      color: #3498db;
    }
    
    .delivery-note {
      font-size: 0.8rem;
      color: #7f8c8d;
      margin-top: 8px;
      font-style: italic;
    }
    
    .suppliers-summary {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 15px 0;
      padding: 10px;
      background: #f8f9fa;
      border-radius: 8px;
      font-size: 0.95rem;
    }
    
    .suppliers-summary i {
      color: #3498db;
    }
    
    .multiple-parcels {
      margin-left: auto;
      color: #e74c3c;
      font-weight: 600;
      font-size: 0.85rem;
    }
  `;
  document.head.appendChild(supplierStyles);
  
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
        renderProducts();
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

  setTimeout(() => {
    document.getElementById('mobile-price-min').value = document.getElementById('price-min').value;
    document.getElementById('mobile-price-max').value = document.getElementById('price-max').value;
    document.getElementById('mobile-brand').value = document.getElementById('brand').value;
    document.getElementById('mobile-availability').value = document.getElementById('availability').value;
    document.getElementById('mobile-sort').value = document.getElementById('sort').value;
  }, 1000);
}

function toggleMobileFilters() {
    const mobileFilters = document.getElementById('mobile-filters');
    mobileFilters.classList.toggle('active');
    
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
    document.getElementById('price-min').value = document.getElementById('mobile-price-min').value;
    document.getElementById('price-max').value = document.getElementById('mobile-price-max').value;
    document.getElementById('brand').value = document.getElementById('mobile-brand').value;
    document.getElementById('availability').value = document.getElementById('mobile-availability').value;
    document.getElementById('sort').value = document.getElementById('mobile-sort').value;
    
    applyFilters();
    closeMobileFilters();
}

function resetMobileFilters() {
    document.getElementById('mobile-price-min').value = '';
    document.getElementById('mobile-price-max').value = '';
    document.getElementById('mobile-brand').value = '';
    document.getElementById('mobile-availability').value = '';
    document.getElementById('mobile-sort').value = 'default';
    
    resetFilters();
    closeMobileFilters();
}

function loadProducts() {
  isProductsLoading = true;
  renderProducts();
  
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
      showNotification("", );
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

function changePage(page) {
  currentPage = page;
  
  // Сбрасываем показанные баннеры при переходе на первую страницу
  if (page === 1) {
    resetShownBanners();
  }
  
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
        if (a.isNew && !b.isNew) return -1;
        if (!a.isNew && b.isNew) return 1;
        
        return 0;
      });
      break;
  }
  
  return filteredProducts;
}

function renderProducts() {
  const grid = document.getElementById("product-grid");
  if (!grid) return;
  
  grid.innerHTML = '';
  
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
  
  setTimeout(() => {
    if (currentPage === 1 && canShowAds()) {
      insertAdsIntoProductGrid();
    }
  }, 100);
  
  updatePagination();
}

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

    categoriesHTML += `
        <div class="category-item active" onclick="selectCategory('')">
            Всі категорії
            <span class="category-count">${products.length}</span>
        </div>
    `;

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

function formatPrice(price) {
  return new Intl.NumberFormat('uk-UA').format(price);
}

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

function updateCartCount() {
  const count = Object.values(cart).reduce((total, qty) => total + qty, 0);
  document.getElementById("cart-count").textContent = count;
}

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
  
  // Сбрасываем показанные баннеры при применении фильтров
  resetShownBanners();
  
  if (isProductsLoading) {
    showEnhancedLoadingSkeleton();
  } else {
    renderProducts();
  }
  
  const filteredProducts = getFilteredProducts();
  if (!isProductsLoading) {
    document.getElementById('products-count').textContent = `Знайдено: ${filteredProducts.length}`;
  }
  
  closeMobileFilters();
}

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
    
    <div id="related-products" class="recommendation-container"></div>
  `;
  
  loadReviews(product.id);
  renderRelatedProducts(productId, 'related-products');
  
  trackUserBehavior('view', productId);
  
  currentRating = 0;
  updateRatingStars();
  
  openModal();
  setTimeout(optimizeModalForMobile, 100);
}

function setRating(rating) {
  currentRating = rating;
  updateRatingStars();
}

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

function addToCartWithQuantity(productId) {
  const quantity = parseInt(document.getElementById("product-quantity").value) || 1;
  
  if (!cart[productId]) {
    cart[productId] = 0;
  }
  cart[productId] += quantity;
  
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  
  trackUserBehavior('add_to_cart', productId);
  
  updateCartCount();
  showNotification("Товар додано до кошика");
  closeModal();
}

function changeQuantity(delta) {
  const input = document.getElementById("product-quantity");
  let value = parseInt(input.value) || 1;
  value += delta;
  
  if (value < 1) value = 1;
  
  input.value = value;
}

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

function removeFromCart(productId) {
  delete cart[productId];
  
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  
  updateCartCount();
  openCart();
}

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
  const comment = document.getElementById('order-comment') ? document.getElementById('order-comment').value.trim() : '';
  
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
    comment: comment,
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

function calculateCartTotal() {
  return Object.entries(cart).reduce((sum, [productId, quantity]) => {
    const product = products.find(p => p.id === productId);
    return sum + (product ? product.price * quantity : 0);
  }, 0);
}

function showOrderConfirmation(orderId, order) {
  const modalContent = document.getElementById("modal-content");
  
  const commentSection = order.comment ? `
    <div class="comment-section" style="margin: 1rem 0; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
      <h4>Ваш коментар:</h4>
      <p>"${order.comment}"</p>
    </div>
  ` : '';
  
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
        <p><strong>Відділення:</strong> ${order.delivery.warehouse}</p>
        <p><strong>Спосіб оплати:</strong> ${order.paymentMethod === 'cash' ? 'Готівкою при отриманні' : 'Онлайн-оплата карткою'}</p>
        <p><strong>Сума товарів:</strong> ${formatPrice(order.total)} ₴</p>
        
        ${commentSection}
        
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

function openModal() {
  document.getElementById("modal").classList.add("active");
}

function closeModal() {
  const modal = document.getElementById("modal");
  modal.classList.remove("active");
  modal.classList.remove("mobile-modal");
  document.body.style.overflow = '';
  
  if (window.currentOrdersUnsubscribe) {
    window.currentOrdersUnsubscribe();
    window.currentOrdersUnsubscribe = null;
  }
}

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
    
    <div class="social-auth">
      <button class="btn btn-google" onclick="signInWithGoogle()">
        <i class="fab fa-google"></i> Увійти через Google
      </button>
      <div class="auth-divider">
        <span>або</span>
      </div>
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

function switchAuthTab(tab) {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const adminForm = document.getElementById("admin-auth-form");
  const tabs = document.querySelectorAll(".auth-tab");
  const socialAuth = document.querySelector(".social-auth");
  
  tabs.forEach(tab => tab.classList.remove('active'));
  
  if (tab === 'login') {
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    adminForm.style.display = 'none';
    socialAuth.style.display = 'block';
    tabs[0].classList.add('active');
  } else if (tab === 'register') {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    adminForm.style.display = 'none';
    socialAuth.style.display = 'block';
    tabs[1].classList.add('active');
  } else if (tab === 'admin') {
    loginForm.style.display = 'none';
    registerForm.style.display = 'none';
    adminForm.style.display = 'block';
    socialAuth.style.display = 'none';
    tabs[2].classList.add('active');
  }
}

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

function register(event) {
  event.preventDefault();
  const name = event.target.querySelector('input[type="text"]').value;
  const email = event.target.querySelector('input[type="email"]').value;
  const password = event.target.querySelector('input[type="password"]').value;
  
  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
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

function verifyAdminPassword() {
  const password = document.getElementById("admin-password").value;
  if (password === ADMIN_PASSWORD) {
    if (!currentUser) {
      showNotification("Спочатку увійдіть в систему", "error");
      switchAuthTab('login');
      return;
    }
    
    const adminRef = db.collection("admins").doc(currentUser.uid);
    adminRef.set({
      email: currentUser.email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
      const admins = JSON.parse(localStorage.getItem(ADMINS_STORAGE_KEY) || '{}');
      admins[currentUser.uid] = true;
      localStorage.setItem(ADMINS_STORAGE_KEY, JSON.stringify(admins));
      
      document.getElementById("admin-panel").style.display = "block";
      adminMode = true;
      showNotification("Права адміністратора отримані");
      closeModal();
      
      loadAdminOrders();
      
      document.getElementById("page-views-container").style.display = "block";
      setupPageCounter();
      
      addReviewsTabIfNotExists();
    })
    .catch((error) => {
      console.error("Помилка збереження прав адміністратора: ", error);
      showNotification("Помилка збереження прав адміністратора", "error");
    });
  } else {
    showNotification("Невірний пароль адміністратора", "error");
  }
}

function promptAdminPassword() {
  const password = prompt("Введіть пароль адміністратора:");
  if (password === ADMIN_PASSWORD) {
    if (!currentUser) {
      showNotification("Спочатку увійдіть в систему", "error");
      openAuthModal();
      return;
    }
    
    const adminRef = db.collection("admins").doc(currentUser.uid);
    adminRef.set({
      email: currentUser.email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
      const admins = JSON.parse(localStorage.getItem(ADMINS_STORAGE_KEY) || '{}');
      admins[currentUser.uid] = true;
      localStorage.setItem(ADMINS_STORAGE_KEY, JSON.stringify(admins));
      
      document.getElementById("admin-panel").style.display = "block";
      adminMode = true;
      showNotification("Права адміністратора отримані");
      
      loadAdminOrders();
      
      document.getElementById("page-views-container").style.display = "block";
      setupPageCounter();
      
      addReviewsTabIfNotExists();
    })
    .catch((error) => {
      console.error("Помилка збереження прав адміністратора: ", error);
      showNotification("Помилка збереження прав адміністратора", "error");
    });
  } else if (password) {
    showNotification("Невірний пароль адміністратора", "error");
  }
}

function checkAdminStatus(userId) {
  db.collection("admins").doc(userId).get()
    .then((doc) => {
      if (doc.exists) {
        document.getElementById("admin-panel").style.display = "block";
        adminMode = true;
        loadAdminOrders();
        
        document.getElementById("page-views-container").style.display = "block";
        setupPageCounter();
        
        addReviewsTabIfNotExists();
      }
    })
    .catch((error) => {
      console.error("Помилка перевірки прав адміністратора: ", error);
    });
}

function logout() {
  auth.signOut()
    .then(() => {
      showNotification("Вихід виконано успішно");
    })
    .catch(error => {
      console.error("Помилка виходу: ", error);
      showNotification("Помилка виходу", "error");
    });
}

function switchTab(tabId) {
  const tabs = document.querySelectorAll(".tab");
  const tabContents = document.querySelectorAll(".tab-content");
  
  tabs.forEach(tab => tab.classList.remove("active"));
  tabContents.forEach(content => content.classList.remove("active"));
  
  document.querySelector(`.tab[onclick="switchTab('${tabId}')"]`).classList.add("active");
  document.getElementById(tabId).classList.add("active");
  
  if (tabId === 'products-tab') {
    loadAdminProducts();
  }
  
  if (tabId === 'orders-tab') {
    loadAdminOrders();
  }
  
  if (tabId === 'reviews-tab-content') {
    loadReviewsForModeration();
  }
}

function loadAdminOrders() {
  const ordersList = document.getElementById("admin-orders-list");
  ordersList.innerHTML = '<p>Завантаження замовлень...</p>';
  
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
            ${order.comment ? `<p><strong>Коментар:</strong> ${order.comment}</p>` : ''}
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
      
      db.collection("orders").doc(orderId).get()
        .then((doc) => {
          if (doc.exists) {
            const order = { id: doc.id, ...doc.data() };
            sendTTNEmail(orderId, order);
          }
        });
      
      loadAdminOrders();
    })
    .catch((error) => {
      console.error("Помилка додавання ТТН: ", error);
      showNotification("Помилка додавання ТТН", "error");
    });
  }
}

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

  emailjs.send(EMAILJS_SERVICE_ID, "template_ttn_notification", templateParams)
    .then(function(response) {
      console.log('Email с ТТН успешно отправлен!', response.status, response.text);
    }, function(error) {
      console.error('Ошибка отправки email с ТТН:', error);
    });
}

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
      
      const commentSection = order.comment ? `
        <div class="comment-section" style="margin: 1rem 0; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
          <h4>Коментар клієнта:</h4>
          <p>"${order.comment}"</p>
        </div>
      ` : '';
      
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
      
      const cancelButton = !adminMode && order.status === 'new' ? `
        <div style="margin: 1rem 0;">
          <button class="btn btn-danger" onclick="cancelOrder('${order.id}')" style="background: #e74c3c; color: white; padding: 10px 20px;">
            <i class="fas fa-times"></i> Скасувати замовлення
          </button>
          <p style="font-size: 0.9em; color: #666; margin-top: 5px;">
            Ви можете скасувати замовлення, доки воно не передане в обробку
          </p>
        </div>
      ` : '';
      
      modalContent.innerHTML = `
        <button class="modal-close" onclick="closeModal()" aria-label="Закрити"><i class="fas fa-times" aria-hidden="true"></i></button>
        <h3>Деталі замовлення #${order.id}</h3>
        <div class="order-details">
          ${ttnSection}
          ${ttnButton}
          ${cancelButton}
          ${commentSection}
          
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

function cancelOrder(orderId) {
    if (!currentUser) {
        showNotification("Увійдіть в систему для скасування замовлення", "warning");
        return;
    }
    
    if (!confirm("Ви впевнені, що хочете скасувати це замовлення?")) {
        return;
    }

    showNotification("Скасування замовлення...", "info");

    db.collection("orders").doc(orderId).get()
        .then((doc) => {
            if (!doc.exists) {
                showNotification("Замовлення не знайдено", "error");
                return;
            }
            
            const order = doc.data();
            
            if (!adminMode && order.userId !== currentUser.uid) {
                showNotification("Ви не можете скасувати це замовлення", "error");
                return;
            }
            
            if (order.status !== 'new') {
                showNotification("Неможливо скасувати замовлення з поточним статусом: " + getStatusText(order.status), "error");
                return;
            }
            
            return performOrderCancellation(orderId, order);
        })
        .then(() => {
            showNotification("Замовлення успішно скасовано");
            
            setTimeout(() => {
                if (adminMode) {
                    loadAdminOrders();
                } else {
                    closeModal();
                    viewOrders();
                }
            }, 1000);
        })
        .catch((error) => {
            console.error("Помилка скасування замовлення: ", error);
            showNotification("Помилка скасування замовлення", "error");
        });
}

function performOrderCancellation(orderId, order) {
    const updateData = {
        status: 'cancelled',
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        cancelledAt: firebase.firestore.FieldValue.serverTimestamp(),
        cancelledBy: adminMode ? 'admin' : 'user',
        cancelledById: currentUser.uid
    };
    
    return db.collection("orders").doc(orderId).update(updateData);
}

function saveFeedUrl() {
  const feedUrl = document.getElementById("feed-url").value;
  localStorage.setItem(FEED_URL_KEY, feedUrl);
  showNotification("URL фіду збережено");
}

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

function generateId() {
  return 'product-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

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

function showEnhancedLoadingSkeleton() {
  const grid = document.getElementById("product-grid");
  if (!grid) return;
  
  grid.innerHTML = '';
  
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

function openProfile() {
    if (!currentUser) {
        openAuthModal();
        showNotification("Увійдіть в систему для перегляду профілю", "warning");
        return;
    }

    const modalContent = document.getElementById("modal-content");
    modalContent.innerHTML = `
        <button class="modal-close" onclick="closeModal()" aria-label="Закрити"><i class="fas fa-times" aria-hidden="true"></i></button>
        <h3>Профіль користувача</h3>
        <div class="profile-container">
            <div class="profile-info">
                <div class="profile-avatar">
                    <i class="fas fa-user-circle"></i>
                </div>
                <div class="profile-details">
                    <p><strong>Ім'я:</strong> <span id="profile-display-name">${currentUser.displayName || 'Не вказано'}</span></p>
                    <p><strong>Email:</strong> <span id="profile-email">${currentUser.email || 'Не вказано'}</span></p>
                    <p><strong>ID:</strong> <span id="profile-uid">${currentUser.uid}</span></p>
                    <p><strong>Дата реєстрації:</strong> <span id="profile-created">${currentUser.metadata.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString('uk-UA') : 'Невідомо'}</span></p>
                </div>
            </div>
            
            <div class="profile-actions">
                <h4>Налаштування профілю</h4>
                <form onsubmit="updateProfile(event)">
                    <div class="form-group">
                        <label>Ім'я та прізвище</label>
                        <input type="text" id="profile-name-input" value="${currentUser.displayName || ''}" placeholder="Введіть ваше ім'я">
                    </div>
                    <div class="form-group">
                        <label>Новий пароль</label>
                        <input type="password" id="profile-password-input" placeholder="Залиште порожнім, щоб не змінювати">
                    </div>
                    <button type="submit" class="btn btn-detail">Оновити профіль</button>
                </form>
            </div>
            
            <div class="profile-stats">
                <h4>Статистика</h4>
                <div class="stats-grid">
                    <div class="stat-item">
                        <i class="fas fa-shopping-cart"></i>
                        <span class="stat-value" id="profile-orders-count">0</span>
                        <span class="stat-label">Замовлень</span>
                    </div>
                    <div class="stat-item">
                        <i class="far fa-heart"></i>
                        <span class="stat-value" id="profile-favorites-count">${Object.keys(favorites).length}</span>
                        <span class="stat-label">Обраних товарів</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    loadUserOrderStats();
    
    openModal();
    setTimeout(optimizeModalForMobile, 100);
}

function updateProfile(event) {
    event.preventDefault();
    
    const newName = document.getElementById('profile-name-input').value.trim();
    const newPassword = document.getElementById('profile-password-input').value.trim();
    
    const promises = [];
    
    if (newName && newName !== currentUser.displayName) {
        promises.push(
            currentUser.updateProfile({
                displayName: newName
            })
        );
    }
    
    if (newPassword) {
        promises.push(
            currentUser.updatePassword(newPassword)
        );
    }
    
    if (promises.length === 0) {
        showNotification("Немає змін для оновлення", "info");
        return;
    }
    
    Promise.all(promises)
        .then(() => {
            showNotification("Профіль успішно оновлено");
            document.getElementById('user-name').textContent = newName || currentUser.email;
            document.getElementById('profile-display-name').textContent = newName || 'Не вказано';
            closeModal();
        })
        .catch(error => {
            console.error("Помилка оновлення профілю: ", error);
            let errorMessage = "Помилка оновлення профілю";
            
            switch (error.code) {
                case 'auth/requires-recent-login':
                    errorMessage = "Для зміни пароля потрібно повторно увійти в систему";
                    break;
                case 'auth/weak-password':
                    errorMessage = "Пароль занадто слабкий";
                    break;
            }
            
            showNotification(errorMessage, "error");
        });
}

function loadUserOrderStats() {
    if (!currentUser) return;
    
    db.collection("orders")
        .where("userId", "==", currentUser.uid)
        .get()
        .then((querySnapshot) => {
            const ordersCount = querySnapshot.size;
            document.getElementById('profile-orders-count').textContent = ordersCount;
        })
        .catch((error) => {
            console.error("Помишка завантаження статистики замовлень: ", error);
        });
}

function getOrderStatusInfo(status) {
    const statusMap = {
        'new': { class: 'status-new', text: 'Новий', icon: 'fas fa-clock' },
        'processing': { class: 'status-processing', text: 'В обробці', icon: 'fas fa-cog' },
        'shipped': { class: 'status-shipped', text: 'Відправлено', icon: 'fas fa-shipping-fast' },
        'delivered': { class: 'status-delivered', text: 'Доставлено', icon: 'fas fa-check-circle' },
        'cancelled': { class: 'status-cancelled', text: 'Скасовано', icon: 'fas fa-times-circle' }
    };
    
    return statusMap[status] || statusMap['new'];
}

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
        <div class="user-orders-container">
            <div id="user-orders-list" style="max-height: 60vh; overflow-y: auto;"></div>
        </div>
    `;
    
    const ordersList = document.getElementById("user-orders-list");
    ordersList.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Завантаження замовлень...</div>';
    
    const unsubscribe = db.collection("orders")
        .where("userId", "==", currentUser.uid)
        .orderBy("createdAt", "desc")
        .onSnapshot((querySnapshot) => {
            if (querySnapshot.empty) {
                ordersList.innerHTML = `
                    <div class="empty-orders">
                        <i class="fas fa-box-open"></i>
                        <h4>У вас немає замовлень</h4>
                        <p>Після оформлення замовлення воно з'явиться тут</p>
                        <button class="btn btn-detail" onclick="closeModal(); applyFilters();">Перейти до товарів</button>
                    </div>
                `;
                return;
            }
            
            let ordersHTML = '';
            querySnapshot.forEach((doc) => {
                const order = { id: doc.id, ...doc.data() };
                const orderDate = order.createdAt ? order.createdAt.toDate().toLocaleString('uk-UA') : 'Дата не вказана';
                const statusInfo = getOrderStatusInfo(order.status);
                
                const ttnSection = order.ttn ? `
                    <div class="order-ttn-info">
                        <p><strong>ТТН:</strong> ${order.ttn}</p>
                        <a href="https://tracking.novaposhta.ua/#/uk/search/${order.ttn}" target="_blank" class="track-link">
                            <i class="fas fa-external-link-alt"></i> Відстежити посилку
                        </a>
                    </div>
                ` : '';
                
                const commentSection = order.comment ? `
                    <div class="order-comment">
                        <p><strong>Ваш коментар:</strong> "${order.comment}"</p>
                    </div>
                ` : '';
                
                const cancelButton = order.status === 'new' ? `
                    <button class="btn btn-danger" onclick="cancelOrder('${order.id}')">
                        <i class="fas fa-times"></i> Скасувати
                    </button>
                ` : '';
                
                ordersHTML += `
                    <div class="user-order-item">
                        <div class="order-header">
                            <div class="order-main-info">
                                <h4>Замовлення #${order.id}</h4>
                                <span class="order-date">${orderDate}</span>
                            </div>
                            <div class="order-status-badge ${statusInfo.class}">
                                <i class="${statusInfo.icon}"></i>
                                ${statusInfo.text}
                            </div>
                        </div>
                        
                        <div class="order-summary">
                            <p><strong>Сума:</strong> ${formatPrice(order.total)} ₴</p>
                            <p><strong>Доставка:</strong> ${order.delivery.service}</p>
                            <p><strong>Оплата:</strong> ${order.paymentMethod === 'cash' ? 'Готівкою при отриманні' : 'Онлайн-оплата карткою'}</p>
                        </div>
                        
                        ${commentSection}
                        ${ttnSection}
                        
                        <div class="order-actions">
                            <button class="btn btn-detail" onclick="viewOrderDetails('${order.id}')">
                                <i class="fas fa-eye"></i> Деталі
                            </button>
                            ${cancelButton}
                        </div>
                    </div>
                `;
            });
            
            ordersList.innerHTML = ordersHTML;
        }, (error) => {
            console.error("Помилка завантаження замовлень: ", error);
            ordersList.innerHTML = '<div class="error-message"><i class="fas fa-exclamation-triangle"></i> Помилка завантаження замовлень</div>';
        });
    
    window.currentOrdersUnsubscribe = unsubscribe;
    
    openModal();
    setTimeout(optimizeModalForMobile, 100);
}

function addReviewsTabIfNotExists() {
    const adminTabs = document.querySelector('.admin-tabs');
    if (!adminTabs) return;
    
    const existingReviewsTab = adminTabs.querySelector('[onclick*="reviews-tab-content"]');
    if (existingReviewsTab) return;
    
    const reviewsTab = document.createElement('div');
    reviewsTab.className = 'tab';
    reviewsTab.setAttribute('onclick', "switchTab('reviews-tab-content')");
    reviewsTab.innerHTML = '<i class="fas fa-comments"></i> Модерація відгуків';
    adminTabs.appendChild(reviewsTab);
    
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

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function adjustHeaderTitle() {
  const headerTitle = document.querySelector('.header-title');
  if (window.innerWidth <= 768) {
    headerTitle.textContent = 'InstruForge';
  } else {
    headerTitle.textContent = 'InstruForge - Інструменти та обладнання';
  }
}

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
        'products5.json': 'Колекційні сувеніри та моделі',
        'products6.json': 'Швидкий ремонт'
    };
    
    document.getElementById('products-title').textContent = titles[source] || 'Товари';
    
    applyFilters();
}

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

document.addEventListener('DOMContentLoaded', function() {
  initApp();
  
  emailjs.init(EMAILJS_USER_ID);
  
  document.getElementById('mobile-menu-btn').addEventListener('click', function() {
    document.getElementById('mobile-menu').classList.toggle('active');
  });
  
  document.getElementById('mobile-menu-close').addEventListener('click', function() {
    document.getElementById('mobile-menu').classList.remove('active');
  });
  
  document.getElementById('mobile-filters-close').addEventListener('click', closeMobileFilters);
  document.getElementById('mobile-filters-apply').addEventListener('click', applyMobileFilters);
  document.getElementById('mobile-filters-reset').addEventListener('click', resetMobileFilters);
  
  document.querySelectorAll('#mobile-menu a').forEach(link => {
    link.addEventListener('click', () => {
      document.getElementById('mobile-menu').classList.remove('active');
    });
  });
  
  if (!document.getElementById('mobile-filters-styles')) {
    const style = document.createElement('style');
    style.id = 'mobile-filters-styles';
    style.textContent = `
      .mobile-filters {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: white;
        z-index: 1000;
        transform: translateX(-100%);
        transition: transform 0.3s ease;
        overflow-y: auto;
        padding: 20px;
      }
      
      .mobile-filters.active {
        transform: translateX(0);
      }
      
      .mobile-filters-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid #eee;
      }
      
      .mobile-filters-body {
        margin-bottom: 20px;
      }
      
      .mobile-filters-footer {
        position: sticky;
        bottom: 0;
        background: white;
        padding: 15px 0;
        border-top: 1px solid #eee;
        display: flex;
        gap: 10px;
      }
      
      .mobile-filters-footer .btn {
        flex: 1;
      }
    `;
    document.head.appendChild(style);
  }
});

function updatePageTitle() {
  const category = currentFilters.category;
  const search = currentFilters.search;
  
  let title = 'InstruForge - Інструменти та обладнання';
  
  if (search) {
    title = `Пошук: "${search}" - InstruForge`;
  } else if (category) {
    title = `${translateCategory(category)} - InstruForge`;
  } else if (showingFavorites) {
    title = 'Обрані товари - InstruForge';
  }
  
  document.title = title;
}

const originalApplyFilters = applyFilters;
applyFilters = function() {
  originalApplyFilters();
  updatePageTitle();
};

const originalToggleFavorites = toggleFavorites;
toggleFavorites = function() {
  originalToggleFavorites();
  updatePageTitle();
};

function openRules() {
    const modal = document.getElementById("rules-modal");
    modal.classList.add("active");
    document.body.style.overflow = 'hidden';
}

function closeRulesModal() {
    const modal = document.getElementById("rules-modal");
    modal.classList.remove("active");
    document.body.style.overflow = '';
}

document.addEventListener('click', function(e) {
    const rulesModal = document.getElementById("rules-modal");
    if (e.target === rulesModal) {
        closeRulesModal();
    }
});

document.addEventListener('keydown', function(e) {
    const rulesModal = document.getElementById("rules-modal");
    if (e.key === 'Escape' && rulesModal.classList.contains('active')) {
        closeRulesModal();
    }
});