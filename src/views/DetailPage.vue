<script setup>
import { ref, watch, computed } from 'vue'; // 1. Tambahkan 'computed'
import { marked } from 'marked';
import ProductCard from '../components/ProductCard.vue';

// 2. Impor library Lightbox yang baru di-install
import VueEasyLightbox from 'vue-easy-lightbox';
import 'vue-easy-lightbox/dist/external-css/vue-easy-lightbox.css';


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

// State untuk gambar utama yang aktif (tidak berubah)
const selectedImage = ref(null);

// --- LOGIKA BARU UNTUK LIGHTBOX ---

// 3. State baru untuk mengontrol lightbox
const lightboxVisible = ref(false); // Untuk buka/tutup lightbox
const lightboxIndex = ref(0);     // Untuk mengingat gambar mana yang sedang ditampilkan di lightbox

// 4. Computed property untuk menyiapkan daftar gambar untuk lightbox
// Library ini butuh array berisi URL gambar lengkap
const imagesForLightbox = computed(() => {
  if (!props.product?.images || props.product.images.length === 0) {
    return [];
  }
  return props.product.images.map(img => `${STRAPI_BASE_URL}${img.url}`);
});

// 5. Fungsi-fungsi baru untuk mengelola lightbox
function showLightbox() {
  // Cari index dari gambar yang sedang aktif ditampilkan
  const currentIndex = props.product.images.findIndex(img => img.id === selectedImage.value.id);
  lightboxIndex.value = currentIndex >= 0 ? currentIndex : 0;
  lightboxVisible.value = true; // Buka lightbox
}

function hideLightbox() {
  lightboxVisible.value = false; // Tutup lightbox
}


// Fungsi lama untuk ganti gambar utama (tidak berubah)
function changeMainImage(imageObject) {
  selectedImage.value = imageObject;
}

// Watcher (tidak berubah)
watch(() => props.product, (newProduct) => {
  if (newProduct && newProduct.images?.length > 0) {
    selectedImage.value = newProduct.images[0];
  } else {
    selectedImage.value = null;
  }
}, { immediate: true });

</script>

<template>
  <div class="detail-page">
    <div class="page-header">
      <button @click="emit('navigate', 'catalog')" class="back-btn">&larr; Kembali ke Katalog</button>
    </div>

    <div v-if="product" class="detail-layout">
      <div class="gallery-and-desc2">
        <div class="gallery-container">
          <div class="main-image-wrapper">
            <img 
              v-if="selectedImage" 
              :src="`${STRAPI_BASE_URL}${selectedImage.url}`" 
              :alt="product.name" 
              class="main-image"
              @click="showLightbox"
              style="cursor: pointer;"
            />
            <div v-else class="placeholder-image"><span>No Image</span></div>
          </div>
          <div class="thumbnail-strip" v-if="product.images?.length > 1">
            <img 
              v-for="img in product.images" 
              :key="img.id" 
              :src="`${STRAPI_BASE_URL}${img.formats.thumbnail.url}`" 
              :alt="`Thumbnail ${img.name}`" 
              class="thumbnail-image"
              :class="{ active: selectedImage && selectedImage.id === img.id }"
              @click="changeMainImage(img)"
            />
          </div>
        </div>
        <div class="description-section bottom" v-if="product.deskripsi_2">
          <div class="description-content" v-html="marked(product.deskripsi_2)"></div>
        </div>
      </div>

      <div class="main-description">
        <h2 class="product-name">{{ product.name }}</h2>
        <div class="description-section" v-if="product.deskripsi_1">
          <div class="description-content" v-html="marked(product.deskripsi_1)"></div>
        </div>
      </div>
    </div>

    <div class="other-products-section" v-if="otherProducts.length > 0">
      <hr>
      <h3>Produk Lainnya</h3>
      <div class="product-grid-simple">
        <ProductCard 
          v-for="other_product in otherProducts" 
          :key="other_product.id" 
          :product="other_product"
          @click="emit('view-detail', other_product.id)"
        />
      </div>
      <button @click="emit('navigate', 'catalog')" class="menu-btn">Lihat Semua Produk</button>
    </div>

    <VueEasyLightbox
      :visible="lightboxVisible"
      :imgs="imagesForLightbox"
      :index="lightboxIndex"
      @hide="hideLightbox"
    ></VueEasyLightbox>

  </div>
</template>

<style scoped>
/* Tambahkan style untuk cursor di gambar utama */
.main-image:hover {
  opacity: 0.9;
}

/* ... semua style dari sebelumnya tidak berubah ... */
.thumbnail-image.active { border-color: #007bff; opacity: 1; }
.thumbnail-image { border: 2px solid transparent; opacity: 0.7; transition: all 0.2s ease; }
.thumbnail-image:hover { opacity: 1; }
.detail-layout { display: grid; grid-template-columns: 2fr 3fr; gap: 32px; }
@media (max-width: 768px) { .detail-layout { grid-template-columns: 1fr; } }
.main-description { background: #fff; padding: 24px; border-radius: 12px; }
.product-name { margin-top: 0; }
.gallery-container { width: 100%; }
.main-image-wrapper { width: 100%; padding-top: 100%; position: relative; background-color: #f0f2f5; border-radius: 12px; overflow: hidden;}
.main-image, .placeholder-image { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; }
.placeholder-image { display: flex; justify-content: center; align-items: center; color: #8d949e; font-weight: 500; }
.thumbnail-strip { display: flex; padding-top: 8px; gap: 8px; overflow-x: auto; }
.thumbnail-image { width: 60px; height: 60px; object-fit: cover; border-radius: 6px; cursor: pointer; }
.description-section { margin-top: 16px; }
.description-section.bottom { background: #fff; padding: 24px; border-radius: 12px; margin-top: 24px; }
.description-content { font-size: 0.95rem; line-height: 1.7; color: #333; }
.description-content h1, .description-content h2, .description-content h3 { margin: 16px 0 8px 0; line-height: 1.3; }
.description-content p { margin: 0 0 12px 0; }
.description-content ul, .description-content ol { padding-left: 20px; margin-bottom: 12px; }
.description-content li { margin-bottom: 4px; }
.other-products-section { margin-top: 48px; text-align: center; }
.other-products-section hr { border: 0; height: 1px; background-color: #ddd; margin-bottom: 32px; }
.other-products-section h3 { margin-bottom: 24px; }
.product-grid-simple { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; max-width: 600px; margin: 0 auto 32px; }
.menu-btn { padding: 12px 24px; font-size: 1.1rem; font-weight: 600; border-radius: 8px; border: 2px solid #007bff; background-color: #007bff; color: white; cursor: pointer; transition: all 0.2s ease; }
.page-header { margin-bottom: 24px; display: flex; flex-direction: column; align-items: flex-start; }
.back-btn { background: none; border: none; font-size: 1rem; color: #007bff; cursor: pointer; padding: 8px 0; }
</style>