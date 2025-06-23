<script setup>
import { ref, onMounted } from 'vue';

const products = ref([]);
const isLoading = ref(true);

// Fungsi untuk fetch data
async function fetchProducts() {
  try {
    const response = await fetch('/products.json');
    if (!response.ok) {
      throw new Error('Gagal memuat data produk');
    }
    products.value = await response.json();
  } catch (error) {
    console.error(error);
    // Mungkin tampilkan pesan error di UI
  } finally {
    isLoading.value = false;
  }
}

// Panggil fungsi saat komponen di-mount
onMounted(() => {
  fetchProducts();
});
</script>

<template>
  <div class="app-container">
    <header>
      <h1>Katalog Produk Digital</h1>
    </header>
    
    <main>
      <div v-if="isLoading" class="loader">
        Memuat data...
      </div>
      <div v-else class="product-grid">
        <div v-for="product in products" :key="product.id" class="product-card">
          <img :src="product.image" :alt="product.name" class="product-image" />
          <div class="product-info">
            <h2>{{ product.name }}</h2>
            <p>{{ product.short_description }}</p>
            <span class="price">{{ product.price }}</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style>
/* Berikan styling yang clean dan modern */
body {
  font-family: sans-serif;
  margin: 0;
  background-color: #f4f7f6;
}
.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
header {
  text-align: center;
  margin-bottom: 40px;
  color: #333;
}
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}
.product-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: transform 0.3s ease;
}
.product-card:hover {
  transform: translateY(-5px);
}
.product-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}
.product-info {
  padding: 20px;
}
.product-info h2 {
  margin: 0 0 10px 0;
  font-size: 1.25rem;
}
.product-info p {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
}
.price {
  display: block;
  margin-top: 15px;
  font-weight: bold;
  font-size: 1.2rem;
  color: #007bff;
}
.loader {
  text-align: center;
  padding: 50px;
  font-size: 1.5rem;
  color: #888;
}
</style>