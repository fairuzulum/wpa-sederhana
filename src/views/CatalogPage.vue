<script setup>
import ProductCard from "../components/ProductCard.vue";

// tailwind
import "../style.css";

defineProps({
  products: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["navigate", "view-detail"]);
</script>

<template>
  <div className="py-6">
    <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
        @click="emit('view-detail', product.id)"
      />
    </div>

    <div v-if="products.length === 0" className="text-center text-gray-500 text-lg py-16">
      Produk tidak ditemukan.
    </div>
  </div>
</template>