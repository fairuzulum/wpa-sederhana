<script setup>
// Bagian <script> tidak perlu diubah sama sekali
import { Swiper, SwiperSlide } from "swiper/vue";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

defineProps({
  categories: { type: Array, required: true },
  banners: { type: Array, default: () => [] },
});

const emit = defineEmits(["navigate", "select-category"]);
const STRAPI_BASE_URL = "https://strapi.fairuzulum.me";
</script>

<template>
  <div className="container mx-auto px-4">
    <div
      className="relative overflow-hidden w-full mb-8 rounded-xl shadow-lg"
      v-if="banners && banners.length > 0"
    >
      <swiper
        :modules="[Autoplay, Pagination, Navigation]"
        :slides-per-view="1"
        :space-between="30"
        :loop="true"
        :pagination="{ clickable: true }"
        :autoplay="{ delay: 4000, disableOnInteraction: false }"
        className="w-full overflow-hidden"
      >
        <swiper-slide v-for="banner in banners" :key="banner.id">
          <img
            :src="`${STRAPI_BASE_URL}${banner.url}`"
            :alt="banner.alternativeText || 'Hero Banner'"
            className="w-full h-auto aspect-[16/6] object-cover block"
          />
        </swiper-slide>
      </swiper>
      <div className="swiper-pagination bottom-2"></div>
    </div>

    <div className="mt-6">
      <div
        v-if="categories.length > 0"
        className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6"
      >
        <div
          v-for="category in categories"
          :key="category.id"
          className="rounded-xl overflow-hidden cursor-pointer transition-transform duration-200 bg-white shadow-md hover:-translate-y-1"
          @click="emit('select-category', category.id)"
        >
          <div
            className="relative w-full aspect-[4/3] flex items-center justify-center"
          >
            <img
              v-if="category.image"
              :src="`${STRAPI_BASE_URL}${category.image.url}`"
              :alt="category.name"
              className="w-full h-full object-cover"
            />
            <div
              v-else
              className="flex items-center justify-center w-full h-full text-gray-500 bg-gray-100"
            >
              <span>No Image</span>
            </div>
            
            <!-- Dark overlay untuk memastikan text terlihat -->
            <div className="absolute inset-0" style="background: rgba(0, 0, 0, 0.4);"></div>
            
            <h3
              className="absolute text-white text-xl md:text-2xl font-bold text-center p-4 z-10 drop-shadow-lg"
            >
              {{ category.name }}
            </h3>
          </div>
        </div>
      </div>
      <div
        v-else
        className="text-center py-16 text-xl md:text-2xl text-gray-600"
      >
        Kategori tidak ditemukan.
      </div>
    </div>
  </div>
</template>