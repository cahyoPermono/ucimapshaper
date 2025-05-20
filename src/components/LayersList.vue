<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { useLayersStore } from '../stores/layers';

const layersStore = useLayersStore();
const editingLayerName = ref<string | null>(null);
const newLayerName = ref('');

const startEditingName = (layerId: string, currentName: string) => {
  editingLayerName.value = layerId;
  newLayerName.value = currentName;
  // Fokus ke input saat mulai edit
  nextTick(() => {
    const input = document.querySelector('.name-input') as HTMLInputElement;
    if (input) input.focus();
  });
};

const saveLayerName = (layerId: string) => {
  if (newLayerName.value.trim()) {
    layersStore.updateLayerName(layerId, newLayerName.value);
  }
  editingLayerName.value = null;
};

const cancelEditingName = () => {
  editingLayerName.value = null;
};

const toggleLayerVisibility = (layerId: string) => {
  layersStore.toggleLayerVisibility(layerId);
};

const removeLayer = (layerId: string) => {
  if (confirm('Are you sure you want to remove this layer?')) {
    layersStore.removeLayer(layerId);
  }
};
</script>

<template>
  <div class="layers-list">
    <div 
      v-for="layer in layersStore.layers" 
      :key="layer.id" 
      class="layer-item"
    >
      <div class="layer-visibility">
        <button 
          class="visibility-toggle"
          :class="{ visible: layer.visible }"
          @click="toggleLayerVisibility(layer.id)"
        >
          <span v-if="layer.visible">👁️</span>
          <span v-else class="hidden-eye">👁️</span>
        </button>
      </div>
      
      <div class="layer-color" :style="{ backgroundColor: layer.color }"></div>
      
      <div class="layer-name">
        <template v-if="editingLayerName === layer.id">
          <input 
            v-model="newLayerName" 
            class="name-input"
            @keyup.enter="saveLayerName(layer.id)"
            @keyup.esc="cancelEditingName"
            @blur="saveLayerName(layer.id)"
            ref="nameInput"
          />
        </template>
        <span 
          v-else 
          @dblclick="startEditingName(layer.id, layer.name)" 
          :title="layer.name"
        >
          {{ layer.name }}
        </span>
      </div>
      
      <div class="layer-actions">
        <button class="action-button" @click="removeLayer(layer.id)" title="Remove Layer">
          ❌
        </button>
      </div>
    </div>
    
    <p v-if="layersStore.layers.length === 0" class="empty-message">
      No layers added yet
    </p>
  </div>
</template>

<style scoped>
.layers-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.layer-item {
  display: flex;
  align-items: center;
  padding: var(--space-2);
  border-radius: var(--border-radius-md);
  background-color: var(--color-gray-50);
  transition: background-color 0.2s ease;
}

.layer-item:hover {
  background-color: var(--color-gray-100);
}

.layer-visibility {
  margin-right: var(--space-2);
}

.visibility-toggle {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: 1rem;
  color: var(--color-gray-500);
  display: flex;
  align-items: center;
  justify-content: center;
}

.visibility-toggle.visible {
  color: var(--color-gray-900);
}

.visibility-toggle .hidden-eye {
  opacity: 0.4;
}

.layer-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: var(--space-2);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.layer-name {
  flex: 1;
  font-size: 0.875rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.name-input {
  width: 100%;
  padding: var(--space-1);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-sm);
  font-size: 0.875rem;
}

.layer-actions {
  display: flex;
  gap: var(--space-1);
}

.action-button {
  background: none;
  border: none;
  padding: var(--space-1);
  cursor: pointer;
  font-size: 0.75rem;
  color: var(--color-gray-500);
  border-radius: var(--border-radius-sm);
  transition: all 0.2s ease;
}

.action-button:hover {
  color: var(--color-error);
  background-color: var(--color-gray-200);
}

.empty-message {
  color: var(--color-gray-500);
  text-align: center;
  font-size: 0.875rem;
  padding: var(--space-4);
}
</style>