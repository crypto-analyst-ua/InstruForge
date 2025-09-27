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
    'products5.json'
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

// Додаємо змінні для покращеного пошуку
let searchTimeout = null;
const SEARCH_DELAY = 300; // Затримка в мс

// ====== ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ ПОИСКА ======

// Кэширование результатов поиска
const searchCache = new Map();

function clearSearchCache() {
  searchCache.clear();
}

// Нормализация поискового запроса (поддержка кириллицы/укр. символов)
function normalizeSearchTerm(term) {
  return term.toLowerCase()
    .replace(/[ї]/g, 'і')
    .replace(/[ъь]/g, '')
    .trim();
}

// Очистка таймера при закрытии страницы
function cleanupSearch() {
  clearTimeout(searchTimeout);
  searchTimeout = null;
}

window.addEventListener('beforeunload', cleanupSearch);

// Улучшенная функция для получения поисковых подсказок
function getSearchSuggestions(query) {
  try {
    if (!query || query.length < 2) return [];
    
    const searchTerm = normalizeSearchTerm(query);
    
    if (searchCache.has(searchTerm)) {
      return searchCache.get(searchTerm);
    }
    
    const suggestions = [];
    const seen = new Set();
    
    products.forEach(product => {
      if (!product || typeof product !== 'object') return;
      if (!product.searchIndex.includes(searchTerm)) return;

      if (product.title) {
        const normalized = normalizeSearchTerm(product.title);
        if (normalized.includes(searchTerm) && !seen.has(product.title)) {
          seen.add(product.title);
          suggestions.push({ value: product.title, type: 'Назва', icon: '📦' });
        }
      }

      if (product.brand) {
        const normalized = normalizeSearchTerm(product.brand);
        if (normalized.includes(searchTerm) && !seen.has(product.brand)) {
          seen.add(product.brand);
          suggestions.push({ value: product.brand, type: 'Бренд', icon: '🏷️' });
        }
      }

      if (product.category) {
        const normalized = normalizeSearchTerm(product.category);
        if (normalized.includes(searchTerm) && !seen.has(product.category)) {
          seen.add(product.category);
          suggestions.push({ value: product.category, type: 'Категорія', icon: '📂' });
        }
      }
    });

    const result = suggestions.slice(0, 5);
    searchCache.set(searchTerm, result);
    return result;
  } catch (error) {
    console.error("Ошибка в поиске:", error);
    return [];
  }
}

// Улучшенная функция для применения подсказки
function applySuggestion(suggestion) {
  document.getElementById('search').value = suggestion;
  currentFilters.search = suggestion;
  applyFilters();
  hideSearchSuggestions();
}

// Оптимизация: предварительная нормализация данных при загрузке
function preprocessProducts(productsArray) {
  return productsArray.map(product => {
    if (!product || typeof product !== 'object') return product;
    
    // Создаем поисковый индекс для быстрого поиска
    const searchIndex = normalizeSearchTerm(
      `${product.title || ''} ${product.brand || ''} ${product.category || ''} ${product.description || ''}`
    );
    
    return {
      ...product,
      searchIndex,
      // Безопасные значения по умолчанию для всех полей
      title: product.title || '',
      brand: product.brand || '',
      category: product.category || '',
      description: product.description || '',
      price: product.price || 0,
      image: product.image || '',
      inStock: product.inStock !== undefined ? product.inStock : true
    };
  });
}

let products = [];
let cart = {};
let favorites = {};
let adminMode = false;
let showingFavorites = false;
let currentUser = null;
let currentPage = 1;
const productsPerPage = 12;
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
  // Форматируем список товаров
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
    to_email: "korovinkonstantin0@gmail.com", // Замените на нужный email
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
    const promises = PRODUCT_FILES.map(file => 
        fetch(file)
            .then(response => {
                if (!response.ok) {
                    console.warn(`Файл ${file} не найден, пропускаем`);
                    return []; // Возвращаем пустой массив если файл не найден
                }
                return response.json();
            })
            .then(productsArray => {
                // Добавляем информацию о источнике к каждому товару
                return productsArray.map(product => ({
                    ...product,
                    source: file, // Добавляем источник
                    isPopular: product.isPopular || false // значение по умолчанию
                }));
            })
            .catch(error => {
                console.warn(`Ошибка загрузки файла ${file}:`, error);
                return []; // Возвращаем пустой массив при ошибке
            })
    );

    return Promise.all(promises)
        .then(results => {
            // Объединяем все массивы товаров в один
            let allProducts = [];
            results.forEach(productsArray => {
                if (Array.isArray(productsArray)) {
                    allProducts = allProducts.concat(productsArray);
                }
            });
            
            if (allProducts.length === 0) {
                // Пробуем завантажити з локального сховища
                const backup = localStorage.getItem('products_backup');
                if (backup) {
                    return JSON.parse(backup);
                }
                throw new Error('Не вдалося завантажити товари з жодного файлу');
            }
            
            // ДОДАЄМО ПЕРЕМІШУВАННЯ: перемішуємо товари перед поверненням
            return shuffleArray(allProducts);
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
    
    // Скрываем недоступные вкладки
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
  // Ініціалізація EmailJS
  emailjs.init(EMAILJS_USER_ID);

  // Перевіряємо статус аутентифікації
  auth.onAuthStateChanged(user => {
    if (user) {
      currentUser = user;
      document.getElementById('login-btn').style.display = 'none';
      document.getElementById('user-menu').style.display = 'inline-block';
      document.getElementById('admin-access-btn').style.display = 'inline-block';
      document.getElementById('user-name').textContent = user.displayName || user.email;
      
      // Перевіряємо, чи є користувач адміністратором
      checkAdminStatus(user.uid);
    } else {
      currentUser = null;
      document.getElementById('login-btn').style.display = 'inline-block';
      document.getElementById('user-menu').style.display = 'none';
      document.getElementById('admin-access-btn').style.display = 'none';
      document.getElementById("admin-panel").style.display = "none";
      adminMode = false;
      document.getElementById("page-views-container").style.display = "none";
    }
  });
  
  // Намагаємося завантажити продукти з Firestore
  loadProducts().catch(error => {
    console.error("Помилка завантаження з Firestore, пробуємо завантажити з JSON:", error);
    
    // Якщо не вдалося завантажити з Firestore, пробуємо завантажити з JSON
    loadProductsFromJson()
      .then(jsonProducts => {
        products = preprocessProducts(jsonProducts); // Добавляем предобработку
        updateCartCount();
        renderProducts();
        renderFeaturedProducts();
        renderCategories();
        renderBrands();
        showNotification(`Товари завантажено з ${PRODUCT_FILES.length} файлів`);
        
        // Зберігаємо продукти в localStorage як резервну копію
        localStorage.setItem('products_backup', JSON.stringify(products));
      })
      .catch(jsonError => {
        console.error("JSON:", jsonError);
        showNotification("", "error");
      });
  }).finally(() => {
      // Проверяем доступность файлов
      checkFilesAvailability();
  });
  
  // Завантажуємо обране та кошик з localStorage
  const cartData = localStorage.getItem(CART_STORAGE_KEY);
  if(cartData) cart = JSON.parse(cartData);
  
  const favoritesData = localStorage.getItem(FAVORITES_STORAGE_KEY);
  if(favoritesData) favorites = JSON.parse(favoritesData);
  
  // Завантажуємо налаштування виду
  const viewMode = localStorage.getItem(VIEW_MODE_KEY) || 'grid';
  setViewMode(viewMode);
  
  updateCartCount();
  
  // Завантажуємо збережений URL фіду
  const feedUrl = localStorage.getItem(FEED_URL_KEY);
  if (feedUrl) {
    document.getElementById("feed-url").value = feedUrl;
  }
  
  // Встановлюємо поточний рій у футері
  document.getElementById("year").innerText = new Date().getFullYear();
  
  // Додаємо обробники подій
  // Оновлюємо обробник пошуку
  document.getElementById('search').addEventListener('input', function() {
    // Додаємо дебаунс для оптимізації
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentFilters.search = this.value.trim();
      applyFilters();
      
      // Показуємо/ховаємо підказки
      if (this.value.length > 2) {
        showSearchSuggestions(this.value);
      } else {
        hideSearchSuggestions();
      }
    }, SEARCH_DELAY);
  });
  
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
  
  // Додаємо обробники для фільтрів ціни
  document.getElementById('price-min').addEventListener('change', function() {
    currentFilters.minPrice = this.value ? parseInt(this.value) : null;
    applyFilters();
  });
  
  document.getElementById('price-max').addEventListener('change', function() {
    currentFilters.maxPrice = this.value ? parseInt(this.value) : null;
    applyFilters();
  });
  
  // Обработчик изменения размера окна для адаптации заголовка
  window.addEventListener('resize', adjustHeaderTitle);
  adjustHeaderTitle(); // Вызываем при загрузке
  
  // Додаємо обробник для закриття підказок при кліку поза полем пошуку
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.search-container')) {
      hideSearchSuggestions();
    }
  });

  // Додаємо обробник для закриття підказок при натисканні Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      hideSearchSuggestions();
    }
  });
}

// Функция для адаптации заголовка
function adjustHeaderTitle() {
  const logoElement = document.querySelector('.logo h1');
  if (window.innerWidth <= 768) {
    logoElement.style.fontSize = Math.min(1.5, 4 * window.innerWidth / 100) + 'rem';
  }
}

// Улучшенная функция для показа поисковых подсказок
function showSearchSuggestions(query) {
  if (!query || query.length < 2) return;
  
  const suggestions = getSearchSuggestions(query);
  const searchContainer = document.querySelector('.search-container');
  
  // Створюємо або оновлюємо контейнер підказок
  let suggestionsContainer = document.getElementById('search-suggestions');
  if (!suggestionsContainer) {
    suggestionsContainer = document.createElement('div');
    suggestionsContainer.id = 'search-suggestions';
    suggestionsContainer.className = 'search-suggestions';
    searchContainer.appendChild(suggestionsContainer);
  }
  
  if (suggestions.length > 0) {
    // Безопасное создание элементов через DOM
    suggestionsContainer.innerHTML = ''; // Очищаем
    
    const highlight = (text, query) => {
      const regex = new RegExp(`(${query})`, 'ig');
      return text.replace(regex, '<span class="highlight">$1</span>');
    };
    
    suggestions.forEach(suggestion => {
      const div = document.createElement('div');
      div.className = 'search-suggestion';
      div.innerHTML = `${suggestion.icon} ${highlight(suggestion.value, query)} <span class="suggestion-type">(${suggestion.type})</span>`;
      div.addEventListener('click', () => applySuggestion(suggestion.value));
      suggestionsContainer.appendChild(div);
    });
    suggestionsContainer.style.display = 'block';
  } else {
    suggestionsContainer.style.display = 'none';
  }
}

// Функція для приховування підказок
function hideSearchSuggestions() {
  const suggestionsContainer = document.getElementById('search-suggestions');
  if (suggestionsContainer) {
    suggestionsContainer.style.display = 'none';
  }
}

// Оновлюємо функцію loadProducts для обробки випадку, коли в Firestore немає товарів
function loadProducts() {
  // Перевіряємо кеш перед завантаженням
  const cachedProducts = localStorage.getItem('products_cache');
  const cacheTime = localStorage.getItem('products_cache_time');
  
  if (cachedProducts && cacheTime && Date.now() - cacheTime < 300000) { // 5 хвилин
    products = preprocessProducts(JSON.parse(cachedProducts)); // Добавляем предобработку
    // ДОДАЄМО ПЕРЕМІШУВАННЯ: перемішуємо товари після завантаження з кешу
    products = shuffleArray(products);
    renderProducts();
    return Promise.resolve();
  }
  
  showLoadingSkeleton();
  
  // ЗМІНА: прибираємо сортування з Firestore запиту
  return db.collection("products")
        .get() // було: .orderBy("createdAt", "desc").get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
        // Якщо в Firestore немає товарів, пробуємо завантажити з localStorage
        const data = localStorage.getItem('products_backup');
        if (data) {
          products = preprocessProducts(JSON.parse(data)); // Добавляем предобработку
          // ДОДАЄМО ПЕРЕМІШУВАННЯ: перемішуємо товари
          products = shuffleArray(products);
          updateCartCount();
          renderProducts();
          renderFeaturedProducts();
          renderCategories();
          renderBrands();
          return Promise.resolve();
        } else {
          // Якщо в localStorage теж немає, пробуємо завантажити з JSON
          return loadProductsFromJson()
            .then(jsonProducts => {
              products = preprocessProducts(jsonProducts); // Добавляем предобработку
              // Перемішуємо товари (це вже було і залишаємо)
              products = shuffleArray(products);
              updateCartCount();
              renderProducts();
              renderFeaturedProducts();
              renderCategories();
              renderBrands();
              showNotification("Товари завантажено з локального файлу");
              
              // Зберігаємо продукти в localStorage як резервну копію
              localStorage.setItem('products_backup', JSON.stringify(products));
            });
        }
      } else {
                products = [];
                querySnapshot.forEach((doc) => {
                    products.push({ id: doc.id, ...doc.data() });
                });
                
                // Добавляем предобработку продуктов
                products = preprocessProducts(products);
                // Перемішуємо товари (це вже було)
                products = shuffleArray(products);
        
        // Зберігаємо в кеш
        localStorage.setItem('products_cache', JSON.stringify(products));
        localStorage.setItem('products_cache_time', Date.now());
        
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
      
      // Пробуємо завантажити з localStorage, якщо Firestore недоступний
      const data = localStorage.getItem('products_backup');
      if (data) {
        products = preprocessProducts(JSON.parse(data)); // Добавляем предобработку
        // ДОДАЄМО ПЕРЕМІШУВАННЯ: перемішуємо товари
        products = shuffleArray(products);
        updateCartCount();
        renderProducts();
        renderFeaturedProducts();
        renderCategories();
        renderBrands();
        return Promise.resolve();
      } else {
        // Передаємо помилку далі для обробки в initApp
        return Promise.reject(error);
      }
    });
}

// ===== ФУНКЦІЇ ПАГІНАЦІЇ =====

// Функція для зміни сторінки в пагінації
function changePage(page) {
  currentPage = page;
  showLoadingSkeleton();
  
  // Використовуємо setTimeout для плавного переходу
  setTimeout(() => {
    renderProducts();
    updatePagination();
    // Прокручуємо сторінку вгору для зручності перегляду
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 100);
}

// Оновлення відображення пагінації
function updatePagination() {
  const paginationContainer = document.getElementById("pagination");
  if (!paginationContainer) return; // Додана перевірка
  
  // Розраховуємо загальну кількість сторінок
  let filteredProducts = getFilteredProducts();
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  
  // Якщо сторінок немає або всього одна, приховуємо пагінацію
  if (totalPages <= 1) {
    paginationContainer.style.display = 'none';
    return;
  }
  
  paginationContainer.style.display = 'flex';
  
  // Очищаємо контейнер пагінації
  paginationContainer.innerHTML = '';
  
  // Додаємо кнопку "Назад"
  const prevButton = document.createElement('button');
  prevButton.innerHTML = '&laquo;';
  prevButton.disabled = currentPage === 1;
  prevButton.onclick = () => changePage(currentPage - 1);
  paginationContainer.appendChild(prevButton);
  
  // Визначаємо діапазон відображуваних сторінок
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + 4);
  
  // Корегуємо startPage, якщо ми в кінці діапазону
  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }
  
  // Додаємо кнопки пагінації
  for (let i = startPage; i <= endPage; i++) {
    const button = document.createElement('button');
    button.textContent = i;
    button.classList.toggle('active', i === currentPage);
    button.onclick = () => changePage(i);
    paginationContainer.appendChild(button);
  }
  
  // Додаємо кнопку "Вперед"
  const nextButton = document.createElement('button');
  nextButton.innerHTML = '&raquo;';
  nextButton.disabled = currentPage === totalPages;
  nextButton.onclick = () => changePage(currentPage + 1);
  paginationContainer.appendChild(nextButton);
}

// Отримання відфільтрованих продуктів (допоміжна функція)
function getFilteredProducts() {
  let filteredProducts = [...products];
  
  if (showingFavorites) {
    filteredProducts = filteredProducts.filter(product => favorites[product.id]);
  }
  
  if (currentFilters.search) {
    const searchTerm = normalizeSearchTerm(currentFilters.search);
    
    // Используем предварительно созданный searchIndex для быстрого поиска
    filteredProducts = filteredProducts.filter(product => {
      if (!product.searchIndex) return false;
      return product.searchIndex.includes(searchTerm);
    });
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
  
  // Фильтрация по источнику (JSON файлу)
  if (currentFilters.source) {
    filteredProducts = filteredProducts.filter(product => 
      product.source === currentFilters.source
    );
  }
  
  // Застосовуємо сортування
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
      // За замовчуванням - без сортування
      break;
  }
  
  return filteredProducts;
}

// ===== КІНЕЦЬ ФУНКЦІЇ ПАГІНАЦІЇ =====

// Функція для завантаження XML-фіду
async function loadFromFeed() {
  const messageElement = document.getElementById("feed-message");
  messageElement.textContent = "Завантаження даних...";
  
  // Отримуємо URL із збережених налаштувань
  const feedUrl = localStorage.getItem(FEED_URL_KEY) || document.getElementById("feed-url").value;
  
  if (!feedUrl) {
    messageElement.textContent = "Введіть URL фіду";
    showNotification("Введіть URL фіду для завантаження");
    return;
  }
  
  // Зберігаємо URL, якщо він був введений в поле
  if (document.getElementById("feed-url").value) {
    localStorage.setItem(FEED_URL_KEY, document.getElementById("feed-url").value);
  }
  
  try {
    // Використовуємо проксі для обходу CORS
    const proxyUrl = 'https://corsproxy.io/?';
    const response = await fetch(proxyUrl + encodeURIComponent(feedUrl));
    
    if (!response.ok) {
      throw new Error(`Помилка HTTP: ${response.status}`);
    }
    
    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    
    // Перевіряємо, чи є помилки парсингу
    if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
      throw new Error("Помилка парсингу XML");
    }
    
    // Парсимо XML залежно від структури
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
      
      // Отримуємо URL зображення
      let image = "";
      const pictureElement = offer.getElementsByTagName("picture")[0];
      if (pictureElement) {
        image = pictureElement.textContent.trim();
      }
      
      // Отримуємо категорію
      const category = getValue("category") || "Без категорії";
      
      items.push({
        id,
        title,
        price,
        description,
        image: image, // Використовуємо оригінальний URL зображення
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
    
    // Зберігаємо товари в Firestore
    const batch = db.batch();
    const productsRef = db.collection("products");
    
    for (const item of items) {
      const productRef = productsRef.doc(item.id);
      batch.set(productRef, item, { merge: true });
    }
    
    await batch.commit();
    
    // Зберігаємо час останнього оновлення
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
      loadProducts(); // Перезавантажуємо список товарів
      return productData.id;
    })
    .catch((error) => {
      console.error("Помилка збереження товару: ", error);
      showNotification("Помилка збереження товару", "error");
      
      // Зберігаємо в localStorage як запасний варіант
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

// Рендеринг продуктів
function renderProducts() {
  const grid = document.getElementById("product-grid");
  if (!grid) return; // Захист від відсутності елемента
  
  grid.innerHTML = '';
  
  // Отримуємо відфільтровані продукти
  let filteredProducts = getFilteredProducts();
  
  // Оновлюємо заголовок і лічильник
  document.getElementById('products-title').textContent = showingFavorites ? 'Обрані товари' : '';
  document.getElementById('products-count').textContent = `Знайдено: ${filteredProducts.length}`;
  
  // Застосовуємо пагінацію
  const startIndex = (currentPage - 1) * productsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);
  
  // Рендеримо продукти
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
    
    // Перевіряємо, чи доданий товар в обране
    const isFavorite = favorites[product.id];
    
    card.innerHTML = `
      ${product.discount ? `<div class="card-discount">-${product.discount}%</div>` : ''}
      ${product.isNew ? '<div class="card-badge">Новинка</div>' : ''}
      <img src="${product.image || 'https://via.placeholder.com/300x200?text=No+Image'}" alt="${product.title}">
      <h3>${product.title}</h3>
      <p>${product.description || 'Опис відсутній'}</p>
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

// Рендеринг популярных товаров (исправленная версия)
function renderFeaturedProducts() {
  const featuredContainer = document.getElementById("featured-products");
  featuredContainer.innerHTML = '';
  
  // Берем случайные товары или товары с флагом isPopular
  let featuredProducts = [];
  
  // Сначала пробуем найти товары с флагом isPopular
  const popularProducts = products.filter(product => product.isPopular);
  
  if (popularProducts.length >= 3) {
    // Если есть достаточно популярных товаров, используем их
    featuredProducts = shuffleArray(popularProducts).slice(0, 5);
  } else {
    // Иначе берем случайные товары из всего каталога
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
  
  // Очищаємо всі опції крім першої
  while (categorySelect.options.length > 1) {
    categorySelect.remove(1);
  }
  
  // Отримуємо унікальні категорії
  const categories = [...new Set(products.map(product => product.category))].filter(Boolean);
  
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });
}

// Рендеринг брендів
function renderBrands() {
  const brandSelect = document.getElementById("brand");
  
  // Очищаємо всі опції крім першої
  while (brandSelect.options.length > 1) {
    brandSelect.remove(1);
  }
  
  // Отримуємо унікальні бренди
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
  
  // Зберігаємо кошик в localStorage
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
  
  // Зберігаємо обране в localStorage
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  
  // Перемальовуємо продукти, якщо знаходимось у режимі обраного
  if (showingFavorites) {
    renderProducts();
  } else {
    // Інакше просто оновлюємо іконку серця у товару
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
  // Отримуємо значення ціни
  const minPrice = document.getElementById("price-min").value ? parseInt(document.getElementById("price-min").value) : null;
  const maxPrice = document.getElementById("price-max").value ? parseInt(document.getElementById("price-max").value) : null;
  
  // Оновлюємо фільтри
  currentFilters.minPrice = minPrice;
  currentFilters.maxPrice = maxPrice;
  currentFilters.category = document.getElementById("category").value;
  currentFilters.brand = document.getElementById("brand").value;
  currentFilters.availability = document.getElementById("availability").value;
  currentFilters.sort = document.getElementById("sort").value;
  
  currentPage = 1;
  renderProducts();
  
  // Оновлюємо лічильник товарів
  const filteredProducts = getFilteredProducts();
  document.getElementById('products-count').textContent = `Знайдено: ${filteredProducts.length}`;
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
          <div><i class="fas fa-truck"></i> Доставка за 1-2 дні</div>
          <div><i class="fas fa-shield-alt"></i> Гарантія 12 місяців</div>
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
  
  // Загружаем отзывы для этого товара
  loadReviews(product.id);
  
  // Инициализируем рейтинг
  currentRating = 0;
  updateRatingStars();
  
  openModal();
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
    approved: false // На модерации
  };
  
  db.collection("reviews").add(newReview)
    .then(() => {
      showNotification("Відгук додано і відправиться на модерацію");
      document.getElementById('review-text').value = "";
      currentRating = 0;
      updateRatingStars();
      loadReviews(productId); // Перезагружаем отзывы
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
  
  // Зберігаємо кошик в localStorage
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
}

// Зміна кількості товару в кошику
function changeCartQuantity(productId, delta) {
  if (!cart[productId] && delta < 1) return; // Захист від від'ємної кількості
  
  cart[productId] += delta;
  
  if (cart[productId] < 1) {
    delete cart[productId];
  }
  
  // Зберігаємо кошик в localStorage
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  
  updateCartCount();
  openCart(); // Перемальовуємо кошик
}

// Видалення товару з кошика
function removeFromCart(productId) {
  delete cart[productId];
  
  // Зберігаємо кошик в localStorage
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  
  updateCartCount();
  openCart(); // Перемальовуємо кошик
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
  
  // Отримуємо дані форми
  const name = document.getElementById('order-name').value.trim();
  const phone = document.getElementById('order-phone').value.trim();
  const email = document.getElementById('order-email').value.trim();
  const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
  
  // Валідація даних
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
  
  // Отримуємо дані доставки
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
  
  // Перевіряємо обов'язкові поля
  if (!name || !phone || !email) {
    showNotification('Заповніть всі обов\'язкові поля', 'error');
    return;
  }
  
  // Перевіряємо, що кошик не порожній
  if (Object.keys(cart).length === 0) {
    showNotification('Кошик порожній', 'error');
    return;
  }
  
  // Створюємо об'єкт замовлення
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
  
  // Зберігаємо замовлення в Firestore
  db.collection("orders").add(order)
    .then((docRef) => {
      // Очищаємо кошик
      cart = {};
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      updateCartCount();
      
      // Отправляем email с заказом
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

// Переключення деталей доставки
function toggleDeliveryDetails(method) {
  // Приховуємо всі блоки з деталями
  document.querySelectorAll('.delivery-details').forEach(detail => {
    detail.classList.remove('active');
  });
  
  // Показуємо потрібний блок
  document.getElementById(`${method}-details`).classList.add('active');
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
  document.getElementById("modal").classList.remove("active");
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
}

// Переключення вкладок авторизации
function switchAuthTab(tab) {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const adminForm = document.getElementById("admin-auth-form");
  const tabs = document.querySelectorAll(".auth-tab");
  
  tabs.forEach(t => t.classList.remove('active'));
  
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

// ===== ПЕРЕГЛЯД ДЕТАЛЕЙ ЗАМОВЛЕННЯ (ОБНОВЛЕНА ВЕРСИЯ) =====
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
      
      // Форматируем даты
      const orderDate = order.createdAt ? order.createdAt.toDate().toLocaleString('uk-UA') : 'Дата не вказана';
      const updatedDate = order.updatedAt ? order.updatedAt.toDate().toLocaleString('uk-UA') : 'Дата не вказана';
      const ttnDate = order.ttnAddedAt ? order.ttnAddedAt.toDate().toLocaleString('uk-UA') : '';
      
      // Добавляем секцию ТТН
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
      
      // Кнопка для админа для добавления/изменения ТТН
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
        
        // Находим товар для отображения названия
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
    
    // Отримуємо всі товари
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
      // Переключаємося на вкладку товарів в адмін-панелі
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
              <p><strong>Категорія:</strong> ${product.category}</p>
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
  const searchTerm = query.toLowerCase();
  
  productItems.forEach(item => {
    const title = item.querySelector('h4').textContent.toLowerCase();
    const description = item.querySelector('p').textContent.toLowerCase();
    
    if (title.includes(searchTerm) || description.includes(searchTerm)) {
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
          <input type="number" id="edit-product-price" value="${product.price}" min="0" step="0.01" required>
        </div>
        <div class="form-group">
          <label>Стара ціна, ₴</label>
          <input type="number" id="edit-product-old-price" value="${product.oldPrice || ''}" min="0" step="0.01">
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
        <input type="number" id="edit-product-discount" value="${product.discount || ''}" min="0" max="100">
      </div>
      <button type="submit" class="btn btn-detail">Зберегти зміни</button>
    </form>
  `;
  
  openModal();
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
      // Оновлюємо список товарів в адмін-панелі
      loadAdminProducts();
    });
}

// Функція видалення товару
function deleteProduct(productId) {
  if (confirm("Ви впевнені, що хочете видалити цей товар? Цю дію не можна скасувати.")) {
    db.collection("products").doc(productId).delete()
      .then(() => {
        showNotification("Товар успішно видалено");
        // Оновлюємо список товарів
        loadAdminProducts();
        // Перезавантажуємо основні продукти
        loadProducts();
      })
      .catch((error) => {
        console.error("Помилка видалення товару: ", error);
        showNotification("Помилка видалення товару", "error");
      });
  }
}

// Функція відкриття профілю користувача
function openProfile() {
  if (!currentUser) {
    showNotification("Спочатку увійдіть в систему", "warning");
    openAuthModal();
    return;
  }
  
  const modalContent = document.getElementById("modal-content");
  modalContent.innerHTML = `
    <button class="modal-close" onclick="closeModal()" aria-label="Закрити"><i class="fas fa-times" aria-hidden="true"></i></button>
    <h3>Профіль користувача</h3>
    <div class="profile-info">
      <div class="form-group">
        <label>Ім'я</label>
        <input type="text" id="profile-name" value="${currentUser.displayName || ''}">
      </div>
      <div class="form-group">
        <label>Email</label>
        <input type="email" id="profile-email" value="${currentUser.email || ''}" disabled>
      </div>
      <div class="form-group">
        <label>Новий пароль</label>
        <input type="password" id="profile-password" placeholder="Залиште порожнім, якщо не хочете змінювати">
      </div>
      <button class="btn btn-detail" onclick="updateProfile()">Зберегти зміни</button>
    </div>
  `;
  
  openModal();
}

// Функція оновлення профілю користувача
function updateProfile() {
  const name = document.getElementById('profile-name').value;
  const password = document.getElementById('profile-password').value;
  
  const updates = {};
  if (name !== currentUser.displayName) {
    updates.displayName = name;
  }
  
  // Оновлюємо профіль
  const promises = [currentUser.updateProfile(updates)];
  
  // Якщо вказано новий пароль, оновлюємо його
  if (password) {
    promises.push(currentUser.updatePassword(password));
  }
  
  Promise.all(promises)
    .then(() => {
      showNotification("Профіль успішно оновлено");
      closeModal();
      // Оновлюємо ім'я користувача в інтерфейсі
      document.getElementById('user-name').textContent = name || currentUser.email;
    })
    .catch((error) => {
      console.error("Помилка оновлення профілю: ", error);
      showNotification("Помилка оновлення профілю: " + error.message, "error");
    });
}

// Функція перегляду замовлень користувача
function viewOrders() {
  if (!currentUser) {
    showNotification("Спочатку увійдіть в систему", "warning");
    openAuthModal();
    return;
  }
  
  const modalContent = document.getElementById("modal-content");
  modalContent.innerHTML = '<h3>Мої замовлення</h3><p>Завантаження замовлень...</p>';
  
  openModal();
  
  // Завантажуємо замовлення користувача
  db.collection("orders")
    .where("userId", "==", currentUser.uid)
    .orderBy("createdAt", "desc")
    .get()
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        modalContent.innerHTML = `
          <h3>Мої замовлення</h3>
          <div class="empty-cart">
            <i class="fas fa-box-open"></i>
            <h3>Замовлень немає</h3>
            <p>Ви ще не здійснювали покупок в нашому магазині</p>
          </div>
        `;
        return;
      }
      
      let ordersHTML = '';
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
        
        ordersHTML += `
          <div class="order-item" style="border: 1px solid #eee; padding: 15px; margin-bottom: 15px; border-radius: 8px;">
            <h4>Змовлення #${order.id}</h4>
            <p><strong>Дата:</strong> ${orderDate}</p>
            <p><strong>Сума:</strong> ${formatPrice(order.total)} ₴</p>
            <p><strong>Статус:</strong> <span class="order-status ${statusClass}">${statusText}</span></p>
            <p><strong>Спосіб доставки:</strong> ${order.delivery.service}</p>
            <button class="btn btn-detail" onclick="viewOrderDetails('${order.id}')">Детальніше</button>
          </div>
        `;
      });
      
      modalContent.innerHTML = `
        <h3>Мої замовлення</h3>
        <div class="user-orders">
          ${ordersHTML}
        </div>
      `;
    })
    .catch((error) => {
      console.error("Помилка завантаження замовлень: ", error);
      modalContent.innerHTML = `
        <h3>Мої замовлення</h3>
        <p>Помилка завантаження замовлень. Будь ласка, спробуйте пізніше.</p>
      `;
    });
}

// Функція для відкриття модального вікна з правилами
function openRules() {
  document.getElementById('rules-modal').classList.add('active');
}

// Функція для закриття модального вікна з правилами
function closeRulesModal() {
  document.getElementById('rules-modal').classList.remove('active');
}

// Закриття модального вікна при кліку outside content
document.getElementById('rules-modal').addEventListener('click', function(e) {
  if (e.target === this) {
    closeRulesModal();
  }
});

// Функція перемикання видимості фільтрів
function toggleFilters() {
  const filters = document.querySelector('.filters');
  filters.classList.toggle('active');
  
const button = document.querySelector('.filter-toggle');
  if (filters.classList.contains('active')) {
    button.innerHTML = '<i class="fas fa-times"></i> Приховати фільтри';
  } else {
    button.innerHTML = '<i class="fas fa-filter"></i> Показати фільтри';
  }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Функція для додавання вкладки модерації відгуків
function addReviewsTabIfNotExists() {
  const existingTab = document.querySelector('.tab[onclick*="reviews-tab-content"]');
  if (!existingTab) {
    const tabsContainer = document.querySelector('.admin-tabs');
    if (tabsContainer) {
      const reviewsTab = document.createElement('div');
      reviewsTab.className = 'tab';
      reviewsTab.setAttribute('onclick', 'switchTab(\'reviews-tab-content\')');
      reviewsTab.textContent = 'Модерація відгуків';
      tabsContainer.appendChild(reviewsTab);
      
      const tabContent = document.createElement('div');
      tabContent.id = 'reviews-tab-content';
      tabContent.className = 'tab-content';
      tabContent.innerHTML = `
        <h3>Модерація відгуків</h3>
        <div id="reviews-moderation-container"></div>
      `;
      document.querySelector('.admin-content').appendChild(tabContent);
    }
  }
}

// Функція перемикання джерела товарів
function switchSource(source, element) {
    // Обновляем активные вкладки
    document.querySelectorAll('.source-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Если функция вызвана из HTML, element будет передан
    if (element) {
        element.classList.add('active');
    } else {
        // Если вызвано программно, находим соответствующую кнопку
        const tabButton = document.querySelector(`.source-tab[onclick*="${source}"]`);
        if (tabButton) {
            tabButton.classList.add('active');
        }
    }
    
    // Устанавливаем фильтр источника
    currentFilters.source = source === 'all' ? '' : source;
    currentPage = 1;
    
    // Обновляем заголовок
    const titles = {
        'all': 'Всі товари',
        'products1.json': 'Обладнання та інструменти',
        'products2.json': 'Миючі засоби', 
        'products3.json': 'Маслобаза',
        'products4.json': 'Дрібниці для дому',
        'products5.json': 'Мамин посуд'
    };
    
    document.getElementById('products-title').textContent = titles[source] || 'Товари';
    
    // Применяем фильтры
    applyFilters();
}

// ===== ФУНКЦІЯ МАСОВОГО ДОДАВАННЯ ТТН =====
function bulkAddTTN() {
  const ordersToUpdate = [];
  
  // Собираем заказы, которым нужно добавить ТТН
  document.querySelectorAll('.admin-order-item').forEach(item => {
    const orderId = item.querySelector('h4').textContent.replace('Замовлення #', '');
    const ttnInput = item.querySelector('.ttn-input');
    
    if (ttnInput && ttnInput.value.trim() !== '') {
      ordersToUpdate.push({
        id: orderId,
        ttn: ttnInput.value.trim()
      });
    }
  });
  
  if (ordersToUpdate.length === 0) {
    showNotification("Не вибрано жодного замовлення для додавання ТТН", "warning");
    return;
  }
  
  if (confirm(`Додати ТТН до ${ordersToUpdate.length} замовлень?`)) {
    const batch = db.batch();
    
    ordersToUpdate.forEach(order => {
      const orderRef = db.collection("orders").doc(order.id);
      batch.update(orderRef, {
        ttn: order.ttn,
        ttnAddedAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    });
    
    batch.commit()
      .then(() => {
        showNotification(`ТТН додано до ${ordersToUpdate.length} замовлень`);
        loadAdminOrders();
      })
      .catch((error) => {
        console.error("Помилка масового додавання ТТН: ", error);
        showNotification("Помилка додавання ТТН", "error");
      });
  }
}

// Ініціалізація додатка після завантаження DOM
document.addEventListener('DOMContentLoaded', initApp);