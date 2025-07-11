<script setup>
defineProps({
  product: {
    type: Object,
    required: true,
  },
});
const STRAPI_BASE_URL = "https://strapi.fairuzulum.me";
</script>

<template>
  <div
    class="bg-white rounded-3xl shadow-lg overflow-hidden transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-xl"
  >
    <div class="relative w-full aspect-square bg-gray-100">
      <template v-if="product.images && product.images.length > 0">
        <img
          :src="`${STRAPI_BASE_URL}${product.images[0].url}`"
          :alt="product.name"
          class="w-full h-full object-cover"
        />
        <div
          class="absolute inset-0 flex items-center justify-center"
          style="background-color: rgba(0, 0, 0, 0.4)"
        >
          <h3
            class="text-sm sm:text-xl font-semibold text-center px-4"
            style="color: rgba(255, 255, 255, 0.5)"
          >
            {{ product.name }}
          </h3>
        </div>
      </template>

      <template v-else>
        <div class="w-full h-full flex items-center justify-center">
          <div class="text-center">
            <span class="text-gray-500 font-medium">No Image</span>
            <h3 class="text-gray-700 text-lg font-semibold mt-2">
              {{ product.name }}
            </h3>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* Tidak perlu CSS tambahan karena semuanya menggunakan Tailwind */
</style>
