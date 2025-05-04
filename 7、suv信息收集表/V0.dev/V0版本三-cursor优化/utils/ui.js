/**
 * UI相关工具函数
 */

/**
 * 显示加载指示器
 */
function showLoader() {
  $("#loader").removeClass("hidden");
}

/**
 * 隐藏加载指示器
 */
function hideLoader() {
  $("#loader").addClass("hidden");
}

/**
 * 显示提示消息
 * @param {string} message - 要显示的消息
 * @param {number} duration - 显示时长(毫秒)
 */
function showToast(message, duration = 3000) {
  $("#toast").text(message).removeClass("hidden");
  setTimeout(() => {
    $("#toast").addClass("hidden");
  }, duration);
}

/**
 * 根据设备类型调整UI
 */
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

/**
 * 初始化主题
 * @param {Object} settings - 应用设置
 */
function initTheme(settings) {
  if (settings.darkMode) {
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

/**
 * 切换主题
 * @param {Object} settings - 应用设置
 * @param {Function} saveData - 保存数据的回调函数
 */
function toggleTheme(settings, saveData) {
  settings.darkMode = !settings.darkMode;
  initTheme(settings);
  saveData();
}

// 导出函数
export {
  showLoader,
  hideLoader,
  showToast,
  adjustUIForDevice,
  initTheme,
  toggleTheme
}; 