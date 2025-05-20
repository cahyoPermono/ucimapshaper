<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useLayersStore } from '../stores/layers';
import * as L from 'leaflet';

const mapContainer = ref<HTMLElement | null>(null);
const map = ref<L.Map | null>(null);
const layersStore = useLayersStore();

onMounted(() => {
  if (mapContainer.value) {
    // Initialize Leaflet map
    map.value = L.map(mapContainer.value, {
      center: [0, 0],
      zoom: 2,
      zoomControl: false,
    });

    // Add tile layer (optional: can be toggled based on user preference)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map.value);

    // Add zoom control to the bottom right
    L.control.zoom({
      position: 'bottomright'
    }).addTo(map.value);

    // Set initial map reference in the store
    layersStore.setMap(map.value);
  }
});

// Watch for changes in loaded layers and update map
watch(() => layersStore.layers, (newLayers) => {
  if (!map.value) return;

  // Clear existing GeoJSON layers before adding new ones
  map.value.eachLayer(layer => {
    if (layer instanceof L.GeoJSON) {
      map.value?.removeLayer(layer);
    }
  });

  // Add all active layers to the map
  newLayers.forEach(layer => {
    if (layer.visible && layer.geojson) {
      const geojsonLayer = L.geoJSON(layer.geojson, {
        style: {
          color: layer.color || '#3388ff',
          weight: 2,
          opacity: 0.8,
          fillOpacity: 0.3
        }
      }).addTo(map.value!);

      // Fit map bounds to the layer if it's the first one
      if (newLayers.length === 1) {
        try {
          const bounds = geojsonLayer.getBounds();
          map.value?.fitBounds(bounds, { padding: [50, 50] });
        } catch (error) {
          console.warn('Unable to fit bounds, layer may be empty');
        }
      }
    }
  });
}, { deep: true });

onUnmounted(() => {
  if (map.value) {
    map.value.remove();
  }
});
</script>

<template>
  <div ref="mapContainer" class="map-view"></div>
</template>

<style scoped>
.map-view {
  width: 100%;
  height: 100%;
  background-color: #f8f9fa;
}
</style>