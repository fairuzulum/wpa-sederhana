<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { marked } from 'marked';
import VueEasyLightbox from 'vue-easy-lightbox';
import 'vue-easy-lightbox/dist/external-css/vue-easy-lightbox.css';

// Import komponen Navbar yang baru
import Navbar from './components/Navbar.vue';

// Import semua halaman/views
import HomePage from './views/HomePage.vue';
import CategoryMenuPage from './views/CategoryMenuPage.vue';
import CatalogPage from './views/CatalogPage.vue';
import DetailPage from './views/DetailPage.vue';
import ProductPreviewPage from './views/ProductPreviewPage.vue';


// --- STATE MANAGEMENT ---
const products = ref([]);
const categories = ref([]);
const heroBanners = ref([]);
const isLoading = ref(true);
const currentPage = ref('home');
const selectedProductId = ref(null);
const selectedCategoryId = ref(null);
const searchQuery = ref(''); // State baru untuk menampung query pencarian

// URL API
const STRAPI_BASE_URL = "https://strapi.fairuzulum.me";
const PRODUCTS_API_URL = `${STRAPI_BASE_URL}/api/products?populate=*`;
const CATEGORIES_API_URL = `${STRAPI_BASE_URL}/api/categories?populate=*`;
const HERO_BANNERS_API_URL = `${STRAPI_BASE_URL}/api/hero-banner-kategoris?populate=*`;

// --- DATA LOGIC ---
async function fetchData() {
  isLoading.value = true;
  try {
    const [productsResponse, categoriesResponse, heroBannersResponse] = await Promise.all([
      fetch(PRODUCTS_API_URL),
      fetch(CATEGORIES_API_URL),
      fetch(HERO_BANNERS_API_URL)
    ]);
    
    if (!productsResponse.ok || !categoriesResponse.ok || !heroBannersResponse.ok) {
      throw new Error('Gagal memuat data dari server.');
    }

    const productsData = await productsResponse.json();
    const categoriesData = await categoriesResponse.json();
    const heroBannersData = await heroBannersResponse.json();

    products.value = Array.isArray(productsData.data) ? productsData.data : [];
    categories.value = Array.isArray(categoriesData.data) ? categoriesData.data : [];
    
    if (heroBannersData.data && Array.isArray(heroBannersData.data) && heroBannersData.data.length > 0) {
      heroBanners.value = heroBannersData.data[0].images || [];
    } else {
      heroBanners.value = [];
    }

  } catch (error) {
    console.error("Terjadi kesalahan saat fetch data:", error);
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  fetchData();
});

// --- COMPUTED PROPERTIES ---

// 1. Computed property untuk memfilter produk berdasarkan pencarian
const filteredProducts = computed(() => {
  if (!searchQuery.value) {
    return products.value; // Jika tidak ada query, kembalikan semua produk
  }
  const query = searchQuery.value.toLowerCase();
  // Filter berdasarkan judul produk
  return products.value.filter(product =>
    product.title.toLowerCase().includes(query)
  );
});

// 2. Computed property untuk katalog, sekarang menggunakan `filteredProducts` sebagai sumber
const productsByCategory = computed(() => {
  // Jika sedang mencari, langsung tampilkan hasil pencarian tanpa filter kategori
  if (searchQuery.value) {
      currentPage.value = 'catalog'; // Otomatis pindah ke halaman catalog saat mencari
      return filteredProducts.value;
  }
  
  // Jika tidak ada kategori yg dipilih, tampilkan semua produk
  if (!selectedCategoryId.value) return products.value;
  
  // Jika ada kategori yg dipilih, filter dari semua produk (bukan dari hasil search)
  return products.value.filter(product => 
    product.categories && product.categories.some(cat => cat.id === selectedCategoryId.value)
  );
});

const selectedProduct = computed(() => products.value.find(p => p.id === selectedProductId.value));
const otherProducts = computed(() => {
  if (!selectedProduct.value) return [];
  return products.value.filter(p => p.id !== selectedProduct.value.id).slice(0, 2);
});

// --- NAVIGATION & HANDLERS ---

function navigateTo(page) {
  searchQuery.value = ''; // Reset pencarian setiap kali navigasi manual
  selectedCategoryId.value = null; // Reset kategori juga
  currentPage.value = page;
  window.scrollTo(0, 0);
}

function selectCategoryAndGoToCatalog(categoryId) {
  searchQuery.value = ''; // Reset pencarian
  selectedCategoryId.value = categoryId;
  currentPage.value = 'catalog';
  window.scrollTo(0, 0);
}

function viewProductDetail(productId) {
  selectedProductId.value = productId;
  currentPage.value = 'detail';
  window.scrollTo(0, 0);
}

// Handler untuk event dari Navbar
function handleSearch(query) {
  searchQuery.value = query;
}

function goHome() {
  navigateTo('home');
}

function goBack() {
  // Menggunakan history browser untuk kembali ke halaman sebelumnya
  // Ini adalah cara paling sederhana dan intuitif untuk tombol "kembali"
  window.history.back();
}

</script>

<template>
  <Navbar 
    @search-change="handleSearch"
    @navigate-home="goHome"
    @navigate-back="goBack"
  />
  <div class="app-container">

    <main>
      <div v-if="isLoading" class="loader">Memuat data...</div>
      <div v-else>
        <HomePage 
          v-if="currentPage === 'home'" 
          @navigate="navigateTo"
        />
        
        <ProductPreviewPage
          v-else-if="currentPage === 'preview'"
          :products="previewProducts"
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
      </div>
    </main>
  </div>
</template>

<style>
/* CSS Global Anda tidak perlu diubah */
:root {
  --primary-color: #007bff;
  --text-color-dark: #1c1e21;
  --bg-color: #ffffff;
}
*, *::before, *::after {
  box-sizing: border-box;
}
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  margin: 0;
  background-color: var(--bg-color);
  color: var(--text-color-dark);
  overflow-x: hidden;
}
.app-container {
  max-width: 1100px;
  margin-left: auto;
  margin-right: auto;
  padding: 0 16px 16px 16px; /* Ubah padding atas jadi 0 karena sudah dihandle Navbar */
}
.loader {
  text-align: center;
  padding: 40px;
  font-size: 1.2rem;
}
.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

@media (min-width: 768px) {
  .app-container {
    padding: 0 24px 24px 24px;
  }
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
}
</style>