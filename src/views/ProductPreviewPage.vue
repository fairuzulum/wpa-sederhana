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
  <div class="product-preview-page">
    <div class="page-header">
      <button @click="emit('navigate', 'home')" class="back-btn">&larr; Kembali ke Menu</button>
      <h2>Produk Unggulan</h2>
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

    <div class="see-more-container">
      <button @click="emit('navigate', 'catalog')" class="menu-btn">
        Lihat Semua Produk
      </button>
    </div>
  </div>
</template>

<style scoped>
.product-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); 
  gap: 24px; 
}
.page-header { 
  margin-bottom: 24px; 
  display: flex; 
  flex-direction: column; 
  align-items: flex-start; 
}
.page-header h2 { 
  margin: 16px 0 0 0; 
}
.back-btn { 
  background: none; 
  border: none; 
  font-size: 1rem; 
  color: #007bff; 
  cursor: pointer; 
  padding: 8px 0; 
}
.back-btn:hover { 
  text-decoration: underline; 
}
.loader { 
  text-align: center; 
  padding: 60px; 
  font-size: 1.5rem; 
  color: #65676b; 
}
.see-more-container {
  text-align: center;
  margin-top: 40px;
}
.menu-btn { 
  padding: 12px 24px; 
  font-size: 1.1rem; 
  font-weight: 600; 
  border-radius: 8px; 
  border: 2px solid #007bff; 
  background-color: #007bff; 
  color: white; 
  cursor: pointer; 
  transition: all 0.2s ease; 
}
.menu-btn:hover { 
  background-color: #0056b3; 
  border-color: #0056b3; 
}
</style>