// 注册Service Worker
function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    // 使用相对路径而不是绝对路径
    const swPath = 'service-worker.js';
    
    navigator.serviceWorker
      .register(swPath)
      .then((registration) => {
        console.log("Service Worker 注册成功:", registration);
        
        // 检查更新
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              showToast('应用已更新，请刷新页面获取最新版本');
            }
          });
        });
      })
      .catch((error) => {
        console.error("Service Worker 注册失败:", error);
      });
    
    // 网络状态变化时重新检查资源
    window.addEventListener('online', () => {
      navigator.serviceWorker.ready.then(registration => {
        registration.update();
      }).catch(error => {
        console.error("Service Worker 更新失败:", error);
      });
    });
    
    // 添加CDN故障时的本地备份检测
    setTimeout(function checkCdnAndFallback() {
      // 检查jQuery可用性
      if (typeof jQuery === 'undefined') {
        console.warn('CDN加载jQuery失败，尝试使用本地备份');
        loadScript('js/libs/jquery.min.js');
      }
    }, 5000);
  }
}

// 设置网络状态监听
function setupNetworkStatus() {
  const updateNetworkStatus = () => {
    if (navigator.onLine) {
      $("#network-status svg")
        .removeClass("text-red-500")
        .addClass("text-green-500");
    } else {
      $("#network-status svg")
        .removeClass("text-green-500")
        .addClass("text-red-500");
      showToast("您当前处于离线状态，数据将保存在本地");
    }
  };

  window.addEventListener("online", updateNetworkStatus);
  window.addEventListener("offline", updateNetworkStatus);
  updateNetworkStatus();
}

// 动态加载脚本
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`加载脚本失败: ${src}`));
    document.head.appendChild(script);
  });
}

// 按需加载库
async function loadLibrary(name) {
  const libraries = {
    'charts': 'https://cdn.jsdelivr.net/npm/highcharts@10.3.3/highcharts.min.js',
    'pdf': 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js',
    'html2canvas': 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js'
  };
  
  if (!libraries[name]) {
    console.error(`未知的库: ${name}`);
    return Promise.reject(new Error(`未知的库: ${name}`));
  }
  
  showLoader();
  
  try {
    await loadScript(libraries[name]);
    console.log(`库加载成功: ${name}`);
    return Promise.resolve();
  } catch (error) {
    console.error(`加载库失败: ${name}`, error);
    showToast(`加载资源失败: ${name}`);
    return Promise.reject(error);
  } finally {
    hideLoader();
  }
} 