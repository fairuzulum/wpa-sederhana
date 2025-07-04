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
const currentPage = ref('home');
const selectedProductId = ref(null);
const selectedCategoryId = ref(null);
const searchQuery = ref('');

const STRAPI_BASE_URL = "https://strapi.fairuzulum.me";
const PRODUCTS_API_URL = `${STRAPI_BASE_URL}/api/products?populate=*`;
const CATEGORIES_API_URL = `${STRAPI_BASE_URL}/api/categories?populate=*`;
const HERO_BANNERS_API_URL = `${STRAPI_BASE_URL}/api/hero-banner-kategoris?populate=*`;

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
    heroBanners.value = (heroBannersData.data && Array.isArray(heroBannersData.data) && heroBannersData.data.length > 0)
      ? heroBannersData.data[0].images || []
      : [];

  } catch (error) {
    console.error("Terjadi kesalahan saat fetch data:", error);
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  fetchData();
});

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
</script>

<template>
  <Navbar
    v-if="currentPage !== 'home'"
    @search-change="handleSearch"
    @navigate-home="goHome"
    @navigate-back="goBack"
  />

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
    <main>
      <div v-if="isLoading" class="text-center py-16 text-lg text-gray-600">Memuat data...</div>

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
/* Kosongkan CSS custom, semua via Tailwind sekarang */
</style>
