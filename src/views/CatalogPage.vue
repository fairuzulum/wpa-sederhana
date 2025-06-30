<script setup>
import ProductCard from "../components/ProductCard.vue";

defineProps({
  products: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["navigate", "view-detail"]);
</script>

<template>
  <div class="catalog-page">
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
/* Hapus style untuk .back-btn dan sesuaikan .page-header */
.page-header {
  margin-bottom: 24px;
  /* Tidak perlu flex lagi jika hanya ada judul */
}
.page-header h2 {
  /* Hapus margin atas yang sebelumnya untuk memberi ruang pada tombol kembali */
  margin: 0;
  font-size: 1.8rem;
}
.loader {
  text-align: center;
  padding: 60px;
  font-size: 1.5rem;
  color: #65676b;
}
</style>