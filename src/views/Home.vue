<script setup lang="ts">
import { ref, onMounted } from 'vue';
import MapView from '../components/MapView.vue';
import Sidebar from '../components/Sidebar.vue';
import Toolbar from '../components/Toolbar.vue';
import { useLayersStore } from '../stores/layers';

const sidebar = ref(true);
const layersStore = useLayersStore();

const toggleSidebar = () => {
  sidebar.value = !sidebar.value;
};

onMounted(() => {
  // Initialize any required setup
});
</script>

<template>
  <div class="home-container">
    <header class="app-header">
      <div class="logo">
        <h1>Vue Mapshaper</h1>
      </div>
      <Toolbar @toggle-sidebar="toggleSidebar" />
    </header>
    
    <div class="content-container">
      <Sidebar v-if="sidebar" />
      <main class="map-container">
        <MapView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-2) var(--space-4);
  background-color: white;
  border-bottom: 1px solid var(--color-gray-200);
  height: 56px;
  box-shadow: var(--shadow-sm);
  z-index: 1000;
}

.logo h1 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-primary);
  margin: 0;
}

.content-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.map-container {
  flex: 1;
  position: relative;
  overflow: hidden;
}

@media (max-width: 768px) {
  .app-header {
    padding: var(--space-2);
  }
  
  .logo h1 {
    font-size: 1rem;
  }
}
</style>