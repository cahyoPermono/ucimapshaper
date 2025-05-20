<script setup lang="ts">
import { ref, computed } from 'vue';
import { useLayersStore } from '../stores/layers';
import * as turf from '@turf/turf';

const layersStore = useLayersStore();
const selectedLayerId = ref('');
const simplifyTolerance = ref(0.001); // Default tolerance value
const simplifyMethod = ref('visvalingam'); // Default method
const originalFeatureCount = ref(0);
const simplifiedFeatureCount = ref(0);
const reductionPercentage = ref(0);
const isProcessing = ref(false);

// Get list of layers for selection
const availableLayers = computed(() => {
  return layersStore.layers.map(layer => ({
    id: layer.id,
    name: layer.name
  }));
});

// Auto-select the first layer if available and none is selected
if (availableLayers.value.length > 0 && !selectedLayerId.value) {
  selectedLayerId.value = availableLayers.value[0].id;
}

// Computed selected layer
const selectedLayer = computed(() => {
  return layersStore.layers.find(layer => layer.id === selectedLayerId.value);
});

// Update feature counts when layer changes
const updateFeatureCounts = () => {
  if (!selectedLayer.value?.geojson) {
    originalFeatureCount.value = 0;
    simplifiedFeatureCount.value = 0;
    reductionPercentage.value = 0;
    return;
  }
  
  // Count vertices in the original layer
  let totalVertices = 0;
  if (selectedLayer.value.geojson.type === 'FeatureCollection') {
    selectedLayer.value.geojson.features.forEach(feature => {
      totalVertices += countVertices(feature);
    });
  } else if (selectedLayer.value.geojson.type === 'Feature') {
    totalVertices = countVertices(selectedLayer.value.geojson);
  }
  
  originalFeatureCount.value = totalVertices;
  
  // The simplified count will be updated after simplification
  simplifiedFeatureCount.value = totalVertices;
  reductionPercentage.value = 0;
};

// Count vertices in a feature
const countVertices = (feature: any): number => {
  if (!feature.geometry) return 0;
  
  let count = 0;
  
  switch (feature.geometry.type) {
    case 'Point':
      count = 1;
      break;
    case 'LineString':
      count = feature.geometry.coordinates.length;
      break;
    case 'Polygon':
      feature.geometry.coordinates.forEach((ring: any[]) => {
        count += ring.length;
      });
      break;
    case 'MultiPoint':
      count = feature.geometry.coordinates.length;
      break;
    case 'MultiLineString':
      feature.geometry.coordinates.forEach((line: any[]) => {
        count += line.length;
      });
      break;
    case 'MultiPolygon':
      feature.geometry.coordinates.forEach((polygon: any[][]) => {
        polygon.forEach((ring: any[]) => {
          count += ring.length;
        });
      });
      break;
  }
  
  return count;
};

// Watch for layer changes to update counts
const onLayerChange = () => {
  updateFeatureCounts();
};

// Simplify the selected layer
const simplifyGeometry = async () => {
  if (!selectedLayer.value || !selectedLayer.value.geojson) return;
  
  isProcessing.value = true;
  
  try {
    const originalGeojson = selectedLayer.value.geojson;
    let simplifiedGeojson;
    
    // Use appropriate simplification method
    if (simplifyMethod.value === 'visvalingam') {
      simplifiedGeojson = turf.simplify(originalGeojson, {
        tolerance: simplifyTolerance.value,
        highQuality: true
      });
    } else {
      // Douglas-Peucker
      simplifiedGeojson = turf.simplify(originalGeojson, {
        tolerance: simplifyTolerance.value,
        highQuality: false
      });
    }
    
    // Update the layer with simplified geometry
    await layersStore.updateLayerGeometry(selectedLayerId.value, simplifiedGeojson);
    
    // Update feature counts after simplification
    let totalVertices = 0;
    if (simplifiedGeojson.type === 'FeatureCollection') {
      simplifiedGeojson.features.forEach((feature: any) => {
        totalVertices += countVertices(feature);
      });
    } else if (simplifiedGeojson.type === 'Feature') {
      totalVertices = countVertices(simplifiedGeojson);
    }
    
    simplifiedFeatureCount.value = totalVertices;
    
    // Calculate reduction percentage
    if (originalFeatureCount.value > 0) {
      reductionPercentage.value = Math.round(
        ((originalFeatureCount.value - simplifiedFeatureCount.value) / originalFeatureCount.value) * 100
      );
    }
  } catch (error) {
    console.error('Error simplifying geometry:', error);
  } finally {
    isProcessing.value = false;
  }
};

// Call updateFeatureCounts when component is mounted
onLayerChange();
</script>

<template>
  <div class="simplify-tools">
    <h3>Simplify Geometry</h3>
    
    <div class="form-group">
      <label for="layer-select">Select Layer:</label>
      <select 
        id="layer-select" 
        v-model="selectedLayerId"
        @change="onLayerChange"
        class="select-input"
      >
        <option 
          v-for="layer in availableLayers" 
          :key="layer.id" 
          :value="layer.id"
        >
          {{ layer.name }}
        </option>
      </select>
    </div>
    
    <div class="form-group">
      <label for="simplify-method">Simplification Method:</label>
      <select 
        id="simplify-method" 
        v-model="simplifyMethod"
        class="select-input"
      >
        <option value="visvalingam">Visvalingam (weighted area)</option>
        <option value="douglas-peucker">Douglas-Peucker (distance)</option>
      </select>
    </div>
    
    <div class="form-group">
      <label for="tolerance-slider">
        Tolerance: {{ simplifyTolerance.toFixed(5) }}
      </label>
      <input 
        id="tolerance-slider" 
        type="range" 
        v-model.number="simplifyTolerance"
        min="0.00001" 
        max="0.1" 
        step="0.00001"
        class="slider"
      >
      <div class="slider-labels">
        <span>Fine</span>
        <span>Coarse</span>
      </div>
    </div>
    
    <button 
      @click="simplifyGeometry"
      class="simplify-button"
      :disabled="isProcessing || !selectedLayerId"
    >
      <span v-if="isProcessing">Processing...</span>
      <span v-else>Simplify</span>
    </button>
    
    <div v-if="originalFeatureCount > 0" class="results-panel">
      <div class="result-item">
        <div class="result-label">Original vertices:</div>
        <div class="result-value">{{ originalFeatureCount }}</div>
      </div>
      <div class="result-item">
        <div class="result-label">Simplified vertices:</div>
        <div class="result-value">{{ simplifiedFeatureCount }}</div>
      </div>
      <div class="result-item highlight">
        <div class="result-label">Reduction:</div>
        <div class="result-value">{{ reductionPercentage }}%</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.simplify-tools {
  padding: var(--space-2);
}

h3 {
  margin-bottom: var(--space-4);
  color: var(--color-gray-800);
}

.form-group {
  margin-bottom: var(--space-4);
}

label {
  display: block;
  margin-bottom: var(--space-2);
  font-size: 0.875rem;
  color: var(--color-gray-700);
}

.select-input {
  width: 100%;
  padding: var(--space-2);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  background-color: white;
  font-size: 0.875rem;
}

.slider {
  width: 100%;
  margin: var(--space-2) 0;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--color-gray-500);
  margin-top: var(--space-1);
}

.simplify-button {
  width: 100%;
  margin-top: var(--space-2);
  padding: var(--space-2);
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.simplify-button:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
}

.simplify-button:disabled {
  background-color: var(--color-gray-300);
  cursor: not-allowed;
}

.results-panel {
  margin-top: var(--space-4);
  padding: var(--space-3);
  background-color: var(--color-gray-50);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-gray-200);
}

.result-item {
  display: flex;
  justify-content: space-between;
  padding: var(--space-1) 0;
  font-size: 0.875rem;
}

.result-label {
  color: var(--color-gray-600);
}

.result-value {
  font-weight: 500;
  color: var(--color-gray-900);
}

.highlight {
  border-top: 1px solid var(--color-gray-200);
  margin-top: var(--space-2);
  padding-top: var(--space-2);
}

.highlight .result-value {
  color: var(--color-primary);
  font-weight: 600;
}
</style>