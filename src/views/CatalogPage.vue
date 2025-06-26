<script setup>
import ProductCard from '../components/ProductCard.vue';

defineProps({
  products: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['navigate', 'view-detail']);
</script>

<template>
  <div class="catalog-page">
    <div class="page-header">
      <button @click="emit('navigate', 'preview')" class="back-btn">&larr; Kembali ke Produk Unggulan</button>
      <h2>Semua Produk</h2>
    </div>
    <div v-if="products.length > 0" class="product-grid">
      <ProductCard 
        v-for="product in products" 
        :key="product.id" 
        :product="product"
        @click="emit('view-detail', product.id)"
      />
    </div>
    <div v-else class="loader">Produk tidak ditemukan.</div>
  </div>
</template>

<style scoped>
/* Style ini spesifik untuk Halaman Katalog */
.product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
.page-header { margin-bottom: 24px; display: flex; flex-direction: column; align-items: flex-start; }
.page-header h2 { margin: 16px 0 0 0; }
.back-btn { background: none; border: none; font-size: 1rem; color: #007bff; cursor: pointer; padding: 8px 0; }
.back-btn:hover { text-decoration: underline; }
.loader { text-align: center; padding: 60px; font-size: 1.5rem; color: #65676b; }
</style>