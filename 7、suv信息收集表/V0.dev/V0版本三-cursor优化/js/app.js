/**
 * 车评家 - 主应用文件
 */

// 导入工具函数
import { loadScript, throttle, debounce, initLazyLoading } from '../utils/helpers.js';
import { 
  showLoader, hideLoader, showToast, 
  adjustUIForDevice, initTheme, toggleTheme 
} from '../utils/ui.js';
import { loadData, saveData, exportData, importData } from '../utils/data.js';
import { renderHomeView, renderRecordView, renderCompareView, renderSettingsView } from './views.js';

// 性能优化 - 添加评分缓存
const scoreCache = new Map();

// 应用状态管理
const AppState = {
  currentView: "home",
  cars: [],
  currentCar: null,
  currentStep: 0,
  compareList: [],  // 确保初始化为空数组
  settings: {
    darkMode: false,
    autoSave: true,
    offlineMode: true,
  },
};

/**
 * 导航到指定视图
 * @param {string} view - 视图名称
 * @param {Object} params - 导航参数
 */
function navigateTo(view, params = {}) {
  // 更新当前视图
  AppState.currentView = view;

  // 高亮当前导航按钮
  $(".nav-btn").removeClass("text-primary-600 dark:text-primary-400");
  $(`.nav-btn[data-view="${view}"]`).addClass(
    "text-primary-600 dark:text-primary-400"
  );

  // 显示加载指示器
  showLoader();

  // 根据视图加载对应内容
  switch (view) {
    case "home":
      renderHomeView(AppState, showToast, navigateTo, (state, toast) => saveData(state, toast));
      break;
    case "record":
      renderRecordView(AppState, params, showToast, navigateTo, (state, toast) => saveData(state, toast));
      break;
    case "compare":
      renderCompareView(AppState, showToast, navigateTo);
      break;
    case "settings":
      renderSettingsView(AppState, (state, toast) => saveData(state, toast), showToast, navigateTo);
      break;
    default:
      renderHomeView(AppState, showToast, navigateTo, (state, toast) => saveData(state, toast));
  }

  // 隐藏加载指示器
  optimizedTimeout(hideLoader, 300);

  // 滚动到页面顶部
  window.scrollTo(0, 0);
}

/**
 * 性能优化 - 使用requestAnimationFrame代替setTimeout
 * @param {Function} callback - 回调函数
 * @param {number} delay - 延迟时间（毫秒）
 */
function optimizedTimeout(callback, delay) {
  if (delay <= 16) {
    // 对于短延迟，直接使用requestAnimationFrame
    return requestAnimationFrame(callback);
  } else {
    // 将长时间任务拆分为较小的任务
    const startTime = performance.now();
    
    function checkTime() {
      if (performance.now() - startTime >= delay) {
        callback();
      } else {
        requestAnimationFrame(checkTime);
      }
    }
    
    requestAnimationFrame(checkTime);
  }
}

// 对外暴露的API
window.AppAPI = {
  AppState,
  showLoader,
  hideLoader,
  showToast,
  saveData: () => saveData(AppState, showToast),
  exportData: () => exportData(AppState, showToast),
  importData: (file) => importData(file, AppState, 
    (state, toast) => saveData(state, toast), 
    initTheme, navigateTo, showToast),
  navigateTo
};

/**
 * 注册Service Worker
 */
function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker
        .register("service-worker.js")
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
        });
      });
    });
    
    // 添加CDN故障时的本地备份检测
    optimizedTimeout(function checkCdnAndFallback() {
      // 检查jQuery可用性
      if (typeof jQuery === 'undefined') {
        console.warn('CDN加载jQuery失败，尝试使用本地备份');
        loadScript('/js/libs/jquery.min.js');
      }
    }, 5000);
  }
}

/**
 * 设置网络状态监听
 */
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

/**
 * 初始化应用
 */
function initApp() {
  console.log("应用初始化中...");
  
  // 加载保存的数据
  loadData(AppState, showToast);

  // 初始化主题
  initTheme(AppState.settings);

  // 注册Service Worker
  registerServiceWorker();

  // 设置网络状态监听
  setupNetworkStatus();

  // 导航按钮点击事件
  $(".nav-btn").on("click", function () {
    const view = $(this).data("view");
    navigateTo(view);
  });

  // 主题切换按钮点击事件
  $("#theme-toggle").on("click", function () {
    toggleTheme(AppState.settings, () => saveData(AppState, showToast));
  });

  // 初始加载首页视图
  navigateTo("home");

  // 检测设备类型并调整UI
  adjustUIForDevice();

  // 监听窗口大小变化，动态调整UI (使用节流)
  $(window).on("resize", throttle(function () {
    adjustUIForDevice();
  }, 200));
}

// 确保DOM完全加载
document.addEventListener('DOMContentLoaded', function() {
  // 确保jQuery加载完成
  if (typeof jQuery === 'undefined') {
    console.error('jQuery未加载，尝试重新加载...');
    var script = document.createElement('script');
    script.src = 'js/libs/jquery.min.js';
    script.onload = initApp;
    document.head.appendChild(script);
    return;
  }
  
  // 初始化应用
  initApp();
}); 