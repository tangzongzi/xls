<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
    <div class="max-w-4xl mx-auto">
      <!-- 页面标题 -->
      <header class="text-center mb-12">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl mb-4 shadow-lg">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </div>
        <h1 class="text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
          如何获取API密钥
        </h1>
        <p class="text-xl text-gray-600 mb-6">获取免费的高质量图片API，为你的小绿书提供丰富的图片资源</p>
        
        <!-- 返回按钮 -->
        <button 
          @click="$emit('back')"
          class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          返回主页
        </button>
      </header>

      <!-- API教程选项卡 -->
      <div class="mb-8">
        <div class="flex flex-wrap justify-center gap-2">
          <button
            v-for="api in apis"
            :key="api.id"
            @click="handleApiSwitch(api.id)"
            :class="[
              'px-6 py-3 font-medium rounded-xl transition-all duration-200 cursor-pointer',
              activeApi === api.id
                ? api.activeClass
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
            ]"
          >
            <span class="flex items-center">
              <div class="w-5 h-5 mr-2 rounded flex items-center justify-center text-xs font-bold" :style="{ backgroundColor: api.color || '#ccc', color: 'white' }">
                {{ api.name.charAt(0) }}
              </div>
              {{ api.name }}
            </span>
          </button>
        </div>
      </div>

      <!-- 教程内容 -->
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <div v-if="currentApi">
          <div class="text-center mb-8">
            <div class="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white font-bold text-2xl shadow-lg" :style="{ backgroundColor: currentApi.color }">
              {{ currentApi.name.charAt(0) }}
            </div>
            <h2 class="text-3xl font-bold text-gray-900 mb-2">{{ currentApi.name }} API获取教程</h2>
            <p class="text-gray-600 text-lg mb-4">{{ currentApi.description }}</p>
            <div class="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <span class="flex items-center">
                <svg class="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
                完全免费
              </span>
              <span class="flex items-center">
                <svg class="w-4 h-4 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path>
                </svg>
                商业可用
              </span>
              <span class="flex items-center">
                <svg class="w-4 h-4 mr-1 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
                </svg>
                约5分钟完成
              </span>
            </div>
          </div>

          <!-- 步骤 -->
          <div class="max-w-3xl mx-auto space-y-8">
            <div 
              v-for="(step, index) in currentApi.steps" 
              :key="index"
              class="bg-gray-50 rounded-xl p-6 border border-gray-100"
            >
              <div class="text-center mb-6">
                <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3 shadow-lg">
                  {{ index + 1 }}
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-3">{{ step.title }}</h3>
                <div class="text-gray-600 mb-6 leading-relaxed" v-html="step.content"></div>
                
                <!-- 链接按钮 -->
                <div v-if="step.link" class="mb-6">
                  <button
                    @click="openExternalLink(step.link.url)"
                    :class="step.link.class || 'inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg font-medium'"
                  >
                    {{ step.link.text }}
                    <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                    </svg>
                  </button>
                  <p class="text-xs text-gray-500 mt-2">点击将在新窗口中打开</p>
                </div>

                <!-- 代码示例 -->
                <div v-if="step.code" class="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto text-left">
                  <pre>{{ step.code }}</pre>
                </div>
              </div>
            </div>
          </div>

          <!-- 注意事项 -->
          <div v-if="currentApi.notes" class="mt-8 max-w-3xl mx-auto">
            <div class="p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
              <div class="text-center mb-4">
                <div class="w-12 h-12 bg-yellow-500 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                </div>
                <h4 class="font-bold text-yellow-800 text-lg mb-4">注意事项</h4>
                <ul class="text-yellow-700 space-y-2 text-left max-w-xl mx-auto">
                  <li v-for="note in currentApi.notes" :key="note" class="flex items-start">
                    <span class="w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>{{ note }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 常见问题 -->
      <div class="mt-8 bg-white rounded-2xl shadow-xl p-8">
        <div class="text-center mb-8">
          <div class="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 class="text-3xl font-bold text-gray-900 mb-2">常见问题</h3>
          <p class="text-gray-600">解答您在使用过程中可能遇到的问题</p>
        </div>
        <div class="max-w-3xl mx-auto space-y-6">
          <div v-for="faq in faqs" :key="faq.question" class="bg-gray-50 rounded-xl p-6 border border-gray-100">
            <h4 class="font-bold text-gray-900 mb-3 text-lg text-center">{{ faq.question }}</h4>
            <p class="text-gray-600 leading-relaxed text-center" v-html="faq.answer"></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// 定义事件
defineEmits(['back']);

// 当前活跃的API
const activeApi = ref('pexels');

// 打开外部链接的方法
const openExternalLink = (url) => {
  // 添加用户确认，提高安全性
  if (confirm(`即将打开外部网站：${url}\n\n确定要继续吗？`)) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

// 处理API切换
const handleApiSwitch = (apiId) => {
  activeApi.value = apiId;
};

// API配置数据
const apis = [
  {
    id: 'pexels',
    name: 'Pexels',
    description: '免费高质量照片，无需署名，商业用途友好',
    color: '#05D9E8',
    activeClass: 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg',
    steps: [
      {
        title: '注册账户',
        content: '访问Pexels官网，点击右上角<code>Join</code>按钮注册账户。推荐使用Google账户快速登录。',
        link: {
          url: 'https://www.pexels.com',
          text: '访问 Pexels.com',
          class: 'inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors'
        }
      },
      {
        title: '获取API密钥',
        content: '登录后访问API页面，在<code>Your API Key</code>部分生成你的专属密钥。',
        link: {
          url: 'https://www.pexels.com/api/',
          text: '获取 API 密钥',
          class: 'inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors'
        }
      },
      {
        title: '配置到小绿书',
        content: '复制API密钥，回到小绿书点击<code>立即设置</code>，选择Pexels并粘贴密钥保存即可。',
        code: '示例密钥：RhQu1rK8IJK38AmxsWEhgQVdZK984psqOOsUXJvFDfz5u'
      }
    ],
    notes: [
      'Pexels API每月免费提供20,000次调用',
      'API密钥是个人专用的，请勿分享给他人',
      'Pexels的图片可以免费用于商业用途，无需署名',
      '如果超出调用限制，需要等待下个月重置或联系Pexels升级'
    ]
  },
  {
    id: 'unsplash',
    name: 'Unsplash',
    description: '世界最大的免费照片社区，高质量专业摄影作品',
    color: '#000000',
    activeClass: 'bg-gradient-to-r from-gray-800 to-black text-white shadow-lg',
    steps: [
      {
        title: '注册账户',
        content: '访问Unsplash官网，点击<code>Join free</code>注册账户。',
        link: {
          url: 'https://unsplash.com',
          text: '访问 Unsplash.com',
          class: 'inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors'
        }
      },
      {
        title: '创建开发者应用',
        content: '访问开发者控制台，创建新应用，填写应用名称和用途描述。',
        link: {
          url: 'https://unsplash.com/developers',
          text: '开发者控制台',
          class: 'inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors'
        }
      },
      {
        title: '获取Access Key',
        content: '应用创建成功后，复制生成的<code>Access Key</code>并配置到小绿书。',
        code: '示例密钥：xjPzKd4fGlmzQvA1B3bQ4pRnT8Cc_YiX5N9mF2sD7Hw'
      }
    ],
    notes: [
      'Demo应用每小时限制50次请求',
      '申请Production级别可获得每小时5,000次请求',
      '使用Unsplash图片时建议（非必需）注明摄影师',
      'API密钥需要妥善保管，避免泄露'
    ]
  },
  {
    id: 'pixabay',
    name: 'Pixabay',
    description: '超过300万张免费图片、矢量图和插画',
    color: '#4EAF47',
    activeClass: 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg',
    steps: [
      {
        title: '注册账户',
        content: '访问Pixabay官网，点击<code>Join</code>注册账户。注册成功后自动获得API密钥。',
        link: {
          url: 'https://pixabay.com',
          text: '访问 Pixabay.com',
          class: 'inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
        }
      },
      {
        title: '查找API密钥',
        content: '登录后在账户设置页面找到API部分，复制你的专属API密钥。',
        link: {
          url: 'https://pixabay.com/api/docs/',
          text: '查看 API 文档',
          class: 'inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
        }
      },
      {
        title: '配置到小绿书',
        content: '将API密钥复制到小绿书的设置中，选择Pixabay并保存即可使用。',
        code: '示例密钥：25598145-4d91b15b3c598f14c5a7bb123'
      }
    ],
    notes: [
      '免费账户每分钟限制5次请求',
      'Pixabay的所有内容都可以免费用于商业用途',
      '不需要注明来源，但作者会很感激',
      'API密钥是个人的，请不要公开分享'
    ]
  }
];

// 计算当前活跃的API对象
const currentApi = computed(() => {
  return apis.find(api => api.id === activeApi.value);
});

// 常见问题
const faqs = [
  {
    question: '为什么需要API密钥？',
    answer: 'API密钥用于身份认证，确保服务稳定性。每个平台都需要API密钥来识别用户身份。'
  },
  {
    question: '这些API都是免费的吗？',
    answer: '是的！Pexels每月20,000次调用，Unsplash每小时50次，Pixabay每分钟5次，完全免费。'
  },
  {
    question: 'API密钥会过期吗？',
    answer: '通常不会过期，但长期不使用或违反条款可能失效。建议定期检查状态。'
  },
  {
    question: '可以同时配置多个API吗？',
    answer: '建议配置多个API作为备选，当一个API达到限制时会自动切换到其他可用API。'
  },
  {
    question: 'API不工作怎么办？',
    answer: '检查API密钥是否正确、网络是否正常、是否超出限制。大多数问题是密钥输入错误。'
  }
];
</script>

<style scoped>
/* 代码块样式 */
code {
  background-color: #f3f4f6;
  color: #1f2937;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.9em;
}

/* 自定义滚动条 */
.overflow-x-auto::-webkit-scrollbar {
  height: 8px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #374151;
  border-radius: 4px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #6b7280;
  border-radius: 4px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>