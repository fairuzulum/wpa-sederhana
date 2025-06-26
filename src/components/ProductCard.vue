<script setup>
defineProps({
  product: {
    type: Object,
    required: true
  }
});
const STRAPI_BASE_URL = "https://strapi.fairuzulum.me";
</script>

<template>
  <div class="product-card-simple">
    <div class="card-image-wrapper">
      <img v-if="product.images && product.images.length > 0" :src="`${STRAPI_BASE_URL}${product.images[0].url}`" :alt="product.name"/>
      <div v-else class="placeholder-image"><span>No Image</span></div>
    </div>
    <h3 class="card-name">{{ product.name }}</h3>
  </div>
</template>

<style scoped>
/* Style ini spesifik untuk kartu produk simpel */
.product-card-simple {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.2s ease;
  cursor: pointer;
}
.product-card-simple:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}
.card-image-wrapper {
  width: 100%;
  aspect-ratio: 1 / 1;
  background-color: #f0f2f5;
}
.card-image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.card-name {
  padding: 16px;
  font-size: 1.1rem;
  font-weight: 600;
  text-align: center;
  margin: 0;
}
.placeholder-image {
  display: flex;
  justify-content: center;
  align-items: center;
  color: #8d949e;
  font-weight: 500;
  width: 100%;
  height: 100%;
}
</style>