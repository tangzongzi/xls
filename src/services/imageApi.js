import axios from 'axios';

/**
 * 无版权图片API服务
 * 支持多个免费图片API，包括Unsplash、Pexels和Pixabay
 */

// API配置
const apiConfig = {
  unsplash: {
    baseUrl: 'https://api.unsplash.com/search/photos',
    apiKey: '', // 需要用户提供
    perPage: 27, // 3页 * 9张/页 = 27张
    maxPages: 3,
    headers: (apiKey) => ({
      Authorization: `Client-ID ${apiKey}`
    }),
    transformResponse: (data) => {
      return data.results.map(item => ({
        id: item.id,
        url: item.urls.regular,
        thumb: item.urls.thumb,
        alt: item.alt_description || 'Unsplash image',
        // 水印信息已移除
        width: item.width,
        height: item.height
      }));
    }
  },
  pexels: {
    baseUrl: 'https://api.pexels.com/v1/search',
    apiKey: '', // 需要用户提供
    perPage: 27, // 3页 * 9张/页 = 27张
    maxPages: 3,
    headers: (apiKey) => ({
      Authorization: apiKey
    }),
    transformResponse: (data) => {
      return data.photos.map(item => ({
        id: item.id,
        url: item.src.large,
        thumb: item.src.medium,
        alt: item.alt || 'Pexels image',
        // 水印信息已移除
        width: item.width,
        height: item.height
      }));
    }
  },
  pixabay: {
    baseUrl: 'https://pixabay.com/api/',
    apiKey: '', // 需要用户提供
    perPage: 27, // 3页 * 9张/页 = 27张
    maxPages: 3,
    params: (query, apiKey) => ({
      q: query,
      per_page: 27,
      key: apiKey
    }),
    transformResponse: (data) => {
      return data.hits.map(item => ({
        id: item.id,
        url: item.largeImageURL,
        thumb: item.previewURL,
        alt: item.tags || 'Pixabay image',
        // 水印信息已移除
        width: item.imageWidth,
        height: item.imageHeight
      }));
    }
  },
  // 可以添加更多API
};

/**
 * 设置API密钥
 * @param {string} provider - API提供商名称
 * @param {string} apiKey - API密钥
 */
export const setApiKey = (provider, apiKey) => {
  if (apiConfig[provider]) {
    apiConfig[provider].apiKey = apiKey;
    // 可以选择将API密钥保存到localStorage
    localStorage.setItem(`${provider}_api_key`, apiKey);
    return true;
  }
  return false;
};

/**
 * 从localStorage加载API密钥
 */
export const loadApiKeys = () => {
  Object.keys(apiConfig).forEach(provider => {
    const savedKey = localStorage.getItem(`${provider}_api_key`);
    if (savedKey) {
      apiConfig[provider].apiKey = savedKey;
    }
  });
};

/**
 * 获取API配置对象
 * @returns {Object} API配置对象
 */
export const getApiConfig = () => {
  return apiConfig;
};

/**
 * 搜索图片
 * @param {string} query - 搜索关键词
 * @param {string} provider - API提供商名称
 * @returns {Promise<Array>} - 图片数组
 */
export const searchImages = async (query, provider = 'unsplash') => {
  if (!apiConfig[provider]) {
    throw new Error(`不支持的API提供商: ${provider}`);
  }
  
  const config = apiConfig[provider];
  
  if (!config.apiKey) {
    throw new Error(`请先设置${provider}的API密钥`);
  }
  
  try {
    let response;
    
    // 根据不同API构建请求
    switch(provider) {
      case 'unsplash':
        response = await axios.get(config.baseUrl, {
          params: {
            query,
            per_page: config.perPage
          },
          headers: config.headers(config.apiKey)
        });
        return config.transformResponse(response.data);
        
      case 'pexels':
        response = await axios.get(config.baseUrl, {
          params: {
            query,
            per_page: config.perPage
          },
          headers: config.headers(config.apiKey)
        });
        return config.transformResponse(response.data);
        
      case 'pixabay':
        response = await axios.get(config.baseUrl, {
          params: config.params(query, config.apiKey)
        });
        return config.transformResponse(response.data);
        
      default:
        throw new Error(`未实现的API提供商: ${provider}`);
    }
  } catch (error) {
    console.error(`搜索图片失败 (${provider}):`, error);
    throw new Error(`搜索图片失败: ${error.message}`);
  }
};

/**
 * 获取支持的API提供商列表
 * @returns {Array<string>} - API提供商名称数组
 */
export const getProviders = () => {
  return Object.keys(apiConfig);
};

/**
 * 检查API密钥是否已设置
 * @param {string} provider - API提供商名称
 * @returns {boolean} - 是否已设置API密钥
 */
export const hasApiKey = (provider) => {
  return !!apiConfig[provider]?.apiKey;
};

export default {
  searchImages,
  setApiKey,
  loadApiKeys,
  getProviders,
  hasApiKey
};