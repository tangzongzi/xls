<script setup>
import { ref, computed, watch } from 'vue';

// 接收props
const props = defineProps({
  images: {
    type: Array,
    default: () => []
  },
  selectedImage: {
    type: Object,
    default: null
  },
  columns: {
    type: Number,
    default: 3
  },
  itemsPerPage: {
    type: Number,
    default: 9
  },
  maxPages: {
    type: Number,
    default: 5
  }
});

// 定义事件
const emit = defineEmits(['select']);

// 分页相关状态
const currentPage = ref(1);

// 计算总页数（限制最大页数）
const totalPages = computed(() => {
  const calculatedPages = Math.ceil(props.images.length / props.itemsPerPage);
  return Math.min(calculatedPages, props.maxPages);
});

// 计算当前页显示的图片（只显示限制页数内的图片）
const paginatedImages = computed(() => {
  const maxImages = props.maxPages * props.itemsPerPage;
  const limitedImages = props.images.slice(0, maxImages);
  
  const start = (currentPage.value - 1) * props.itemsPerPage;
  const end = start + props.itemsPerPage;
  return limitedImages.slice(start, end);
});

// 计算总图片数
const totalImages = computed(() => {
  return props.images.length;
});

// 计算可见的页码
const visiblePages = computed(() => {
  const pages = [];
  const maxVisible = 5;
  const total = totalPages.value;
  const current = currentPage.value;
  
  if (total <= maxVisible) {
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    let start = Math.max(1, current - 2);
    let end = Math.min(total, current + 2);
    
    if (start === 1) {
      end = Math.min(maxVisible, total);
    } else if (end === total) {
      start = Math.max(1, total - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
  }
  
  return pages;
});

// 跳转到指定页
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

// 监听图片变化，重置到第一页
watch(() => props.images, () => {
  currentPage.value = 1;
}, { deep: true });

// 选择图片
const selectImage = (image) => {
  emit('select', image);
};

// 检查图片是否被选中
const isSelected = (image) => {
  return props.selectedImage && props.selectedImage.id === image.id;
};

// 计算图片网格样式
const gridStyle = computed(() => {
  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${props.columns}, 1fr)`,
    gap: '1rem'
  };
});

// 模拟图片加载状态
const loadingStates = ref({});

const handleImageLoad = (imageId) => {
  loadingStates.value[imageId] = true;
};

const isImageLoaded = (imageId) => {
  return loadingStates.value[imageId];
};

// 处理无图片情况
const hasImages = computed(() => {
  return props.images && props.images.length > 0;
});
</script>

<template>
  <div class="image-selector">
    <!-- 无图片提示 -->
    <div v-if="!hasImages" class="p-6 bg-gray-50 rounded-lg border border-gray-200 text-center">
      <svg class="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
      </svg>
      <p class="text-gray-600">输入关键词搜索图片</p>
      <p class="text-sm text-gray-500 mt-1">至少需要3个字符</p>
    </div>
    
    <!-- 图片网格 -->
    <div v-else :style="gridStyle" class="image-grid">
      <div 
        v-for="image in paginatedImages" 
        :key="image.id"
        class="relative overflow-hidden rounded-xl cursor-pointer transition-all duration-200 group border border-gray-200"
        :class="isSelected(image) ? 'ring-2 ring-emerald-500 border-emerald-500 shadow-lg' : 'hover:border-emerald-300 hover:shadow-lg transform hover:-translate-y-1'"
        @click="selectImage(image)"
      >
        <!-- 加载占位符 -->
        <div 
          v-if="!isImageLoaded(image.id)" 
          class="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center"
        >
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        </div>
        
        <!-- 图片 -->
        <img 
          :src="image.thumb || image.url" 
          :alt="image.alt" 
          class="w-full h-64 object-cover bg-white"
          @load="handleImageLoad(image.id)"
        />
        
        <!-- 选中标记 -->
        <div 
          v-if="isSelected(image)" 
          class="absolute top-2 right-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full p-1.5 shadow-lg"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
          </svg>
        </div>
        
        <!-- 图片信息 -->
        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 transform translate-y-full group-hover:translate-y-0 transition-transform">
          <p class="text-white text-sm truncate">{{ image.alt }}</p>
        </div>
      </div>
    </div>
    
    <!-- 分页组件 -->
    <div v-if="hasImages && totalPages > 1" class="mt-6">
      <!-- 分页控件 -->
      <div class="flex justify-center items-center gap-4 mb-3">
        <button 
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage <= 1"
          class="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-emerald-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-emerald-200 hover:border-emerald-300 shadow-sm hover:shadow-md"
        >
          ← 上一页
        </button>
        
        <div class="flex items-center gap-2">
          <button 
            v-for="page in visiblePages"
            :key="page"
            @click="goToPage(page)"
            :class="[
              'px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 border',
              page === currentPage 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-500 shadow-md' 
                : 'bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-300 shadow-sm hover:shadow-md'
            ]"
          >
            {{ page }}
          </button>
        </div>
        
        <button 
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage >= totalPages"
          class="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-emerald-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-emerald-200 hover:border-emerald-300 shadow-sm hover:shadow-md"
        >
          下一页 →
        </button>
      </div>
      
      <!-- 分页信息提示 -->
      <div class="text-center">
        <div class="inline-flex items-center px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-200">
          <span class="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></span>
          第 {{ currentPage }} 页，共 {{ totalPages }} 页
          <template v-if="props.images.length > props.maxPages * props.itemsPerPage">
            <span class="mx-2">•</span>
            <span class="text-amber-600">最多显示 {{ props.maxPages }} 页</span>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>