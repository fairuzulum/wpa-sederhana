<script setup>
// TIDAK ADA PERUBAHAN DI SINI
import { ref, onMounted, computed, watch } from "vue";
import { marked } from 'marked';
import VueEasyLightbox from 'vue-easy-lightbox';
import 'vue-easy-lightbox/dist/external-css/vue-easy-lightbox.css';

import HomePage from './views/HomePage.vue';
import CatalogPage from './views/CatalogPage.vue';
import DetailPage from './views/DetailPage.vue';
import ProductPreviewPage from './views/ProductPreviewPage.vue';

const products = ref([]);
const isLoading = ref(true);
const currentPage = ref('home');
const selectedProductId = ref(null);

const STRAPI_BASE_URL = "https://strapi.fairuzulum.me";
const PRODUCTS_API_URL = `${STRAPI_BASE_URL}/api/products?populate=*`;

async function fetchData() {
  isLoading.value = true;
  try {
    const response = await fetch(PRODUCTS_API_URL);
    if (!response.ok) throw new Error('Gagal memuat data produk.');
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

const previewProducts = computed(() => {
  return products.value.slice(0, 6);
});

const selectedProduct = computed(() => {
  return products.value.find(p => p.id === selectedProductId.value) || null;
});

const otherProducts = computed(() => {
  if (!selectedProduct.value) return [];
  return products.value
    .filter(p => p.id !== selectedProduct.value.id)
    .slice(0, 2);
});

function navigateTo(page) {
  currentPage.value = page;
  window.scrollTo(0, 0);
}

function viewProductDetail(productId) {
  selectedProductId.value = productId;
  currentPage.value = 'detail';
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
/* ... Sebagian besar style sama ... */
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  margin: 0;
  background-color: #f0f2f5;
  color: #1c1e21;
}
.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
}
header h1 {
  text-align: center;
  margin-bottom: 24px;
  font-size: 1.8rem;
}

/* ============================================== */
/* FOKUS PERUBAHAN CSS ADA DI SINI          */
/* ============================================== */

/* --- Product Grid Styling --- */
.product-grid {
  display: grid;
  /* Default untuk mobile tetap 1 kolom */
  grid-template-columns: 1fr; 
  gap: 20px;
}

/* --- Tablet (potrait) dan layar lebih besar --- */
@media (min-width: 768px) {
  .app-container {
    padding: 24px;
  }
  header h1 {
    font-size: 2.2rem;
  }
  .product-grid {
    /* Langsung menjadi 3 kolom */
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
}

/* --- Desktop dengan layar lebih lebar --- */
@media (min-width: 1200px) {
   header h1 {
    font-size: 2.5rem;
  }
  /* Tetap 3 kolom, tapi mungkin dengan gap lebih besar jika diinginkan */
  .product-grid {
     gap: 32px;
  }
}

/* ============================================== */
/* AKHIR DARI FOKUS PERUBAHAN CSS           */
/* ============================================== */


/* --- Detail Page Layout (Tidak berubah) --- */
.detail-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}
@media (min-width: 768px) {
  .detail-layout {
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }
}
@media (min-width: 1024px) {
  .detail-layout {
    grid-template-columns: 2fr 3fr;
    gap: 32px;
  }
}

/* Sisa style lainnya tetap sama */
.main-description,
.description-section.bottom {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
}
.product-name {
  margin-top: 0;
  font-size: 1.5rem;
}
.main-image-wrapper {
  padding-top: 100%;
}
.main-image, .placeholder-image { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; border-radius: 12px;}
.placeholder-image { display: flex; justify-content: center; align-items: center; color: #8d949e; font-weight: 500; background-color: #f0f2f5; }
.thumbnail-strip { display: flex; padding-top: 10px; gap: 10px; overflow-x: auto; }
.thumbnail-image { width: 64px; height: 64px; object-fit: cover; border-radius: 8px; cursor: pointer; border: 2px solid transparent; transition: border-color 0.2s; }
.thumbnail-image:hover { opacity: 0.8; }
.thumbnail-image.active { border-color: #007bff; }
.other-products-section { margin-top: 48px; text-align: center; }
.other-products-section hr { border: 0; height: 1px; background-color: #ddd; margin-bottom: 32px; }
.other-products-section h3 { margin-bottom: 24px; }
</style>