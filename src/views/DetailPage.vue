<script setup>
import { ref, watch, computed } from 'vue';
import { marked } from 'marked';
import ProductCard from '../components/ProductCard.vue';
import VueEasyLightbox from 'vue-easy-lightbox';
import 'vue-easy-lightbox/dist/external-css/vue-easy-lightbox.css';
import MarkdownRenderer from '../components/MarkdownRenderer.vue';

const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  otherProducts: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['navigate', 'view-detail']);
const STRAPI_BASE_URL = "https://strapi.fairuzulum.me";

const selectedImage = ref(null);
const lightboxVisible = ref(false);
const lightboxIndex = ref(0);

const imagesForLightbox = computed(() => {
  if (!props.product?.images || props.product.images.length === 0) {
    return [];
  }
  return props.product.images.map(img => `${STRAPI_BASE_URL}${img.url}`);
});

function showLightbox() {
  const currentIndex = props.product.images.findIndex(img => img.id === selectedImage.value.id);
  lightboxIndex.value = currentIndex >= 0 ? currentIndex : 0;
  lightboxVisible.value = true;
}

function hideLightbox() {
  lightboxVisible.value = false;
}

function changeMainImage(imageObject) {
  selectedImage.value = imageObject;
}

watch(() => props.product, (newProduct) => {
  if (newProduct && newProduct.images?.length > 0) {
    selectedImage.value = newProduct.images[0];
  } else {
    selectedImage.value = null;
  }
}, { immediate: true });
</script>

<template>
  <div className="container mx-auto px-4">
    <div className="mb-6 flex flex-col items-start">
      <button @click="emit('navigate', 'catalog')" className="text-blue-600 text-base p-2 bg-transparent border-none cursor-pointer">← Kembali ke Katalog</button>
    </div>

    <div v-if="product" className="grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-8">
      <div className="gallery-container">
        <div className="relative w-full pt-[100%] bg-gray-100 rounded-xl overflow-hidden">
          <img 
            v-if="selectedImage" 
            :src="`${STRAPI_BASE_URL}${selectedImage.url}`" 
            :alt="product.name" 
            className="absolute top-0 left-0 w-full h-full object-cover cursor-pointer hover:opacity-90"
            @click="showLightbox"
          />
          <div v-else className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-gray-500 font-medium">No Image</div>
        </div>
        <div v-if="product.images?.length > 1" className="flex justify-center pt-2 gap-2 overflow-x-auto">
          <img 
            v-for="img in product.images" 
            :key="img.id" 
            :src="`${STRAPI_BASE_URL}${img.formats.thumbnail.url}`" 
            :alt="`Thumbnail ${img.name}`" 
            className="w-16 h-16 object-cover rounded-md cursor-pointer border-2 border-transparent hover:opacity-100"
            :className="{ 'border-blue-500 opacity-100': selectedImage && selectedImage.id === img.id, 'opacity-70': !(selectedImage && selectedImage.id === img.id) }"
            @click="changeMainImage(img)"
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl">
        <h2 className="text-2xl font-bold mt-0">{{ product.name }}</h2>
        <div v-if="product.deskripsi" className="mt-4">
          <MarkdownRenderer :content="product.deskripsi" />
        </div>
      </div>

        
    </div>

    <div v-if="otherProducts.length > 0" className="mt-12 text-center">
      <hr className="border-0 h-px bg-gray-300 mb-8">
      <h3 className="mb-6 text-xl font-semibold">Produk Lainnya</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto mb-8">
        <ProductCard 
          v-for="other_product in otherProducts" 
          :key="other_product.id" 
          :product="other_product"
          @click="emit('view-detail', other_product.id)"
        />
      </div>
      <button @click="emit('navigate', 'catalog')" className="px-6 py-3 text-base font-semibold rounded-lg border-2 border-blue-600 bg-blue-600 text-white cursor-pointer hover:bg-blue-700 transition-all">Lihat Semua Produk</button>
    </div>

    <VueEasyLightbox
      :visible="lightboxVisible"
      :imgs="imagesForLightbox"
      :index="lightboxIndex"
      @hide="hideLightbox"
    ></VueEasyLightbox>
  </div>
</template>