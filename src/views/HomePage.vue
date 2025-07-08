<script setup>
const emit = defineEmits(["navigate", "refresh-data", "sync-data"]);
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-gray-100">
    <div class="flex flex-col md:flex-row gap-6">
      <button 
        @click="emit('navigate', 'category-menu')" 
        class="inline-flex items-center justify-center rounded-lg w-64 h-20 text-2xl font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
      >
        Products
      </button>

      <!-- <button 
        @click="alert('Halaman portfolio belum dibuat.')" 
        class="inline-flex items-center justify-center rounded-lg w-64 h-20 text-2xl font-bold border border-slate-300 bg-transparent text-slate-500 opacity-70 cursor-not-allowed"
        disabled
      >
        Portfolio
      </button> -->

      <button 
        @click="emit('sync-data')" 
        class="inline-flex items-center justify-center rounded-lg w-64 h-20 text-2xl font-bold bg-green-600 hover:bg-green-700 text-white transition-colors"
      >
        Sync Data
      </button>
    </div>
  </div>
</template>