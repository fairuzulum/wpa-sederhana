<script setup>
import { ref, onMounted, computed } from "vue";
import { marked } from 'marked';
import VueEasyLightbox from 'vue-easy-lightbox';
import 'vue-easy-lightbox/dist/external-css/vue-easy-lightbox.css';

import Navbar from './components/Navbar.vue';
import HomePage from './views/HomePage.vue';
import CategoryMenuPage from './views/CategoryMenuPage.vue';
import CatalogPage from './views/CatalogPage.vue';
import DetailPage from './views/DetailPage.vue';
import ProductPreviewPage from './views/ProductPreviewPage.vue';

const products = ref([]);
const categories = ref([]);
const heroBanners = ref([]);
const isLoading = ref(true);
const isInitialDataLoaded = ref(false);
const isOffline = ref(!navigator.onLine);
const downloadProgress = ref(0);
const currentPage = ref('home');
const selectedProductId = ref(null);
const selectedCategoryId = ref(null);
const searchQuery = ref('');

const STRAPI_BASE_URL = "https://strapi.fairuzulum.me";
const PRODUCTS_API_URL = `${STRAPI_BASE_URL}/api/products?populate=*`;
const CATEGORIES_API_URL = `${STRAPI_BASE_URL}/api/categories?populate=*`;
const HERO_BANNERS_API_URL = `${STRAPI_BASE_URL}/api/hero-banner-kategoris?populate=*`;

// Cache keys untuk localStorage
const CACHE_KEYS = {
  PRODUCTS: 'katalog_products_cache',
  CATEGORIES: 'katalog_categories_cache',
  HERO_BANNERS: 'katalog_hero_banners_cache',
  LAST_UPDATED: 'katalog_last_updated',
  IMAGES: 'katalog_images_cache'
};

// Fungsi untuk menyimpan data ke localStorage
function saveToLocalStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

// Fungsi untuk mengambil data dari localStorage
function getFromLocalStorage(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
}

// Fungsi untuk mengecek apakah cache masih valid (7 hari)
function isCacheValid() {
  const lastUpdated = getFromLocalStorage(CACHE_KEYS.LAST_UPDATED);
  if (!lastUpdated) return false;
  
  const now = new Date().getTime();
  const cacheAge = now - lastUpdated;
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 hari dalam milidetik
  
  return cacheAge < maxAge;
}

// Fungsi untuk preload gambar
async function preloadImages(imageUrls) {
  const imagePromises = imageUrls.map(url => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => resolve(url); // Resolve even if failed to avoid blocking
      img.src = url.startsWith('http') ? url : `${STRAPI_BASE_URL}${url}`;
    });
  });
  
  return Promise.all(imagePromises);
}

// Fungsi untuk mengekstrak semua URL gambar dari data
function extractImageUrls(data) {
  const imageUrls = new Set();
  
  function extractFromObject(obj) {
    if (!obj || typeof obj !== 'object') return;
    
    for (const key in obj) {
      const value = obj[key];
      
      if (typeof value === 'string' && (value.includes('.jpg') || value.includes('.jpeg') || value.includes('.png') || value.includes('.webp'))) {
        imageUrls.add(value);
      } else if (Array.isArray(value)) {
        value.forEach(item => extractFromObject(item));
      } else if (typeof value === 'object') {
        extractFromObject(value);
      }
    }
  }
  
  extractFromObject(data);
  return Array.from(imageUrls);
}

// Fungsi untuk fetch data dengan retry dan caching
async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Attempt ${i + 1} failed for ${url}:`, error);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
    }
  }
}

// Fungsi utama untuk fetch dan cache semua data
async function fetchAndCacheAllData() {
  isLoading.value = true;
  downloadProgress.value = 0;
  
  try {
    // Cek apakah ada cache yang valid
    const cachedProducts = getFromLocalStorage(CACHE_KEYS.PRODUCTS);
    const cachedCategories = getFromLocalStorage(CACHE_KEYS.CATEGORIES);
    const cachedHeroBanners = getFromLocalStorage(CACHE_KEYS.HERO_BANNERS);
    
    if (cachedProducts && cachedCategories && cachedHeroBanners && isCacheValid()) {
      console.log('Using cached data');
      products.value = cachedProducts;
      categories.value = cachedCategories;
      heroBanners.value = cachedHeroBanners;
      isInitialDataLoaded.value = true;
      downloadProgress.value = 100;
      return;
    }
    
    console.log('Fetching fresh data...');
    downloadProgress.value = 10;
    
    // Fetch data API
    const [productsData, categoriesData, heroBannersData] = await Promise.all([
      fetchWithRetry(PRODUCTS_API_URL),
      fetchWithRetry(CATEGORIES_API_URL),
      fetchWithRetry(HERO_BANNERS_API_URL)
    ]);
    
    downloadProgress.value = 40;
    
    // Process data
    const processedProducts = Array.isArray(productsData.data) ? productsData.data : [];
    const processedCategories = Array.isArray(categoriesData.data) ? categoriesData.data : [];
    const processedHeroBanners = (heroBannersData.data && Array.isArray(heroBannersData.data) && heroBannersData.data.length > 0)
      ? heroBannersData.data[0].images || []
      : [];
    
    downloadProgress.value = 60;
    
    // Extract dan preload semua gambar
    const allImageUrls = [
      ...extractImageUrls(processedProducts),
      ...extractImageUrls(processedCategories),
      ...extractImageUrls(processedHeroBanners)
    ];
    
    console.log(`Preloading ${allImageUrls.length} images...`);
    await preloadImages(allImageUrls);
    
    downloadProgress.value = 90;
    
    // Simpan ke state
    products.value = processedProducts;
    categories.value = processedCategories;
    heroBanners.value = processedHeroBanners;
    
    // Simpan ke localStorage
    saveToLocalStorage(CACHE_KEYS.PRODUCTS, processedProducts);
    saveToLocalStorage(CACHE_KEYS.CATEGORIES, processedCategories);
    saveToLocalStorage(CACHE_KEYS.HERO_BANNERS, processedHeroBanners);
    saveToLocalStorage(CACHE_KEYS.LAST_UPDATED, new Date().getTime());
    
    downloadProgress.value = 100;
    isInitialDataLoaded.value = true;
    
    console.log('All data and images cached successfully!');
    
  } catch (error) {
    console.error("Error fetching data:", error);
    
    // Fallback ke cache jika ada error
    const cachedProducts = getFromLocalStorage(CACHE_KEYS.PRODUCTS);
    const cachedCategories = getFromLocalStorage(CACHE_KEYS.CATEGORIES);
    const cachedHeroBanners = getFromLocalStorage(CACHE_KEYS.HERO_BANNERS);
    
    if (cachedProducts && cachedCategories && cachedHeroBanners) {
      console.log('Using cached data as fallback');
      products.value = cachedProducts;
      categories.value = cachedCategories;
      heroBanners.value = cachedHeroBanners;
      isInitialDataLoaded.value = true;
      downloadProgress.value = 100;
    }
  } finally {
    isLoading.value = false;
  }
}

// Event listeners untuk status online/offline
function handleOnline() {
  isOffline.value = false;
  console.log('App is online');
}

function handleOffline() {
  isOffline.value = true;
  console.log('App is offline');
}

onMounted(() => {
  // Setup event listeners
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Fetch data saat app dimuat
  fetchAndCacheAllData();
});

// Computed properties (sama seperti sebelumnya)
const filteredProducts = computed(() => {
  if (!searchQuery.value) return products.value;
  const query = searchQuery.value.toLowerCase();
  return products.value.filter(product =>
    product.title.toLowerCase().includes(query)
  );
});

const productsByCategory = computed(() => {
  if (searchQuery.value) {
    currentPage.value = 'catalog';
    return filteredProducts.value;
  }
  if (!selectedCategoryId.value) return products.value;
  return products.value.filter(product =>
    product.categories && product.categories.some(cat => cat.id === selectedCategoryId.value)
  );
});

const selectedProduct = computed(() => products.value.find(p => p.id === selectedProductId.value));
const otherProducts = computed(() => {
  if (!selectedProduct.value) return [];
  return products.value.filter(p => p.id !== selectedProduct.value.id).slice(0, 2);
});

// Navigation functions (sama seperti sebelumnya)
function navigateTo(page) {
  searchQuery.value = '';
  selectedCategoryId.value = null;
  currentPage.value = page;
  window.scrollTo(0, 0);
}

function selectCategoryAndGoToCatalog(categoryId) {
  searchQuery.value = '';
  selectedCategoryId.value = categoryId;
  currentPage.value = 'catalog';
  window.scrollTo(0, 0);
}

function viewProductDetail(productId) {
  selectedProductId.value = productId;
  currentPage.value = 'detail';
  window.scrollTo(0, 0);
}

function handleSearch(query) {
  searchQuery.value = query;
}

function goHome() {
  navigateTo('home');
}

function goBack() {
  window.history.back();
}

// Fungsi untuk manual refresh data
async function refreshData() {
  // Hapus cache
  localStorage.removeItem(CACHE_KEYS.PRODUCTS);
  localStorage.removeItem(CACHE_KEYS.CATEGORIES);
  localStorage.removeItem(CACHE_KEYS.HERO_BANNERS);
  localStorage.removeItem(CACHE_KEYS.LAST_UPDATED);
  
  // Fetch ulang
  await fetchAndCacheAllData();
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Status Bar -->
    <div v-if="isOffline" class="bg-orange-500 text-white text-center py-2 text-sm">
      📱 Mode Offline - Data dari cache lokal
    </div>
    
    <!-- Loading Screen -->
    <div v-if="isLoading" class="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div class="text-center">
        <div class="mb-4">
          <div class="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
        <h2 class="text-xl font-semibold mb-2">Memuat Katalog...</h2>
        <p class="text-gray-600 mb-4">Mengunduh data dan gambar untuk penggunaan offline</p>
        <div class="w-64 bg-gray-200 rounded-full h-2 mx-auto">
          <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" :style="{ width: `${downloadProgress}%` }"></div>
        </div>
        <p class="text-sm text-gray-500 mt-2">{{ downloadProgress }}%</p>
      </div>
    </div>
    
    <!-- Main App -->
    <div v-if="!isLoading && isInitialDataLoaded">
      <Navbar
        v-if="currentPage !== 'home'"
        @search-change="handleSearch"
        @navigate-home="goHome"
        @navigate-back="goBack"
      />

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <main>
          <HomePage
            v-if="currentPage === 'home'"
            @navigate="navigateTo"
            @refresh-data="refreshData"
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
    <div v-if="!isLoading && !isInitialDataLoaded" class="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div class="text-center">
        <div class="text-6xl mb-4">😞</div>
        <h2 class="text-xl font-semibold mb-2">Tidak dapat memuat data</h2>
        <p class="text-gray-600 mb-4">Periksa koneksi internet Anda</p>
        <button 
          @click="fetchAndCacheAllData"
          class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  </div>
</template>

<style>
/* Kosongkan CSS custom, semua via Tailwind sekarang */
</style>