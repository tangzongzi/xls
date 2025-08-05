<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import TextInput from '../TextInput/TextInput.vue';
import ImageSelector from '../ImageSelector/ImageSelector.vue';
import html2canvas from 'html2canvas';
import axios from 'axios';
import { loadApiKeys, setApiKey as saveApiKey } from '../../services/imageApi';

// 状态管理
const selectedImage = ref(null);
const generatedImages = ref([]);
const isLoading = ref(false);
const error = ref(null);
const showApiSettings = ref(false); // 控制API设置面板的显示/隐藏
const showSignatureSettings = ref(false); // 控制签名设置面板的显示/隐藏
const searchKeyword = ref(''); // 图片搜索关键词

// 多段文案处理
const paragraphs = ref([]);
const previewImages = ref([]);
const batchGenerating = ref(false);

// 签名功能数据
const signature = reactive({
  text: '',
  position: 'bottom-right',
  style: 'normal',
  fontSize: 30,  // 默认改为中等大小(30px)
  opacity: 100,
  color: '#ffffff'
});

// 从本地存储加载签名设置
const loadSignatureSettings = () => {
  try {
    const saved = localStorage.getItem('signature-settings');
    if (saved) {
      const settings = JSON.parse(saved);
      Object.assign(signature, settings);
    }
  } catch (error) {
    console.log('加载签名设置失败:', error);
  }
};

// 保存签名设置到本地存储
const saveSignatureSettings = () => {
  try {
    localStorage.setItem('signature-settings', JSON.stringify(signature));
  } catch (error) {
    console.log('保存签名设置失败:', error);
  }
};

// 监听签名设置变化，自动保存
watch(signature, () => {
  saveSignatureSettings();
}, { deep: true });

// 签名位置选项
const signaturePositions = [
  { value: 'bottom-right', label: '右下角' },
  { value: 'bottom-left', label: '左下角' },
  { value: 'bottom-center', label: '底部居中' }
];

// 签名样式选项
const signatureStyles = [
  { value: 'normal', label: '普通' },
  { value: 'bold', label: '加粗' },
  { value: 'italic', label: '斜体' }
];

// 签名字体大小选项
const signatureFontSizes = [
  { value: 26, label: '小' },    // 14px → 26px
  { value: 30, label: '中' },    // 18px → 30px
  { value: 34, label: '大' },    // 22px → 34px
  { value: 38, label: '特大' }  // 26px → 38px
];



// 统一使用情感文案样式
const defaultTextStyle = {
  id: 'emotional',
  name: '情感文案',
  textClass: 'absolute inset-0',
  bgClass: 'bg-black/40',
  textStyle: 'emotional-text-style'
};

// 处理段落变化
const handleParagraphsChange = (newParagraphs) => {
  paragraphs.value = newParagraphs;
  // 如果有图片和段落，自动生成预览
  if (selectedImage.value && paragraphs.value.length > 0) {
    generatePreviewImages();
  } else {
    previewImages.value = [];
  }
};

// 生成预览图片数组
const generatePreviewImages = () => {
  if (!selectedImage.value) return;
  
  previewImages.value = paragraphs.value.map(paragraph => ({
    image: selectedImage.value,
    text: paragraph
  }));
};

// 获取当前文字样式 - 统一使用情感文案样式
const getCurrentTextStyle = () => {
  return defaultTextStyle;
};

// 创建签名元素
const createSignatureElement = () => {
  if (!signature.text) return null;
  
  const signatureElement = document.createElement('div');
  signatureElement.textContent = signature.text;
  signatureElement.style.position = 'absolute';
  signatureElement.style.fontSize = signature.fontSize + 'px';
  signatureElement.style.color = signature.color;
  signatureElement.style.opacity = (signature.opacity / 100).toString();
  signatureElement.style.textShadow = '1px 1px 3px rgba(0, 0, 0, 0.8)';
  signatureElement.style.fontFamily = '"Alibaba PuHuiTi", sans-serif';
  signatureElement.style.zIndex = '25';
  
  // 设置样式
  if (signature.style === 'bold') {
    signatureElement.style.fontWeight = 'bold';
  } else if (signature.style === 'italic') {
    signatureElement.style.fontStyle = 'italic';
  }
  

  
  // 设置位置（将右下角往上移动）
  switch (signature.position) {
    case 'bottom-right':
      signatureElement.style.bottom = '40px'; // 从15px改为40px，往上移动
      signatureElement.style.right = '20px';
      break;
    case 'bottom-left':
      signatureElement.style.bottom = '40px'; // 从15px改为40px，往上移动
      signatureElement.style.left = '20px';
      break;
    case 'bottom-center':
      signatureElement.style.bottom = '40px'; // 从15px改为40px，往上移动
      signatureElement.style.left = '50%';
      signatureElement.style.transform = 'translateX(-50%)';
      break;
  }
  
  return signatureElement;
};

// 图片搜索API配置
const apiConfig = reactive({
  // 这里可以配置不同的无版权图片API
  unsplash: {
    baseUrl: 'https://api.unsplash.com/search/photos',
    apiKey: '', // 需要用户提供
    perPage: 90, // 10页 * 9张/页 = 90张
    maxPages: 10
  },
  pexels: {
    baseUrl: 'https://api.pexels.com/v1/search',
    apiKey: '', // 需要用户提供
    perPage: 90, // 10页 * 9张/页 = 90张
    maxPages: 10
  },
  pixabay: {
    baseUrl: 'https://pixabay.com/api/',
    apiKey: '', // 需要用户提供
    perPage: 90, // 10页 * 9张/页 = 90张
    maxPages: 10
  }
});





// TextInput组件的引用
const textInputRef = ref(null);

// 添加模板文案到第一个输入框
const addTemplateText = (template) => {
  // 调用TextInput组件的方法
  if (textInputRef.value) {
    textInputRef.value.addTemplateText(template);
  }
  
  // 使用 Pexels 热门关键词，直接搜索无需翻译
  const searchKeywords = {
    '自然风光': 'nature',
    '城市建筑': 'architecture', 
    '人物肖像': 'portrait',
    '温馨生活': 'lifestyle',
    '商务办公': 'business',
    '美食料理': 'food',
    '旅行探索': 'travel',
    '健康运动': 'fitness',
    '科技数码': 'technology',
    '艺术创意': 'creative',
    '宠物动物': 'animals',
    '时尚潮流': 'fashion'
  };
  
  const keyword = searchKeywords[template] || template;
  // 更新搜索框内容
  searchKeyword.value = keyword;
  searchImages(keyword);
};

// 当前选择的API - 默认为Pexels
const selectedApi = ref('pexels');

// 中文关键词翻译为英文
const translateKeyword = (keyword) => {
  const keywordMap = {
    // 风景类
    '阳光': 'sunshine bright light',
    '日落': 'sunset evening golden',
    '日出': 'sunrise morning light',
    '海滩': 'beach ocean sea',
    '大海': 'ocean sea blue',
    '山脉': 'mountain landscape nature',
    '森林': 'forest trees nature',
    '花朵': 'flowers bloom colorful',
    '樱花': 'cherry blossom pink',
    '雪景': 'snow winter white',
    '雨天': 'rain drops weather',
    '彩虹': 'rainbow colorful sky',
    '星空': 'stars night sky',
    '月亮': 'moon night peaceful',
    
    // 情感类
    '爱情': 'love romantic couple',
    '情侣': 'couple love romantic',
    '拥抱': 'hug embrace love',
    '微笑': 'smile happy joy',
    '思念': 'missing longing emotion',
    '温馨': 'warm cozy comfortable',
    '浪漫': 'romantic love sweet',
    '幸福': 'happiness joy smile',
    '治愈': 'healing peaceful calm',
    '宁静': 'peaceful quiet serene',
    '梦想': 'dream inspiration hope',
    '希望': 'hope light bright',
    
    // 生活类
    '咖啡': 'coffee cup morning',
    '书本': 'book reading study',
    '音乐': 'music instrument sound',
    '旅行': 'travel journey adventure',
    '城市': 'city urban architecture',
    '街道': 'street urban city',
    '建筑': 'architecture building design',
    '家居': 'home interior cozy',
    '美食': 'food delicious cooking',
    '植物': 'plants green nature',
    '宠物': 'pets cute animals',
    '运动': 'sports exercise fitness',
    
    // 颜色类
    '蓝色': 'blue ocean sky',
    '绿色': 'green nature plants',
    '粉色': 'pink soft feminine',
    '白色': 'white clean minimal',
    '黑色': 'black dark elegant',
    '金色': 'golden warm light',
    '红色': 'red passion vibrant',
    '紫色': 'purple elegant mysterious',
    
    // 季节类
    '春天': 'spring flowers bloom',
    '夏天': 'summer sunny bright',
    '秋天': 'autumn leaves golden',
    '冬天': 'winter snow cold',
    
    // 时间类
    '早晨': 'morning sunrise light',
    '黄昏': 'dusk evening golden',
    '夜晚': 'night dark peaceful',
    '深夜': 'midnight stars quiet'
  };
  
  // 如果是中文关键词，返回对应的英文
  if (keywordMap[keyword]) {
    return keywordMap[keyword];
  }
  
  // 检查是否包含中文字符
  const chineseRegex = /[\u4e00-\u9fa5]/;
  if (chineseRegex.test(keyword)) {
    // 对于未映射的中文关键词，尝试提取关键概念
    const conceptMap = {
      '温暖': 'warm cozy light',
      '安静': 'quiet peaceful calm',
      '美丽': 'beautiful pretty lovely',
      '优雅': 'elegant graceful refined',
      '自然': 'nature natural organic',
      '简约': 'minimal simple clean',
      '复古': 'vintage retro classic',
      '现代': 'modern contemporary sleek'
    };
    
    // 查找包含的概念词
    for (const [chinese, english] of Object.entries(conceptMap)) {
      if (keyword.includes(chinese)) {
        return english;
      }
    }
    
    // 如果都没有匹配，返回一个通用的搜索词
    return 'beautiful nature peaceful';
  }
  
  // 英文关键词直接返回
  return keyword;
};

// 通过搜索框搜索图片
const handleSearchImages = () => {
  if (searchKeyword.value && searchKeyword.value.trim().length >= 2) {
    searchImages(searchKeyword.value.trim());
  }
};

// 搜索框回车事件
const handleSearchKeyDown = (event) => {
  if (event.key === 'Enter') {
    handleSearchImages();
  }
};

// 监听段落变化，自动搜索图片
watch(paragraphs, (newParagraphs) => {
  // 只有在没有手动搜索关键词时，才使用第一个段落作为搜索关键词
  if (newParagraphs.length > 0 && newParagraphs[0].trim().length > 3 && !searchKeyword.value) {
    searchImages(newParagraphs[0]);
  }
  
  // 如果有选中的图片，更新预览
  if (selectedImage.value && paragraphs.value.length > 0) {
    generatePreviewImages();
  }
}, { deep: true });

// 搜索图片
const searchImages = async (query) => {
  if (!query || query.trim().length < 2) return;
  
  // 将中文关键词翻译为英文
  const translatedQuery = translateKeyword(query.trim());
  console.log(`搜索关键词: ${query} -> ${translatedQuery}`);
  
  isLoading.value = true;
  error.value = null;
  
  try {
    let images = [];
    const api = apiConfig[selectedApi.value];
    
    if (!api.apiKey) {
      error.value = `请先设置${selectedApi.value}的API密钥`;
      generatedImages.value = [];
      isLoading.value = false;
      return;
    }
    
    // 根据不同API构建请求
    let response;
    switch(selectedApi.value) {
      case 'unsplash':
        response = await axios.get(api.baseUrl, {
          params: {
            query: translatedQuery,
            per_page: api.perPage,
            client_id: api.apiKey
          }
        });
        images = response.data.results.map(item => ({
          id: item.id,
          url: item.urls.regular,
          thumb: item.urls.thumb,
          alt: item.alt_description || query
          // 水印信息已移除
        }));
        break;
        
      case 'pexels':
        response = await axios.get(api.baseUrl, {
          params: {
            query: translatedQuery,
            per_page: api.perPage
          },
          headers: {
            Authorization: api.apiKey
          }
        });
        images = response.data.photos.map(item => ({
          id: item.id,
          url: item.src.large,
          thumb: item.src.medium,
          alt: query
          // 水印信息已移除
        }));
        break;
        
      case 'pixabay':
        response = await axios.get(api.baseUrl, {
          params: {
            q: translatedQuery,
            per_page: api.perPage,
            key: api.apiKey
          }
        });
        images = response.data.hits.map(item => ({
          id: item.id,
          url: item.largeImageURL,
          thumb: item.previewURL,
          alt: query
          // 水印信息已移除
        }));
        break;
    }
    
    generatedImages.value = images;
  } catch (err) {
    console.error('Error fetching images:', err);
    error.value = '获取图片失败，请检查API配置或网络连接';
    generatedImages.value = [];
  } finally {
    isLoading.value = false;
  }
};

// 选择图片
const handleImageSelect = (image) => {
  selectedImage.value = image;
  
  // 如果有段落，自动生成预览
  if (paragraphs.value.length > 0) {
    generatePreviewImages();
  }
};

// 生成最终图文
const generateFinalImage = async () => {
  // 检查基本条件
  if (!selectedImage.value) {
    error.value = '请先选择图片';
    return;
  }
  
  if (paragraphs.value.length === 0 || !paragraphs.value[0]) {
    error.value = '请先输入文字';
    return;
  }
  
  // 如果有多段文案，进行批量生成
  if (paragraphs.value.length > 1) {
    await batchGenerateAndDownload();
    return;
  }
  
  // 单图文生成
  
  try {
    // 创建高质量3:4比例容器 - 提升到1080p质量
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'fixed';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    tempContainer.style.width = '1080px';  // 提升分辨率
    tempContainer.style.height = '1440px'; // 3:4 比例
    tempContainer.style.aspectRatio = '3/4';
    
    // 创建图片元素
    const imgElement = document.createElement('img');
    imgElement.src = selectedImage.value.url || selectedImage.value.thumb || selectedImage.value;
    imgElement.style.width = '100%';
    imgElement.style.height = '100%';
    imgElement.style.objectFit = 'cover';
    imgElement.crossOrigin = 'anonymous';
    
    // 创建文本元素 - 优化文字布局防止超出
    const textElement = document.createElement('div');
    textElement.textContent = paragraphs.value[0];
    textElement.className = 'emotional-text-style';
    textElement.style.position = 'absolute';
    textElement.style.top = '20%';  // 从顶部20%开始
    textElement.style.left = '40px';
    textElement.style.right = '40px';  // 设置右边距
    textElement.style.bottom = '8%';  // 底部留8%空间
    textElement.style.fontFamily = '"Alibaba PuHuiTi", "PingFang SC", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif';
    textElement.style.fontSize = '36px';      // 减小字体大小
    textElement.style.lineHeight = '1.6';     // 合理的行间距
    textElement.style.fontWeight = '300';     // 适中的字体粗细
    textElement.style.color = 'white';
    textElement.style.textAlign = 'left';
    textElement.style.letterSpacing = '0.5px';
    textElement.style.textShadow = '2px 2px 8px rgba(0, 0, 0, 0.8)';
    textElement.style.whiteSpace = 'pre-line';
    textElement.style.padding = '20px';
    textElement.style.boxSizing = 'border-box';
    textElement.style.overflow = 'hidden';  // 防止文字超出
    textElement.style.display = 'flex';
    textElement.style.alignItems = 'flex-start';  // 从顶部开始对齐
    textElement.style.justifyContent = 'flex-start';
    
    // 添加背景遮罩
    const overlayElement = document.createElement('div');
    overlayElement.style.position = 'absolute';
    overlayElement.style.top = '0';
    overlayElement.style.left = '0';
    overlayElement.style.width = '100%';
    overlayElement.style.height = '100%';
    overlayElement.style.background = 'rgba(0, 0, 0, 0.4)';
    
    tempContainer.appendChild(imgElement);
    tempContainer.appendChild(overlayElement);
    tempContainer.appendChild(textElement);
    
    // 添加签名
    const signatureElement = createSignatureElement();
    if (signatureElement) {
      tempContainer.appendChild(signatureElement);
    }
    
    document.body.appendChild(tempContainer);
    
    // 等待图片加载
    await new Promise(resolve => {
      imgElement.onload = resolve;
      if (imgElement.complete) resolve();
    });
    
    const canvas = await html2canvas(tempContainer, {
      useCORS: true,
      allowTaint: true,
      scale: 1,           // 降低scale，因为容器本身已经是高分辨率
      width: 1080,        // 匹配新的容器宽度
      height: 1440,       // 匹配新的容器高度
      backgroundColor: null,
      logging: false,
      removeContainer: true
    });
    
    // 清理临时元素
    document.body.removeChild(tempContainer);
    
    // 转换为高质量图片并下载
    const image = canvas.toDataURL('image/png', 1.0); // 最高质量
    const link = document.createElement('a');
    link.href = image;
    link.download = `小绿书图文_HD_${new Date().getTime()}.png`;
    link.click();
  } catch (err) {
    console.error('Error generating image:', err);
    error.value = '生成图片失败，请重试';
  }
};

// 批量生成并下载图文
const batchGenerateAndDownload = async () => {
  if (!selectedImage.value || paragraphs.value.length === 0) {
    error.value = '请先选择图片并输入文字';
    return;
  }
  
  batchGenerating.value = true;
  error.value = null;
  
  try {
    // 创建一个zip文件夹
    const timestamp = new Date().getTime();
    let successCount = 0;
    const imagesToGenerate = paragraphs.value.slice(0, 4).map(paragraph => ({
      image: selectedImage.value,
      text: paragraph
    })); // 只处理前4张
    
    // 逐个生成并下载
    for (let i = 0; i < imagesToGenerate.length; i++) {
      const previewData = imagesToGenerate[i];
      
      // 创建高质量临时预览元素
      const tempContainer = document.createElement('div');
      tempContainer.className = 'image-preview-container';
      tempContainer.style.position = 'fixed';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '-9999px';
      tempContainer.style.width = '1080px';  // 提升分辨率
      tempContainer.style.height = '1440px'; // 保持3:4比例
      tempContainer.style.aspectRatio = '3/4';
      
      // 创建图片元素
       const imgElement = document.createElement('img');
       // 根据不同API获取正确的图片URL
       if (previewData.image.urls && previewData.image.urls.regular) {
         // Unsplash格式
         imgElement.src = previewData.image.urls.regular;
       } else if (previewData.image.src) {
         // Pexels格式
         imgElement.src = previewData.image.src;
       } else if (previewData.image.webformatURL) {
         // Pixabay格式
         imgElement.src = previewData.image.webformatURL;
       } else {
         // 兜底方案
         imgElement.src = previewData.image.url || previewData.image.largeImageURL || previewData.image;
       }
       imgElement.style.width = '100%';
       imgElement.style.height = '100%';
       imgElement.style.objectFit = 'cover';
       imgElement.crossOrigin = 'anonymous';
      
      // 创建文本元素
      const textElement = document.createElement('div');
      const currentStyle = getCurrentTextStyle();
      textElement.className = `overlay-text ${currentStyle.id}-overlay`;
      textElement.textContent = previewData.text;
      textElement.style.position = 'absolute';
      
      // 统一使用情感文案样式 - 优化文字布局防止超出
      textElement.style.top = '20%';  // 从顶部20%开始
      textElement.style.left = '40px';
      textElement.style.right = '40px';  // 设置右边距
      textElement.style.bottom = '8%';  // 底部留8%空间
      textElement.style.fontFamily = '"Alibaba PuHuiTi", "PingFang SC", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif';
      textElement.style.fontSize = '36px';      // 减小字体大小
      textElement.style.lineHeight = '1.6';     // 合理的行间距
      textElement.style.fontWeight = '300';     // 适中的字体粗细
      textElement.style.color = 'white';
      textElement.style.textAlign = 'left';
      textElement.style.letterSpacing = '0.5px';
      textElement.style.textShadow = '2px 2px 8px rgba(0, 0, 0, 0.8)';
      textElement.style.whiteSpace = 'pre-line';
      textElement.style.padding = '20px';
      textElement.style.boxSizing = 'border-box';
      textElement.style.overflow = 'hidden';  // 防止文字超出
      textElement.style.display = 'flex';
      textElement.style.alignItems = 'flex-start';  // 从顶部开始对齐
      textElement.style.justifyContent = 'flex-start';
      
      // 添加背景遮罩
      const overlayElement = document.createElement('div');
      overlayElement.style.position = 'absolute';
      overlayElement.style.top = '0';
      overlayElement.style.left = '0';
      overlayElement.style.width = '100%';
      overlayElement.style.height = '100%';
      overlayElement.style.background = 'rgba(0, 0, 0, 0.4)';
      
      // 添加到容器
      tempContainer.appendChild(imgElement);
      tempContainer.appendChild(overlayElement);
      tempContainer.appendChild(textElement);
      
      // 添加签名
      const signatureElement = createSignatureElement();
      if (signatureElement) {
        tempContainer.appendChild(signatureElement);
      }
      
      document.body.appendChild(tempContainer);
      
      // 等待图片加载
      await new Promise(resolve => {
        imgElement.onload = resolve;
        // 如果图片已经加载完成，直接解析
        if (imgElement.complete) resolve();
      });
      
              // 生成canvas
        try {
          const canvas = await html2canvas(tempContainer, {
            useCORS: true,
            allowTaint: true,
            scale: 1,           // 降低scale，因为容器本身已经是高分辨率
            width: 1080,        // 匹配新的容器宽度
            height: 1440,       // 匹配新的容器高度
            backgroundColor: null,
            logging: false,
            removeContainer: true
          });
        
        // 创建高质量下载链接
        const link = document.createElement('a');
        link.download = `小绿书图文_HD_${timestamp}-${i+1}.png`;
        link.href = canvas.toDataURL('image/png', 1.0); // 最高质量
        link.click();
        successCount++;
        
        // 清理临时元素
        document.body.removeChild(tempContainer);
      } catch (err) {
        console.error(`生成第${i+1}张图片失败:`, err);
        // 清理临时元素
        document.body.removeChild(tempContainer);
      }
    }
    
    if (successCount > 0) {
      alert(`成功生成并下载了${successCount}张图文组合！`);
    } else {
      error.value = '生成图片失败，请重试';
    }
  } catch (err) {
    console.error('批量生成图片失败:', err);
    error.value = '批量生成图片失败，请重试';
  } finally {
    batchGenerating.value = false;
  }
};

// 切换API
const changeApi = (api) => {
  selectedApi.value = api;
  if (paragraphs.value.length > 0 && paragraphs.value[0].trim().length > 3) {
    searchImages(paragraphs.value[0]);
  }
};

// 设置API密钥
const setApiKey = (api, key) => {
  apiConfig[api].apiKey = key;
  // 保存API密钥到localStorage
  localStorage.setItem(`${api}_api_key`, key);
  // 同时更新imageApi服务中的API密钥
  saveApiKey(api, key);
  
  // 显示保存成功提示
  const savedMessage = document.createElement('div');
  savedMessage.textContent = 'API密钥已保存';
  savedMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg';
  document.body.appendChild(savedMessage);
  
  // 2秒后移除提示
  setTimeout(() => {
    document.body.removeChild(savedMessage);
  }, 2000);
};

// 组件挂载时加载保存的API密钥
onMounted(() => {
  // 从localStorage加载API密钥
  Object.keys(apiConfig).forEach(api => {
    const savedKey = localStorage.getItem(`${api}_api_key`);
    if (savedKey) {
      apiConfig[api].apiKey = savedKey;
    }
  });
  
  // 同时加载imageApi服务中的API密钥
  loadApiKeys();
  
  // 加载签名设置
  loadSignatureSettings();
  
  // 初始加载一些示例图片
  generatedImages.value = [
    {
      id: 'demo1',
      url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500',
      thumb: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=200',
      alt: '示例图片 - 学习'
    },
    {
      id: 'demo2', 
      url: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=500',
      thumb: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=200',
      alt: '示例图片 - 情感'
    },
    {
      id: 'demo3',
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500', 
      thumb: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200',
      alt: '示例图片 - 自然'
    },
    {
      id: 'demo4',
      url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=500',
      thumb: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=200', 
      alt: '示例图片 - 风景'
    },
    {
      id: 'demo5',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
      thumb: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      alt: '示例图片 - 思考'
    },
    {
      id: 'demo6',
      url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=500',
      thumb: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=200',
      alt: '示例图片 - 海洋'
    },
    {
      id: 'demo7',
      url: 'https://images.unsplash.com/photo-1471879832106-c7ab9e0cee23?w=500',
      thumb: 'https://images.unsplash.com/photo-1471879832106-c7ab9e0cee23?w=200',
      alt: '示例图片 - 夜空'
    },
    {
      id: 'demo8',
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500',
      thumb: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200',
      alt: '示例图片 - 山景'
    },
    {
      id: 'demo9',
      url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500',
      thumb: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200',
      alt: '示例图片 - 森林'
    },
    {
      id: 'demo10',
      url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500',
      thumb: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=200',
      alt: '示例图片 - 湖泊'
    },
    {
      id: 'demo11',
      url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=500',
      thumb: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=200',
      alt: '示例图片 - 海滩'
    },
    {
      id: 'demo12',
      url: 'https://images.unsplash.com/photo-1464822759844-d150baef493e?w=500',
      thumb: 'https://images.unsplash.com/photo-1464822759844-d150baef493e?w=200',
      alt: '示例图片 - 草原'
    }
  ];
});
</script>

<template>
  <div class="overflow-hidden relative w-full min-h-screen">
    
    <!-- API设置弹窗 -->
    <div 
      v-if="showApiSettings" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showApiSettings = false"
    >
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-900">API设置</h3>
          <button 
            @click="showApiSettings = false"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">选择图片源：</label>
            <div class="flex gap-2">
              <button 
                v-for="api in Object.keys(apiConfig)" 
                :key="api"
                @click="changeApi(api)"
                :class="[
                  'px-3 py-2 rounded text-sm font-medium flex-1',
                  selectedApi === api 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                ]"
              >
                {{ api.charAt(0).toUpperCase() + api.slice(1) }}
              </button>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ selectedApi.charAt(0).toUpperCase() + selectedApi.slice(1) }} API密钥：
            </label>
            <input 
              type="text" 
              :placeholder="`请输入${selectedApi}的API密钥`"
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              :value="apiConfig[selectedApi].apiKey"
              @change="e => setApiKey(selectedApi, e.target.value)"
            />
            <p class="mt-1 text-xs text-gray-500">
              输入API密钥后，系统将自动保存并启用该图片源。
            </p>
          </div>
        </div>
        
        <div class="mt-6 flex justify-end">
          <button 
            @click="showApiSettings = false"
            class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            完成
          </button>
        </div>
      </div>
    </div>
    
    <!-- 顶部情感文案模板区域 -->
    <div class="bg-white/80 backdrop-blur-sm border-b border-emerald-100 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-8">
        <!-- 图片搜索框 -->
        <div class="text-center mb-6">
          <div class="max-w-2xl mx-auto">
            <div class="relative">
              <input
                v-model="searchKeyword"
                @keydown="handleSearchKeyDown"
                type="text"
                placeholder="输入中文或英文关键词搜索图片 (如：阳光、咖啡、风景、情侣、sunset、coffee...)"
                class="w-full px-6 py-4 text-lg border border-emerald-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-lg hover:shadow-xl transition-all duration-200 pl-16 bg-white/90 backdrop-blur-sm"
              />
              <div class="absolute left-5 top-1/2 transform -translate-y-1/2">
                <svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <button
                @click="handleSearchImages"
                :disabled="!searchKeyword || searchKeyword.trim().length < 2"
                class="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full hover:from-emerald-600 hover:to-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
              >
                搜索
              </button>
            </div>
            <p class="text-sm text-gray-500 mt-2">🌏 支持中文搜索 | 按回车键快速搜索，或点击下方情感模板快速开始</p>
          </div>
        </div>
        
        <!-- 情感文案模板标签 -->
        <div class="mb-6">
          <h3 class="text-base font-bold text-gray-800 mb-4 text-center">🎨 主题模板快速开始</h3>
          <div class="flex flex-wrap justify-center gap-3">
            <button 
              v-for="template in [
                {name: '自然风光', icon: '🌿'},
                {name: '城市建筑', icon: '🏙️'},
                {name: '人物肖像', icon: '👤'},
                {name: '温馨生活', icon: '🏠'},
                {name: '商务办公', icon: '💼'},
                {name: '美食料理', icon: '🍽️'},
                {name: '旅行探索', icon: '✈️'},
                {name: '健康运动', icon: '💪'},
                {name: '科技数码', icon: '💻'},
                {name: '艺术创意', icon: '🎨'},
                {name: '宠物动物', icon: '🐾'},
                {name: '时尚潮流', icon: '👗'}
              ]"
              :key="template.name"
              @click="addTemplateText(template.name)"
              class="px-5 py-2.5 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 hover:border-emerald-300 rounded-full transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5"
            >
              {{ template.icon }} {{ template.name }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto p-6">
      <!-- 顶部：文案输入区域 -->
      <div class="mb-6">
        <div class="card">
          <div class="card-header">
            <h2 class="text-xl font-bold text-gray-900 flex items-center mb-1">
              <span class="w-4 h-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mr-3 shadow-md"></span>
              文案输入
            </h2>
            <p class="text-sm text-emerald-700 font-medium leading-relaxed">输入您的图文内容</p>
          </div>
          <div class="card-body">
            <TextInput 
              ref="textInputRef"
              @paragraphsChange="handleParagraphsChange"
            />
          </div>
        </div>
      </div>
      
      <!-- 底部：左右布局 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- 左：选择背景图片 -->
        <div class="card relative">
          <!-- API设置按钮 -->
          <div class="absolute top-4 right-4 z-10">
            <button 
              @click="showApiSettings = true" 
              class="p-3 rounded-full bg-white/90 backdrop-blur-sm hover:bg-emerald-50 border border-emerald-100 hover:border-emerald-200 transition-all duration-200 shadow-lg hover:shadow-xl"
              title="API设置"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
          <div class="card-header">
            <h2 class="text-xl font-bold text-gray-900 flex items-center mb-1">
              <span class="w-4 h-4 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full mr-3 shadow-md"></span>
              选择背景图片
            </h2>
            <p class="text-sm text-teal-700 font-medium leading-relaxed">从素材库中选择合适的图片</p>
          </div>
          <div class="card-body">
            <div v-if="error" class="mb-4 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm shadow-sm">
              <div class="flex items-start">
                <svg class="w-5 h-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
                <div>
                  <p class="font-medium">{{ error }}</p>
                  <p class="mt-1 text-xs text-amber-600">请点击右上角设置图标配置API密钥以获取图片。</p>
                </div>
              </div>
            </div>
            <div v-if="isLoading" class="flex justify-center items-center py-16">
              <div class="text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-3 border-emerald-200 border-t-emerald-500 mx-auto mb-4 shadow-lg"></div>
                <p class="text-emerald-600 font-medium">正在搜索图片...</p>
                <p class="text-sm text-gray-500 mt-1">请稍候，为您匹配最合适的图片</p>
              </div>
            </div>
            <ImageSelector 
              v-if="!isLoading"
              :images="generatedImages" 
              :selectedImage="selectedImage"
              :columns="3"
              :itemsPerPage="9"
              :maxPages="10"
              @select="handleImageSelect"
            />
            <!-- 图片数量提示 -->
            <div v-if="generatedImages.length > 0" class="mt-6 text-center">
              <div class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-700 rounded-full text-sm font-medium border border-teal-200 shadow-sm">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z"></path>
                </svg>
                共 {{ generatedImages.length }} 张精选图片
                <span v-if="generatedImages.length >= 9" class="ml-2 px-2 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-bold">
                  {{ Math.ceil(generatedImages.length / 9) }} 页
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 右：预览和生成 -->
        <div class="card flex flex-col relative">
          <!-- 签名设置按钮 -->
          <button 
            @click="showSignatureSettings = !showSignatureSettings"
            class="absolute top-4 right-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center text-emerald-500 hover:text-emerald-600"
            title="签名设置"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
            </svg>
          </button>
          <div class="card-header">
            <h2 class="text-xl font-bold text-gray-900 flex items-center mb-1">
              <span class="w-4 h-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mr-3 shadow-md"></span>
              预览和生成
            </h2>
            <p class="text-sm text-amber-700 font-medium leading-relaxed">实时预览您的图文作品</p>
          </div>
          <div class="card-body flex-1 flex flex-col overflow-hidden py-4">
            <div class="flex-1 flex items-center justify-center overflow-hidden px-4 pt-4 pb-2">
              <div class="w-full max-w-md relative border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-white" style="aspect-ratio: 3/4;">

                <div v-if="!selectedImage || (paragraphs.length === 0 || !paragraphs[0])" class="absolute inset-0 flex items-center justify-center text-gray-500">
                  <div class="text-center p-8">
                    <div class="mb-6">
                      <div class="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                        <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                      </div>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-3">开始创作</h3>
                    <p class="text-base text-gray-600 font-medium">请先选择图片并输入文字</p>
                  </div>
                </div>
                <template v-else>
                  <img 
                    v-if="selectedImage" 
                    :src="selectedImage.url || selectedImage.thumb || selectedImage" 
                    :alt="selectedImage.alt || '预览图片'" 
                    class="w-full h-full object-cover"
                  />
                  <div v-if="paragraphs.length > 0 && paragraphs[0]" :class="[getCurrentTextStyle().textClass, getCurrentTextStyle().bgClass]">
                    <p :class="getCurrentTextStyle().textStyle">{{ paragraphs[0] }}</p>
                  </div>
                  <!-- 签名显示 -->
                  <div v-if="signature.text" 
                       class="absolute"
                       :style="{
                         color: signature.color,
                         fontSize: signature.fontSize + 'px',
                         opacity: signature.opacity / 100,
                         textShadow: '1px 1px 3px rgba(0, 0, 0, 0.8)',
                         zIndex: 25,
                         fontFamily: 'Alibaba PuHuiTi, sans-serif',
                         fontWeight: signature.style === 'bold' ? 'bold' : 'normal',
                         fontStyle: signature.style === 'italic' ? 'italic' : 'normal',
                         bottom: '40px',
                         right: signature.position === 'bottom-right' ? '20px' : 'auto',
                         left: signature.position === 'bottom-left' ? '20px' : (signature.position === 'bottom-center' ? '50%' : 'auto'),
                         transform: signature.position === 'bottom-center' ? 'translateX(-50%)' : 'none'
                       }">
                    {{ signature.text }}
                  </div>
                </template>
              </div>
            </div>
            

            
            <!-- 生成按钮移动到预览图片下方 -->
            <div class="flex justify-center flex-shrink-0" style="margin-bottom: 100px;">
              <button 
                @click="generateFinalImage"
                class="btn-primary px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-xl"
                :disabled="!selectedImage || paragraphs.length === 0"
              >
                <span v-if="batchGenerating" class="flex items-center justify-center">
                  <span class="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                  生成中...
                </span>
                <span v-else class="flex items-center">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  生成并下载图文
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- 签名设置模态框 -->
  <div v-if="showSignatureSettings" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="showSignatureSettings = false">
    <div class="bg-white rounded-xl shadow-2xl p-6 m-4 max-w-md w-full" @click.stop>
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-800 flex items-center">
          <svg class="w-5 h-5 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
          </svg>
          签名设置
        </h3>
        <button @click="showSignatureSettings = false" class="text-gray-400 hover:text-gray-600 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <div class="space-y-4">
        <!-- 签名文字输入 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">签名文字</label>
          <input 
            v-model="signature.text"
            type="text" 
            placeholder="请输入您的签名"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
          />
        </div>
        
        <!-- 签名位置选择 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">签名位置</label>
          <div class="flex gap-2 flex-wrap">
            <button 
              v-for="pos in signaturePositions" 
              :key="pos.value"
              @click="signature.position = pos.value"
              :class="[
                'px-3 py-2 text-sm rounded-lg border transition-colors flex-1',
                signature.position === pos.value 
                  ? 'bg-emerald-500 text-white border-emerald-500' 
                  : 'bg-white text-gray-700 border-gray-300 hover:border-emerald-300'
              ]"
            >
              {{ pos.label }}
            </button>
          </div>
        </div>
        
        <!-- 签名样式选择 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">签名样式</label>
          <div class="flex gap-2 flex-wrap">
            <button 
              v-for="style in signatureStyles" 
              :key="style.value"
              @click="signature.style = style.value"
              :class="[
                'px-3 py-2 text-sm rounded-lg border transition-colors flex-1',
                signature.style === style.value 
                  ? 'bg-emerald-500 text-white border-emerald-500' 
                  : 'bg-white text-gray-700 border-gray-300 hover:border-emerald-300'
              ]"
            >
              {{ style.label }}
            </button>
          </div>
        </div>
        
        <!-- 签名字体大小 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">字体大小</label>
          <div class="flex gap-2 flex-wrap">
            <button 
              v-for="fontSize in signatureFontSizes" 
              :key="fontSize.value"
              @click="signature.fontSize = fontSize.value"
              :class="[
                'px-3 py-2 text-sm rounded-lg border transition-colors flex-1',
                signature.fontSize === fontSize.value 
                  ? 'bg-emerald-500 text-white border-emerald-500' 
                  : 'bg-white text-gray-700 border-gray-300 hover:border-emerald-300'
              ]"
            >
              {{ fontSize.label }}
            </button>
          </div>
        </div>
        
        <!-- 透明度设置 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">透明度: {{ signature.opacity }}%</label>
          <input 
            v-model="signature.opacity"
            type="range" 
            min="10" 
            max="100" 
            step="10"
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>10%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
        

        <!-- 颜色选择 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">签名颜色</label>
          <div class="flex gap-2 flex-wrap">
            <button 
              v-for="color in [{ value: '#ffffff', label: '白色' }, { value: '#000000', label: '黑色' }, { value: '#ef4444', label: '红色' }, { value: '#3b82f6', label: '蓝色' }]" 
              :key="color.value"
              @click="signature.color = color.value"
              :class="[
                'px-3 py-2 text-sm rounded-lg border transition-colors flex-1 flex items-center justify-center',
                signature.color === color.value 
                  ? 'bg-emerald-500 text-white border-emerald-500' 
                  : 'bg-white text-gray-700 border-gray-300 hover:border-emerald-300'
              ]"
            >
              <div 
                class="w-4 h-4 rounded-full mr-2 border border-gray-300" 
                :style="{ backgroundColor: color.value }"
              ></div>
              {{ color.label }}
            </button>
          </div>
        </div>
        
        <!-- 确认按钮 -->
        <div class="pt-4 border-t border-gray-200">
          <button 
            @click="showSignatureSettings = false"
            class="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            确认
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 自定义动画和样式 */
.border-3 {
  border-width: 3px;
}

/* 卡片悬停效果 */
.hover\:shadow-xl:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* 渐变边框效果 */
.gradient-border {
  background: linear-gradient(white, white) padding-box,
              linear-gradient(45deg, #3b82f6, #8b5cf6) border-box;
  border: 2px solid transparent;
}

/* 文字渐变效果 */
.text-gradient {
  background: linear-gradient(45deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 毛玻璃效果 */
.glass-effect {
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.9);
}

/* 平滑滚动 */
.scroll-smooth {
  scroll-behavior: smooth;
}

/* 滑块样式 */
.slider::-webkit-slider-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  background: #10b981;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider::-moz-range-thumb {
  height: 20px;
  width: 20px;
  background: #10b981;
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>