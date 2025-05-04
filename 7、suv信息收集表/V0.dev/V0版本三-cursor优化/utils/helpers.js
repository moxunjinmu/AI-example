/**
 * 辅助函数 - 动态加载脚本
 * @param {string} url - 脚本URL
 * @returns {Promise} - 加载脚本的Promise
 */
function loadScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * 辅助函数 - 节流
 * @param {Function} func - 要节流的函数
 * @param {number} delay - 延迟时间 
 * @returns {Function} - 节流后的函数
 */
function throttle(func, delay) {
  let lastCall = 0;
  return function(...args) {
    const now = new Date().getTime();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return func.apply(this, args);
  };
}

/**
 * 辅助函数 - 防抖
 * @param {Function} func - 要防抖的函数 
 * @param {number} delay - 延迟时间
 * @returns {Function} - 防抖后的函数
 */
function debounce(func, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

/**
 * 图片懒加载初始化
 */
function initLazyLoading() {
  const lazyImages = document.querySelectorAll('.lazyload');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazyload');
          imageObserver.unobserve(img);
        }
      });
    });
    
    lazyImages.forEach(img => {
      imageObserver.observe(img);
    });
  } else {
    // 降级处理
    lazyImages.forEach(img => {
      img.src = img.dataset.src;
    });
  }
}

// 导出工具函数，便于其他模块使用
export {
  loadScript,
  throttle,
  debounce,
  initLazyLoading
}; 