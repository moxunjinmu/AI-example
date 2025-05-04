// 应用状态管理
const AppState = {
  cars: [],
  currentView: "home",
  compareList: [],
  settings: {
    darkMode: false,
    autoSave: true,
    offlineMode: true,
  }
};

// DOM就绪检查
document.addEventListener("DOMContentLoaded", function() {
  // 取消等待Service Worker完成，允许页面继续加载
  Promise.resolve().then(() => {
    try {
      // 注册Service Worker作为一个独立的过程
      if (navigator.serviceWorker) {
        registerServiceWorker();
      }
    } catch (error) {
      console.error('Service Worker注册失败，但应用将继续运行:', error);
    }
  });
  
  // 初始化应用
  initApp();
});

// 初始化应用
function initApp() {
  console.log("应用初始化中...");
  
  // 加载保存的数据
  loadData();

  // 初始化主题
  initTheme();

  // 设置网络状态监听
  setupNetworkStatus();

  // 导航按钮点击事件
  $(".nav-btn").on("click", function () {
    const view = $(this).data("view");
    navigateTo(view);
  });

  // 主题切换按钮点击事件
  $("#theme-toggle").on("click", function () {
    toggleTheme();
  });
  
  // 添加车型按钮事件
  $("#add-car-button").on("click", function() {
    navigateTo("add");
  });
  
  // 返回首页按钮事件
  $("#back-to-home, #cancel-add-car").on("click", function() {
    navigateTo("home");
  });
  
  // 跳转到对比页面
  $("#go-to-compare").on("click", function() {
    navigateTo("compare");
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

// 根据设备类型调整UI
function adjustUIForDevice() {
  const isMobile = window.innerWidth < 768;

  if (isMobile) {
    // 移动设备特定调整
    $(".content-area").addClass("pb-32"); // 增加底部内容区域的padding
  } else {
    // 桌面设备特定调整
    $(".content-area").removeClass("pb-32");
  }
}

// 加载保存的数据
function loadData() {
  try {
    // 加载车辆数据
    const savedCars = localStorage.getItem("carEvaluator_cars");
    if (savedCars) {
      AppState.cars = JSON.parse(savedCars);
    }

    // 加载设置
    const savedSettings = localStorage.getItem("carEvaluator_settings");
    if (savedSettings) {
      AppState.settings = {
        ...AppState.settings,
        ...JSON.parse(savedSettings),
      };
    }
  } catch (error) {
    console.error("加载数据失败:", error);
    showToast("加载数据失败，将使用默认设置");
  }
}

// 保存数据
function saveData() {
  try {
    localStorage.setItem(
      "carEvaluator_cars",
      JSON.stringify(AppState.cars)
    );
    localStorage.setItem(
      "carEvaluator_settings",
      JSON.stringify(AppState.settings)
    );
  } catch (error) {
    console.error("保存数据失败:", error);
    showToast("保存数据失败，请检查浏览器存储空间");
  }
}

// 初始化主题
function initTheme() {
  if (AppState.settings.darkMode) {
    document.documentElement.classList.add("dark");
    $("#light-icon").removeClass("hidden");
    $("#dark-icon").addClass("hidden");
    $("#theme-color").attr("content", "#1f2937");
  } else {
    document.documentElement.classList.remove("dark");
    $("#light-icon").addClass("hidden");
    $("#dark-icon").removeClass("hidden");
    $("#theme-color").attr("content", "#ffffff");
  }
}

// 切换主题
function toggleTheme() {
  AppState.settings.darkMode = !AppState.settings.darkMode;
  initTheme();
  saveData();
}

// 显示加载指示器
function showLoader() {
  $("#loader").removeClass("hidden");
}

// 隐藏加载指示器
function hideLoader() {
  $("#loader").addClass("hidden");
}

// 显示提示消息
function showToast(message, duration = 3000) {
  $("#toast").text(message).removeClass("hidden");
  setTimeout(() => {
    $("#toast").addClass("hidden");
  }, duration);
}

// 节流函数 - 限制函数调用频率
function throttle(func, delay) {
  let lastCall = 0;
  return function (...args) {
    const now = new Date().getTime();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return func(...args);
  };
}

// 防抖函数 - 延迟函数执行直到停止调用一段时间后
function debounce(func, delay) {
  let debounceTimer;
  return function (...args) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => func(...args), delay);
  };
}

// 导航到指定视图
function navigateTo(viewName) {
  // 更新当前视图
  AppState.currentView = viewName;
  
  // 隐藏骨架屏
  $("#skeleton-screen").addClass("hidden");
  
  // 隐藏所有视图
  $(".view").addClass("hidden");
  
  // 显示目标视图
  $(`#${viewName}-view`).removeClass("hidden").addClass("fade-in");
  
  // 更新导航按钮状态
  $(".nav-btn").removeClass("bg-blue-100 dark:bg-blue-900");
  $(`.nav-btn[data-view="${viewName}"]`).addClass("bg-blue-100 dark:bg-blue-900");
  
  // 根据视图执行特定操作
  switch (viewName) {
    case "home":
      renderCarList();
      break;
    case "add":
      // 重置表单
      resetAddCarForm();
      break;
    case "compare":
      renderCompareView();
      break;
    case "settings":
      renderSettingsView();
      break;
  }
} 