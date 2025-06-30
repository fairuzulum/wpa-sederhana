<script setup>
// Bagian script tidak berubah
import { ref } from 'vue';
import myLogo from '../assets/logo.png';

const emit = defineEmits(['search-change', 'navigate-home', 'navigate-back']);
const searchQuery = ref('');

function handleInput() {
  emit('search-change', searchQuery.value);
}
</script>

<template>
  <nav class="main-navbar">
    <div class="navbar-content">
      
      <div class="nav-left">
        <img :src="myLogo" alt="App Logo" class="logo" @click="emit('navigate-home')" />
      </div>

      <div class="nav-center">
        <div class="search-container">
          <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Cari produk..." 
            class="search-input"
            v-model="searchQuery"
            @input="handleInput"
          />
        </div>
      </div>

      <div class="nav-right">
          <button @click="emit('navigate-back')" class="back-icon" title="Kembali">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
        <a href="#" @click.prevent="emit('navigate-home')" class="nav-link">Home</a>
      </div>

    </div>
  </nav>
</template>

<style scoped>
/* Updated: Simplified .main-navbar styles */
.main-navbar {
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  padding: 12px 0; /* Vertical padding only */
  position: sticky;
  top: 0;
  border-radius: 12px; /* Kept rounded corners */
  margin-bottom: 20px;
  z-index: 1000;
  width: 100%;
}

/* Updated: Removed horizontal padding from .navbar-content */
.navbar-content {
  max-width: 1100px; 
  margin: 0 auto; /* Center the content */
  padding: 0; /* Remove horizontal padding */
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Add slight padding to internal sections to avoid edge-touching */
.nav-left {
  flex-shrink: 0;
  padding-left: 16px; /* Small padding to avoid edge */
}
.nav-right {
  flex-shrink: 0;
  padding-right: 16px; /* Small padding to avoid edge */
}
.nav-center {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  padding: 0 12px; /* Reduced padding for search bar */
}

.logo { 
  height: 85px;
  cursor: pointer;
}

.search-container {
  position: relative;
  width: 100%;
  max-width: 600px;
}
.search-icon {
  position: absolute;
  top: 50%;
  left: 16px;
  transform: translateY(-50%);
  color: #8e8e8e;
  pointer-events: none;
}
.search-input {
  width: 100%;
  padding: 10px 16px 10px 44px;
  border: 1px solid #ccc;
  border-radius: 20px;
  font-size: 1rem;
  background-color: #ffffff; 
  color: var(--text-color-dark);
}
.search-input::placeholder {
  color: #6c757d;
  opacity: 1;
}
.search-input:focus + .search-icon {
  color: var(--primary-color);
}
.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}
.nav-right {
  display: flex;
  align-items: center;
  gap: 16px;
}
.nav-link {
  text-decoration: none;
  color: var(--primary-color);
  font-weight: 500;
  font-size: 1rem;
}
.nav-link:hover {
  text-decoration: underline;
}
.back-icon {
  background: var(--primary-color); /* Blue background */
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%; /* Circular shape */
  width: 32px; /* Fixed size for circle */
  height: 32px;
  color: #ffffff; /* White color for SVG stroke */
  transition: background-color 0.2s ease; /* Smooth hover transition */
  margin-right: 16px; /* Reduced from 40px for better spacing */
}
.back-icon:hover {
  background: #0056b3; /* Darker blue on hover */
}
.back-icon svg {
  stroke: #ffffff; /* Ensure SVG stroke is white */
}
@media (min-width: 768px) {
  /* No padding for larger screens */
  .navbar-content {
    padding: 0;
  }
  .nav-left {
    padding-left: 24px; /* Slightly larger padding for desktop */
  }
  .nav-right {
    padding-right: 24px;
  }
  .nav-center {
    padding: 0 24px;
  }
}
@media (max-width: 768px) {
  .nav-center {
    padding: 0 8px; /* Tighter padding on mobile */
  }
  .nav-left {
    padding-left: 8px;
  }
  .nav-right {
    padding-right: 8px;
    gap: 8px;
  }
  .nav-link { 
    font-size: 0; 
  }
  .nav-link::before { 
    content: '🏠'; 
    font-size: 1.5rem; 
  }
  .back-icon {
    margin-right: 8px; /* Tighter spacing on mobile */
  }
}
</style>