/**
 * ==============================================================================
 * AUREON — Digital Flagship Platform (Vanilla JS + Tailwind CSS)
 * ==============================================================================
 * Полная реализация дизайн-системы, умного поиска, каталога с фильтрами,
 * валют USD/UZS, страницы товара маркетплейса, корзины с расчётом выгоды,
 * избранного, чека заказа (.txt Blob), истории заказов и доступности.
 * ==============================================================================
 */

'use strict';

/* ==============================================================================
 * 1. КОНСТАНТЫ И ДЕМОНСТРАЦИОННЫЙ КУРС ВАЛЮТ
 * ============================================================================== */

// Демонстрационный курс доллара к узбекскому суму.
// Внимание: значение приблизительное, не является официальным котировочным курсом
// и при необходимости обновляется вручную.
const USD_TO_UZS = 12850;

// Порог условно бесплатной доставки для демонстрационного магазина (в USD)
const FREE_SHIPPING_THRESHOLD_USD = 50;

// Префиксы версионированных ключей LocalStorage
const STORAGE_KEYS = {
  THEME: 'shop:v1:theme',
  LANG: 'shop:v1:lang',
  CURRENCY: 'shop:v1:currency',
  CART: 'shop:v1:cart',
  FAVORITES: 'shop:v1:favorites',
  RECENT: 'shop:v1:recent',
  ORDERS: 'shop:v1:orders',
  USER_REVIEWS_PREFIX: 'shop:v1:user_reviews_',
};

const API_BASE_URL = 'https://dummyjson.com';

// Словарь локализации интерфейса
const TRANSLATIONS = {
  ru: {
    cart: 'Корзина',
    heroBadge: 'Новая коллекция товаров из DummyJSON API',
    heroDescription: 'Откройте для себя оригинальные товары с мгновенным поиском, честными скидками, подробными характеристиками и бережной адаптацией.',
    heroExploreCta: 'Исследовать каталог',
    benefit1: 'Умный поиск',
    benefit2: 'Избранное PRO',
    catalogSubtitle: 'Каталог товаров',
    catalogTitle: 'Коллекция AUREON',
    loadingCatalog: 'Загрузка каталога...',
    foundCount: (c) => `Найдено: ${c} товаров`,
    allLoaded: 'Вы просмотрели все доступные товары',
    errorTitle: 'Не удалось загрузить товары',
    retryBtn: 'Повторить попытку',
    addToCart: 'В корзину',
    buyNow: 'Купить сейчас',
    unavailable: 'Недоступно для заказа',
    minOrder: (n) => `Мин. заказ: ${n} шт.`,
    lowStock: 'Мало на складе',
    inStock: (n) => `В наличии: ${n} шт.`,
    outOfStock: 'Нет в наличии',
    discountBadge: (d) => `−${Math.round(d)}%`,
    spotlightBadge: 'Выбор AUREON • Топ рейтинг',
    addedToCartToast: (title, qty = 1) => `«${title}» (${qty} шт.) добавлен в корзину`,
    addedToFavToast: (title) => `«${title}» добавлен в избранное`,
    removedFromFavToast: (title) => `«${title}» удалён из избранного`,
    offlineWarning: 'Нет соединения с интернетом. Проверьте сетевое подключение.',
    onlineRestored: 'Соединение с интернетом восстановлено.',
    shareSuccess: 'Ссылка на товар скопирована в буфер обмена!',
    shareError: 'Не удалось скопировать ссылку.',
    freeShippingReached: 'Бесплатная доставка активна!',
    freeShippingRemain: (amount) => `До бесплатной доставки ещё ${amount}`,
    emptyCartTitle: 'Ваша корзина пуста',
    emptyCartDesc: 'Выберите понравившиеся товары в каталоге, чтобы оформить заказ.',
    emptyFavTitle: 'В избранном пока ничего нет',
    emptyFavDesc: 'Нажимайте на сердечко на карточках товаров, чтобы сохранять их сюда.',
    emptyOrdersTitle: 'У вас пока нет заказов',
    emptyOrdersDesc: 'Оформите ваш первый демонстрационный заказ в корзине.',
    tabDescription: 'Описание',
    tabSpecs: 'Характеристики',
    tabShipping: 'Доставка и возврат',
    tabReviews: 'Отзывы',
    similarProductsTitle: 'Похожие товары',
    recentProductsTitle: 'Вы недавно смотрели',
    allReviewsFilter: 'Все отзывы',
    writeReviewTitle: 'Оставить свой отзыв',
    submitReviewBtn: 'Опубликовать отзыв',
    localReviewBadge: 'Виден только на этом устройстве',
    reviewSuccessToast: 'Ваш отзыв успешно сохранён!',
    reviewValidationToast: 'Пожалуйста, заполните имя, оценку и текст отзыва.',
    itemRemovedFromCart: 'Товар удалён из корзины',
    undoBtn: 'Отменить',
  },
  en: {
    cart: 'Cart',
    heroBadge: 'New product collection from DummyJSON API',
    heroDescription: 'Discover authentic products with instant search, genuine discounts, detailed specifications, and responsive design.',
    heroExploreCta: 'Explore Catalog',
    benefit1: 'Smart Search',
    benefit2: 'Favorites PRO',
    catalogSubtitle: 'Product Catalog',
    catalogTitle: 'AUREON Collection',
    loadingCatalog: 'Loading catalog...',
    foundCount: (c) => `Found: ${c} products`,
    allLoaded: 'You have viewed all available products',
    errorTitle: 'Failed to load products',
    retryBtn: 'Try Again',
    addToCart: 'Add to Cart',
    buyNow: 'Buy Now',
    unavailable: 'Unavailable for Order',
    minOrder: (n) => `Min. order: ${n} pcs`,
    lowStock: 'Low Stock',
    inStock: (n) => `In Stock: ${n} pcs`,
    outOfStock: 'Out of Stock',
    discountBadge: (d) => `−${Math.round(d)}%`,
    spotlightBadge: 'AUREON Spotlight • Top Rated',
    addedToCartToast: (title, qty = 1) => `"${title}" (${qty} pcs) added to cart`,
    addedToFavToast: (title) => `"${title}" added to favorites`,
    removedFromFavToast: (title) => `"${title}" removed from favorites`,
    offlineWarning: 'No internet connection. Please check your network.',
    onlineRestored: 'Internet connection restored.',
    shareSuccess: 'Product link copied to clipboard!',
    shareError: 'Failed to copy link.',
    freeShippingReached: 'Free shipping unlocked!',
    freeShippingRemain: (amount) => `Add ${amount} more for free shipping`,
    emptyCartTitle: 'Your cart is empty',
    emptyCartDesc: 'Explore the catalog to find items and add them to your cart.',
    emptyFavTitle: 'Your favorites list is empty',
    emptyFavDesc: 'Click the heart icon on any product to save it here.',
    emptyOrdersTitle: 'No orders yet',
    emptyOrdersDesc: 'Place your first demo order from the shopping cart.',
    tabDescription: 'Description',
    tabSpecs: 'Specifications',
    tabShipping: 'Shipping & Returns',
    tabReviews: 'Reviews',
    similarProductsTitle: 'Similar Products',
    recentProductsTitle: 'Recently Viewed',
    allReviewsFilter: 'All Reviews',
    writeReviewTitle: 'Write a Review',
    submitReviewBtn: 'Post Review',
    localReviewBadge: 'Visible only on this device',
    reviewSuccessToast: 'Your review has been saved!',
    reviewValidationToast: 'Please provide name, rating and comment.',
    itemRemovedFromCart: 'Item removed from cart',
    undoBtn: 'Undo',
  }
};

/* ==============================================================================
 * 2. ЕДИНОЕ СОСТОЯНИЕ ПРИЛОЖЕНИЯ (APP_STATE)
 * ============================================================================== */

const APP_STATE = {
  theme: 'light',
  lang: 'ru',
  currency: 'USD', // 'USD' | 'UZS'
  products: [],
  categories: [],
  total: 0,
  skip: 0,
  limit: 12,
  isLoading: false,
  hasError: false,
  errorMessage: '',
  heroFeatured: null,
  cart: [],
  favorites: [],
  recent: [],
  orders: [],
  catalogScrollY: 0,
  currentProduct: null,
  currentProductSimilar: [],
  filters: {
    search: '',
    category: 'all',
    minPrice: null,
    maxPrice: null,
    discountOnly: false,
    inStockOnly: false,
    sort: 'default'
  },
  productPageUI: {
    selectedImageIndex: 0,
    activeTab: 'description',
    reviewFilterStars: 'all',
    reviewSort: 'newest',
    selectedQuantity: 1,
    newReviewRating: 5
  },
  lastRemovedCartItem: null,
  activeSearchController: null,
};

const apiCache = new Map();

/* ==============================================================================
 * 3. ХРАНИЛИЩЕ LOCALSTORAGE (БЕЗОПАСНАЯ РАБОТА)
 * ============================================================================== */

let storageWarningShown = false;

function safeStorageGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    if (!storageWarningShown) {
      console.warn('LocalStorage error:', err);
      storageWarningShown = true;
    }
    return fallback;
  }
}

function safeStorageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    if (!storageWarningShown) {
      console.warn('LocalStorage write error:', err);
      storageWarningShown = true;
    }
    return false;
  }
}

/* ==============================================================================
 * 4. ЕДИНЫЙ ФОРМАТТЕР ВАЛЮТ (USD / UZS)
 * ============================================================================== */

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const uzsFormatter = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 0,
});

/**
 * Единая функция форматирования цен по всему сайту.
 * Принимает сумму в USD, пересчитывает в сумы при активной валюте UZS.
 */
function formatPrice(amountInUSD) {
  if (typeof amountInUSD !== 'number' || isNaN(amountInUSD)) {
    return APP_STATE.currency === 'UZS' ? '0 сум' : '$0.00';
  }

  if (APP_STATE.currency === 'UZS') {
    const uzsAmount = Math.round(amountInUSD * USD_TO_UZS);
    return `${uzsFormatter.format(uzsAmount)} сум`;
  }

  return usdFormatter.format(amountInUSD);
}

/**
 * Единая функция расчёта финальной цены со скидкой (в долларах, округление до центов)
 */
function getFinalPrice(product) {
  if (!product || typeof product.price !== 'number') return 0;
  const discount = typeof product.discountPercentage === 'number' ? product.discountPercentage : 0;
  const finalPrice = product.price * (1 - discount / 100);
  return Math.round(finalPrice * 100) / 100;
}

/**
 * Экранирование строк для предотвращения XSS
 */
function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderRatingStars(rating, sizeClass = 'text-xs') {
  const safeRating = Math.max(0, Math.min(5, Number(rating) || 0));
  const fullStars = Math.floor(safeRating);
  const hasHalf = safeRating - fullStars >= 0.5;
  let starsHtml = '';

  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      starsHtml += '<span class="text-amber-400">★</span>';
    } else if (i === fullStars + 1 && hasHalf) {
      starsHtml += '<span class="text-amber-400">★</span>';
    } else {
      starsHtml += '<span class="text-slate-300 dark:text-slate-600">☆</span>';
    }
  }

  return `
    <span class="inline-flex items-center gap-1 ${sizeClass}">
      <span class="tracking-tighter">${starsHtml}</span>
      <span class="font-bold text-slate-700 dark:text-slate-300 ml-0.5">${safeRating.toFixed(1)}</span>
    </span>
  `;
}

/* ==============================================================================
 * 5. ВСПЛЫВАЮЩИЕ УВЕДОМЛЕНИЯ (TOAST С ПОДДЕРЖКОЙ КНОПОК ДЕЙСТВИЯ)
 * ============================================================================== */

function showToast(message, type = 'info', actionBtnConfig = null) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `
    pointer-events-auto flex items-center gap-3 p-4 rounded-2xl border backdrop-blur-xl shadow-drawer
    transform translate-y-4 opacity-0 transition-all duration-300 ease-out text-xs sm:text-sm font-semibold
    ${
      type === 'success'
        ? 'bg-emerald-50/95 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
        : type === 'warning'
        ? 'bg-amber-50/95 dark:bg-amber-950/90 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100'
        : type === 'error'
        ? 'bg-rose-50/95 dark:bg-rose-950/90 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100'
        : 'bg-white/95 dark:bg-surface-cardDark border-appBorder-light dark:border-appBorder-dark text-textMain-light dark:text-textMain-dark'
    }
  `;

  let iconSvg = '';
  if (type === 'success') {
    iconSvg = `<svg class="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`;
  } else if (type === 'error') {
    iconSvg = `<svg class="w-5 h-5 text-rose-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>`;
  } else {
    iconSvg = `<svg class="w-5 h-5 text-brand flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
  }

  let actionHtml = '';
  if (actionBtnConfig) {
    actionHtml = `
      <button type="button" class="toast-action-btn ml-2 px-2.5 py-1 rounded-lg bg-brand text-white font-bold text-xs hover:bg-brand-600 transition-colors">
        ${escapeHTML(actionBtnConfig.text)}
      </button>
    `;
  }

  toast.innerHTML = `
    ${iconSvg}
    <div class="leading-snug flex-1">${escapeHTML(message)}</div>
    ${actionHtml}
    <button type="button" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors ml-1" aria-label="Закрыть">
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
    </button>
  `;

  if (actionBtnConfig && actionBtnConfig.onClick) {
    const actionBtn = toast.querySelector('.toast-action-btn');
    if (actionBtn) {
      actionBtn.addEventListener('click', () => {
        actionBtnConfig.onClick();
        removeToast(toast);
      });
    }
  }

  toast.querySelector('button[aria-label="Закрыть"]').addEventListener('click', () => removeToast(toast));
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-4', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
  });

  const timer = setTimeout(() => removeToast(toast), actionBtnConfig ? 6000 : 3500);

  function removeToast(elem) {
    clearTimeout(timer);
    elem.classList.remove('translate-y-0', 'opacity-100');
    elem.classList.add('translate-y-2', 'opacity-0');
    setTimeout(() => {
      if (elem.parentNode) elem.parentNode.removeChild(elem);
    }, 300);
  }
}

/* ==============================================================================
 * 6. API КЛИЕНТ
 * ============================================================================== */

async function fetchAPI(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const isGet = !options.method || options.method.toUpperCase() === 'GET';

  if (isGet && apiCache.has(url)) {
    return apiCache.get(url);
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        ...(options.headers || {})
      }
    });

    if (!response.ok) {
      throw new Error(`Ошибка сервера HTTP: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (isGet) apiCache.set(url, data);
    return data;
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error(`Ошибка при запросе к ${url}:`, error);
    }
    throw error;
  }
}

/* ==============================================================================
 * 7. СКЕЛЕТОНЫ ЗАГРУЗКИ (ACCURATE SHIMMER SKELETONS)
 * ============================================================================== */

function renderSkeletons(count = 12) {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  let html = '';
  for (let i = 0; i < count; i++) {
    html += `
      <div class="rounded-2xl bg-white dark:bg-surface-cardDark border border-appBorder-light dark:border-appBorder-dark p-4 shadow-subtle shimmer-mask flex flex-col justify-between h-[390px]" aria-hidden="true">
        <div class="space-y-3">
          <div class="w-full h-44 bg-slate-200/80 dark:bg-slate-800/80 rounded-xl"></div>
          <div class="flex items-center justify-between">
            <div class="h-3 bg-slate-200/80 dark:bg-slate-800/80 rounded-full w-16"></div>
            <div class="h-3 bg-slate-200/80 dark:bg-slate-800/80 rounded-full w-12"></div>
          </div>
          <div class="h-4 bg-slate-200/80 dark:bg-slate-800/80 rounded w-4/5"></div>
          <div class="h-3.5 bg-slate-200/80 dark:bg-slate-800/80 rounded w-1/2"></div>
        </div>
        <div class="pt-3 border-t border-appBorder-light dark:border-appBorder-dark flex items-center justify-between">
          <div class="h-6 bg-slate-200/80 dark:bg-slate-800/80 rounded-lg w-20"></div>
          <div class="h-9 bg-slate-200/80 dark:bg-slate-800/80 rounded-xl w-24"></div>
        </div>
      </div>
    `;
  }
  grid.innerHTML = html;
}

/* ==============================================================================
 * 8. ГЕНЕРАТОР КАРТОЧКИ ТОВАРА (createCard)
 * ============================================================================== */

function createCard(product) {
  const t = TRANSLATIONS[APP_STATE.lang];
  const originalPrice = product.price || 0;
  const finalPrice = getFinalPrice(product);
  const hasDiscount = typeof product.discountPercentage === 'number' && product.discountPercentage > 0;

  const isOutOfStock = product.stock <= 0;
  const isMinOrderExceeded = (product.minimumOrderQuantity || 1) > (product.stock || 0);
  const cannotOrder = isOutOfStock || isMinOrderExceeded;
  const isFavorite = APP_STATE.favorites.includes(product.id);

  const isLowStock = product.availabilityStatus === 'Low Stock';
  const hasMinOrder = (product.minimumOrderQuantity || 1) > 1;

  const titleSafe = escapeHTML(product.title);
  const categorySafe = escapeHTML(product.category);
  const thumbnailSafe = escapeHTML(product.thumbnail || (product.images && product.images[0]) || '');

  return `
    <article
      class="product-card group relative rounded-2xl bg-white dark:bg-surface-cardDark border border-appBorder-light dark:border-appBorder-dark p-4 shadow-subtle hover:shadow-subtle-hover transition-all duration-300 ease-out hover:-translate-y-1 flex flex-col justify-between cursor-pointer"
      data-action="navigate-product"
      data-id="${product.id}"
    >
      <div>
        <!-- Контейнер изображения -->
        <div class="relative w-full h-48 bg-slate-50 dark:bg-slate-900/60 rounded-xl overflow-hidden flex items-center justify-center p-3 border border-appBorder-light/60 dark:border-appBorder-dark/60">
          
          <!-- Бейджи -->
          <div class="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start pointer-events-none">
            ${
              hasDiscount
                ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500 text-white shadow-sm">
                    ${t.discountBadge(product.discountPercentage)}
                  </span>`
                : ''
            }
            ${
              isLowStock
                ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 shadow-sm">
                    ${t.lowStock}
                  </span>`
                : ''
            }
          </div>

          <!-- Кнопка «В избранное» -->
          <button
            type="button"
            class="favorite-toggle-btn absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-full bg-white/90 dark:bg-slate-800/90 border border-appBorder-light dark:border-appBorder-dark flex items-center justify-center shadow-sm hover:scale-110 active:scale-95 transition-all text-slate-400 hover:text-rose-500 focus:outline-none"
            data-action="toggle-favorite"
            data-id="${product.id}"
            title="Добавить в избранное"
            aria-label="В избранное"
          >
            <svg class="w-4 h-4 transition-colors ${isFavorite ? 'text-rose-500 fill-rose-500' : 'fill-none'}" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </button>

          <!-- Картинка -->
          <img
            src="${thumbnailSafe}"
            alt="${titleSafe}"
            loading="lazy"
            decoding="async"
            width="180"
            height="180"
            class="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 ease-out"
            onerror="this.onerror=null; this.src='https://placehold.co/400x400/e2e8f0/64748b?text=AUREON';"
          />
        </div>

        <div class="mt-3 space-y-1.5">
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold uppercase tracking-wider text-brand text-[10px]">
              ${categorySafe}
            </span>
            ${renderRatingStars(product.rating)}
          </div>

          <h3
            class="text-sm font-bold text-textMain-light dark:text-textMain-dark line-clamp-1 group-hover:text-brand transition-colors"
            title="${titleSafe}"
          >
            ${titleSafe}
          </h3>

          ${
            hasMinOrder
              ? `<p class="text-[10px] font-medium text-textSub-light dark:text-textSub-dark">
                  ${t.minOrder(product.minimumOrderQuantity)}
                </p>`
              : ''
          }
        </div>
      </div>

      <div class="mt-4 pt-3 border-t border-appBorder-light dark:border-appBorder-dark flex items-center justify-between gap-2">
        <div class="flex flex-col">
          <span class="text-base sm:text-lg font-extrabold text-textMain-light dark:text-textMain-dark tracking-tight">
            ${formatPrice(finalPrice)}
          </span>
          ${
            hasDiscount
              ? `<span class="text-[11px] text-textSub-light dark:text-textSub-dark line-through font-medium">
                  ${formatPrice(originalPrice)}
                </span>`
              : ''
          }
        </div>

        <button
          type="button"
          class="add-to-cart-btn inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl font-bold text-xs tracking-wide transition-all active:scale-95 focus:outline-none ${
            cannotOrder
              ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
              : 'bg-brand hover:bg-brand-600 text-white shadow-glow'
          }"
          data-action="add-to-cart"
          data-id="${product.id}"
          ${cannotOrder ? 'disabled' : ''}
        >
          <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
          </svg>
          <span>${cannotOrder ? t.unavailable : t.addToCart}</span>
        </button>
      </div>
    </article>
  `;
}

/* ==============================================================================
 * 9. ДИНАМИЧЕСКИЙ HERO SPOTLIGHT
 * ============================================================================== */

function renderHeroSpotlight(product) {
  const container = document.getElementById('heroSpotlightCard');
  const skeleton = document.getElementById('heroSpotlightSkeleton');
  if (!container || !skeleton || !product) return;

  const t = TRANSLATIONS[APP_STATE.lang];
  const finalPrice = getFinalPrice(product);

  container.innerHTML = `
    <div
      class="p-5 sm:p-6 rounded-2xl bg-white dark:bg-surface-cardDark border border-appBorder-light dark:border-appBorder-dark shadow-subtle hover:shadow-subtle-hover transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
      data-action="navigate-product"
      data-id="${product.id}"
    >
      <div class="flex items-center justify-between mb-3">
        <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          ${t.spotlightBadge}
        </span>
        ${renderRatingStars(product.rating)}
      </div>

      <div class="w-full h-48 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 flex items-center justify-center overflow-hidden mb-3">
        <img
          src="${escapeHTML(product.thumbnail || '')}"
          alt="${escapeHTML(product.title)}"
          class="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div class="space-y-1 mb-3">
        <span class="text-[10px] uppercase font-extrabold tracking-widest text-brand">
          ${escapeHTML(product.category)}
        </span>
        <h3 class="text-base font-bold text-textMain-light dark:text-textMain-dark line-clamp-1">
          ${escapeHTML(product.title)}
        </h3>
      </div>

      <div class="pt-3 border-t border-appBorder-light dark:border-appBorder-dark flex items-center justify-between">
        <div>
          <span class="text-xl font-extrabold text-textMain-light dark:text-textMain-dark tracking-tight">
            ${formatPrice(finalPrice)}
          </span>
          ${
            product.discountPercentage > 0
              ? `<span class="ml-1.5 text-xs text-rose-500 font-bold">−${Math.round(product.discountPercentage)}%</span>`
              : ''
          }
        </div>
        <button
          type="button"
          class="px-3.5 py-2 rounded-xl bg-brand hover:bg-brand-600 text-white font-bold text-xs shadow-glow transition-all active:scale-95"
          data-action="add-to-cart"
          data-id="${product.id}"
        >
          ${t.addToCart}
        </button>
      </div>
    </div>
  `;

  skeleton.classList.add('hidden');
  container.classList.remove('hidden');
}

/* ==============================================================================
 * 10. ЗАГРУЗКА КАТЕГОРИЙ И КАТАЛОГА
 * ============================================================================== */

async function loadCategories() {
  const bar = document.getElementById('categoriesBar');
  if (!bar) return;

  try {
    const categories = await fetchAPI('/products/categories');
    APP_STATE.categories = categories;

    // Кнопка «Все»
    let html = `
      <button
        type="button"
        class="category-pill-btn flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
          APP_STATE.filters.category === 'all'
            ? 'bg-brand text-white border-brand shadow-glow'
            : 'bg-white dark:bg-surface-cardDark text-textMain-light dark:text-textMain-dark border-appBorder-light dark:border-appBorder-dark hover:border-brand/40'
        }"
        data-category="all"
      >
        Все товары
      </button>
    `;

    categories.forEach(cat => {
      const slug = typeof cat === 'string' ? cat : (cat.slug || cat.name);
      const name = typeof cat === 'string' ? cat : (cat.name || cat.slug);
      const isActive = APP_STATE.filters.category === slug;

      html += `
        <button
          type="button"
          class="category-pill-btn flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border capitalize ${
            isActive
              ? 'bg-brand text-white border-brand shadow-glow'
              : 'bg-white dark:bg-surface-cardDark text-textMain-light dark:text-textMain-dark border-appBorder-light dark:border-appBorder-dark hover:border-brand/40'
          }"
          data-category="${escapeHTML(slug)}"
        >
          ${escapeHTML(name)}
        </button>
      `;
    });

    bar.innerHTML = html;

    bar.querySelectorAll('.category-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-category');
        APP_STATE.filters.category = cat;
        updateURLHash();
        loadProducts(true);
        loadCategories(); // перерисовать активную пилюлю
      });
    });

  } catch (err) {
    console.warn('Не удалось загрузить список категорий:', err);
  }
}

/**
 * Загрузка товаров с учётом поиска, категорий, пагинации и клиентской фильтрации
 */
async function loadProducts(reset = false) {
  if (APP_STATE.isLoading) return;

  APP_STATE.isLoading = true;
  APP_STATE.hasError = false;

  const errorBlock = document.getElementById('catalogError');
  const countBadge = document.getElementById('catalogCountBadge');
  const endMsg = document.getElementById('catalogEndMessage');
  const spinner = document.getElementById('infiniteScrollSpinner');
  const t = TRANSLATIONS[APP_STATE.lang];

  if (errorBlock) errorBlock.classList.add('hidden');
  if (reset && countBadge) countBadge.textContent = t.loadingCatalog;
  if (!reset && spinner) spinner.classList.remove('hidden');

  if (reset) {
    APP_STATE.skip = 0;
    APP_STATE.products = [];
    renderSkeletons(12);
  }

  try {
    let endpoint = '';
    const { search, category } = APP_STATE.filters;

    if (search.trim()) {
      endpoint = `/products/search?q=${encodeURIComponent(search.trim())}&limit=${APP_STATE.limit}&skip=${APP_STATE.skip}`;
    } else if (category && category !== 'all') {
      endpoint = `/products/category/${encodeURIComponent(category)}?limit=${APP_STATE.limit}&skip=${APP_STATE.skip}`;
    } else {
      endpoint = `/products?limit=${APP_STATE.limit}&skip=${APP_STATE.skip}`;
    }

    const data = await fetchAPI(endpoint);

    APP_STATE.products = reset ? data.products : [...APP_STATE.products, ...data.products];
    APP_STATE.total = data.total;
    APP_STATE.skip += data.products.length;

    if (!APP_STATE.heroFeatured && APP_STATE.products.length > 0) {
      const topRated = [...APP_STATE.products].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
      APP_STATE.heroFeatured = topRated;
      renderHeroSpotlight(topRated);
    }

    // Рендерим отфильтрованные и отсортированные товары
    renderFilteredProductsGrid();

    // Проверка окончания загрузки
    if (endMsg) {
      if (APP_STATE.skip >= APP_STATE.total && APP_STATE.total > 0) {
        endMsg.classList.remove('hidden');
      } else {
        endMsg.classList.add('hidden');
      }
    }
  } catch (err) {
    APP_STATE.hasError = true;
    APP_STATE.errorMessage = err.message || 'Ошибка сети';

    if (errorBlock) {
      document.getElementById('catalogErrorMessage').textContent = APP_STATE.errorMessage;
      errorBlock.classList.remove('hidden');
    }
    if (countBadge) countBadge.textContent = '';
  } finally {
    APP_STATE.isLoading = false;
    if (spinner) spinner.classList.add('hidden');
  }
}

/**
 * Клиентская фильтрация по цене, скидкам, наличию и сортировка
 */
function getFilteredAndSortedProducts() {
  const { minPrice, maxPrice, discountOnly, inStockOnly, sort } = APP_STATE.filters;

  return APP_STATE.products
    .filter(product => {
      const price = getFinalPrice(product);

      if (minPrice !== null && price < minPrice) return false;
      if (maxPrice !== null && price > maxPrice) return false;

      if (discountOnly) {
        if (!product.discountPercentage || product.discountPercentage <= 0) return false;
      }

      if (inStockOnly) {
        if (product.availabilityStatus === 'Out of Stock' || product.stock <= 0) return false;
      }

      return true;
    })
    .sort((a, b) => {
      const priceA = getFinalPrice(a);
      const priceB = getFinalPrice(b);

      if (sort === 'price-asc') return priceA - priceB;
      if (sort === 'price-desc') return priceB - priceA;
      if (sort === 'rating-desc') return (b.rating || 0) - (a.rating || 0);
      if (sort === 'title-asc') return (a.title || '').localeCompare(b.title || '');
      return 0; // default
    });
}

function renderFilteredProductsGrid() {
  const grid = document.getElementById('productsGrid');
  const countBadge = document.getElementById('catalogCountBadge');
  const resetBtn = document.getElementById('resetFiltersBtn');
  const t = TRANSLATIONS[APP_STATE.lang];
  if (!grid) return;

  const filtered = getFilteredAndSortedProducts();

  // Обновляем счётчик
  if (countBadge) {
    countBadge.textContent = t.foundCount(filtered.length);
  }

  // Показываем кнопку сброса, если применены фильтры
  const hasActiveFilters =
    Boolean(APP_STATE.filters.search.trim()) ||
    APP_STATE.filters.category !== 'all' ||
    APP_STATE.filters.minPrice !== null ||
    APP_STATE.filters.maxPrice !== null ||
    APP_STATE.filters.discountOnly ||
    APP_STATE.filters.inStockOnly ||
    APP_STATE.filters.sort !== 'default';

  if (resetBtn) {
    if (hasActiveFilters) resetBtn.classList.remove('hidden');
    else resetBtn.classList.add('hidden');
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-16 text-center space-y-4">
        <div class="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
          <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>
        </div>
        <h4 class="text-lg font-bold text-textMain-light dark:text-textMain-dark">Ничего не найдено</h4>
        <p class="text-xs text-textSub-light dark:text-textSub-dark max-w-sm mx-auto">
          Попробуйте изменить поисковый запрос, сбросить фильтры по цене или выбрать другую категорию.
        </p>
        <button
          type="button"
          onclick="resetAllFilters()"
          class="px-4 py-2 rounded-xl bg-brand text-white font-bold text-xs shadow-glow transition-all"
        >
          Сбросить все фильтры
        </button>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(product => createCard(product)).join('');
}

function resetAllFilters() {
  APP_STATE.filters = {
    search: '',
    category: 'all',
    minPrice: null,
    maxPrice: null,
    discountOnly: false,
    inStockOnly: false,
    sort: 'default'
  };

  const searchInput = document.getElementById('searchInput');
  const mobileSearchInput = document.getElementById('mobileSearchInput');
  const priceMin = document.getElementById('priceMinInput');
  const priceMax = document.getElementById('priceMaxInput');
  const discCheck = document.getElementById('filterDiscountOnly');
  const stockCheck = document.getElementById('filterInStockOnly');
  const sortSelect = document.getElementById('catalogSortSelect');

  if (searchInput) searchInput.value = '';
  if (mobileSearchInput) mobileSearchInput.value = '';
  if (priceMin) priceMin.value = '';
  if (priceMax) priceMax.value = '';
  if (discCheck) discCheck.checked = false;
  if (stockCheck) stockCheck.checked = false;
  if (sortSelect) sortSelect.value = 'default';

  updateURLHash();
  loadCategories();
  loadProducts(true);
}

/* ==============================================================================
 * 11. УМНЫЙ ПОИСК С ВЫПАДАЮЩИМИ ПОДСКАЗКАМИ (SMART SEARCH)
 * ============================================================================== */

let searchDebounceTimer = null;

function initSearch() {
  const input = document.getElementById('searchInput');
  const mobileInput = document.getElementById('mobileSearchInput');
  const clearBtn = document.getElementById('searchClearBtn');
  const dropdown = document.getElementById('searchDropdown');

  if (!input) return;

  const handleSearchInput = (val) => {
    const query = val.trim();
    if (clearBtn) {
      if (query) clearBtn.classList.remove('hidden');
      else clearBtn.classList.add('hidden');
    }

    clearTimeout(searchDebounceTimer);
    if (APP_STATE.activeSearchController) {
      APP_STATE.activeSearchController.abort();
    }

    if (!query) {
      if (dropdown) dropdown.classList.add('hidden');
      APP_STATE.filters.search = '';
      updateURLHash();
      loadProducts(true);
      return;
    }

    // Debounce 400 мс
    searchDebounceTimer = setTimeout(async () => {
      APP_STATE.activeSearchController = new AbortController();
      try {
        const data = await fetchAPI(
          `/products/search?q=${encodeURIComponent(query)}&limit=6`,
          { signal: APP_STATE.activeSearchController.signal }
        );
        renderSearchDropdown(data.products, query);
      } catch (e) {
        if (e.name !== 'AbortError') console.warn('Поиск прерван:', e);
      }
    }, 400);
  };

  input.addEventListener('input', (e) => handleSearchInput(e.target.value));
  if (mobileInput) {
    mobileInput.addEventListener('input', (e) => {
      input.value = e.target.value;
      handleSearchInput(e.target.value);
    });
  }

  // Очистка поиска
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      input.value = '';
      if (mobileInput) mobileInput.value = '';
      handleSearchInput('');
      input.focus();
    });
  }

  // Закрытие выпадающего окна по клику вне
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#searchWidgetContainer')) {
      if (dropdown) dropdown.classList.add('hidden');
    }
  });

  // Навигация стрелками вверх/вниз и Enter
  input.addEventListener('keydown', (e) => {
    if (!dropdown || dropdown.classList.contains('hidden')) return;
    const items = dropdown.querySelectorAll('.search-item-btn');
    if (items.length === 0) return;

    let activeIdx = -1;
    items.forEach((item, idx) => {
      if (item.classList.contains('bg-slate-100') || item.classList.contains('dark:bg-slate-800')) {
        activeIdx = idx;
      }
    });

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIdx = (activeIdx + 1) % items.length;
      highlightSearchItem(items, nextIdx);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIdx = (activeIdx - 1 + items.length) % items.length;
      highlightSearchItem(items, prevIdx);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx >= 0 && items[activeIdx]) {
        items[activeIdx].click();
      } else {
        dropdown.classList.add('hidden');
        APP_STATE.filters.search = input.value.trim();
        updateURLHash();
        loadProducts(true);
      }
    } else if (e.key === 'Escape') {
      dropdown.classList.add('hidden');
    }
  });
}

function highlightSearchItem(items, targetIdx) {
  items.forEach((item, idx) => {
    if (idx === targetIdx) {
      item.classList.add('bg-slate-100', 'dark:bg-slate-800');
      item.scrollIntoView({ block: 'nearest' });
    } else {
      item.classList.remove('bg-slate-100', 'dark:bg-slate-800');
    }
  });
}

function highlightMatch(text, query) {
  if (!query) return escapeHTML(text);
  const safeText = escapeHTML(text);
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return safeText.replace(regex, '<mark class="bg-brand-100 dark:bg-brand-900/60 text-brand font-black rounded px-0.5">$1</mark>');
}

function renderSearchDropdown(products, query) {
  const dropdown = document.getElementById('searchDropdown');
  if (!dropdown) return;

  if (!products || products.length === 0) {
    dropdown.innerHTML = `
      <div class="p-4 text-center text-xs text-textSub-light dark:text-textSub-dark">
        По запросу «${escapeHTML(query)}» ничего не найдено
      </div>
    `;
    dropdown.classList.remove('hidden');
    return;
  }

  dropdown.innerHTML = `
    <div class="p-2 space-y-1">
      <div class="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-textSub-light dark:text-textSub-dark">
        Подсказки товаров
      </div>
      ${products
        .map(
          product => `
        <button
          type="button"
          class="search-item-btn w-full p-2 rounded-xl flex items-center gap-3 text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          data-id="${product.id}"
        >
          <img
            src="${escapeHTML(product.thumbnail || '')}"
            alt="${escapeHTML(product.title)}"
            class="w-10 h-10 rounded-lg object-contain bg-slate-50 dark:bg-slate-900 p-1 flex-shrink-0"
          />
          <div class="flex-1 min-w-0">
            <h5 class="text-xs font-bold text-textMain-light dark:text-textMain-dark truncate">
              ${highlightMatch(product.title, query)}
            </h5>
            <span class="text-[10px] text-brand uppercase font-semibold">${escapeHTML(product.category)}</span>
          </div>
          <span class="text-xs font-extrabold text-textMain-light dark:text-textMain-dark flex-shrink-0">
            ${formatPrice(getFinalPrice(product))}
          </span>
        </button>
      `
        )
        .join('')}
    </div>
  `;

  dropdown.querySelectorAll('.search-item-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      dropdown.classList.add('hidden');
      window.location.hash = `#/product/${id}`;
    });
  });

  dropdown.classList.remove('hidden');
}

/* ==============================================================================
 * 12. СТРАНИЦА ТОВАРА В СТИЛЕ МАРКЕТПЛЕЙСА (#/product/ID)
 * ============================================================================== */

async function openProductPage(productId) {
  const container = document.getElementById('productDetailView');
  if (!container) return;

  container.innerHTML = `
    <div class="py-20 text-center space-y-4">
      <div class="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p class="text-xs font-semibold text-textSub-light dark:text-textSub-dark">Загрузка карточки товара #${productId}...</p>
    </div>
  `;

  try {
    let product = APP_STATE.products.find(p => p.id === Number(productId));
    if (!product) {
      product = await fetchAPI(`/products/${productId}`);
    }
    APP_STATE.currentProduct = product;

    // Сохраняем в список «Недавно просмотренные» (до 8 уникальных)
    addToRecent(product);

    const minQty = product.minimumOrderQuantity || 1;
    APP_STATE.productPageUI = {
      selectedImageIndex: 0,
      activeTab: 'description',
      reviewFilterStars: 'all',
      reviewSort: 'newest',
      selectedQuantity: minQty,
      newReviewRating: 5
    };

    try {
      const similarData = await fetchAPI(`/products/category/${encodeURIComponent(product.category)}?limit=5`);
      APP_STATE.currentProductSimilar = (similarData.products || [])
        .filter(p => p.id !== product.id)
        .slice(0, 4);
    } catch (e) {
      APP_STATE.currentProductSimilar = [];
    }

    renderProductDetailContent();

  } catch (err) {
    container.innerHTML = `
      <div class="p-8 rounded-3xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-center space-y-4">
        <h3 class="text-lg font-bold text-textMain-light dark:text-textMain-dark">Ошибка загрузки товара</h3>
        <p class="text-xs text-textSub-light dark:text-textSub-dark">${escapeHTML(err.message)}</p>
        <button
          type="button"
          onclick="window.location.hash='#/catalog'"
          class="px-5 py-2.5 rounded-xl bg-brand text-white font-bold text-xs uppercase shadow-glow"
        >
          Вернуться в каталог
        </button>
      </div>
    `;
  }
}

function addToRecent(product) {
  if (!product) return;
  APP_STATE.recent = APP_STATE.recent.filter(item => item.id !== product.id);
  APP_STATE.recent.unshift({
    id: product.id,
    title: product.title,
    thumbnail: product.thumbnail,
    price: product.price,
    discountPercentage: product.discountPercentage,
    category: product.category,
    rating: product.rating,
  });
  if (APP_STATE.recent.length > 8) {
    APP_STATE.recent = APP_STATE.recent.slice(0, 8);
  }
  safeStorageSet(STORAGE_KEYS.RECENT, APP_STATE.recent);
  renderRecentCatalogSection();
}

function getLocalUserReviews(productId) {
  return safeStorageGet(`${STORAGE_KEYS.USER_REVIEWS_PREFIX}${productId}`, []);
}

function saveLocalUserReview(productId, reviewObj) {
  const key = `${STORAGE_KEYS.USER_REVIEWS_PREFIX}${productId}`;
  const list = getLocalUserReviews(productId);
  list.unshift(reviewObj);
  safeStorageSet(key, list);
}

function renderProductDetailContent() {
  const container = document.getElementById('productDetailView');
  const product = APP_STATE.currentProduct;
  if (!container || !product) return;

  const t = TRANSLATIONS[APP_STATE.lang];
  const finalPrice = getFinalPrice(product);
  const originalPrice = product.price || 0;
  const hasDiscount = typeof product.discountPercentage === 'number' && product.discountPercentage > 0;
  const savings = Math.max(0, originalPrice - finalPrice);

  const images = (product.images && product.images.length > 0)
    ? product.images
    : [product.thumbnail || 'https://placehold.co/600x600/e2e8f0/64748b?text=AUREON'];

  const currentImgSrc = images[APP_STATE.productPageUI.selectedImageIndex] || images[0];

  const minQty = product.minimumOrderQuantity || 1;
  const stock = product.stock || 0;
  const cannotOrder = stock <= 0 || minQty > stock;
  const isFavorite = APP_STATE.favorites.includes(product.id);

  const apiReviews = (product.reviews || []).map(r => ({ ...r, isLocal: false }));
  const localReviews = getLocalUserReviews(product.id).map(r => ({ ...r, isLocal: true }));
  const allReviews = [...localReviews, ...apiReviews];

  const totalReviewsCount = allReviews.length;
  const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  allReviews.forEach(r => {
    const star = Math.max(1, Math.min(5, Math.round(r.rating || 5)));
    ratingDistribution[star] = (ratingDistribution[star] || 0) + 1;
  });

  const filterStars = APP_STATE.productPageUI.reviewFilterStars;
  let filteredReviews = allReviews;
  if (filterStars !== 'all') {
    filteredReviews = allReviews.filter(r => Math.round(r.rating || 5) === Number(filterStars));
  }

  const sortMode = APP_STATE.productPageUI.reviewSort;
  filteredReviews.sort((a, b) => {
    if (sortMode === 'highest') return (b.rating || 0) - (a.rating || 0);
    if (sortMode === 'lowest') return (a.rating || 0) - (b.rating || 0);
    if (sortMode === 'oldest') return new Date(a.date || 0) - new Date(b.date || 0);
    return new Date(b.date || 0) - new Date(a.date || 0);
  });

  container.innerHTML = `
    <!-- ХЛЕБНЫЕ КРОШКИ, ВОЗВРАТ И КНОПКА «ПОДЕЛИТЬСЯ» -->
    <nav class="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-textSub-light dark:text-textSub-dark" aria-label="Хлебные крошки">
      <div class="flex items-center gap-2">
        <a href="#/catalog" class="hover:text-brand transition-colors">Главная</a>
        <span>›</span>
        <button type="button" class="hover:text-brand uppercase font-bold tracking-wider" onclick="filterByCategoryAndGo('${escapeHTML(product.category)}')">
          ${escapeHTML(product.category)}
        </button>
        <span>›</span>
        <span class="text-textMain-light dark:text-textMain-dark font-medium max-w-xs truncate">${escapeHTML(product.title)}</span>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          id="shareProductBtn"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-appBorder-light dark:border-appBorder-dark hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-bold text-textMain-light dark:text-textMain-dark"
          title="Поделиться ссылкой на товар"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
          <span>Поделиться</span>
        </button>

        <a
          href="#/catalog"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-textMain-light dark:text-textMain-dark transition-colors"
        >
          ← Назад в каталог
        </a>
      </div>
    </nav>

    <!-- ГАЛЕРЕЯ И ПРИЛИПАЮЩИЙ БЛОК ПОКУПКИ -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      <!-- ЛЕВАЯ КОЛОНКА: ГАЛЕРЕЯ С ЛАЙТБОКСОМ -->
      <div class="lg:col-span-7 space-y-4">
        <div class="relative w-full h-[360px] sm:h-[460px] rounded-3xl bg-white dark:bg-surface-cardDark border border-appBorder-light dark:border-appBorder-dark shadow-subtle overflow-hidden flex items-center justify-center p-6 group">
          
          <!-- Кнопка зума в полноэкранный режим -->
          <button
            type="button"
            id="openLightboxBtn"
            class="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/90 dark:bg-slate-800/90 shadow-md border border-appBorder-light dark:border-appBorder-dark hover:scale-110 active:scale-95 transition-all text-slate-600 dark:text-slate-300"
            title="Открыть на весь экран"
            aria-label="Полноэкранный просмотр"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
          </button>

          ${
            images.length > 1
              ? `
                <button
                  type="button"
                  id="prevGalleryImageBtn"
                  class="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/90 dark:bg-slate-800/90 shadow-md border border-appBorder-light dark:border-appBorder-dark flex items-center justify-center text-slate-700 dark:text-slate-200 hover:scale-110 active:scale-95 transition-all"
                  aria-label="Предыдущее фото"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                </button>
                <button
                  type="button"
                  id="nextGalleryImageBtn"
                  class="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/90 dark:bg-slate-800/90 shadow-md border border-appBorder-light dark:border-appBorder-dark flex items-center justify-center text-slate-700 dark:text-slate-200 hover:scale-110 active:scale-95 transition-all"
                  aria-label="Следующее фото"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </button>
              `
              : ''
          }

          <img
            id="mainGalleryImg"
            src="${escapeHTML(currentImgSrc)}"
            alt="${escapeHTML(product.title)}"
            class="max-h-full max-w-full object-contain cursor-zoom-in transition-transform duration-300 group-hover:scale-105"
            onerror="this.onerror=null; this.src='https://placehold.co/600x600/e2e8f0/64748b?text=AUREON';"
          />
        </div>

        <!-- Превью миниатюр внизу -->
        ${
          images.length > 1
            ? `
              <div class="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                ${images
                  .map(
                    (img, idx) => `
                  <button
                    type="button"
                    class="gallery-thumb-btn flex-shrink-0 w-16 h-16 rounded-xl bg-white dark:bg-surface-cardDark border-2 p-1 transition-all overflow-hidden ${
                      idx === APP_STATE.productPageUI.selectedImageIndex
                        ? 'border-brand shadow-glow ring-2 ring-brand/20'
                        : 'border-appBorder-light dark:border-appBorder-dark opacity-70 hover:opacity-100'
                    }"
                    data-thumb-idx="${idx}"
                  >
                    <img src="${escapeHTML(img)}" alt="Превью ${idx + 1}" class="w-full h-full object-contain" />
                  </button>
                `
                  )
                  .join('')}
              </div>
            `
            : ''
        }
      </div>

      <!-- ПРАВАЯ КОЛОНКА: ДЕСКТОПНЫЙ STICKY-БЛОК ПОКУПКИ -->
      <div class="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
        <div class="p-6 rounded-3xl bg-white dark:bg-surface-cardDark border border-appBorder-light dark:border-appBorder-dark shadow-subtle space-y-5">
          
          <div class="flex flex-wrap items-center justify-between gap-2">
            <span class="text-xs uppercase font-extrabold tracking-widest text-brand">
              ${escapeHTML(product.category)}
            </span>
            <div class="flex items-center gap-1.5">
              ${
                hasDiscount
                  ? `<span class="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-500 text-white shadow-sm">
                      ${t.discountBadge(product.discountPercentage)}
                    </span>`
                  : ''
              }
              <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                stock > 0
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
              }">
                ${stock > 0 ? (stock <= 5 ? t.lowStock : t.inStock(stock)) : t.outOfStock}
              </span>
            </div>
          </div>

          <h1 class="text-2xl font-extrabold text-textMain-light dark:text-textMain-dark tracking-tight leading-snug">
            ${escapeHTML(product.title)}
          </h1>

          <div class="flex items-center gap-3 pt-1 border-b border-appBorder-light dark:border-appBorder-dark pb-3 text-xs">
            ${renderRatingStars(product.rating, 'text-xs')}
            <span class="text-slate-300 dark:text-slate-700">•</span>
            <button
              type="button"
              id="jumpToReviewsBtn"
              class="font-bold text-textSub-light dark:text-textSub-dark hover:text-brand underline decoration-slate-300 transition-colors"
            >
              ${totalReviewsCount} отзывов
            </button>
            ${
              product.brand
                ? `
                  <span class="text-slate-300 dark:text-slate-700">•</span>
                  <span class="font-semibold text-textSub-light dark:text-textSub-dark">Бренд: <strong class="text-textMain-light dark:text-textMain-dark">${escapeHTML(product.brand)}</strong></span>
                `
                : ''
            }
          </div>

          <!-- Цены -->
          <div class="space-y-1">
            <div class="flex items-baseline gap-3">
              <span class="text-3xl font-extrabold text-textMain-light dark:text-textMain-dark tracking-tight">
                ${formatPrice(finalPrice)}
              </span>
              ${
                hasDiscount
                  ? `<span class="text-sm text-textSub-light dark:text-textSub-dark line-through font-semibold">
                      ${formatPrice(originalPrice)}
                    </span>`
                  : ''
              }
            </div>
            ${
              hasDiscount && savings > 0
                ? `<p class="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Экономия ${formatPrice(savings)} (${Math.round(product.discountPercentage)}%)
                  </p>`
                : ''
            }
          </div>

          ${
            minQty > 1
              ? `
                <div class="p-3 rounded-xl bg-brand-50/80 dark:bg-brand-950/40 border border-brand-200/60 dark:border-brand-900/60 text-xs text-brand flex items-center gap-2">
                  <svg class="w-4 h-4 text-brand flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  <span>${t.minOrder(minQty)}</span>
                </div>
              `
              : ''
          }

          <!-- Количество и кнопки покупки -->
          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <div class="inline-flex items-center rounded-xl border border-appBorder-light dark:border-appBorder-dark bg-slate-50 dark:bg-slate-900 p-1">
                <button
                  type="button"
                  id="detailQtyMinusBtn"
                  class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-textMain-light dark:text-textMain-dark hover:bg-white dark:hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  ${APP_STATE.productPageUI.selectedQuantity <= minQty ? 'disabled' : ''}
                >
                  −
                </button>
                <span id="detailQtyDisplay" class="w-10 text-center font-extrabold text-sm text-textMain-light dark:text-textMain-dark">
                  ${APP_STATE.productPageUI.selectedQuantity}
                </span>
                <button
                  type="button"
                  id="detailQtyPlusBtn"
                  class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-textMain-light dark:text-textMain-dark hover:bg-white dark:hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  ${APP_STATE.productPageUI.selectedQuantity >= stock ? 'disabled' : ''}
                >
                  +
                </button>
              </div>

              <button
                type="button"
                id="detailToggleFavBtn"
                class="flex-1 py-2.5 px-3 rounded-xl border border-appBorder-light dark:border-appBorder-dark hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 text-textMain-light dark:text-textMain-dark"
              >
                <svg class="w-4 h-4 transition-colors ${isFavorite ? 'text-rose-500 fill-rose-500' : 'fill-none'}" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
                <span>${isFavorite ? 'В избранном' : 'В избранное'}</span>
              </button>
            </div>

            <div class="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                id="detailAddToCartBtn"
                class="py-3 px-4 rounded-xl font-bold text-xs shadow-glow flex items-center justify-center gap-1.5 active:scale-95 transition-all ${
                  cannotOrder
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed col-span-2'
                    : 'bg-brand hover:bg-brand-600 text-white'
                }"
                ${cannotOrder ? 'disabled' : ''}
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                <span>${cannotOrder ? t.unavailable : t.addToCart}</span>
              </button>

              ${
                !cannotOrder
                  ? `
                    <button
                      type="button"
                      id="detailBuyNowBtn"
                      class="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-950 font-bold text-xs shadow-subtle active:scale-95 transition-all"
                    >
                      ${t.buyNow}
                    </button>
                  `
                  : ''
              }
            </div>
          </div>

          <!-- Факты доставки и гарантии -->
          <div class="pt-3 border-t border-appBorder-light dark:border-appBorder-dark space-y-2 text-xs text-textSub-light dark:text-textSub-dark">
            ${
              product.shippingInformation
                ? `<div class="flex items-center gap-2">🚚 <span><strong>Доставка:</strong> ${escapeHTML(product.shippingInformation)}</span></div>`
                : ''
            }
            ${
              product.warrantyInformation
                ? `<div class="flex items-center gap-2">🛡️ <span><strong>Гарантия:</strong> ${escapeHTML(product.warrantyInformation)}</span></div>`
                : ''
            }
            ${
              product.returnPolicy
                ? `<div class="flex items-center gap-2">🔄 <span><strong>Возврат:</strong> ${escapeHTML(product.returnPolicy)}</span></div>`
                : ''
            }
          </div>

        </div>
      </div>
    </div>

    <!-- ВКЛАДКИ -->
    <section id="productTabsSection" class="pt-6 space-y-6">
      <div class="flex items-center gap-2 border-b border-appBorder-light dark:border-appBorder-dark overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          class="tab-trigger-btn px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
            APP_STATE.productPageUI.activeTab === 'description'
              ? 'bg-brand text-white shadow-glow'
              : 'text-textSub-light dark:text-textSub-dark hover:bg-slate-100 dark:hover:bg-slate-800'
          }"
          data-tab="description"
        >
          ${t.tabDescription}
        </button>
        <button
          type="button"
          class="tab-trigger-btn px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
            APP_STATE.productPageUI.activeTab === 'specs'
              ? 'bg-brand text-white shadow-glow'
              : 'text-textSub-light dark:text-textSub-dark hover:bg-slate-100 dark:hover:bg-slate-800'
          }"
          data-tab="specs"
        >
          ${t.tabSpecs}
        </button>
        <button
          type="button"
          class="tab-trigger-btn px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
            APP_STATE.productPageUI.activeTab === 'shipping'
              ? 'bg-brand text-white shadow-glow'
              : 'text-textSub-light dark:text-textSub-dark hover:bg-slate-100 dark:hover:bg-slate-800'
          }"
          data-tab="shipping"
        >
          ${t.tabShipping}
        </button>
        <button
          type="button"
          class="tab-trigger-btn px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
            APP_STATE.productPageUI.activeTab === 'reviews'
              ? 'bg-brand text-white shadow-glow'
              : 'text-textSub-light dark:text-textSub-dark hover:bg-slate-100 dark:hover:bg-slate-800'
          }"
          data-tab="reviews"
        >
          ${t.tabReviews} (${totalReviewsCount})
        </button>
      </div>

      <div class="p-6 rounded-3xl bg-white dark:bg-surface-cardDark border border-appBorder-light dark:border-appBorder-dark shadow-subtle">
        <!-- ВКЛАДКА 1: ОПИСАНИЕ -->
        <div class="${APP_STATE.productPageUI.activeTab === 'description' ? 'block' : 'hidden'} space-y-4">
          <h4 class="text-base font-bold text-textMain-light dark:text-textMain-dark">${t.tabDescription}</h4>
          <p class="text-sm text-textSub-light dark:text-textSub-dark leading-relaxed max-w-3xl">
            ${escapeHTML(product.description || 'Описание отсутствует.')}
          </p>
          ${
            product.tags && product.tags.length > 0
              ? `
                <div class="pt-3 border-t border-appBorder-light dark:border-appBorder-dark flex flex-wrap gap-2 items-center">
                  <span class="text-xs font-bold text-slate-400">Теги:</span>
                  ${product.tags.map(tag => `<span class="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold">#${escapeHTML(tag)}</span>`).join('')}
                </div>
              `
              : ''
          }
        </div>

        <!-- ВКЛАДКА 2: ХАРАКТЕРИСТИКИ -->
        <div class="${APP_STATE.productPageUI.activeTab === 'specs' ? 'block' : 'hidden'} space-y-4">
          <h4 class="text-base font-bold text-textMain-light dark:text-textMain-dark">${t.tabSpecs}</h4>
          <dl class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            ${
              product.brand
                ? `<div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 flex justify-between"><dt class="text-textSub-light">Бренд</dt><dd class="font-bold text-textMain-light dark:text-textMain-dark">${escapeHTML(product.brand)}</dd></div>`
                : ''
            }
            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 flex justify-between"><dt class="text-textSub-light">Категория</dt><dd class="font-bold uppercase tracking-wider text-brand">${escapeHTML(product.category)}</dd></div>
            ${
              product.weight
                ? `<div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 flex justify-between"><dt class="text-textSub-light">Вес</dt><dd class="font-bold text-textMain-light dark:text-textMain-dark">${product.weight} кг / г</dd></div>`
                : ''
            }
            ${
              product.dimensions
                ? `<div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 flex justify-between"><dt class="text-textSub-light">Габариты</dt><dd class="font-bold text-textMain-light dark:text-textMain-dark">${product.dimensions.width} × ${product.dimensions.height} × ${product.dimensions.depth} см</dd></div>`
                : ''
            }
            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 flex justify-between"><dt class="text-textSub-light">Статус склада</dt><dd class="font-bold text-textMain-light dark:text-textMain-dark">${escapeHTML(product.availabilityStatus || 'В наличии')}</dd></div>
            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 flex justify-between"><dt class="text-textSub-light">Остаток</dt><dd class="font-bold text-textMain-light dark:text-textMain-dark">${product.stock || 0} шт.</dd></div>
            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 flex justify-between"><dt class="text-textSub-light">Минимальный заказ</dt><dd class="font-bold text-textMain-light dark:text-textMain-dark">${minQty} шт.</dd></div>
          </dl>
        </div>

        <!-- ВКЛАДКА 3: ДОСТАВКА И ВОЗВРАТ -->
        <div class="${APP_STATE.productPageUI.activeTab === 'shipping' ? 'block' : 'hidden'} space-y-4">
          <h4 class="text-base font-bold text-textMain-light dark:text-textMain-dark">${t.tabShipping}</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 space-y-1.5">
              <h5 class="font-bold text-textMain-light dark:text-textMain-dark">Сроки доставки</h5>
              <p class="text-textSub-light leading-relaxed">${escapeHTML(product.shippingInformation || 'Стандартные сроки.')}</p>
            </div>
            <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 space-y-1.5">
              <h5 class="font-bold text-textMain-light dark:text-textMain-dark">Гарантия качества</h5>
              <p class="text-textSub-light leading-relaxed">${escapeHTML(product.warrantyInformation || 'Гарантия поставщика.')}</p>
            </div>
            <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 space-y-1.5">
              <h5 class="font-bold text-textMain-light dark:text-textMain-dark">Условия возврата</h5>
              <p class="text-textSub-light leading-relaxed">${escapeHTML(product.returnPolicy || 'Регламент возврата.')}</p>
            </div>
          </div>
        </div>

        <!-- ВКЛАДКА 4: ОТЗЫВЫ С СОРТИРОВКОЙ И ФИЛЬТРОМ ПО ЗВЁЗДАМ -->
        <div class="${APP_STATE.productPageUI.activeTab === 'reviews' ? 'block' : 'hidden'} space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-5 rounded-2xl bg-slate-50 dark:bg-slate-900">
            <div class="md:col-span-4 text-center md:text-left space-y-1">
              <span class="text-4xl font-black text-textMain-light dark:text-textMain-dark">
                ${(Number(product.rating) || 0).toFixed(1)}
              </span>
              <div>${renderRatingStars(product.rating, 'text-sm')}</div>
              <p class="text-xs text-textSub-light">${totalReviewsCount} проверенных отзывов</p>
            </div>

            <div class="md:col-span-8 space-y-1.5 text-xs">
              ${[5, 4, 3, 2, 1]
                .map(star => {
                  const count = ratingDistribution[star] || 0;
                  const pct = totalReviewsCount > 0 ? Math.round((count / totalReviewsCount) * 100) : 0;
                  return `
                    <div class="flex items-center gap-2">
                      <span class="w-7 font-bold text-right">${star} ★</span>
                      <div class="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div class="h-full bg-amber-400 rounded-full" style="width: ${pct}%"></div>
                      </div>
                      <span class="w-10 text-right text-textSub-light">${count}</span>
                    </div>
                  `;
                })
                .join('')}
            </div>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-appBorder-light dark:border-appBorder-dark text-xs">
            <div class="flex flex-wrap items-center gap-1.5">
              <button type="button" class="review-filter-btn px-3 py-1.5 rounded-xl font-bold ${filterStars === 'all' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-textSub-light'}" data-star-filter="all">Все</button>
              ${[5, 4, 3, 2, 1].map(s => `<button type="button" class="review-filter-btn px-2.5 py-1.5 rounded-xl font-bold ${filterStars === String(s) ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-textSub-light'}" data-star-filter="${s}">${s} ★</button>`).join('')}
            </div>

            <div class="flex items-center gap-2">
              <label for="reviewSortSelect" class="text-textSub-light">Сортировка:</label>
              <select id="reviewSortSelect" class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-textMain-light dark:text-textMain-dark focus:outline-none">
                <option value="newest" ${sortMode === 'newest' ? 'selected' : ''}>Сначала новые</option>
                <option value="oldest" ${sortMode === 'oldest' ? 'selected' : ''}>Сначала старые</option>
                <option value="highest" ${sortMode === 'highest' ? 'selected' : ''}>С высокой оценкой</option>
                <option value="lowest" ${sortMode === 'lowest' ? 'selected' : ''}>С низкой оценкой</option>
              </select>
            </div>
          </div>

          <!-- Список отзывов -->
          <div class="space-y-3">
            ${
              filteredReviews.length === 0
                ? `<p class="py-6 text-center text-xs text-textSub-light">Нет отзывов по выбранному фильтру.</p>`
                : filteredReviews.map(r => `
                    <div class="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-appBorder-light dark:border-appBorder-dark space-y-1.5">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                          <span class="font-extrabold text-xs text-textMain-light dark:text-textMain-dark">${escapeHTML(r.reviewerName || 'Покупатель')}</span>
                          ${r.isLocal ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand/10 text-brand">${t.localReviewBadge}</span>` : ''}
                        </div>
                        <span class="text-[10px] text-textSub-light">${r.date ? new Date(r.date).toLocaleDateString() : 'Недавно'}</span>
                      </div>
                      <div>${renderRatingStars(r.rating, 'text-[11px]')}</div>
                      <p class="text-xs text-textSub-light dark:text-textSub-dark leading-relaxed">${escapeHTML(r.comment || '')}</p>
                    </div>
                  `).join('')
            }
          </div>

          <!-- Форма добавления отзыва -->
          <div class="mt-6 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-appBorder-light dark:border-appBorder-dark space-y-3">
            <h5 class="font-bold text-xs text-textMain-light dark:text-textMain-dark">${t.writeReviewTitle}</h5>
            <form id="addReviewForm" class="space-y-3 text-xs">
              <div class="flex items-center gap-2">
                <span class="text-textSub-light font-semibold">Ваша оценка:</span>
                <div id="starPickerContainer" class="flex items-center gap-1 cursor-pointer text-lg text-amber-400">
                  <span data-star-pick="1">★</span><span data-star-pick="2">★</span><span data-star-pick="3">★</span><span data-star-pick="4">★</span><span data-star-pick="5">★</span>
                </div>
              </div>
              <input type="text" id="reviewAuthorName" placeholder="Ваше имя" required class="w-full px-3 py-2 rounded-xl bg-white dark:bg-surface-dark border border-appBorder-light dark:border-appBorder-dark focus:ring-2 focus:ring-brand focus:outline-none" />
              <textarea id="reviewCommentText" rows="2" placeholder="Поделитесь впечатлениями о товаре..." required class="w-full px-3 py-2 rounded-xl bg-white dark:bg-surface-dark border border-appBorder-light dark:border-appBorder-dark focus:ring-2 focus:ring-brand focus:outline-none"></textarea>
              <div class="flex items-center justify-between">
                <span class="text-[10px] text-textSub-light">* Сохраняется в браузере с пометкой «Виден только на этом устройстве»</span>
                <button type="submit" class="px-4 py-2 rounded-xl bg-brand text-white font-bold text-xs shadow-glow transition-all active:scale-95">${t.submitReviewBtn}</button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </section>

    <!-- ПОХОЖИЕ ТОВАРЫ -->
    ${
      APP_STATE.currentProductSimilar.length > 0
        ? `
          <section class="space-y-4 pt-6 border-t border-appBorder-light dark:border-appBorder-dark">
            <h3 class="text-xl font-extrabold text-textMain-light dark:text-textMain-dark">${t.similarProductsTitle}</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              ${APP_STATE.currentProductSimilar.map(p => createCard(p)).join('')}
            </div>
          </section>
        `
        : ''
    }

    <!-- ВЫ НЕДАВНО СМОТРЕЛИ -->
    ${
      APP_STATE.recent.length > 1
        ? `
          <section class="space-y-4 pt-6 border-t border-appBorder-light dark:border-appBorder-dark">
            <h3 class="text-xl font-extrabold text-textMain-light dark:text-textMain-dark">${t.recentProductsTitle}</h3>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              ${APP_STATE.recent.filter(r => r.id !== product.id).slice(0, 4).map(p => createCard(p)).join('')}
            </div>
          </section>
        `
        : ''
    }

    <!-- МОБИЛЬНАЯ ФИКСИРОВАННАЯ ПАНЕЛЬ ПОКУПКИ С УЧЁТОМ SAFE-AREA-INSET-BOTTOM -->
    <div class="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#111725]/95 backdrop-blur-md border-t border-appBorder-light dark:border-appBorder-dark p-3.5 flex items-center justify-between gap-3 shadow-drawer" style="padding-bottom: calc(0.875rem + var(--safe-bottom));">
      <div>
        <span class="text-base font-black text-textMain-light dark:text-textMain-dark">${formatPrice(finalPrice)}</span>
        ${hasDiscount ? `<span class="block text-[10px] text-textSub-light line-through">${formatPrice(originalPrice)}</span>` : ''}
      </div>
      <div class="flex items-center gap-2">
        <button
          type="button"
          onclick="addToCart(${product.id}, ${APP_STATE.productPageUI.selectedQuantity})"
          class="px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-600 text-white font-bold text-xs shadow-glow transition-all active:scale-95 ${cannotOrder ? 'opacity-40 cursor-not-allowed' : ''}"
          ${cannotOrder ? 'disabled' : ''}
        >
          ${cannotOrder ? t.unavailable : t.addToCart}
        </button>
        ${
          !cannotOrder
            ? `
              <button
                type="button"
                onclick="buyNowDirect(${product.id})"
                class="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs shadow-subtle active:scale-95"
              >
                ${t.buyNow}
              </button>
            `
            : ''
        }
      </div>
    </div>
  `;

  initProductDetailListeners(product, images);
}

function initProductDetailListeners(product, images) {
  const container = document.getElementById('productDetailView');
  if (!container) return;

  const minQty = product.minimumOrderQuantity || 1;
  const stock = product.stock || 0;

  // Миниатюры галереи
  container.querySelectorAll('.gallery-thumb-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      APP_STATE.productPageUI.selectedImageIndex = Number(btn.getAttribute('data-thumb-idx'));
      renderProductDetailContent();
    });
  });

  // Стрелки галереи
  const prevBtn = document.getElementById('prevGalleryImageBtn');
  const nextBtn = document.getElementById('nextGalleryImageBtn');
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      const len = images.length;
      APP_STATE.productPageUI.selectedImageIndex = (APP_STATE.productPageUI.selectedImageIndex - 1 + len) % len;
      renderProductDetailContent();
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const len = images.length;
      APP_STATE.productPageUI.selectedImageIndex = (APP_STATE.productPageUI.selectedImageIndex + 1) % len;
      renderProductDetailContent();
    });
  }

  // Лайтбокс на весь экран
  const openLbBtn = document.getElementById('openLightboxBtn');
  const mainImg = document.getElementById('mainGalleryImg');
  if (openLbBtn) openLbBtn.addEventListener('click', () => openGalleryLightbox(images));
  if (mainImg) mainImg.addEventListener('click', () => openGalleryLightbox(images));

  // Количество
  const minusBtn = document.getElementById('detailQtyMinusBtn');
  const plusBtn = document.getElementById('detailQtyPlusBtn');
  const qtyDisplay = document.getElementById('detailQtyDisplay');
  if (minusBtn && plusBtn && qtyDisplay) {
    minusBtn.addEventListener('click', () => {
      if (APP_STATE.productPageUI.selectedQuantity > minQty) {
        APP_STATE.productPageUI.selectedQuantity--;
        qtyDisplay.textContent = APP_STATE.productPageUI.selectedQuantity;
        minusBtn.disabled = APP_STATE.productPageUI.selectedQuantity <= minQty;
        plusBtn.disabled = APP_STATE.productPageUI.selectedQuantity >= stock;
      }
    });
    plusBtn.addEventListener('click', () => {
      if (APP_STATE.productPageUI.selectedQuantity < stock) {
        APP_STATE.productPageUI.selectedQuantity++;
        qtyDisplay.textContent = APP_STATE.productPageUI.selectedQuantity;
        minusBtn.disabled = APP_STATE.productPageUI.selectedQuantity <= minQty;
        plusBtn.disabled = APP_STATE.productPageUI.selectedQuantity >= stock;
      }
    });
  }

  // В корзину
  const addToCartBtn = document.getElementById('detailAddToCartBtn');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      addToCart(product.id, APP_STATE.productPageUI.selectedQuantity);
    });
  }

  // Купить сейчас
  const buyNowBtn = document.getElementById('detailBuyNowBtn');
  if (buyNowBtn) {
    buyNowBtn.addEventListener('click', () => buyNowDirect(product.id));
  }

  // Избранное
  const favBtn = document.getElementById('detailToggleFavBtn');
  if (favBtn) {
    favBtn.addEventListener('click', () => {
      toggleFavorite(product.id);
      renderProductDetailContent();
    });
  }

  // Поделиться
  const shareBtn = document.getElementById('shareProductBtn');
  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(window.location.href);
        showToast(TRANSLATIONS[APP_STATE.lang].shareSuccess, 'success');
      } catch (e) {
        showToast(TRANSLATIONS[APP_STATE.lang].shareError, 'error');
      }
    });
  }

  // Прыжок к отзывам
  const jumpBtn = document.getElementById('jumpToReviewsBtn');
  if (jumpBtn) {
    jumpBtn.addEventListener('click', () => {
      APP_STATE.productPageUI.activeTab = 'reviews';
      renderProductDetailContent();
      const tabSection = document.getElementById('productTabsSection');
      if (tabSection) tabSection.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Вкладки
  container.querySelectorAll('.tab-trigger-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      APP_STATE.productPageUI.activeTab = btn.getAttribute('data-tab');
      renderProductDetailContent();
    });
  });

  // Фильтр звёзд в отзывах
  container.querySelectorAll('.review-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      APP_STATE.productPageUI.reviewFilterStars = btn.getAttribute('data-star-filter');
      renderProductDetailContent();
    });
  });

  // Сортировка отзывов
  const sortSelect = document.getElementById('reviewSortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      APP_STATE.productPageUI.reviewSort = e.target.value;
      renderProductDetailContent();
    });
  }

  // Выбор оценки звёздами
  const starPicker = document.getElementById('starPickerContainer');
  if (starPicker) {
    const starSpans = starPicker.querySelectorAll('[data-star-pick]');
    const updateDisplay = (val) => {
      starSpans.forEach(span => {
        const p = Number(span.getAttribute('data-star-pick'));
        span.textContent = p <= val ? '★' : '☆';
        span.className = p <= val ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600';
      });
    };
    updateDisplay(APP_STATE.productPageUI.newReviewRating);

    starSpans.forEach(span => {
      span.addEventListener('click', () => {
        const rating = Number(span.getAttribute('data-star-pick'));
        APP_STATE.productPageUI.newReviewRating = rating;
        updateDisplay(rating);
      });
    });
  }

  // Отправка формы отзыва
  const reviewForm = document.getElementById('addReviewForm');
  if (reviewForm) {
    reviewForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const authorInput = document.getElementById('reviewAuthorName');
      const commentInput = document.getElementById('reviewCommentText');
      const author = authorInput ? authorInput.value.trim() : '';
      const comment = commentInput ? commentInput.value.trim() : '';

      if (!author || !comment) {
        showToast(TRANSLATIONS[APP_STATE.lang].reviewValidationToast, 'warning');
        return;
      }

      saveLocalUserReview(product.id, {
        rating: APP_STATE.productPageUI.newReviewRating,
        comment: comment,
        date: new Date().toISOString(),
        reviewerName: author,
      });

      showToast(TRANSLATIONS[APP_STATE.lang].reviewSuccessToast, 'success');
      renderProductDetailContent();
    });
  }
}

function buyNowDirect(productId) {
  addToCart(productId, APP_STATE.productPageUI.selectedQuantity);
  openCheckoutModal();
}

function filterByCategoryAndGo(category) {
  APP_STATE.filters.category = category;
  window.location.hash = `#/catalog`;
  loadCategories();
  loadProducts(true);
}

/* ==============================================================================
 * 13. ПОЛНОЭКРАННЫЙ ЛАЙТБОКС ГАЛЕРЕИ (LIGHTBOX)
 * ============================================================================== */

let lightboxImages = [];
let lightboxCurrentIdx = 0;

function openGalleryLightbox(images) {
  lightboxImages = images;
  lightboxCurrentIdx = APP_STATE.productPageUI.selectedImageIndex;

  const modal = document.getElementById('galleryLightbox');
  const imgElem = document.getElementById('lightboxImage');
  if (!modal || !imgElem) return;

  imgElem.src = lightboxImages[lightboxCurrentIdx];
  modal.classList.remove('hidden');

  const handleKeydown = (e) => {
    if (e.key === 'Escape') closeGalleryLightbox();
    else if (e.key === 'ArrowLeft') {
      lightboxCurrentIdx = (lightboxCurrentIdx - 1 + lightboxImages.length) % lightboxImages.length;
      imgElem.src = lightboxImages[lightboxCurrentIdx];
    } else if (e.key === 'ArrowRight') {
      lightboxCurrentIdx = (lightboxCurrentIdx + 1) % lightboxImages.length;
      imgElem.src = lightboxImages[lightboxCurrentIdx];
    }
  };

  document.addEventListener('keydown', handleKeydown);
  modal._keydownHandler = handleKeydown;
}

function closeGalleryLightbox() {
  const modal = document.getElementById('galleryLightbox');
  if (!modal) return;
  modal.classList.add('hidden');
  if (modal._keydownHandler) {
    document.removeEventListener('keydown', modal._keydownHandler);
    modal._keydownHandler = null;
  }
}

function initLightboxControls() {
  const modal = document.getElementById('galleryLightbox');
  const closeBtn = document.getElementById('lightboxCloseBtn');
  const prevBtn = document.getElementById('lightboxPrevBtn');
  const nextBtn = document.getElementById('lightboxNextBtn');
  const imgElem = document.getElementById('lightboxImage');

  if (closeBtn) closeBtn.addEventListener('click', closeGalleryLightbox);
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      lightboxCurrentIdx = (lightboxCurrentIdx - 1 + lightboxImages.length) % lightboxImages.length;
      if (imgElem) imgElem.src = lightboxImages[lightboxCurrentIdx];
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      lightboxCurrentIdx = (lightboxCurrentIdx + 1) % lightboxImages.length;
      if (imgElem) imgElem.src = lightboxImages[lightboxCurrentIdx];
    });
  }
}

/* ==============================================================================
 * 14. КОРЗИНА: РАСЧЁТ ЭКОНОМИИ, ВЫДВИЖНАЯ ПАНЕЛЬ И ДОСТАВКА
 * ============================================================================== */

function openCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  const backdrop = document.getElementById('cartDrawerBackdrop');
  if (!drawer || !backdrop) return;

  renderCartDrawerContent();
  backdrop.classList.remove('hidden');
  requestAnimationFrame(() => {
    backdrop.classList.remove('opacity-0');
    backdrop.classList.add('opacity-100');
    drawer.classList.remove('translate-x-full');
    drawer.classList.add('translate-x-0');
  });
}

function closeCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  const backdrop = document.getElementById('cartDrawerBackdrop');
  if (!drawer || !backdrop) return;

  backdrop.classList.remove('opacity-100');
  backdrop.classList.add('opacity-0');
  drawer.classList.remove('translate-x-0');
  drawer.classList.add('translate-x-full');
  setTimeout(() => backdrop.classList.add('hidden'), 300);
}

function addToCart(productId, quantity = 1) {
  const id = Number(productId);
  const product = APP_STATE.products.find(p => p.id === id) || APP_STATE.currentProduct;
  if (!product) return;

  const minQty = product.minimumOrderQuantity || 1;
  const qtyToAdd = Math.max(minQty, quantity);
  const existing = APP_STATE.cart.find(item => item.id === id);

  if (existing) {
    existing.quantity += qtyToAdd;
    if (product.stock && existing.quantity > product.stock) {
      existing.quantity = product.stock;
    }
  } else {
    APP_STATE.cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      discountPercentage: product.discountPercentage,
      thumbnail: product.thumbnail,
      quantity: qtyToAdd,
      minimumOrderQuantity: minQty,
      stock: product.stock
    });
  }

  safeStorageSet(STORAGE_KEYS.CART, APP_STATE.cart);
  updateBadges();

  const t = TRANSLATIONS[APP_STATE.lang];
  showToast(t.addedToCartToast(product.title, qtyToAdd), 'success');
}

function removeFromCart(productId) {
  const idx = APP_STATE.cart.findIndex(i => i.id === productId);
  if (idx === -1) return;

  const removedItem = APP_STATE.cart.splice(idx, 1)[0];
  safeStorageSet(STORAGE_KEYS.CART, APP_STATE.cart);
  updateBadges();
  renderCartDrawerContent();

  const t = TRANSLATIONS[APP_STATE.lang];
  showToast(t.itemRemovedFromCart, 'info', {
    text: t.undoBtn,
    onClick: () => {
      APP_STATE.cart.splice(idx, 0, removedItem);
      safeStorageSet(STORAGE_KEYS.CART, APP_STATE.cart);
      updateBadges();
      renderCartDrawerContent();
    }
  });
}

function renderCartDrawerContent() {
  const list = document.getElementById('cartItemsList');
  const drawerCount = document.getElementById('cartDrawerCount');
  const subtotalElem = document.getElementById('cartSubtotal');
  const grandTotalElem = document.getElementById('cartGrandTotal');
  const savingsRow = document.getElementById('cartSavingsRow');
  const savingsElem = document.getElementById('cartSavingsAmount');
  const freeShipBar = document.getElementById('freeShippingBar');
  const freeShipRemain = document.getElementById('freeShippingRemain');
  const t = TRANSLATIONS[APP_STATE.lang];

  if (!list) return;

  const totalCount = APP_STATE.cart.reduce((sum, item) => sum + item.quantity, 0);
  if (drawerCount) drawerCount.textContent = totalCount;

  if (APP_STATE.cart.length === 0) {
    list.innerHTML = `
      <div class="py-16 text-center space-y-3">
        <div class="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
          <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
        </div>
        <h4 class="text-base font-bold text-textMain-light dark:text-textMain-dark">${t.emptyCartTitle}</h4>
        <p class="text-xs text-textSub-light max-w-xs mx-auto">${t.emptyCartDesc}</p>
      </div>
    `;
    if (subtotalElem) subtotalElem.textContent = formatPrice(0);
    if (grandTotalElem) grandTotalElem.textContent = formatPrice(0);
    if (savingsRow) savingsRow.classList.add('hidden');
    if (freeShipBar) freeShipBar.style.width = '0%';
    if (freeShipRemain) freeShipRemain.textContent = '';
    return;
  }

  // Расчёт сумм и экономии
  let sumWithoutDiscount = 0;
  let finalGrandTotal = 0;

  list.innerHTML = APP_STATE.cart
    .map(item => {
      const origPrice = item.price || 0;
      const finalPrice = getFinalPrice(item);
      const itemSubtotal = origPrice * item.quantity;
      const itemFinalTotal = finalPrice * item.quantity;
      const itemSavings = Math.max(0, itemSubtotal - itemFinalTotal);

      sumWithoutDiscount += itemSubtotal;
      finalGrandTotal += itemFinalTotal;

      return `
        <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-appBorder-light dark:border-appBorder-dark flex gap-3 items-center">
          <img
            src="${escapeHTML(item.thumbnail || '')}"
            alt="${escapeHTML(item.title)}"
            class="w-16 h-16 rounded-xl object-contain bg-white dark:bg-surface-dark p-1 flex-shrink-0"
          />
          <div class="flex-1 min-w-0 space-y-1">
            <h5 class="text-xs font-bold text-textMain-light dark:text-textMain-dark truncate">${escapeHTML(item.title)}</h5>
            <div class="flex items-baseline gap-2">
              <span class="text-xs font-extrabold text-textMain-light dark:text-textMain-dark">${formatPrice(finalPrice)}</span>
              ${item.discountPercentage > 0 ? `<span class="text-[10px] text-textSub-light line-through">${formatPrice(origPrice)}</span>` : ''}
            </div>
            ${itemSavings > 0 ? `<span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Выгода: ${formatPrice(itemSavings)}</span>` : ''}

            <!-- Селектор количества в корзине -->
            <div class="flex items-center gap-2 pt-1">
              <div class="inline-flex items-center rounded-lg border border-appBorder-light dark:border-appBorder-dark bg-white dark:bg-surface-dark">
                <button
                  type="button"
                  class="px-2 py-0.5 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
                  onclick="changeCartQuantity(${item.id}, -1)"
                  ${item.quantity <= (item.minimumOrderQuantity || 1) ? 'disabled' : ''}
                >
                  −
                </button>
                <span class="w-8 text-center text-xs font-bold">${item.quantity}</span>
                <button
                  type="button"
                  class="px-2 py-0.5 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
                  onclick="changeCartQuantity(${item.id}, 1)"
                  ${item.stock && item.quantity >= item.stock ? 'disabled' : ''}
                >
                  +
                </button>
              </div>
              <button
                type="button"
                class="text-rose-500 hover:text-rose-600 text-xs font-bold p-1"
                onclick="removeFromCart(${item.id})"
                title="Удалить товар"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      `;
    })
    .join('');

  const totalSavings = Math.max(0, sumWithoutDiscount - finalGrandTotal);

  if (subtotalElem) subtotalElem.textContent = formatPrice(sumWithoutDiscount);
  if (grandTotalElem) grandTotalElem.textContent = formatPrice(finalGrandTotal);

  if (savingsRow && savingsElem) {
    if (totalSavings > 0) {
      savingsElem.textContent = `-${formatPrice(totalSavings)}`;
      savingsRow.classList.remove('hidden');
    } else {
      savingsRow.classList.add('hidden');
    }
  }

  // Прогресс бесплатной доставки ($50 порог в USD)
  if (freeShipBar && freeShipRemain) {
    const progressPct = Math.min(100, Math.round((finalGrandTotal / FREE_SHIPPING_THRESHOLD_USD) * 100));
    freeShipBar.style.width = `${progressPct}%`;

    if (finalGrandTotal >= FREE_SHIPPING_THRESHOLD_USD) {
      freeShipRemain.textContent = t.freeShippingReached;
      freeShipRemain.className = 'text-emerald-600 font-bold';
    } else {
      const remainUSD = FREE_SHIPPING_THRESHOLD_USD - finalGrandTotal;
      freeShipRemain.textContent = t.freeShippingRemain(formatPrice(remainUSD));
      freeShipRemain.className = 'text-brand font-bold';
    }
  }
}

function changeCartQuantity(productId, delta) {
  const item = APP_STATE.cart.find(i => i.id === productId);
  if (!item) return;

  const min = item.minimumOrderQuantity || 1;
  const max = item.stock || 999;
  const nextQty = item.quantity + delta;

  if (nextQty >= min && nextQty <= max) {
    item.quantity = nextQty;
    safeStorageSet(STORAGE_KEYS.CART, APP_STATE.cart);
    updateBadges();
    renderCartDrawerContent();
  }
}

/* ==============================================================================
 * 15. ИЗБРАННОЕ И ПАНЕЛЬ FAVORITES DRAWER
 * ============================================================================== */

function openFavoritesDrawer() {
  const drawer = document.getElementById('favoritesDrawer');
  const backdrop = document.getElementById('favoritesDrawerBackdrop');
  if (!drawer || !backdrop) return;

  renderFavoritesDrawerContent();
  backdrop.classList.remove('hidden');
  requestAnimationFrame(() => {
    backdrop.classList.remove('opacity-0');
    backdrop.classList.add('opacity-100');
    drawer.classList.remove('translate-x-full');
    drawer.classList.add('translate-x-0');
  });
}

function closeFavoritesDrawer() {
  const drawer = document.getElementById('favoritesDrawer');
  const backdrop = document.getElementById('favoritesDrawerBackdrop');
  if (!drawer || !backdrop) return;

  backdrop.classList.remove('opacity-100');
  backdrop.classList.add('opacity-0');
  drawer.classList.remove('translate-x-0');
  drawer.classList.add('translate-x-full');
  setTimeout(() => backdrop.classList.add('hidden'), 300);
}

function toggleFavorite(productId) {
  const id = Number(productId);
  const index = APP_STATE.favorites.indexOf(id);
  const t = TRANSLATIONS[APP_STATE.lang];
  const product = APP_STATE.products.find(p => p.id === id) || APP_STATE.currentProduct;
  const title = product ? product.title : 'Товар';

  if (index > -1) {
    APP_STATE.favorites.splice(index, 1);
    showToast(t.removedFromFavToast(title), 'info');
  } else {
    APP_STATE.favorites.push(id);
    showToast(t.addedToFavToast(title), 'success');
  }

  safeStorageSet(STORAGE_KEYS.FAVORITES, APP_STATE.favorites);
  updateBadges();

  // Синхронизация сердечек в каталоге
  document.querySelectorAll(`[data-action="toggle-favorite"][data-id="${id}"] svg`).forEach(cardHeart => {
    const isNowFav = APP_STATE.favorites.includes(id);
    if (isNowFav) {
      cardHeart.classList.add('text-rose-500', 'fill-rose-500');
      cardHeart.classList.remove('fill-none');
    } else {
      cardHeart.classList.remove('text-rose-500', 'fill-rose-500');
      cardHeart.classList.add('fill-none');
    }
  });

  renderFavoritesDrawerContent();
}

function renderFavoritesDrawerContent() {
  const list = document.getElementById('favoritesItemsList');
  const drawerCount = document.getElementById('favoritesDrawerCount');
  const t = TRANSLATIONS[APP_STATE.lang];
  if (!list) return;

  if (drawerCount) drawerCount.textContent = APP_STATE.favorites.length;

  if (APP_STATE.favorites.length === 0) {
    list.innerHTML = `
      <div class="py-16 text-center space-y-3">
        <div class="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
          <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
        </div>
        <h4 class="text-base font-bold text-textMain-light dark:text-textMain-dark">${t.emptyFavTitle}</h4>
        <p class="text-xs text-textSub-light max-w-xs mx-auto">${t.emptyFavDesc}</p>
      </div>
    `;
    return;
  }

  list.innerHTML = APP_STATE.favorites
    .map(favId => {
      const p = APP_STATE.products.find(item => item.id === favId) || { id: favId, title: `Товар #${favId}`, price: 0 };
      const finalPrice = getFinalPrice(p);

      return `
        <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-appBorder-light dark:border-appBorder-dark flex gap-3 items-center">
          <img
            src="${escapeHTML(p.thumbnail || '')}"
            alt="${escapeHTML(p.title)}"
            class="w-16 h-16 rounded-xl object-contain bg-white dark:bg-surface-dark p-1 flex-shrink-0"
            onerror="this.src='https://placehold.co/200x200?text=AUREON'"
          />
          <div class="flex-1 min-w-0 space-y-1">
            <h5 class="text-xs font-bold text-textMain-light dark:text-textMain-dark truncate cursor-pointer hover:text-brand" onclick="window.location.hash='#/product/${p.id}'; closeFavoritesDrawer();">
              ${escapeHTML(p.title)}
            </h5>
            <span class="text-xs font-extrabold text-textMain-light dark:text-textMain-dark">${formatPrice(finalPrice)}</span>
            <div class="flex gap-2 pt-1">
              <button
                type="button"
                class="px-2.5 py-1 rounded-lg bg-brand text-white font-bold text-[11px] shadow-glow"
                onclick="addToCart(${p.id});"
              >
                В корзину
              </button>
              <button
                type="button"
                class="px-2.5 py-1 rounded-lg text-rose-500 font-bold text-[11px] hover:bg-rose-50 dark:hover:bg-rose-950"
                onclick="toggleFavorite(${p.id});"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      `;
    })
    .join('');
}

/* ==============================================================================
 * 16. ОФОРМЛЕНИЕ ЗАКАЗА И СКАЧИВАНИЕ ЧЕКА (.TXT BLOB)
 * ============================================================================== */

let lastPlacedOrder = null;

function openCheckoutModal() {
  closeCartDrawer();
  const modal = document.getElementById('checkoutModalBackdrop');
  const totalElem = document.getElementById('checkoutTotalAmount');
  if (!modal) return;

  const grandTotal = APP_STATE.cart.reduce((sum, item) => sum + getFinalPrice(item) * item.quantity, 0);
  if (totalElem) totalElem.textContent = formatPrice(grandTotal);

  modal.classList.remove('hidden');
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkoutModalBackdrop');
  if (modal) modal.classList.add('hidden');
}

function initCheckout() {
  const form = document.getElementById('checkoutForm');
  const closeBtn = document.getElementById('checkoutCloseBtn');
  const successCloseBtn = document.getElementById('successModalCloseBtn');
  const downloadBtn = document.getElementById('downloadReceiptBtn');

  if (closeBtn) closeBtn.addEventListener('click', closeCheckoutModal);

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('orderCustomerName');
      const phoneInput = document.getElementById('orderCustomerPhone');
      const addressInput = document.getElementById('orderCustomerAddress');
      const paymentInput = document.querySelector('input[name="paymentMethod"]:checked');

      const name = nameInput ? nameInput.value.trim() : '';
      const phone = phoneInput ? phoneInput.value.trim() : '';
      const address = addressInput ? addressInput.value.trim() : '';
      const payment = paymentInput ? paymentInput.value : 'card';

      // Валидация телефона (минимум 7 цифр)
      const phoneDigits = phone.replace(/\D/g, '');
      if (phoneDigits.length < 7) {
        showToast('Пожалуйста, введите корректный номер телефона (не менее 7 цифр)', 'warning');
        if (phoneInput) phoneInput.focus();
        return;
      }

      if (!name || !address) {
        showToast('Пожалуйста, заполните все обязательные поля формы', 'warning');
        return;
      }

      // Генерация 6-значного номера заказа
      const orderNumber = `#${Math.floor(100000 + Math.random() * 900000)}`;
      const orderDate = new Date();

      const itemsSnapshot = APP_STATE.cart.map(item => ({
        id: item.id,
        title: item.title,
        price: getFinalPrice(item),
        originalPrice: item.price,
        quantity: item.quantity,
      }));

      const grandTotalUSD = itemsSnapshot.reduce((sum, i) => sum + i.price * i.quantity, 0);

      const orderData = {
        orderNumber,
        date: orderDate.toISOString(),
        customer: { name, phone, address, payment },
        items: itemsSnapshot,
        totalUSD: grandTotalUSD,
        currencyUsed: APP_STATE.currency,
      };

      // Сохраняем в историю заказов
      APP_STATE.orders = safeStorageGet(STORAGE_KEYS.ORDERS, []);
      APP_STATE.orders.unshift(orderData);
      safeStorageSet(STORAGE_KEYS.ORDERS, APP_STATE.orders);

      lastPlacedOrder = orderData;

      // Очищаем корзину
      APP_STATE.cart = [];
      safeStorageSet(STORAGE_KEYS.CART, []);
      updateBadges();

      closeCheckoutModal();

      // Показываем окно успеха
      const successModal = document.getElementById('orderSuccessModal');
      const numElem = document.getElementById('successOrderNumber');
      if (numElem) numElem.textContent = orderNumber;
      if (successModal) successModal.classList.remove('hidden');
    });
  }

  if (successCloseBtn) {
    successCloseBtn.addEventListener('click', () => {
      const successModal = document.getElementById('orderSuccessModal');
      if (successModal) successModal.classList.add('hidden');
      window.location.hash = '#/catalog';
    });
  }

  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      if (lastPlacedOrder) {
        generateAndDownloadReceipt(lastPlacedOrder);
      }
    });
  }
}

/**
 * Генерация текстового чека через Blob и временную ссылку скачивания
 */
function generateAndDownloadReceipt(order) {
  const line = '==================================================\n';
  let receipt = '';
  receipt += line;
  receipt += '               ТОРГОВАЯ ПЛАТФОРМА AUREON          \n';
  receipt += '          ДЕМОНСТРАЦИОННЫЙ ЭЛЕКТРОННЫЙ ЧЕК         \n';
  receipt += line;
  receipt += ` Номер заказа: ${order.orderNumber}\n`;
  receipt += ` Дата и время: ${new Date(order.date).toLocaleString()}\n`;
  receipt += ` Покупатель:   ${order.customer.name}\n`;
  receipt += ` Телефон:      ${order.customer.phone}\n`;
  receipt += ` Адрес:        ${order.customer.address}\n`;
  receipt += ` Оплата:       ${order.customer.payment === 'card' ? 'Карта онлайн' : 'При получении'}\n`;
  receipt += line;
  receipt += ' ТОВАРЫ:\n';

  order.items.forEach((item, idx) => {
    receipt += ` ${idx + 1}. ${item.title}\n`;
    receipt += `    ${item.quantity} шт. x ${formatPrice(item.price)} = ${formatPrice(item.price * item.quantity)}\n`;
  });

  receipt += line;
  receipt += ` ИТОГО К ОПЛАТЕ: ${formatPrice(order.totalUSD)}\n`;
  receipt += line;
  receipt += ' ВНИМАНИЕ:\n';
  receipt += ' Данный заказ является демонстрационным, создан в\n';
  receipt += ' учебных/ознакомительных целях и нигде не обрабатывается.\n';
  receipt += line;

  const blob = new Blob([receipt], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `AUREON_Check_${order.orderNumber.replace('#', '')}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ==============================================================================
 * 17. ИСТОРИЯ ЗАКАЗОВ (ORDERS DRAWER)
 * ============================================================================== */

function openOrdersDrawer() {
  const drawer = document.getElementById('ordersDrawer');
  const backdrop = document.getElementById('ordersDrawerBackdrop');
  if (!drawer || !backdrop) return;

  renderOrdersDrawerContent();
  backdrop.classList.remove('hidden');
  requestAnimationFrame(() => {
    backdrop.classList.remove('opacity-0');
    backdrop.classList.add('opacity-100');
    drawer.classList.remove('translate-x-full');
    drawer.classList.add('translate-x-0');
  });
}

function closeOrdersDrawer() {
  const drawer = document.getElementById('ordersDrawer');
  const backdrop = document.getElementById('ordersDrawerBackdrop');
  if (!drawer || !backdrop) return;

  backdrop.classList.remove('opacity-100');
  backdrop.classList.add('opacity-0');
  drawer.classList.remove('translate-x-0');
  drawer.classList.add('translate-x-full');
  setTimeout(() => backdrop.classList.add('hidden'), 300);
}

function renderOrdersDrawerContent() {
  const list = document.getElementById('ordersListContainer');
  const t = TRANSLATIONS[APP_STATE.lang];
  if (!list) return;

  const orders = safeStorageGet(STORAGE_KEYS.ORDERS, []);

  if (orders.length === 0) {
    list.innerHTML = `
      <div class="py-16 text-center space-y-3">
        <div class="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
          <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
        </div>
        <h4 class="text-base font-bold text-textMain-light dark:text-textMain-dark">${t.emptyOrdersTitle}</h4>
        <p class="text-xs text-textSub-light max-w-xs mx-auto">${t.emptyOrdersDesc}</p>
      </div>
    `;
    return;
  }

  list.innerHTML = orders
    .map(order => `
      <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-appBorder-light dark:border-appBorder-dark space-y-2 text-xs">
        <div class="flex items-center justify-between">
          <span class="font-black text-brand text-sm">${order.orderNumber}</span>
          <span class="text-[10px] text-textSub-light">${new Date(order.date).toLocaleDateString()}</span>
        </div>
        <p class="text-textSub-light">Товаров: <strong>${order.items.reduce((s, i) => s + i.quantity, 0)} шт.</strong></p>
        <div class="flex items-center justify-between pt-2 border-t border-appBorder-light dark:border-appBorder-dark">
          <span class="font-extrabold text-sm text-textMain-light dark:text-textMain-dark">${formatPrice(order.totalUSD)}</span>
          <button
            type="button"
            class="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 font-bold text-[11px]"
            onclick='generateAndDownloadReceipt(${JSON.stringify(order).replace(/'/g, "&apos;")})'
          >
            Чек (.txt)
          </button>
        </div>
      </div>
    `)
    .join('');
}

/* ==============================================================================
 * 18. «ВЫ НЕДАВНО СМОТРЕЛИ» В КАТАЛОГЕ
 * ============================================================================== */

function renderRecentCatalogSection() {
  const section = document.getElementById('catalogRecentViewedSection');
  const grid = document.getElementById('catalogRecentGrid');
  if (!section || !grid) return;

  if (APP_STATE.recent.length === 0) {
    section.classList.add('hidden');
    return;
  }

  section.classList.remove('hidden');
  grid.innerHTML = APP_STATE.recent.slice(0, 4).map(p => createCard(p)).join('');
}

/* ==============================================================================
 * 19. БЕСКОНЕЧНАЯ ПРОКРУТКА (INTERSECTION OBSERVER)
 * ============================================================================== */

function initInfiniteScroll() {
  const sentinel = document.getElementById('infiniteScrollSentinel');
  if (!sentinel) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !APP_STATE.isLoading) {
        if (APP_STATE.skip < APP_STATE.total && APP_STATE.total > 0) {
          loadProducts(false);
        }
      }
    });
  }, { rootMargin: '200px' });

  observer.observe(sentinel);
}

/* ==============================================================================
 * 20. ХЭШ-РОУТИНГ И СИНХРОНИЗАЦИЯ URL
 * ============================================================================== */

function parseURLHash() {
  const hash = window.location.hash || '#/catalog';
  const productMatch = hash.match(/^#\/product\/(\d+)$/);

  if (productMatch) {
    return { route: 'product', id: productMatch[1] };
  }

  // Парсинг параметров фильтров из hash: #/catalog?category=...&search=...
  if (hash.includes('?')) {
    const params = new URLSearchParams(hash.split('?')[1]);
    if (params.has('category')) APP_STATE.filters.category = params.get('category');
    if (params.has('search')) APP_STATE.filters.search = params.get('search');
    if (params.has('sort')) APP_STATE.filters.sort = params.get('sort');
    if (params.has('minPrice')) APP_STATE.filters.minPrice = Number(params.get('minPrice')) || null;
    if (params.has('maxPrice')) APP_STATE.filters.maxPrice = Number(params.get('maxPrice')) || null;
  }

  return { route: 'catalog' };
}

function updateURLHash() {
  if (window.location.hash.startsWith('#/product/')) return;

  const params = new URLSearchParams();
  if (APP_STATE.filters.category !== 'all') params.set('category', APP_STATE.filters.category);
  if (APP_STATE.filters.search.trim()) params.set('search', APP_STATE.filters.search.trim());
  if (APP_STATE.filters.sort !== 'default') params.set('sort', APP_STATE.filters.sort);
  if (APP_STATE.filters.minPrice !== null) params.set('minPrice', APP_STATE.filters.minPrice);
  if (APP_STATE.filters.maxPrice !== null) params.set('maxPrice', APP_STATE.filters.maxPrice);

  const qs = params.toString();
  window.location.hash = qs ? `#/catalog?${qs}` : `#/catalog`;
}

function handleRouting() {
  const { route, id } = parseURLHash();
  const catalogView = document.getElementById('catalogView');
  const productDetailView = document.getElementById('productDetailView');

  if (!catalogView || !productDetailView) return;

  if (route === 'product' && id) {
    if (!catalogView.classList.contains('hidden')) {
      APP_STATE.catalogScrollY = window.scrollY;
    }
    catalogView.classList.add('hidden');
    productDetailView.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'instant' });
    openProductPage(id);
  } else {
    productDetailView.classList.add('hidden');
    catalogView.classList.remove('hidden');

    if (APP_STATE.catalogScrollY > 0) {
      window.scrollTo({ top: APP_STATE.catalogScrollY, behavior: 'instant' });
    }
  }
}

function initRouter() {
  window.addEventListener('hashchange', handleRouting);
  handleRouting();
}

/* ==============================================================================
 * 21. ПЕРЕКЛЮЧАТЕЛЬ ВАЛЮТ, ТЕМЫ И ЯЗЫКА
 * ============================================================================== */

function initCurrencySwitcher() {
  const btn = document.getElementById('currencyToggleBtn');
  const label = document.getElementById('currencyLabel');
  const savedCurrency = safeStorageGet(STORAGE_KEYS.CURRENCY, 'USD');
  APP_STATE.currency = savedCurrency;

  const updateLabel = () => {
    if (label) label.textContent = APP_STATE.currency === 'UZS' ? 'UZS (сум)' : 'USD ($)';
  };
  updateLabel();

  if (btn) {
    btn.addEventListener('click', () => {
      APP_STATE.currency = APP_STATE.currency === 'USD' ? 'UZS' : 'USD';
      safeStorageSet(STORAGE_KEYS.CURRENCY, APP_STATE.currency);
      updateLabel();

      // Обновляем все цены на экране без сетевых запросов
      renderFilteredProductsGrid();
      if (APP_STATE.heroFeatured) renderHeroSpotlight(APP_STATE.heroFeatured);
      if (APP_STATE.currentProduct && !document.getElementById('productDetailView').classList.contains('hidden')) {
        renderProductDetailContent();
      }
      renderCartDrawerContent();
      renderFavoritesDrawerContent();
      renderRecentCatalogSection();
      showToast(`Валюта переключена на ${APP_STATE.currency}`, 'info');
    });
  }
}

function applyTheme(themeName) {
  APP_STATE.theme = themeName;
  const root = document.documentElement;
  if (themeName === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
  safeStorageSet(STORAGE_KEYS.THEME, themeName);
}

function initTheme() {
  const saved = safeStorageGet(STORAGE_KEYS.THEME, null);
  if (saved === 'dark' || saved === 'light') {
    applyTheme(saved);
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  }

  const btn = document.getElementById('themeToggleBtn');
  if (btn) {
    btn.addEventListener('click', () => {
      applyTheme(APP_STATE.theme === 'dark' ? 'light' : 'dark');
    });
  }
}

function applyLanguage(lang) {
  APP_STATE.lang = lang;
  safeStorageSet(STORAGE_KEYS.LANG, lang);

  const label = document.getElementById('langLabel');
  if (label) label.textContent = lang.toUpperCase();

  const t = TRANSLATIONS[lang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key] && typeof t[key] === 'string') el.textContent = t[key];
  });

  renderFilteredProductsGrid();
  if (APP_STATE.heroFeatured) renderHeroSpotlight(APP_STATE.heroFeatured);
  if (APP_STATE.currentProduct) renderProductDetailContent();
  renderCartDrawerContent();
  renderFavoritesDrawerContent();
}

function initLanguage() {
  const saved = safeStorageGet(STORAGE_KEYS.LANG, 'ru');
  applyLanguage(saved);

  const btn = document.getElementById('langToggleBtn');
  if (btn) {
    btn.addEventListener('click', () => {
      applyLanguage(APP_STATE.lang === 'ru' ? 'en' : 'ru');
    });
  }
}

/* ==============================================================================
 * 22. СЧЁТЧИКИ ШАПКИ
 * ============================================================================== */

function updateBadges() {
  const cartBadge = document.getElementById('cartBadge');
  const favBadge = document.getElementById('favoritesBadge');

  if (cartBadge) {
    const count = APP_STATE.cart.reduce((sum, i) => sum + i.quantity, 0);
    cartBadge.textContent = count;
  }

  if (favBadge) {
    const count = APP_STATE.favorites.length;
    favBadge.textContent = count;
    if (count > 0) {
      favBadge.classList.remove('scale-0');
      favBadge.classList.add('scale-100');
    } else {
      favBadge.classList.remove('scale-100');
      favBadge.classList.add('scale-0');
    }
  }
}

/* ==============================================================================
 * 23. КЛИКИ В КАТАЛОГЕ (ДЕЛЕГИРОВАНИЕ)
 * ============================================================================== */

function initCatalogInteractions() {
  const catalogView = document.getElementById('catalogView');
  if (!catalogView) return;

  catalogView.addEventListener('click', (e) => {
    const favTarget = e.target.closest('[data-action="toggle-favorite"]');
    if (favTarget) {
      e.stopPropagation();
      e.preventDefault();
      toggleFavorite(favTarget.getAttribute('data-id'));
      return;
    }

    const cartTarget = e.target.closest('[data-action="add-to-cart"]');
    if (cartTarget) {
      e.stopPropagation();
      e.preventDefault();
      addToCart(cartTarget.getAttribute('data-id'));
      return;
    }

    const cardTarget = e.target.closest('[data-action="navigate-product"]');
    if (cardTarget) {
      const id = cardTarget.getAttribute('data-id');
      if (id) window.location.hash = `#/product/${id}`;
    }
  });

  // Фильтр по цене
  const applyPriceBtn = document.getElementById('applyPriceFilterBtn');
  if (applyPriceBtn) {
    applyPriceBtn.addEventListener('click', () => {
      const minVal = document.getElementById('priceMinInput').value;
      const maxVal = document.getElementById('priceMaxInput').value;
      APP_STATE.filters.minPrice = minVal ? Number(minVal) : null;
      APP_STATE.filters.maxPrice = maxVal ? Number(maxVal) : null;
      updateURLHash();
      renderFilteredProductsGrid();
    });
  }

  // Чекбокс со скидкой
  const discCheck = document.getElementById('filterDiscountOnly');
  if (discCheck) {
    discCheck.addEventListener('change', (e) => {
      APP_STATE.filters.discountOnly = e.target.checked;
      renderFilteredProductsGrid();
    });
  }

  // Чекбокс в наличии
  const stockCheck = document.getElementById('filterInStockOnly');
  if (stockCheck) {
    stockCheck.addEventListener('change', (e) => {
      APP_STATE.filters.inStockOnly = e.target.checked;
      renderFilteredProductsGrid();
    });
  }

  // Сортировка
  const sortSelect = document.getElementById('catalogSortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      APP_STATE.filters.sort = e.target.value;
      updateURLHash();
      renderFilteredProductsGrid();
    });
  }

  // Кнопка сброса
  const resetBtn = document.getElementById('resetFiltersBtn');
  if (resetBtn) resetBtn.addEventListener('click', resetAllFilters);

  // Кнопка повтора
  const retryBtn = document.getElementById('catalogRetryBtn');
  if (retryBtn) retryBtn.addEventListener('click', () => loadProducts(true));
}

/* ==============================================================================
 * 24. ИНИЦИАЛИЗАЦИЯ ДРАВЕРОВ И КНОПОК ШАПКИ
 * ============================================================================== */

function initDrawersAndModals() {
  const cartBtn = document.getElementById('cartOpenBtn');
  const cartClose = document.getElementById('cartDrawerCloseBtn');
  const cartBackdrop = document.getElementById('cartDrawerBackdrop');
  const cartClear = document.getElementById('cartClearBtn');
  const cartCheckout = document.getElementById('cartCheckoutBtn');

  if (cartBtn) cartBtn.addEventListener('click', openCartDrawer);
  if (cartClose) cartClose.addEventListener('click', closeCartDrawer);
  if (cartBackdrop) cartBackdrop.addEventListener('click', closeCartDrawer);
  if (cartCheckout) cartCheckout.addEventListener('click', openCheckoutModal);
  if (cartClear) {
    cartClear.addEventListener('click', () => {
      if (APP_STATE.cart.length > 0 && confirm('Вы уверены, что хотите очистить корзину?')) {
        APP_STATE.cart = [];
        safeStorageSet(STORAGE_KEYS.CART, []);
        updateBadges();
        renderCartDrawerContent();
      }
    });
  }

  const favBtn = document.getElementById('favoritesOpenBtn');
  const favClose = document.getElementById('favoritesDrawerCloseBtn');
  const favBackdrop = document.getElementById('favoritesDrawerBackdrop');
  const favClear = document.getElementById('favoritesClearBtn');

  if (favBtn) favBtn.addEventListener('click', openFavoritesDrawer);
  if (favClose) favClose.addEventListener('click', closeFavoritesDrawer);
  if (favBackdrop) favBackdrop.addEventListener('click', closeFavoritesDrawer);
  if (favClear) {
    favClear.addEventListener('click', () => {
      APP_STATE.favorites = [];
      safeStorageSet(STORAGE_KEYS.FAVORITES, []);
      updateBadges();
      renderFavoritesDrawerContent();
      renderFilteredProductsGrid();
    });
  }

  const ordersBtn = document.getElementById('ordersOpenBtn');
  const ordersClose = document.getElementById('ordersDrawerCloseBtn');
  const ordersBackdrop = document.getElementById('ordersDrawerBackdrop');

  if (ordersBtn) ordersBtn.addEventListener('click', openOrdersDrawer);
  if (ordersClose) ordersClose.addEventListener('click', closeOrdersDrawer);
  if (ordersBackdrop) ordersBackdrop.addEventListener('click', closeOrdersDrawer);
}

/* ==============================================================================
 * 25. КНОПКА «НАВЕРХ», МОНИТОРИНГ СЕТИ И СИНХРОНИЗАЦИЯ ВКЛАДОК
 * ============================================================================== */

function initScrollToTop() {
  const btn = document.getElementById('scrollToTopBtn');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.remove('opacity-0', 'pointer-events-none');
      btn.classList.add('opacity-100');
    } else {
      btn.classList.add('opacity-0', 'pointer-events-none');
      btn.classList.remove('opacity-100');
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function initNetworkMonitor() {
  const banner = document.getElementById('networkBanner');
  const text = document.getElementById('networkBannerText');
  if (!banner || !text) return;

  window.addEventListener('offline', () => {
    text.textContent = TRANSLATIONS[APP_STATE.lang].offlineWarning;
    banner.classList.remove('hidden');
  });

  window.addEventListener('online', () => {
    text.textContent = TRANSLATIONS[APP_STATE.lang].onlineRestored;
    setTimeout(() => banner.classList.add('hidden'), 3000);
  });
}

function initAmbientGlow() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const glow1 = document.getElementById('ambientGlow1');
  const glow2 = document.getElementById('ambientGlow2');
  if (!glow1 || !glow2) return;

  let ticking = false;
  window.addEventListener('mousemove', (e) => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * 35;
        const y = (e.clientY / window.innerHeight - 0.5) * 35;
        glow1.style.transform = `translate(${x}px, ${y}px)`;
        glow2.style.transform = `translate(${-x}px, ${-y}px)`;
        ticking = false;
      });
      ticking = true;
    }
  });
}

function initStorageSync() {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEYS.THEME && e.newValue) applyTheme(JSON.parse(e.newValue));
    if (e.key === STORAGE_KEYS.LANG && e.newValue) applyLanguage(JSON.parse(e.newValue));
    if (e.key === STORAGE_KEYS.CURRENCY && e.newValue) {
      APP_STATE.currency = JSON.parse(e.newValue);
      renderFilteredProductsGrid();
    }
    if (e.key === STORAGE_KEYS.CART) {
      APP_STATE.cart = safeStorageGet(STORAGE_KEYS.CART, []);
      updateBadges();
      renderCartDrawerContent();
    }
    if (e.key === STORAGE_KEYS.FAVORITES) {
      APP_STATE.favorites = safeStorageGet(STORAGE_KEYS.FAVORITES, []);
      updateBadges();
      renderFavoritesDrawerContent();
      renderFilteredProductsGrid();
    }
  });
}

function initGlobalErrorHandling() {
  window.addEventListener('error', (event) => {
    console.error('Unhandled UI error:', event.error);
  });
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason);
  });
}

/* ==============================================================================
 * 26. СТАРТ ПРИЛОЖЕНИЯ
 * ============================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initGlobalErrorHandling();
  initTheme();
  initLanguage();
  initCurrencySwitcher();
  initNetworkMonitor();
  initAmbientGlow();
  initStorageSync();
  initScrollToTop();
  initSearch();
  initDrawersAndModals();
  initCheckout();
  initLightboxControls();

  // Восстанавливаем данные хранилища
  APP_STATE.cart = safeStorageGet(STORAGE_KEYS.CART, []);
  APP_STATE.favorites = safeStorageGet(STORAGE_KEYS.FAVORITES, []);
  APP_STATE.recent = safeStorageGet(STORAGE_KEYS.RECENT, []);
  updateBadges();

  initCatalogInteractions();
  initInfiniteScroll();

  // Загружаем категории, каталог и запускаем хэш-роутер
  Promise.all([loadCategories(), loadProducts(true)]).then(() => {
    initRouter();
    renderRecentCatalogSection();
  });
});
