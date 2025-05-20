<script setup lang="ts">
import { ref } from 'vue';
import { useLayersStore } from '../stores/layers';

const emit = defineEmits(['toggle-sidebar']);
const layersStore = useLayersStore();

const toggleSidebar = () => {
  emit('toggle-sidebar');
};
</script>

<template>
  <div class="toolbar">
    <button @click="toggleSidebar" class="toolbar-button" title="Toggle Sidebar">
      ☰
    </button>
    
    <div class="toolbar-divider"></div>
    
    <button
      @click="layersStore.resetView()"
      class="toolbar-button"
      title="Reset View"
    >
      🔍
    </button>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.toolbar-button {
  background-color: transparent;
  color: var(--color-gray-700);
  border: none;
  padding: var(--space-1) var(--space-2);
  font-size: 1.25rem;
  cursor: pointer;
  border-radius: var(--border-radius-sm);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toolbar-button:hover {
  background-color: var(--color-gray-100);
  color: var(--color-gray-900);
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background-color: var(--color-gray-200);
  margin: 0 var(--space-2);
}
</style>