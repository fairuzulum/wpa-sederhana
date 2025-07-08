<script setup>
import { ref } from 'vue';
import myLogo from '../assets/logo.png';

defineProps({
  currentPage: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['search-change', 'navigate-home', 'navigate-back']);
const searchQuery = ref('');

function handleInput() {
  emit('search-change', searchQuery.value);
}
</script>

<template>
  <nav className="bg-white border-b px-6 py-3 border-gray-200 rounded-xl mb-5 z-[1000] w-full">
    <div className="w-full flex justify-between items-center gap-4 sm:gap-6">
      
      <!-- Logo dengan jarak -->
      <div className="flex-shrink-0">
        <img :src="myLogo" alt="App Logo" className="h-[60px] lg:h-[85px] cursor-pointer" @click="emit('navigate-home')" />
      </div>

      <!-- Search di tengah, hanya muncul di CatalogPage -->
      <div v-if="currentPage === 'catalog'" className="flex-1 flex justify-center">
        <div className="relative w-full max-w-[600px]">
          <!-- Search Icon -->
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-gray-400">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </div>
          
          <input 
            type="text" 
            placeholder="Cari produk..." 
            className="w-full py-2.5 pl-11 pr-4 border border-gray-300 rounded-full text-base bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/25"
            v-model="searchQuery"
            @input="handleInput"
          />
        </div>
      </div>
      <!-- Spacer kosong untuk menjaga layout -->
      <div v-else className="flex-1"></div>

      <!-- Tombol back dengan jarak -->
      <div className="flex-shrink-0">
        <button @click="emit('navigate-back')" className="bg-blue-600 text-white p-2 rounded-full w-8 h-8 flex items-center justify-center hover:bg-blue-800 transition-colors" title="Kembali">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
      </div>
    </div>
  </nav>
</template>