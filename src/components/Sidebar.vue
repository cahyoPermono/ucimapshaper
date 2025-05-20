<script setup lang="ts">
import { ref, computed } from 'vue';
import { useLayersStore } from '../stores/layers';
import FileUploader from './FileUploader.vue';
import LayersList from './LayersList.vue';
import SimplifyTools from './SimplifyTools.vue';

const activeTab = ref('layers');
const layersStore = useLayersStore();

const hasLayers = computed(() => layersStore.layers.length > 0);

const setActiveTab = (tab: string) => {
  activeTab.value = tab;
};
</script>

<template>
  <aside class="sidebar">
    <div class="tabs">
      <button 
        :class="['tab-button', { active: activeTab === 'layers' }]" 
        @click="setActiveTab('layers')"
      >
        Layers
      </button>
      <button 
        :class="['tab-button', { active: activeTab === 'tools', disabled: !hasLayers }]" 
        @click="hasLayers && setActiveTab('tools')"
        :disabled="!hasLayers"
      >
        Tools
      </button>
      <button 
        :class="['tab-button', { active: activeTab === 'export', disabled: !hasLayers }]" 
        @click="hasLayers && setActiveTab('export')"
        :disabled="!hasLayers"
      >
        Export
      </button>
    </div>
    
    <div class="sidebar-content">
      <template v-if="activeTab === 'layers'">
        <div v-if="!hasLayers" class="empty-state">
          <h3>No layers added yet</h3>
          <p>Upload a GeoJSON, Shapefile, or other supported format to get started.</p>
          <FileUploader />
        </div>
        <template v-else>
          <div class="layers-section">
            <div class="section-header">
              <h3>Layers</h3>
              <FileUploader compact />
            </div>
            <LayersList />
          </div>
        </template>
      </template>
      
      <template v-if="activeTab === 'tools' && hasLayers">
        <SimplifyTools />
      </template>
      
      <template v-if="activeTab === 'export' && hasLayers">
        <div class="export-section">
          <h3>Export Options</h3>
          <div class="export-options">
            <button @click="layersStore.exportGeoJSON()">GeoJSON</button>
            <button @click="layersStore.exportShapefile()">Shapefile</button>
            <button @click="layersStore.exportTopoJSON()">TopoJSON</button>
          </div>
        </div>
      </template>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 300px;
  height: 100%;
  background-color: white;
  border-right: 1px solid var(--color-gray-200);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  z-index: 10;
}

.tabs {
  display: flex;
  border-bottom: 1px solid var(--color-gray-200);
}

.tab-button {
  flex: 1;
  background-color: transparent;
  color: var(--color-gray-600);
  border: none;
  padding: var(--space-3) 0;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
}

.tab-button:hover:not(.disabled) {
  background-color: var(--color-gray-100);
  color: var(--color-gray-900);
}

.tab-button.active {
  color: var(--color-primary);
  border-bottom: 2px solid var(--color-primary);
  background-color: transparent;
}

.tab-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-3);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: var(--space-6);
}

.empty-state h3 {
  margin-bottom: var(--space-2);
  color: var(--color-gray-700);
}

.empty-state p {
  margin-bottom: var(--space-4);
  color: var(--color-gray-500);
  font-size: 0.875rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
}

.export-section {
  padding: var(--space-2);
}

.export-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-top: var(--space-3);
}

@media (max-width: 768px) {
  .sidebar {
    width: 260px;
  }
}
</style>