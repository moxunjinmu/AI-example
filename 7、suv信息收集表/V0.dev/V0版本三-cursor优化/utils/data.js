/**
 * 数据相关工具函数
 */

/**
 * 加载保存的数据
 * @param {Object} AppState - 应用状态对象
 * @param {Function} showToast - 显示提示的函数
 */
function loadData(AppState, showToast) {
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

/**
 * 保存数据
 * @param {Object} AppState - 应用状态对象
 * @param {Function} showToast - 显示提示的函数
 */
function saveData(AppState, showToast) {
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

/**
 * 导出数据为JSON
 * @param {Object} AppState - 应用状态对象
 * @param {Function} showToast - 显示提示的函数
 */
function exportData(AppState, showToast) {
  const data = {
    cars: AppState.cars,
    settings: AppState.settings,
  };

  const dataStr = JSON.stringify(data, null, 2);
  const dataUri =
    "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

  const exportFileName = `车评家数据_${
    new Date().toISOString().split("T")[0]
  }.json`;

  const linkElement = document.createElement("a");
  linkElement.setAttribute("href", dataUri);
  linkElement.setAttribute("download", exportFileName);
  linkElement.click();

  showToast("数据导出成功");
}

/**
 * 导入数据
 * @param {File} file - 导入的文件
 * @param {Object} AppState - 应用状态对象 
 * @param {Function} saveData - 保存数据的函数
 * @param {Function} initTheme - 初始化主题的函数
 * @param {Function} navigateTo - 导航函数
 * @param {Function} showToast - 显示提示的函数
 */
function importData(file, AppState, saveData, initTheme, navigateTo, showToast) {
  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);

      if (data.cars && Array.isArray(data.cars)) {
        if (confirm("导入将覆盖现有数据，是否继续？")) {
          AppState.cars = data.cars;

          if (data.settings) {
            AppState.settings = {
              ...AppState.settings,
              ...data.settings,
            };
          }

          saveData(AppState, showToast);
          initTheme(AppState.settings);
          navigateTo("home");
          showToast("数据导入成功");
        }
      } else {
        showToast("无效的数据格式");
      }
    } catch (error) {
      console.error("导入数据失败:", error);
      showToast("导入数据失败，请检查文件格式");
    }
  };

  reader.readAsText(file);
}

// 导出函数
export {
  loadData,
  saveData,
  exportData,
  importData
}; 