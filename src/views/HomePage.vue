<script setup>
const emit = defineEmits(["navigate"]);
</script>

<template>
  <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
    
    <div className="flex flex-col md:flex-row gap-6">

      <button 
        @click="emit('navigate', 'category-menu')" 
        className="inline-flex items-center justify-center rounded-lg w-64 h-20 text-2xl font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
      >
        Products
      </button>

      <button 
        @click="alert('Halaman portfolio belum dibuat.')" 
        className="inline-flex items-center justify-center rounded-lg w-64 h-20 text-2xl font-bold border border-slate-300 bg-transparent text-slate-500 opacity-70 cursor-not-allowed"
        disabled
      >
        Portfolio
      </button>

    </div>
  </div>
</template>