<script setup>
import { ref, onMounted } from "vue";
// 1. Impor komponen Swiper dari library
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

// 2. Impor CSS Swiper
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const products = ref([]);
const banners = ref([]); // State baru untuk menampung data banner
const isLoading = ref(true);

const STRAPI_BASE_URL = "https://katalog.hjkarpet.com/strapi-api";
const PRODUCTS_API_URL = `${STRAPI_BASE_URL}/api/products?populate=*`;
const BANNERS_API_URL = `${STRAPI_BASE_URL}/api/banners?populate=*`; // URL API untuk banner

// Fungsi untuk memformat harga
const formatPrice = (value) => {
  if (isNaN(value)) return value;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value);
};

// Fungsi untuk fetch kedua data (produk dan banner) secara bersamaan
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

    products.value = Array.isArray(productsData.data) ? productsData.data : [];
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
            :autoplay="{
              delay: 3500,
              disableOnInteraction: false,
            }"
          >
            <swiper-slide v-for="banner in banners" :key="banner.id">
              <img 
                v-if="banner.image"
                :src="`${STRAPI_BASE_URL}${banner.image.url}`" 
                :alt="banner.title" 
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
                  <img v-if="product?.image?.length > 0" :src="`${STRAPI_BASE_URL}${product.image[0].url}`" :alt="product.name" class="main-image"/>
                  <div v-else class="placeholder-image"><span>No Image</span></div>
                </div>
                <div class="thumbnail-strip" v-if="product?.image?.length > 1">
                  <img v-for="img in product.image" :key="img.id" :src="`${STRAPI_BASE_URL}${img.formats.thumbnail.url}`" :alt="`Thumbnail ${img.name}`" class="thumbnail-image"/>
                </div>
              </div>
              <div class="product-info">
                <h2 class="product-name">{{ product.name }}</h2>
                <div class="variant-section" v-if="product.daftar_varian && product.daftar_varian.length > 0">
                  <p class="variant-title">Pilihan Varian & Harga:</p>
                  <table class="variant-table">
                    <thead>
                      <tr>
                        <th>Ukuran</th>
                        <th>Ketebalan</th>
                        <th>Harga</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="variant in product.daftar_varian" :key="variant.id">
                        <td>{{ variant.ukuran }}</td>
                        <td>{{ variant.ketebalan }}</td>
                        <td>{{ formatPrice(variant.harga) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div v-else class="no-variants"><p>Informasi harga dan varian belum tersedia.</p></div>
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
/* General Styling */
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
  position: relative; /* Diperlukan untuk positioning tombol navigasi */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.banner-image {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 7; /* Rasio yang lebih sinematik */
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
  padding-top: 75%;
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
.variant-section {
  flex-grow: 1;
}
.variant-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
}
.variant-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}
.variant-table th, .variant-table td {
  text-align: left;
  padding: 12px 8px;
  border-bottom: 1px solid #e0e0e0;
}
.variant-table th {
  color: #65676b;
  font-weight: 600;
}
.variant-table td:last-child {
  font-weight: 600;
  color: #007bff;
  text-align: right;
}
.no-variants p {
  color: #65676b;
  font-style: italic;
}

/* Loader */
.loader {
  text-align: center;
  padding: 60px;
  font-size: 1.5rem;
  color: #65676b;
}
</style>