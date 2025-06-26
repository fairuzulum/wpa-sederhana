<script setup>
import { ref, onMounted } from "vue";
// 1. Impor komponen Swiper
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

// 2. Impor library 'marked' untuk Rich Text
import { marked } from 'marked';

// 3. Impor CSS Swiper
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const products = ref([]);
const banners = ref([]);
const isLoading = ref(true);

// 4. Update URL Strapi-mu
const STRAPI_BASE_URL = "https://strapi.fairuzulum.me";
const PRODUCTS_API_URL = `${STRAPI_BASE_URL}/api/products?populate=*`;
const BANNERS_API_URL = `${STRAPI_BASE_URL}/api/banners?populate=*`;

// Fungsi untuk fetch data (tidak perlu diubah)
async function fetchData() {
  try {
    const [productsResponse, bannersResponse] = await Promise.all([
      fetch(PRODUCTS_API_URL),
      fetch(BANNERS_API_URL)
    ]);

    if (!productsResponse.ok || !bannersResponse.ok) {
      throw new Error('Gagal memuat data dari server.');
    }

    const productsData = await productsResponse.json();
    const bannersData = await bannersResponse.json();

    // Data dari Strapi v4 ada di dalam properti .data
    products.value = Array.isArray(productsData.data) ? productsData.data : [];
    // Untuk banner, kita asumsikan strukturnya flat atau sesuaikan jika perlu
    banners.value = Array.isArray(bannersData.data) ? bannersData.data : [];

  } catch (error) {
    console.error("Terjadi kesalahan saat fetch data:", error);
    products.value = [];
    banners.value = [];
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="app-container">
    <header>
      <h1>Katalog Produk Digital</h1>
    </header>

    <main>
      <div v-if="isLoading" class="loader">Memuat data...</div>

      <div v-else>
        <div class="banner-section" v-if="banners.length > 0">
          <swiper
            :modules="[Autoplay, Pagination, Navigation]"
            :slides-per-view="1"
            :space-between="30"
            :loop="true"
            :pagination="{ clickable: true }"
            :navigation="true"
            :autoplay="{ delay: 3500, disableOnInteraction: false }"
          >
            <swiper-slide v-for="banner in banners" :key="banner.id">
              <img 
                v-if="banner.attributes.image.data"
                :src="`${STRAPI_BASE_URL}${banner.attributes.image.data.attributes.url}`" 
                :alt="banner.attributes.title" 
                class="banner-image"
              />
            </swiper-slide>
          </swiper>
        </div>

        <div class="product-section" v-if="products.length > 0">
          <div class="product-grid">
            <div v-for="product in products" :key="product.id" class="product-card">
              
              <div class="gallery-container">
                <div class="main-image-wrapper">
                  <img v-if="product.attributes.images && product.attributes.images.data?.length > 0" :src="`${STRAPI_BASE_URL}${product.attributes.images.data[0].attributes.url}`" :alt="product.attributes.name" class="main-image"/>
                  <div v-else class="placeholder-image"><span>No Image</span></div>
                </div>
                <div class="thumbnail-strip" v-if="product.attributes.images && product.attributes.images.data?.length > 1">
                  <img v-for="img in product.attributes.images.data" :key="img.id" :src="`${STRAPI_BASE_URL}${img.attributes.formats.thumbnail.url}`" :alt="`Thumbnail ${img.attributes.name}`" class="thumbnail-image"/>
                </div>
              </div>

              <div class="product-info">
                <h2 class="product-name">{{ product.attributes.name }}</h2>
                
                <div class="description-section" v-if="product.attributes.deskripsi_1">
                  <div class="description-content" v-html="marked(product.attributes.deskripsi_1)"></div>
                </div>

                <div class="description-section" v-if="product.attributes.deskripsi_2">
                  <h4 class="description-title">Info Tambahan</h4>
                  <div class="description-content" v-html="marked(product.attributes.deskripsi_2)"></div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div v-else class="loader">
          Produk tidak ditemukan.
        </div>
      </div>
    </main>
  </div>
</template>

<style>
/* ... General Styling & Swiper styling tidak berubah ... */
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
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
  color: #1c1e21;
}

/* Banner & Swiper Styling */
.banner-section {
  margin-bottom: 40px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.banner-image {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 7;
  object-fit: cover;
}
.swiper-pagination-bullet-active {
  background-color: #fff;
}
.swiper-button-next,
.swiper-button-prev {
  color: #fff;
  background-color: rgba(0, 0, 0, 0.3);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  transition: background-color 0.2s;
}
.swiper-button-next:hover,
.swiper-button-prev:hover {
  background-color: rgba(0, 0, 0, 0.5);
}
.swiper-button-next:after,
.swiper-button-prev:after {
  font-size: 18px;
  font-weight: bold;
}


/* Product Section */
.product-section {
  margin-top: 40px;
}
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 24px;
}
.product-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}
.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}
.gallery-container {
  width: 100%;
}
.main-image-wrapper {
  width: 100%;
  padding-top: 75%; /* Aspect ratio 4:3 */
  position: relative;
  background-color: #f0f2f5;
}
.main-image, .placeholder-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.placeholder-image {
  display: flex;
  justify-content: center;
  align-items: center;
  color: #8d949e;
  font-weight: 500;
}
.thumbnail-strip {
  display: flex;
  padding: 8px;
  gap: 8px;
  background-color: #f0f2f5;
  overflow-x: auto;
}
.thumbnail-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  cursor: pointer;
}

/* Product Info */
.product-info {
  padding: 20px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}
.product-name {
  margin: 0 0 16px 0;
  font-size: 1.5rem;
  font-weight: 600;
}

/* --- STYLE BARU UNTUK DESKRIPSI RICH TEXT --- */
.description-section {
  margin-top: 16px;
  border-top: 1px solid #e0e0e0;
  padding-top: 16px;
}
.description-title {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}
.description-content {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #333;
}
.description-content h1,
.description-content h2,
.description-content h3 {
  margin: 16px 0 8px 0;
  line-height: 1.3;
}
.description-content p {
  margin: 0 0 12px 0;
}
.description-content ul,
.description-content ol {
  padding-left: 20px;
  margin-bottom: 12px;
}
.description-content li {
  margin-bottom: 4px;
}
/* --- AKHIR STYLE BARU --- */

.loader {
  text-align: center;
  padding: 60px;
  font-size: 1.5rem;
  color: #65676b;
}
</style>