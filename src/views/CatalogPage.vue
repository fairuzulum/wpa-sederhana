<script setup>
import ProductCard from "../components/ProductCard.vue";

// tailwind
import "../style.css";

defineProps({
  products: {
    type: Array,
    required: true,
  },
  searchQuery: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["navigate", "view-detail"]);
</script>

<template>
  <div>
    <!-- Tampilkan informasi pencarian jika ada -->
    <div v-if="searchQuery && searchQuery.trim() !== ''" class="mb-4">
      <p class="text-gray-600 text-sm">
        Hasil pencarian untuk: <span class="font-semibold">"{{ searchQuery }}"</span>
        <span class="text-gray-500">({{ products.length }} produk ditemukan)</span>
      </p>
    </div>

    <!-- Grid produk -->
    <div
      className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6"
    >
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
        @click="emit('view-detail', product.id)"
      />
    </div>

    <!-- Pesan jika tidak ada produk -->
    <div
      v-if="products.length === 0"
      className="text-center text-gray-500 text-lg py-16"
    >
      <div v-if="searchQuery && searchQuery.trim() !== ''">
        <div class="text-4xl mb-4">🔍</div>
        <p class="mb-2">Tidak ada produk yang ditemukan</p>
        <p class="text-sm text-gray-400">Coba gunakan kata kunci yang berbeda</p>
      </div>
      <div v-else>
        Produk tidak ditemukan.
      </div>
    </div>
  </div>
</template>

