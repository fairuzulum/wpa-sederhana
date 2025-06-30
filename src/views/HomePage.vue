<script setup>
const emit = defineEmits(["navigate"]);
</script>

<template>
  <div class="home-page">
    <h2>Selamat Datang</h2>
    <div class="menu-buttons">
      <button @click="emit('navigate', 'category-menu')" class="menu-btn">
        Lihat Produk
      </button>
      <button @click="alert('Halaman portfolio belum dibuat.')" class="menu-btn disabled">
        Lihat Portfolio
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Style ini spesifik untuk Halaman Home */
.home-page {
  text-align: center;
  padding: 40px 20px;
}
.menu-buttons {
  margin-top: 32px;
  display: flex;
  justify-content: center;
  gap: 20px;
}
.menu-btn {
  padding: 12px 24px;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 8px;
  border: 2px solid #007bff;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}
.menu-btn:hover {
  background-color: #0056b3;
  border-color: #0056b3;
}
.menu-btn.disabled {
  background-color: #ccc;
  border-color: #ccc;
  cursor: not-allowed;
}
</style>
