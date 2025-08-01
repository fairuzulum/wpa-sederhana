<script setup>
import { ref, onMounted, computed } from "vue";
import { marked } from "marked";
import VueEasyLightbox from "vue-easy-lightbox";
import "vue-easy-lightbox/dist/external-css/vue-easy-lightbox.css";

import Navbar from "./components/Navbar.vue";
import HomePage from "./views/HomePage.vue";
import CategoryMenuPage from "./views/CategoryMenuPage.vue";
import CatalogPage from "./views/CatalogPage.vue";
import DetailPage from "./views/DetailPage.vue";
import ProductPreviewPage from "./views/ProductPreviewPage.vue";

const products = ref([]);
const categories = ref([]);
const heroBanners = ref([]);
const isLoading = ref(true);
const isInitialDataLoaded = ref(false);
const isOffline = ref(!navigator.onLine);
const downloadProgress = ref(0);
const currentPage = ref("home");
const selectedProductId = ref(null);
const selectedCategoryId = ref(null);
const searchQuery = ref("");
const isSyncing = ref(false);
const syncMessage = ref("");

const STRAPI_BASE_URL = "https://strapi.fairuzulum.me";
const PRODUCTS_API_URL = `${STRAPI_BASE_URL}/api/products?populate=*`;
const CATEGORIES_API_URL = `${STRAPI_BASE_URL}/api/categories?populate=*`;
const HERO_BANNERS_API_URL = `${STRAPI_BASE_URL}/api/hero-banner-kategoris?populate=*`;

// Cache keys untuk localStorage
const CACHE_KEYS = {
  PRODUCTS: "katalog_products_cache",
  CATEGORIES: "katalog_categories_cache",
  HERO_BANNERS: "katalog_hero_banners_cache",
  LAST_UPDATED: "katalog_last_updated",
  IMAGES: "katalog_images_cache",
};

// Fungsi untuk menyimpan data ke localStorage
function saveToLocalStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
}

// Fungsi untuk mengambil data dari localStorage
function getFromLocalStorage(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error reading from localStorage:", error);
    return null;
  }
}

// Fungsi untuk mengecek apakah cache masih valid (7 hari)
function isCacheValid() {
  const lastUpdated = getFromLocalStorage(CACHE_KEYS.LAST_UPDATED);
  if (!lastUpdated) {
    console.log("No cache timestamp found");
    return false;
  }

  const now = new Date().getTime();
  const cacheAge = now - lastUpdated;
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 hari dalam milidetik

  console.log("Cache age:", Math.floor(cacheAge / (1000 * 60 * 60)), "hours");
  return cacheAge < maxAge;
}

// Fungsi untuk preload gambar
async function preloadImages(imageUrls) {
  const imagePromises = imageUrls.map((url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => resolve(url);
      img.src = url.startsWith("http") ? url : `${STRAPI_BASE_URL}${url}`;
    });
  });

  return Promise.all(imagePromises);
}

// Fungsi untuk mengekstrak semua URL gambar dari data
function extractImageUrls(data) {
  const imageUrls = new Set();

  function extractFromObject(obj) {
    if (!obj || typeof obj !== "object") return;

    for (const key in obj) {
      const value = obj[key];

      if (
        typeof value === "string" &&
        (value.includes(".jpg") ||
          value.includes(".jpeg") ||
          value.includes(".png") ||
          value.includes(".webp"))
      ) {
        imageUrls.add(value);
      } else if (Array.isArray(value)) {
        value.forEach((item) => extractFromObject(item));
      } else if (typeof value === "object") {
        extractFromObject(value);
      }
    }
  }

  extractFromObject(data);
  return Array.from(imageUrls);
}

// Fungsi untuk fetch data dengan retry dan pagination
async function fetchWithRetry(url, retries = 3) {
  let allData = [];
  let page = 1;
  const pageSize = 1000; // Sesuai defaultLimit Strapi
  const fetchedPages = new Set();

  for (let i = 0; i < retries; i++) {
    try {
      while (true) {
        if (fetchedPages.has(page)) {
          console.warn(`Page ${page} already fetched, skipping`);
          break;
        }
        const query = new URLSearchParams({
          "pagination[page]": page,
          "pagination[pageSize]": pageSize,
        }).toString();
        const fetchUrl = `${url}&${query}`;
        console.log(`Fetching: ${fetchUrl}`);
        const response = await fetch(fetchUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const json = await response.json();
        const newData = Array.isArray(json.data) ? json.data : [];
        allData = [...allData, ...newData];
        fetchedPages.add(page);

        const { pageCount } = json.meta?.pagination || {};
        if (!pageCount || page >= pageCount) {
          break;
        }
        page++;
      }
      console.log(`Fetched ${allData.length} items from ${url}`);
      return { data: allData, meta: {} };
    } catch (error) {
      console.error(`Attempt ${i + 1} failed for ${url}:`, error);
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

// Fungsi utama untuk fetch dan cache semua data
async function fetchAndCacheAllData() {
  isLoading.value = true;
  downloadProgress.value = 0;

  try {
    console.log("Starting fetchAndCacheAllData...");

    // Reset state
    products.value = [];
    categories.value = [];
    heroBanners.value = [];

    // Cek cache
    const cachedProducts = getFromLocalStorage(CACHE_KEYS.PRODUCTS);
    const cachedCategories = getFromLocalStorage(CACHE_KEYS.CATEGORIES);
    const cachedHeroBanners = getFromLocalStorage(CACHE_KEYS.HERO_BANNERS);

    console.log("Cache check:", {
      hasProducts: !!cachedProducts,
      hasCategories: !!cachedCategories,
      hasBanners: !!cachedHeroBanners,
      isValid: isCacheValid(),
    });

    if (
      cachedProducts &&
      cachedCategories &&
      cachedHeroBanners &&
      isCacheValid()
    ) {
      console.log("Using cached data");
      products.value = cachedProducts;
      categories.value = cachedCategories;
      heroBanners.value = cachedHeroBanners;
      isInitialDataLoaded.value = true;
      downloadProgress.value = 100;
      isLoading.value = false;
      return;
    }

    if (cachedProducts && cachedCategories && cachedHeroBanners) {
      console.log("Using expired cache while fetching new data");
      products.value = cachedProducts;
      categories.value = cachedCategories;
      heroBanners.value = cachedHeroBanners;
      isInitialDataLoaded.value = true;
      isLoading.value = false;
    }

    if (!navigator.onLine) {
      console.log("Offline - using available cache");
      downloadProgress.value = 100;
      return;
    }

    console.log("Fetching fresh data...");
    downloadProgress.value = 10;

    const [productsData, categoriesData, heroBannersData] = await Promise.all([
      fetchWithRetry(PRODUCTS_API_URL),
      fetchWithRetry(CATEGORIES_API_URL),
      fetchWithRetry(HERO_BANNERS_API_URL),
    ]);

    downloadProgress.value = 40;

    const processedProducts = Array.isArray(productsData.data)
      ? productsData.data
      : [];
    const processedCategories = Array.isArray(categoriesData.data)
      ? categoriesData.data
      : [];
    const processedHeroBanners =
      heroBannersData.data &&
      Array.isArray(heroBannersData.data) &&
      heroBannersData.data.length > 0
        ? heroBannersData.data[0].images || []
        : [];

    downloadProgress.value = 60;

    const allImageUrls = [
      ...extractImageUrls(processedProducts),
      ...extractImageUrls(processedCategories),
      ...extractImageUrls(processedHeroBanners),
    ];
    console.log(`Preloading ${allImageUrls.length} images...`);
    await preloadImages(allImageUrls);

    downloadProgress.value = 90;

    products.value = processedProducts;
    categories.value = processedCategories;
    heroBanners.value = processedHeroBanners;

    saveToLocalStorage(CACHE_KEYS.PRODUCTS, processedProducts);
    saveToLocalStorage(CACHE_KEYS.CATEGORIES, processedCategories);
    saveToLocalStorage(CACHE_KEYS.HERO_BANNERS, processedHeroBanners);
    saveToLocalStorage(CACHE_KEYS.LAST_UPDATED, new Date().getTime());

    downloadProgress.value = 100;
    isInitialDataLoaded.value = true;

    console.log("Data updated successfully!");
  } catch (error) {
    console.error("Error fetching data:", error);

    const cachedProducts = getFromLocalStorage(CACHE_KEYS.PRODUCTS);
    const cachedCategories = getFromLocalStorage(CACHE_KEYS.CATEGORIES);
    const cachedHeroBanners = getFromLocalStorage(CACHE_KEYS.HERO_BANNERS);

    if (cachedProducts && cachedCategories && cachedHeroBanners) {
      console.log("Using cached data as fallback");
      products.value = cachedProducts;
      categories.value = cachedCategories;
      heroBanners.value = cachedHeroBanners;
      isInitialDataLoaded.value = true;
      downloadProgress.value = 100;
    } else {
      console.error("No cache available and fetch failed");
      isInitialDataLoaded.value = false;
    }
  } finally {
    isLoading.value = false;
  }
}

// Fungsi untuk sync cache dengan Strapi (hapus cache dan download ulang)
async function syncCacheWithStrapi() {
  if (!navigator.onLine) {
    syncMessage.value = "Tidak ada koneksi internet!";
    setTimeout(() => {
      syncMessage.value = "";
    }, 3000);
    return;
  }

  if (isSyncing.value) return;
  isSyncing.value = true;
  syncMessage.value = "Menyinkronkan data...";
  downloadProgress.value = 0;

  try {
    // Hapus cache
    localStorage.removeItem(CACHE_KEYS.PRODUCTS);
    localStorage.removeItem(CACHE_KEYS.CATEGORIES);
    localStorage.removeItem(CACHE_KEYS.HERO_BANNERS);
    localStorage.removeItem(CACHE_KEYS.LAST_UPDATED);
    localStorage.removeItem(CACHE_KEYS.IMAGES);

    // Reset state
    products.value = [];
    categories.value = [];
    heroBanners.value = [];
    isInitialDataLoaded.value = false;

    downloadProgress.value = 10;

    // Fetch ulang semua data
    await fetchAndCacheAllData();

    syncMessage.value = "Sinkronisasi selesai!";
    console.log("Sync completed with full data refresh");
  } catch (error) {
    console.error("Error syncing data:", error);
    syncMessage.value = "Gagal menyinkronkan data. Coba lagi.";
  } finally {
    isSyncing.value = false;
    setTimeout(() => {
      syncMessage.value = "";
    }, 3000);
  }
}

// Event listeners untuk status online/offline
function handleOnline() {
  isOffline.value = false;
  console.log("App is online");
}

function handleOffline() {
  isOffline.value = true;
  console.log("App is offline");
}

onMounted(async () => {
  console.log("App mounted, checking initial state...");

  // Setup event listeners
  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  // Reset state
  products.value = [];
  categories.value = [];
  heroBanners.value = [];

  // Cek cache
  const cachedProducts = getFromLocalStorage(CACHE_KEYS.PRODUCTS);
  const cachedCategories = getFromLocalStorage(CACHE_KEYS.CATEGORIES);
  const cachedHeroBanners = getFromLocalStorage(CACHE_KEYS.HERO_BANNERS);

  if (cachedProducts && cachedCategories && cachedHeroBanners) {
    console.log("Loading cached data immediately");
    products.value = cachedProducts;
    categories.value = cachedCategories;
    heroBanners.value = cachedHeroBanners;
    isInitialDataLoaded.value = true;
    isLoading.value = false;
  }

  await fetchAndCacheAllData();
});

// Computed properties - PERBAIKAN UTAMA ADA DI SINI
const filteredProducts = computed(() => {
  let baseProducts = products.value;

  // Jika ada kategori yang dipilih, filter produk berdasarkan kategori
  if (selectedCategoryId.value) {
    baseProducts = products.value.filter(
      (product) =>
        product.categories &&
        product.categories.some((cat) => cat.id === selectedCategoryId.value)
    );
  }

  // Jika ada query pencarian, filter produk berdasarkan query
  if (searchQuery.value && searchQuery.value.trim() !== "") {
    const query = searchQuery.value.toLowerCase().trim();
    return baseProducts.filter((product) => {
      // Cari di name
      const nameMatch = product.name && product.name.toLowerCase().includes(query);
      
      // Cari di description jika ada
      const descriptionMatch = product.description && product.description.toLowerCase().includes(query);
      
      // Cari di kategori
      const categoryMatch = product.categories && product.categories.some(cat => 
        cat.name && cat.name.toLowerCase().includes(query)
      );
      
      return nameMatch || descriptionMatch || categoryMatch;
    });
  }

  return baseProducts;
});

// Computed property untuk produk berdasarkan kategori - DIPERBAIKI
const productsByCategory = computed(() => {
  // Jika ada pencarian, gunakan filteredProducts
  if (searchQuery.value && searchQuery.value.trim() !== "") {
    return filteredProducts.value;
  }
  
  // Jika tidak ada kategori yang dipilih, tampilkan semua produk
  if (!selectedCategoryId.value) {
    return products.value;
  }
  
  // Filter berdasarkan kategori yang dipilih
  return products.value.filter(
    (product) =>
      product.categories &&
      product.categories.some((cat) => cat.id === selectedCategoryId.value)
  );
});

const selectedProduct = computed(() =>
  products.value.find((p) => p.id === selectedProductId.value)
);

// const otherProducts = computed(() => {
//   if (!selectedProduct.value) return [];
//   return products.value
//     .filter((p) => p.id !== selectedProduct.value.id)
//     .slice(0, 5);
// });

const otherProducts = computed(() => {
  if (!selectedProduct.value) return [];

  // Mendapatkan kategori produk yang sedang ditampilkan
  const selectedCategories = selectedProduct.value.categories;

  // Filter produk lain yang memiliki kategori yang sama
  return products.value
    .filter((p) => 
      p.id !== selectedProduct.value.id && 
      p.categories && 
      p.categories.some((cat) => selectedCategories.some(selectedCat => selectedCat.id === cat.id))
    )
    .slice(0, 5); // Tampilkan hanya 5 produk lainnya
});


// Navigation functions
function navigateTo(page, preserveCategory = false) {
  // Reset pencarian saat navigasi
  searchQuery.value = "";
  if (!preserveCategory) {
    selectedCategoryId.value = null;
  }
  currentPage.value = page;
  window.scrollTo(0, 0);
}

function selectCategoryAndGoToCatalog(categoryId) {
  // Reset pencarian saat memilih kategori
  searchQuery.value = "";
  selectedCategoryId.value = categoryId;
  currentPage.value = "catalog";
  window.scrollTo(0, 0);
}

function viewProductDetail(productId) {
  selectedProductId.value = productId;
  currentPage.value = "detail";
  window.scrollTo(0, 0);
}

// PERBAIKAN UTAMA: Fungsi handleSearch yang diperbaiki
function handleSearch(query) {
  console.log("Search query received:", query);
  searchQuery.value = query;
  
  // Jika ada pencarian, pastikan kita di halaman catalog
  if (query && query.trim() !== "" && currentPage.value !== "catalog") {
    currentPage.value = "catalog";
  }
}

function goHome() {
  navigateTo("home");
}

function goBack() {
  console.log("goBack called, current page:", currentPage.value);
  let targetPage;
  let preserveCategory = false;
  switch (currentPage.value) {
    case "category-menu":
      targetPage = "home";
      break;
    case "catalog":
      targetPage = "category-menu";
      break;
    case "detail":
      targetPage = "catalog";
      preserveCategory = true;
      break;
    default:
      targetPage = "home";
  }
  navigateTo(targetPage, preserveCategory);
}

// Fungsi untuk manual refresh data
async function refreshData() {
  console.log("Manual refresh triggered");
  localStorage.removeItem(CACHE_KEYS.PRODUCTS);
  localStorage.removeItem(CACHE_KEYS.CATEGORIES);
  localStorage.removeItem(CACHE_KEYS.HERO_BANNERS);
  localStorage.removeItem(CACHE_KEYS.LAST_UPDATED);
  localStorage.removeItem(CACHE_KEYS.IMAGES);
  isInitialDataLoaded.value = false;
  products.value = [];
  categories.value = [];
  heroBanners.value = [];
  await fetchAndCacheAllData();
}

// Fungsi untuk clear cache dan reload
function clearCacheAndReload() {
  console.log("Clearing cache and reloading...");
  localStorage.clear();
  products.value = [];
  categories.value = [];
  heroBanners.value = [];
  window.location.reload();
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading Screen -->
    <div
      v-if="isLoading && !isInitialDataLoaded"
      class="fixed inset-0 bg-white z-50 flex items-center justify-center"
    >
      <div class="text-center">
        <div class="mb-4">
          <div
            class="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"
          ></div>
        </div>
        <h2 class="text-xl font-semibold mb-2">Memuat Katalog...</h2>
        <p class="text-gray-600 mb-4">
          Mengunduh data dan gambar untuk penggunaan offline
        </p>
        <div class="w-64 bg-gray-200 rounded-full h-2 mx-auto">
          <div
            class="bg-blue-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${downloadProgress}%` }"
          ></div>
        </div>
        <p class="text-sm text-gray-500 mt-2">{{ downloadProgress }}%</p>
      </div>
    </div>

    <!-- Background Loading for Updates -->
    <div
      v-if="isLoading && isInitialDataLoaded"
      class="fixed top-20 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-40"
    >
      <div class="flex items-center space-x-2">
        <div
          class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
        ></div>
        <span class="text-sm">Memperbarui data...</span>
      </div>
    </div>

    <!-- Sync Feedback -->
    <div
      v-if="isSyncing || syncMessage"
      class="fixed top-20 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-40"
    >
      <div class="flex items-center space-x-2">
        <div
          v-if="isSyncing"
          class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
        ></div>
        <span class="text-sm">{{ syncMessage }}</span>
      </div>
      <div v-if="isSyncing" class="w-32 bg-gray-200 rounded-full h-1 mt-2">
        <div
          class="bg-white h-1 rounded-full transition-all duration-300"
          :style="{ width: `${downloadProgress}%` }"
        ></div>
      </div>
    </div>

    <!-- Main App -->
    <div v-if="isInitialDataLoaded">
      <Navbar
        v-if="currentPage !== 'home'"
        :currentPage="currentPage"
        @search-change="handleSearch"
        @navigate-home="goHome"
        @navigate-back="goBack"
      />

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-4">
        <main>
          <HomePage
            v-if="currentPage === 'home'"
            @navigate="navigateTo"
            @refresh-data="refreshData"
            @sync-data="syncCacheWithStrapi"
          />

          <ProductPreviewPage
            v-else-if="currentPage === 'preview'"
            :products="filteredProducts"
            @navigate="navigateTo"
            @view-detail="viewProductDetail"
          />

          <CategoryMenuPage
            v-else-if="currentPage === 'category-menu'"
            :categories="categories"
            :banners="heroBanners"
            @navigate="navigateTo"
            @select-category="selectCategoryAndGoToCatalog"
          />

          <CatalogPage
            v-else-if="currentPage === 'catalog'"
            :products="productsByCategory"
            :search-query="searchQuery"
            @navigate="navigateTo"
            @view-detail="viewProductDetail"
          />

          <DetailPage
            v-else-if="currentPage === 'detail' && selectedProduct"
            :product="selectedProduct"
            :other-products="otherProducts"
            @navigate="navigateTo"
            @view-detail="viewProductDetail"
          />
        </main>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-if="!isLoading && !isInitialDataLoaded"
      class="fixed inset-0 bg-white z-50 flex items-center justify-center"
    >
      <div class="text-center">
        <div class="text-6xl mb-4">😞</div>
        <h2 class="text-xl font-semibold mb-2">Tidak dapat memuat data</h2>
        <p class="text-gray-600 mb-4">
          Periksa koneksi internet Anda dan coba lagi
        </p>
        <div class="space-y-2">
          <button
            @click="fetchAndCacheAllData"
            class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors block mx-auto"
          >
            Coba Lagi
          </button>
          <button
            @click="clearCacheAndReload"
            class="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors block mx-auto"
          >
            Hapus Cache & Reload
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* Kosongkan CSS custom, semua via Tailwind sekarang */
</style>

