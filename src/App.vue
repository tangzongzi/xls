<script setup>
import { ref } from 'vue';
import ImageTextMatcher from './components/ImageTextMatcher/ImageTextMatcher.vue';
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-6 px-2 sm:px-4 lg:px-6">
    <div class="w-full">
      <header class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl mb-4 shadow-lg">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
          </svg>
        </div>
        <h1 class="text-5xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4 leading-tight">
          小绿书图文匹配工具
        </h1>
        <p class="text-xl text-gray-600 font-semibold leading-relaxed">输入文案，自动匹配图片，一键生成精美图文</p>
        <div class="mt-4 inline-flex items-center px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
          <span class="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
          智能匹配 · 一键生成 · 高清输出
        </div>
      </header>
      
      <main>
        <ImageTextMatcher />
      </main>
      
      <footer class="mt-12 text-center">
        <div class="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full border border-emerald-100 shadow-sm">
          <div class="w-6 h-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
            <span class="text-white text-xs font-bold">绿</span>
          </div>
          <span class="text-gray-600 text-sm font-medium">© {{ new Date().getFullYear() }} 小绿书 - 让创作更简单</span>
        </div>
      </footer>
    </div>
  </div>
</template>

<style>
/* 全局样式 */
</style>
