<script setup>
// Bagian <script> tidak perlu diubah sama sekali
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

defineProps({
  categories: { type: Array, required: true },
  banners: { type: Array, default: () => [] }
});

const emit = defineEmits(['navigate', 'select-category']);
const STRAPI_BASE_URL = "https://strapi.fairuzulum.me";
</script>

<template>
  <div class="category-menu-page">

    <div class="hero-banner-section" v-if="banners && banners.length > 0">
      <swiper
        :modules="[Autoplay, Pagination, Navigation]"
        :slides-per-view="1"
        :space-between="30"
        :loop="true"
        :pagination="{ clickable: true }"
        :navigation="true"
        :autoplay="{ delay: 4000, disableOnInteraction: false }"
      >
        <swiper-slide v-for="banner in banners" :key="banner.id">
          <img :src="`${STRAPI_BASE_URL}${banner.url}`" :alt="banner.alternativeText || 'Hero Banner'" class="hero-banner-image"/>
        </swiper-slide>
      </swiper>
    </div>

    <div class="category-section">
      <div v-if="categories.length > 0" class="category-grid">
        <div 
          v-for="category in categories" 
          :key="category.id" 
          class="category-card"
          @click="emit('select-category', category.id)"
        >
          <div class="category-image-wrapper">
            <img v-if="category.image" :src="`${STRAPI_BASE_URL}${category.image.url}`" :alt="category.name" class="category-image"/>
            <div v-else class="placeholder-image"><span>No Image</span></div>
            <div class="text-overlay"></div>
            <h3 class="category-name">{{ category.name }}</h3>
          </div>
        </div>
      </div>
      <div v-else class="loader">Kategori tidak ditemukan.</div>
    </div>
  </div>
</template>

<style scoped>
/* ============================================== */
/* CSS FINAL ANTI-LUBER UNTUK HALAMAN KATEGORI    */
/* ============================================== */

/* --- Banner Section --- */
.hero-banner-section {
  /* Ensure the section stays within the parent container */
  position: relative;
  overflow: hidden;
  width: 100%;
  max-width: 100%; /* Explicitly constrain to parent width */
  margin-bottom: 32px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.hero-banner-image {
  width: 100%;
  max-width: 100%; /* Prevent image from exceeding container */
  aspect-ratio: 16 / 6;
  object-fit: cover;
  display: block;
}

/* Ensure Swiper container respects parent bounds */
:deep(.swiper) {
  width: 100%;
  max-width: 100%;
  overflow: hidden; /* Reinforce overflow handling */
}

/* Style Swiper navigation buttons to stay within bounds */
:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  color: #fff;
  width: 40px;
  height: 40px;
  margin-top: 0; /* Center vertically */
  transform: translateY(-50%); /* Ensure proper centering */
  background: rgba(0, 0, 0, 0.5); /* Optional: Add background for visibility */
  border-radius: 50%;
}

/* Position navigation buttons inside the Swiper container */
:deep(.swiper-button-next) {
  right: 10px; /* Keep buttons within container */
}
:deep(.swiper-button-prev) {
  left: 10px;
}

/* Style pagination bullets */
:deep(.swiper-pagination) {
  bottom: 10px; /* Ensure pagination stays within bounds */
}
:deep(.swiper-pagination-bullet-active) {
  background-color: #fff;
}

/* --- Category Section --- */
.category-section h2 {
  text-align: center;
  margin: 0 0 24px 0;
}
.category-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 2 columns on mobile */
  gap: 16px;
}
@media (min-width: 768px) {
  .category-grid {
    grid-template-columns: repeat(3, 1fr); /* 3 columns on tablet+ */
    gap: 24px;
  }
}

/* Style lain yang tidak berubah */
.category-card { 
  border-radius: 12px; 
  overflow: hidden; 
  cursor: pointer; 
  transition: transform 0.2s ease; 
  background-color: #fff; 
  box-shadow: 0 2px 8px rgba(0,0,0,0.08); 
}
.category-card:hover { 
  transform: translateY(-4px); 
}
.category-image-wrapper { 
  position: relative; 
  width: 100%; 
  aspect-ratio: 4 / 3; 
  display: flex; 
  justify-content: center; 
  align-items: center; 
}
.category-image { 
  width: 100%; 
  height: 100%; 
  object-fit: cover; 
}
.text-overlay { 
  position: absolute; 
  top: 0; 
  left: 0; 
  width: 100%; 
  height: 100%; 
  background: rgba(0, 0, 0, 0.4); 
}
.category-name { 
  position: absolute; 
  color: white; 
  font-size: 1.5rem; 
  font-weight: 700; 
  padding: 16px; 
  text-align: center; 
  text-shadow: 1px 1px 4px rgba(0,0,0,0.7); 
}
.page-header { 
  margin-bottom: 24px; 
}
.back-btn { 
  background: none; 
  border: none; 
  font-size: 1rem; 
  color: #007bff; 
  cursor: pointer; 
  padding: 0; 
}
.placeholder-image { 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  width: 100%; 
  height: 100%; 
  color: #8d949e; 
  background-color: #f0f2f5;
}
.loader { 
  text-align: center; 
  padding: 60px; 
  font-size: 1.5rem; 
}
</style>