<script setup>
import { ref, watch, computed } from 'vue';

// 接收props
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '输入你的文案内容...'
  },
  minLength: {
    type: Number,
    default: 3
  }
});

// 定义事件
const emit = defineEmits(['update:modelValue', 'paragraphsChange']);

// 本地状态 - 改为4个数字索引的文案
const textInputs = ref([
  { id: 1, text: '' },
  { id: 2, text: '' },
  { id: 3, text: '' },
  { id: 4, text: '' }
]);

// 计算总字符数
const totalCharCount = computed(() => {
  return textInputs.value.reduce((total, input) => total + input.text.length, 0);
});

// 计算有效文案数量（非空文案）
const validTextCount = computed(() => {
  return textInputs.value.filter(input => input.text.trim().length >= props.minLength).length;
});

// 计算分段文案（只包含非空的文案）
const paragraphs = computed(() => {
  return textInputs.value
    .filter(input => input.text.trim().length > 0)
    .map(input => input.text);
});

// 监听文案变化，只发送段落变化事件，不更新modelValue
watch(textInputs, (newInputs) => {
  emit('paragraphsChange', paragraphs.value);
}, { deep: true });

// 从modelValue初始化（仅在组件首次加载时使用）
const initFromModelValue = () => {
  if (props.modelValue && !textInputs.value.some(input => input.text.trim())) {
    // 只有当所有输入框都为空时，才将modelValue放入第一个输入框
    textInputs.value[0].text = props.modelValue;
  }
};

// 移除对props.modelValue的监听，让输入框保持独立

// 清空所有文案
const clearAll = () => {
  textInputs.value.forEach(input => input.text = '');
};

// 添加示例情感文案
const addExampleText = () => {
  const example = `情绪稳定，是成年人的必修课

生活的担子越来越重，
上有长辈需要照顾，下有孩子需要教育，
偶尔也想找个人倾诉，
却发现每个人都在忙碌，
你张了张嘴，最终还是把所有情绪咽了回去。

直到某一天，你突然意识到——
真正能理解自己的人，只有自己；
真正能安放自己情绪的，也只能是自己。

与其渴望别人的宽慰，
不如学会自我调整，让内心变得更加笃定和从容。`;
  
  // 将示例放入输入框
  textInputs.value[0].text = example;
};



// 添加模板文案到第一个输入框
const addTemplateText = (template) => {
  const templates = {
    '自然风光': `山川湖海，都是我的治愈良药
清晨的第一缕阳光
穿过云层洒向大地
让人感受到生命的美好与希望`,
    
    '城市建筑': `钢筋水泥构筑的现代诗篇
每一座建筑都诉说着时代的故事
在这繁华都市中
我们寻找着属于自己的位置`,
    
    '人物肖像': `每个人都是独一无二的存在
眼神中藏着千万种故事
微笑背后是无数个日夜的坚持
记录下这一刻最真实的你`,
    
    '温馨生活': `生活的美好藏在细节里
一杯热茶，一本好书
午后的阳光透过窗帘
这就是我想要的简单幸福`,
    
    '商务办公': `每一个努力的日子都值得被记录
在忙碌的工作中寻找成长的意义
专业与梦想并行
成就更好的自己`,
    
    '美食料理': `人间烟火气，最抚凡人心
每一道菜都承载着温暖的记忆
用心烹饪的不只是食物
更是对生活的热爱与期待`,
    
    '旅行探索': `世界那么大，我想去看看
每一次出发都是对未知的拥抱
在路上遇见不同的风景
也遇见更好的自己`,
    
    '健康运动': `汗水是最好的化妆品
每一次挥汗如雨都是对自己的投资
健康的身体是一切美好的基础
让我们一起拥抱更强大的自己`,
    
    '科技数码': `科技改变生活，创新引领未来
在数字化的世界里
我们见证着每一次突破与进步
拥抱科技，拥抱无限可能`,
    
    '艺术创意': `艺术来源于生活，高于生活
每一次创作都是心灵的表达
用色彩和线条诉说内心的故事
让创意点亮平凡的日子`,
    
    '宠物动物': `它们是最纯真的陪伴
无条件的爱与忠诚
在它们眼中，我们就是全世界
感谢这些小天使带来的温暖`,
    
    '时尚潮流': `时尚是态度，潮流是表达
每一次搭配都是对美的追求
穿出自己的风格
让自信成为最好的装饰`
  };
  
  textInputs.value[0].text = templates[template] || (template + '：');
};

// 暴露方法给父组件
defineExpose({
  addTemplateText
});

// 初始化
initFromModelValue();
</script>

<template>
  <div class="text-input-container">
    <!-- 文案输入区域 -->
    <div class="mb-4">
      <div class="flex justify-end mb-6">
        <div class="flex gap-3">
          <button 
            @click="addExampleText"
            class="btn-secondary btn-small px-4 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 hover:border-emerald-300 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
          >
            ✨ 添加示例
          </button>
          <button 
            @click="clearAll"
            class="btn-small px-4 py-2 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
          >
            🗑️ 清空全部
          </button>
        </div>
      </div>
      
      <!-- 单个文案输入框 -->
      <div>
        <textarea
          v-model="textInputs[0].text"
          placeholder="输入您的图文内容..."
          rows="4"
          class="w-full p-4 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 resize-none text-base leading-relaxed bg-white hover:border-emerald-300 shadow-sm focus:shadow-md"
        ></textarea>
      </div>
    </div>
    
    <!-- 文本统计 -->
    <div class="flex justify-between items-center text-sm bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-3 border border-emerald-100 shadow-sm mt-3">
      <div class="flex gap-6">
        <span class="text-gray-700 flex items-center">
          <span class="w-2 h-2 bg-emerald-400 rounded-full mr-2"></span>
          总字符数: <span class="font-bold text-emerald-700 ml-1">{{ totalCharCount }}</span>
        </span>
        <span class="text-gray-700 flex items-center">
          <span class="w-2 h-2 bg-teal-400 rounded-full mr-2"></span>
          文案状态: <span class="font-bold text-teal-700 ml-1">{{ validTextCount > 0 ? '已输入' : '未输入' }}</span>
        </span>
      </div>
    </div>
    

  </div>
</template>