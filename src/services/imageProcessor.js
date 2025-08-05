import html2canvas from 'html2canvas';

/**
 * 图片处理服务
 * 提供图片合成、下载等功能
 */

/**
 * 将DOM元素转换为图片
 * @param {HTMLElement|string} element - DOM元素或元素ID
 * @param {Object} options - html2canvas配置选项
 * @returns {Promise<HTMLCanvasElement>} - 返回Canvas元素
 */
export const domToCanvas = async (element, options = {}) => {
  // 如果传入的是字符串ID，获取对应的DOM元素
  const targetElement = typeof element === 'string' 
    ? document.getElementById(element) 
    : element;
  
  if (!targetElement) {
    throw new Error('目标元素不存在');
  }
  
  // 默认配置
  const defaultOptions = {
    useCORS: true, // 允许加载跨域图片
    allowTaint: true, // 允许图片污染画布
    scale: 2, // 提高导出图片质量
    backgroundColor: null, // 透明背景
    logging: false, // 关闭日志
    width: 600, // 固定宽度3:4
    height: 800 // 固定高度3:4
  };
  
  try {
    // 合并配置
    const mergedOptions = { ...defaultOptions, ...options };
    
    // 转换为Canvas
    return await html2canvas(targetElement, mergedOptions);
  } catch (error) {
    console.error('DOM转Canvas失败:', error);
    throw new Error(`生成图片失败: ${error.message}`);
  }
};

/**
 * 将Canvas转换为图片并下载
 * @param {HTMLCanvasElement} canvas - Canvas元素
 * @param {string} fileName - 文件名
 * @param {string} type - 图片类型，如'image/png'、'image/jpeg'
 * @param {number} quality - 图片质量，仅对JPEG有效
 */
export const downloadCanvas = (canvas, fileName = 'image', type = 'image/png', quality = 0.9) => {
  try {
    // 创建下载链接
    const link = document.createElement('a');
    
    // 转换为DataURL
    const dataUrl = type === 'image/jpeg' 
      ? canvas.toDataURL(type, quality) 
      : canvas.toDataURL(type);
    
    // 设置下载属性
    link.href = dataUrl;
    link.download = `${fileName}.${type.split('/')[1]}`;
    
    // 模拟点击下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return dataUrl;
  } catch (error) {
    console.error('下载图片失败:', error);
    throw new Error(`下载图片失败: ${error.message}`);
  }
};

/**
 * 生成并下载图文组合
 * @param {HTMLElement|string} element - DOM元素或元素ID
 * @param {string} fileName - 文件名
 * @param {Object} options - 配置选项
 */
export const generateAndDownloadImage = async (element, fileName = '小绿书图文', options = {}) => {
  try {
    // 生成Canvas
    const canvas = await domToCanvas(element, options);
    
    // 下载图片
    return downloadCanvas(canvas, fileName);
  } catch (error) {
    console.error('生成并下载图片失败:', error);
    throw error;
  }
};

/**
 * 预加载图片
 * @param {string} src - 图片URL
 * @returns {Promise<HTMLImageElement>} - 返回加载完成的图片元素
 */
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // 允许跨域
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error(`图片加载失败: ${src}`));
    img.src = src;
  });
};

/**
 * 调整图片大小
 * @param {HTMLImageElement} img - 图片元素
 * @param {number} maxWidth - 最大宽度
 * @param {number} maxHeight - 最大高度
 * @returns {Object} - 返回调整后的宽高
 */
export const resizeImage = (img, maxWidth, maxHeight) => {
  let width = img.width;
  let height = img.height;
  
  // 计算宽高比
  const ratio = Math.min(maxWidth / width, maxHeight / height);
  
  // 如果图片尺寸已经小于最大尺寸，不需要调整
  if (ratio >= 1) {
    return { width, height };
  }
  
  // 调整尺寸
  width = Math.floor(width * ratio);
  height = Math.floor(height * ratio);
  
  return { width, height };
};

export default {
  domToCanvas,
  downloadCanvas,
  generateAndDownloadImage,
  preloadImage,
  resizeImage
};