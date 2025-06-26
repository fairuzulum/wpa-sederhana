<script setup>
import { ref, onMounted, computed } from "vue";

// Import halaman-halaman kita
import HomePage from "./views/HomePage.vue";
import CatalogPage from "./views/CatalogPage.vue";
import DetailPage from "./views/DetailPage.vue";
import ProductPreviewPage from "./views/ProductPreviewPage.vue";

// --- STATE MANAGEMENT ---
const products = ref([]);
const isLoading = ref(true);
const currentPage = ref("home");
const selectedProductId = ref(null);

const STRAPI_BASE_URL = "https://strapi.fairuzulum.me";
const PRODUCTS_API_URL = `${STRAPI_BASE_URL}/api/products?populate=*`;

const previewProducts = computed(() => {
  return products.value.slice(0, 6);
});

// --- DATA LOGIC ---
async function fetchData() {
  isLoading.value = true;
  try {
    const response = await fetch(PRODUCTS_API_URL);
    if (!response.ok) throw new Error("Gagal memuat data produk.");
    const productsData = await response.json();
    products.value = Array.isArray(productsData.data) ? productsData.data : [];
  } catch (error) {
    console.error("Terjadi kesalahan:", error);
    products.value = [];
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  fetchData();
});

const selectedProduct = computed(() => {
  return products.value.find((p) => p.id === selectedProductId.value) || null;
});

const otherProducts = computed(() => {
  if (!selectedProduct.value) return [];
  return products.value
    .filter((p) => p.id !== selectedProduct.value.id)
    .slice(0, 2);
});

// --- NAVIGATION LOGIC ---
function navigateTo(page) {
  currentPage.value = page;
  window.scrollTo(0, 0);
}

function viewProductDetail(productId) {
  selectedProductId.value = productId;
  currentPage.value = "detail";
  window.scrollTo(0, 0);
}
</script>

<template>
  <div class="app-container">
    <header>
      <h1>Katalog Produk Digital</h1>
    </header>

    <main>
      <div v-if="isLoading" class="loader">Memuat data...</div>

      <div v-else>
        <HomePage v-if="currentPage === 'home'" @navigate="navigateTo" />

        <ProductPreviewPage
          v-else-if="currentPage === 'preview'"
          :products="previewProducts"
          @navigate="navigateTo"
          @view-detail="viewProductDetail"
        />
        <CatalogPage
          v-else-if="currentPage === 'catalog'"
          :products="products"
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
/* Style global (jika ada) bisa ditaruh di sini atau di file main.css */
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
    Arial, sans-serif;
  margin: 0;
  background-color: #f0f2f5;
  color: #1c1e21;
}
.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}
header h1 {
  text-align: center;
  margin-bottom: 32px;
  font-size: 2.5rem;
  font-weight: 700;
}
.loader {
  text-align: center;
  padding: 60px;
  font-size: 1.5rem;
  color: #65676b;
}
</style>
