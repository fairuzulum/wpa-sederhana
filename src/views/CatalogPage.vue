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
  <div class="min-h-screen flex flex-col items-center justify-center px-4 py-8">
    <!-- Tampilkan informasi pencarian jika ada -->
    <div v-if="searchQuery && searchQuery.trim() !== ''" class="mb-4 w-full max-w-6xl">
      <p class="text-gray-600 text-sm text-center">
        Hasil pencarian untuk: <span class="font-semibold">"{{ searchQuery }}"</span>
        <span class="text-gray-500">({{ products.length }} produk ditemukan)</span>
      </p>
    </div>

    <!-- Grid produk dengan centering yang fleksibel -->
    <div class="w-full max-w-6xl flex justify-center">
      <div
        class="grid gap-4 md:gap-6 place-items-center"
        :class="{
          'grid-cols-1': products.length === 1,
          'grid-cols-2': products.length === 2,
          'grid-cols-3': products.length === 3,
          'grid-cols-2 sm:grid-cols-4': products.length === 4,
          'grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5': products.length >= 5
        }"
      >
        <ProductCard
          v-for="product in products"
          :key="product.id"
          :product="product"
          @click="emit('view-detail', product.id)"
        />
      </div>
    </div>

    <!-- Pesan jika tidak ada produk -->
    <div
      v-if="products.length === 0"
      class="text-center text-gray-500 text-lg py-16 w-full max-w-6xl"
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

