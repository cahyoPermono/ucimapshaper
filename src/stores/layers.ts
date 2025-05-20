import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { saveAs } from 'file-saver';
import * as L from 'leaflet';

export interface Layer {
  id: string;
  name: string;
  geojson: any;
  visible: boolean;
  color?: string;
}

export const useLayersStore = defineStore('layers', () => {
  const layers = ref<Layer[]>([]);
  const map = ref<L.Map | null>(null);

  // Set map reference
  function setMap(mapInstance: L.Map) {
    map.value = mapInstance;
  }

  // Add new layer
  async function addLayer(layer: Layer) {
    layers.value.push(layer);
  }

  // Remove layer
  function removeLayer(layerId: string) {
    const index = layers.value.findIndex(layer => layer.id === layerId);
    if (index !== -1) {
      layers.value.splice(index, 1);
    }
  }

  // Toggle layer visibility
  function toggleLayerVisibility(layerId: string) {
    const layer = layers.value.find(layer => layer.id === layerId);
    if (layer) {
      layer.visible = !layer.visible;
    }
  }

  // Update layer name
  function updateLayerName(layerId: string, newName: string) {
    const layer = layers.value.find(layer => layer.id === layerId);
    if (layer) {
      layer.name = newName;
    }
  }

  // Update layer geometry (for simplification tools)
  async function updateLayerGeometry(layerId: string, newGeojson: any) {
    const layer = layers.value.find(layer => layer.id === layerId);
    if (layer) {
      layer.geojson = newGeojson;
    }
  }

  // Export layer as GeoJSON
  function exportGeoJSON() {
    if (layers.value.length === 0) return;
    
    // If only one layer is present, export that
    if (layers.value.length === 1) {
      const blob = new Blob(
        [JSON.stringify(layers.value[0].geojson)], 
        { type: 'application/json' }
      );
      saveAs(blob, `${layers.value[0].name}.geojson`);
      return;
    }
    
    // If multiple layers, let user choose which one to export
    const layerToExport = prompt(
      'Enter the name of the layer to export, or "all" to export all layers:',
      'all'
    );
    
    if (!layerToExport) return;
    
    if (layerToExport.toLowerCase() === 'all') {
      // Export all layers as a single FeatureCollection
      const features: any[] = [];
      
      layers.value.forEach(layer => {
        if (layer.geojson.type === 'FeatureCollection') {
          features.push(...layer.geojson.features);
        } else if (layer.geojson.type === 'Feature') {
          features.push(layer.geojson);
        }
      });
      
      const combinedGeoJSON = {
        type: 'FeatureCollection',
        features
      };
      
      const blob = new Blob(
        [JSON.stringify(combinedGeoJSON)], 
        { type: 'application/json' }
      );
      saveAs(blob, 'all_layers.geojson');
    } else {
      // Find the layer by name
      const layer = layers.value.find(
        layer => layer.name.toLowerCase() === layerToExport.toLowerCase()
      );
      
      if (layer) {
        const blob = new Blob(
          [JSON.stringify(layer.geojson)], 
          { type: 'application/json' }
        );
        saveAs(blob, `${layer.name}.geojson`);
      } else {
        alert(`Layer "${layerToExport}" not found.`);
      }
    }
  }
  
  // Export to Shapefile functionality (placeholder)
  function exportShapefile() {
    alert('Shapefile export will be implemented in a future update.');
  }
  
  // Export to TopoJSON functionality (placeholder)
  function exportTopoJSON() {
    alert('TopoJSON export will be implemented in a future update.');
  }
  
  // Reset view to fit all layers
  function resetView() {
    if (!map.value) return;
    
    const visibleLayers = layers.value.filter(layer => layer.visible);
    
    if (visibleLayers.length === 0) return;
    
    // Create temporary GeoJSON layers to get bounds
    const bounds: L.LatLngBounds[] = [];
    
    visibleLayers.forEach(layer => {
      try {
        const tempLayer = L.geoJSON(layer.geojson);
        const layerBounds = tempLayer.getBounds();
        
        if (layerBounds.isValid()) {
          bounds.push(layerBounds);
        }
      } catch (error) {
        console.warn('Could not get bounds for layer:', layer.name);
      }
    });
    
    if (bounds.length > 0) {
      // Combine all bounds
      const combinedBounds = bounds[0];
      
      for (let i = 1; i < bounds.length; i++) {
        combinedBounds.extend(bounds[i]);
      }
      
      map.value.fitBounds(combinedBounds, { padding: [50, 50] });
    }
  }

  return {
    layers,
    setMap,
    addLayer,
    removeLayer,
    toggleLayerVisibility,
    updateLayerName,
    updateLayerGeometry,
    exportGeoJSON,
    exportShapefile,
    exportTopoJSON,
    resetView
  };
});