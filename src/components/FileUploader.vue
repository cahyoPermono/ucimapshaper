<script setup lang="ts">
import { ref } from 'vue';
import { useLayersStore } from '../stores/layers';
import shp from 'shpjs';

defineProps({
  compact: {
    type: Boolean,
    default: false
  }
});

const layersStore = useLayersStore();
const fileInput = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');

const handleFileSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;
  
  await processFiles(input.files);
  input.value = ''; // Reset the input
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  isDragging.value = true;
};

const handleDragLeave = () => {
  isDragging.value = false;
};

const handleDrop = async (event: DragEvent) => {
  event.preventDefault();
  isDragging.value = false;
  
  if (!event.dataTransfer?.files.length) return;
  await processFiles(event.dataTransfer.files);
};

const processFiles = async (files: FileList) => {
  isLoading.value = true;
  errorMessage.value = '';
  
  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileName = file.name;
      const extension = fileName.split('.').pop()?.toLowerCase();
      
      // Process based on file extension
      if (extension === 'json' || extension === 'geojson') {
        await processGeoJSON(file);
      } else if (extension === 'zip') {
        await processZipFile(file);
      } else if (extension === 'shp') {
        await processShapefile(file);
      } else {
        throw new Error(`Unsupported file type: ${extension}`);
      }
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unknown error during file upload';
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

const processGeoJSON = async (file: File) => {
  const reader = new FileReader();
  
  return new Promise<void>((resolve, reject) => {
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const geojson = JSON.parse(content);
        
        await layersStore.addLayer({
          id: Date.now().toString(),
          name: file.name,
          geojson,
          visible: true,
          color: getRandomColor()
        });
        
        resolve();
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
};

const processZipFile = async (file: File) => {
  try {
    // Read the file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    // Pass the ArrayBuffer directly to shpjs
    const geojson = await shp(arrayBuffer);

    await layersStore.addLayer({
      id: Date.now().toString(),
      name: file.name,
      geojson,
      visible: true,
      color: getRandomColor()
    });
  } catch (error) {
    throw new Error(`Error processing zip file: ${error instanceof Error ? error.message : String(error)}`);
  }
};

const processShapefile = async (_file: File) => {
  // For simplicity, treat as unsupported for now
  errorMessage.value = 'Shapefile processing will be implemented in a future update';
};

const getRandomColor = () => {
  const colors = [
    '#3388ff', // Blue
    '#33a02c', // Green
    '#ff7f00', // Orange
    '#6a3d9a', // Purple
    '#e31a1c', // Red
    '#fdbf6f', // Light orange
    '#ff9198', // Light pink
    '#b15928', // Brown
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

const triggerFileInput = () => {
  fileInput.value?.click();
};
</script>

<template>
  <div>
    <input 
      ref="fileInput"
      type="file" 
      accept=".json,.geojson,.zip,.shp,.cpg,.dbf,.prj,.sbn,.sbx,.shx" 
      multiple
      @change="handleFileSelect"
      class="hidden-input"
    >
    
    <template v-if="compact">
      <button class="upload-button-compact" @click="triggerFileInput">
        + Add Layer
      </button>
    </template>
    <template v-else>
      <div 
        class="upload-area" 
        :class="{ dragging: isDragging, loading: isLoading }"
        @dragover="handleDragOver" 
        @dragleave="handleDragLeave" 
        @drop="handleDrop"
        @click="triggerFileInput"
      >
        <div v-if="isLoading" class="upload-content">
          <div class="spinner"></div>
          <p>Loading file...</p>
        </div>
        <div v-else class="upload-content">
          <span class="upload-icon">📁</span>
          <p>Drop GeoJSON or Shapefile here<br>or click to browse</p>
          <small>Supports .json, .geojson, .shp, .zip</small>
        </div>
      </div>
    </template>
    
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
  </div>
</template>

<style scoped>
.hidden-input {
  display: none;
}

.upload-area {
  border: 2px dashed var(--color-gray-300);
  border-radius: var(--border-radius-lg);
  padding: var(--space-6);
  text-align: center;
  cursor: pointer;
  background-color: var(--color-gray-50);
  transition: all 0.2s ease;
}

.upload-area:hover {
  border-color: var(--color-primary);
  background-color: var(--color-gray-100);
}

.upload-area.dragging {
  border-color: var(--color-primary);
  background-color: var(--color-gray-100);
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
}

.upload-icon {
  font-size: 2rem;
  margin-bottom: var(--space-2);
}

.upload-area p {
  margin: 0;
  color: var(--color-gray-700);
}

.upload-area small {
  color: var(--color-gray-500);
  font-size: 0.75rem;
}

.error-message {
  color: var(--color-error);
  margin-top: var(--space-2);
  font-size: 0.875rem;
  text-align: center;
}

.upload-button-compact {
  background-color: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  padding: var(--space-1) var(--space-2);
  font-size: 0.75rem;
}

.upload-button-compact:hover {
  background-color: var(--color-gray-100);
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(0, 102, 204, 0.3);
  border-radius: 50%;
  border-top-color: var(--color-primary);
  animation: spin 1s ease-in-out infinite;
  margin-bottom: var(--space-2);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>