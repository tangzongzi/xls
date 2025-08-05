<script setup>
import { computed, ref } from 'vue';

// 接收props
const props = defineProps({
  image: {
    type: Object,
    default: null
  },
  text: {
    type: String,
    default: ''
  }
});

// 简化：移除样式选择，固定使用居中叠加样式

// 检查是否有图片
const hasContent = computed(() => {
  return props.image;
});
</script>

<template>
  <div class="preview-container">
    <!-- 样式已固定为居中叠加，无需选择 -->
    
    <!-- 预览区域 -->
    <div 
      id="preview-container"
      class="relative overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-50"
      style="width: 100%; aspect-ratio: 3/4; min-height: unset;"
    >
      <!-- 无内容提示 -->
      <div v-if="!hasContent" class="absolute inset-0 flex items-center justify-center text-gray-500">
        <div class="text-center p-6">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <p>请先选择图片并输入文字</p>
        </div>
      </div>
      
      <!-- 固定样式：居中叠加 -->
      <template v-else>
        <div class="relative w-full h-full">
          <img 
            v-if="image" 
            :src="image.url || image.thumb || image" 
            :alt="image.alt || '预览图片'" 
            class="w-full h-full object-cover"
          />
          <div v-if="text && text.trim()" class="absolute inset-0 flex items-center justify-center text-center p-6 bg-black/30">
            <p class="text-white text-xl font-bold drop-shadow-lg">{{ text }}</p>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>