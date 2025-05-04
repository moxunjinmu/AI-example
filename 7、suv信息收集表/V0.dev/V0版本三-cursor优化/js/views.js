/**
 * 视图渲染相关函数
 */

// 导入工具函数，根据需要添加
import { calculateTotalScore, getAllPros, getAllCons } from './calculations.js';
import { loadChartLibraries, renderRadarChart, createFallbackRadarChart, loadPdfLibraries } from './charts.js';

/**
 * 渲染首页视图
 * @param {Object} AppState - 应用状态
 * @param {Function} showToast - 显示提示消息函数
 * @param {Function} navigateTo - 导航函数
 * @param {Function} saveData - 保存数据函数
 */
function renderHomeView(AppState, showToast, navigateTo, saveData) {
  // 使用DocumentFragment减少重排
  const fragment = document.createDocumentFragment();
  const container = document.createElement('div');
  container.className = 'space-y-6';
  
  let html = `
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold">我的车辆评测</h2>
      <button
        id="add-car-btn"
        class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        添加车型
      </button>
    </div>
    
    <div class="car-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  `;

  // 没有车辆时显示空状态
  if (!AppState.cars.length) {
    html += `
      <div class="col-span-full text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        <p class="mt-4 text-gray-600 dark:text-gray-400">暂无车辆评测记录</p>
        <button id="empty-add-car-btn" class="mt-4 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg">
          开始添加车型
        </button>
      </div>
    `;
  } else {
    // 显示车辆列表
    AppState.cars.forEach((car, index) => {
      const totalScore = calculateTotalScore(car);
      const scorePercentage = Math.round((totalScore / 10) * 100);

      html += `
        <div class="car-card bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div class="h-40 bg-gray-200 dark:bg-gray-700 relative">
            ${
              car.images && car.images.length > 0
                ? `<img src="${car.images[0]}" alt="${car.brand} ${car.model}" class="w-full h-full object-cover">`
                : `<div class="flex items-center justify-center h-full">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>`
            }
            <div class="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-full p-2 shadow">
              <div class="text-center">
                <span class="text-lg font-bold text-primary-600 dark:text-primary-400">${totalScore.toFixed(
                  1
                )}</span>
                <span class="text-xs block">评分</span>
              </div>
            </div>
          </div>
          <div class="p-4">
            <h3 class="text-lg font-bold">${car.brand} ${car.model}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">${
              car.version || "未指定版本"
            }</p>
            <div class="mt-2 flex justify-between items-center">
              <span class="text-sm text-gray-600 dark:text-gray-400">
                ¥${
                  car.price ? car.price.toLocaleString("zh-CN") : "暂无价格"
                }
              </span>
              <span class="text-xs text-gray-500 dark:text-gray-400">
                ${
                  car.testDate
                    ? new Date(car.testDate).toLocaleDateString("zh-CN")
                    : "未记录日期"
                }
              </span>
            </div>
            <div class="mt-3 flex justify-between">
              <button class="car-detail-btn text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 px-3 py-1 rounded" data-index="${index}">
                查看详情
              </button>
              <div class="flex space-x-2">
                <button class="compare-car-btn text-sm bg-primary-100 hover:bg-primary-200 dark:bg-primary-900 dark:hover:bg-primary-800 text-primary-700 dark:text-primary-300 px-3 py-1 rounded" data-index="${index}">
                  ${AppState.compareList && AppState.compareList.some(c => c.id === car.id) ? '已对比' : '对比'}
                </button>
                <button class="edit-car-btn text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 px-3 py-1 rounded" data-index="${index}">
                  编辑
                </button>
                <button class="delete-car-btn text-sm bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-300 px-3 py-1 rounded" data-index="${index}">
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    });
  }

  html += `
      </div>
    </div>
  `;

  container.innerHTML = html;
  fragment.appendChild(container);
  
  // 清空视图容器并添加新内容
  $("#view-container").empty().append(fragment);

  // 添加事件监听
  $("#add-car-btn, #empty-add-car-btn").on("click", function () {
    AppState.currentCar = {
      id: Date.now().toString(),
      brand: "",
      model: "",
      version: "",
      price: null,
      discountPrice: null,
      testDate: new Date().toISOString().split("T")[0],
      testLocation: "",
      salesConsultant: "",
      images: [],
      notes: "",
      ratings: {
        exterior: { score: 5, pros: [], cons: [] },
        interior: { score: 5, pros: [], cons: [] },
        space: { score: 5, pros: [], cons: [] },
        power: { score: 5, pros: [], cons: [] },
        handling: { score: 5, pros: [], cons: [] },
        nvh: { score: 5, pros: [], cons: [] },
        intelligence: { score: 5, pros: [], cons: [] },
        fuelConsumption: { score: 5, pros: [], cons: [] },
      },
      overallComment: "",
    };
    AppState.currentStep = 0;
    navigateTo("record", { isNew: true });
  });

  // 编辑车辆按钮点击事件
  $(".edit-car-btn").on("click", function () {
    const index = $(this).data("index");
    AppState.currentCar = { ...AppState.cars[index] };
    AppState.currentStep = 0;
    navigateTo("record", { isNew: false });
  });
  
  // 查看详情按钮点击事件
  $(".car-detail-btn").on("click", function () {
    const index = $(this).data("index");
    showCarDetail(AppState.cars[index]);
  });

  // 删除车辆按钮点击事件
  $(".delete-car-btn").on("click", function () {
    const index = $(this).data("index");
    if (confirm("确定要删除这条评测记录吗？")) {
      // 如果车辆在对比列表中，同时从对比列表中移除
      const carId = AppState.cars[index].id;
      if (AppState.compareList) {
        const compareIndex = AppState.compareList.findIndex(c => c.id === carId);
        if (compareIndex !== -1) {
          AppState.compareList.splice(compareIndex, 1);
        }
      }
      
      AppState.cars.splice(index, 1);
      saveData(AppState, showToast);
      renderHomeView(AppState, showToast, navigateTo, saveData);
      showToast("删除成功");
    }
  });
  
  // 添加到对比按钮点击事件
  $(".compare-car-btn").on("click", function () {
    const index = $(this).data("index");
    const car = AppState.cars[index];
    
    // 确保对比列表已初始化
    if (!AppState.compareList) {
      AppState.compareList = [];
    }
    
    // 检查是否已在对比列表中
    const existingIndex = AppState.compareList.findIndex(c => c.id === car.id);
    
    if (existingIndex !== -1) {
      // 如果已在列表中，则移除
      AppState.compareList.splice(existingIndex, 1);
      showToast("已从对比列表中移除");
    } else {
      // 添加到对比列表
      AppState.compareList.push(car);
      showToast("已添加到对比列表");
    }
    
    // 重新渲染视图以更新UI
    renderHomeView(AppState, showToast, navigateTo, saveData);
  });
}

/**
 * 渲染记录视图
 * @param {Object} AppState - 应用状态
 * @param {Object} params - 参数
 * @param {Function} showToast - 显示提示消息函数
 * @param {Function} navigateTo - 导航函数
 * @param {Function} saveData - 保存数据函数
 */
function renderRecordView(AppState, params = {}, showToast, navigateTo, saveData) {
  // 如果是新增车辆
  if (!AppState.currentCar) {
    AppState.currentCar = {
      id: Date.now().toString(),
      brand: "",
      model: "",
      version: "",
      price: null,
      discountPrice: null,
      testDate: new Date().toISOString().split("T")[0],
      testLocation: "",
      salesConsultant: "",
      images: [],
      notes: "",
      ratings: {
        exterior: { score: 5, pros: [], cons: [], notes: "" },
        interior: { score: 5, pros: [], cons: [], notes: "" },
        space: { score: 5, pros: [], cons: [], notes: "" },
        power: { score: 5, pros: [], cons: [], notes: "" },
        handling: { score: 5, pros: [], cons: [], notes: "" },
        nvh: { score: 5, pros: [], cons: [], notes: "" },
        intelligence: { score: 5, pros: [], cons: [], notes: "" },
        fuelConsumption: { score: 5, pros: [], cons: [], notes: "" },
      },
      overallComment: "",
    };
  }

  const car = AppState.currentCar;
  const isNew = !params.edit;
  
  // 步骤标题和描述
  const steps = [
    { title: "基本信息", desc: "填写车辆的基本信息" },
    { title: "外观评测", desc: "评价车辆的外观设计和做工" },
    { title: "内饰评测", desc: "评价车辆的内饰设计和材质" },
    { title: "空间表现", desc: "评价车辆的乘坐空间和储物空间" },
    { title: "动力系统", desc: "评价车辆的动力性能和平顺性" },
    { title: "操控性能", desc: "评价车辆的转向和悬挂表现" },
    { title: "NVH表现", desc: "评价车辆的噪音、震动和声音表现" },
    { title: "智能系统", desc: "评价车辆的智能化配置和功能" },
    { title: "油耗表现", desc: "记录车辆的实际油耗或能耗" },
    { title: "总结评价", desc: "对车辆进行综合评价" },
  ];
  
  // 当前步骤
  const step = AppState.currentStep || 0;
  
  // 准备HTML
  let html = `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold">${isNew ? "添加新车型" : "编辑车型"}</h2>
        <div class="text-sm text-gray-500">步骤 ${step + 1}/${steps.length}</div>
      </div>
      
      <!-- 步骤进度条 -->
      <div class="relative pt-1">
        <div class="overflow-hidden h-2 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
          <div style="width:${(step / (steps.length - 1)) * 100}%" class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500"></div>
        </div>
      </div>
      
      <!-- 步骤标题 -->
      <div class="text-center mb-6">
        <h3 class="text-xl font-semibold">${steps[step].title}</h3>
        <p class="text-gray-600 dark:text-gray-400">${steps[step].desc}</p>
      </div>
      
      <!-- 步骤内容 -->
      <div class="step-content bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
  `;

  // 根据当前步骤渲染不同的表单内容
  switch (step) {
    case 0: // 基本信息
      html += `
        <div class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" for="brand">
                品牌 <span class="text-red-500">*</span>
              </label>
              <input type="text" id="brand" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white" value="${car.brand || ""}" required>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" for="model">
                车型 <span class="text-red-500">*</span>
              </label>
              <input type="text" id="model" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white" value="${car.model || ""}" required>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" for="version">
              配置版本
            </label>
            <input type="text" id="version" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white" value="${car.version || ""}">
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" for="price">
                指导价（万元）
              </label>
              <input type="number" id="price" step="0.01" min="0" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white" value="${car.price || ""}">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" for="discountPrice">
                优惠后价格（万元）
              </label>
              <input type="number" id="discountPrice" step="0.01" min="0" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white" value="${car.discountPrice || ""}">
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" for="testDate">
                试驾日期
              </label>
              <input type="date" id="testDate" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white" value="${car.testDate || ""}">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" for="testLocation">
                试驾地点
              </label>
              <input type="text" id="testLocation" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white" value="${car.testLocation || ""}">
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" for="salesConsultant">
              销售顾问
            </label>
            <input type="text" id="salesConsultant" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white" value="${car.salesConsultant || ""}">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              车辆照片
            </label>
            <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
              <div class="space-y-1 text-center">
                <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <div class="flex text-sm text-gray-600 dark:text-gray-400">
                  <label for="file-upload" class="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 focus-within:outline-none">
                    <span>上传照片</span>
                    <input id="file-upload" name="file-upload" type="file" accept="image/*" class="sr-only" multiple>
                  </label>
                  <p class="pl-1">或拖放图片到此处</p>
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  PNG, JPG, GIF 最大 10MB
                </p>
              </div>
            </div>
            <div id="image-preview" class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              ${car.images && car.images.length > 0
                ? car.images
                    .map(
                      (img, idx) => `
                  <div class="relative">
                    <img src="${img}" alt="车辆照片" class="h-24 w-full object-cover rounded-md">
                    <button type="button" class="remove-image absolute top-1 right-1 bg-red-500 text-white rounded-full p-1" data-index="${idx}">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                `
                    )
                    .join("")
                : ""}
            </div>
          </div>
        </div>
      `;
      break;

    case 1: // 外观评测
      html += renderRatingSection("exterior", "外观评测", car);
      break;

    case 2: // 内饰评测
      html += renderRatingSection("interior", "内饰评测", car);
      break;

    case 3: // 空间表现
      html += renderRatingSection("space", "空间表现", car);
      break;

    case 4: // 动力系统
      html += renderRatingSection("power", "动力系统", car);
      break;

    case 5: // 操控性能
      html += renderRatingSection("handling", "操控性能", car);
      break;

    case 6: // NVH表现
      html += renderRatingSection("nvh", "NVH表现", car);
      break;

    case 7: // 智能系统
      html += renderRatingSection("intelligence", "智能系统", car);
      break;

    case 8: // 油耗表现
      html += renderRatingSection("fuelConsumption", "油耗表现", car);
      break;

    case 9: // 总结评价
      html += `
        <div class="space-y-6">
          <div>
            <h4 class="text-lg font-medium mb-2">综合评分</h4>
            <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
              <div class="text-center">
                <span class="text-4xl font-bold text-primary-600 dark:text-primary-400">${calculateTotalScore(car).toFixed(1)}</span>
                <span class="text-lg">/10</span>
              </div>
              <div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="text-center">
                  <div class="text-sm text-gray-600 dark:text-gray-400">外观</div>
                  <div class="font-semibold">${car.ratings.exterior.score.toFixed(1)}</div>
                </div>
                <div class="text-center">
                  <div class="text-sm text-gray-600 dark:text-gray-400">内饰</div>
                  <div class="font-semibold">${car.ratings.interior.score.toFixed(1)}</div>
                </div>
                <div class="text-center">
                  <div class="text-sm text-gray-600 dark:text-gray-400">空间</div>
                  <div class="font-semibold">${car.ratings.space.score.toFixed(1)}</div>
                </div>
                <div class="text-center">
                  <div class="text-sm text-gray-600 dark:text-gray-400">动力</div>
                  <div class="font-semibold">${car.ratings.power.score.toFixed(1)}</div>
                </div>
                <div class="text-center">
                  <div class="text-sm text-gray-600 dark:text-gray-400">操控</div>
                  <div class="font-semibold">${car.ratings.handling.score.toFixed(1)}</div>
                </div>
                <div class="text-center">
                  <div class="text-sm text-gray-600 dark:text-gray-400">NVH</div>
                  <div class="font-semibold">${car.ratings.nvh.score.toFixed(1)}</div>
                </div>
                <div class="text-center">
                  <div class="text-sm text-gray-600 dark:text-gray-400">智能</div>
                  <div class="font-semibold">${car.ratings.intelligence.score.toFixed(1)}</div>
                </div>
                <div class="text-center">
                  <div class="text-sm text-gray-600 dark:text-gray-400">油耗</div>
                  <div class="font-semibold">${car.ratings.fuelConsumption.score.toFixed(1)}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" for="overallComment">
              综合评价
            </label>
            <textarea id="overallComment" rows="6" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white" placeholder="请输入对该车型的综合评价...">${car.overallComment || ""}</textarea>
          </div>
        </div>
      `;
      break;
  }

  html += `
      </div>
      
      <!-- 导航按钮 -->
      <div class="flex justify-between mt-6 nav-buttons">
        <button id="prev-step-btn" class="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 px-4 py-2 rounded-lg flex items-center ${step === 0 ? "invisible" : ""}">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          上一步
        </button>
        <div class="flex space-x-2">
          <button id="save-edit-btn" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            保存编辑
          </button>
          <button id="next-step-btn" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center">
            ${step === steps.length - 1 ? "完成" : "下一步"}
            ${step === steps.length - 1
              ? `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>`
              : `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>`}
          </button>
        </div>
      </div>
    </div>
  `;

  // 渲染视图
  $("#view-container").html(html);

  // 上一步按钮点击事件
  $("#prev-step-btn").on("click", function () {
    if (step > 0) {
      saveCurrentStepData(AppState, showToast);
      AppState.currentStep = step - 1;
      navigateTo("record", { edit: !isNew });
    }
  });

  // 保存编辑按钮点击事件
  $("#save-edit-btn").on("click", function () {
    if (saveCurrentStepData(AppState, showToast)) {
      // 保存车辆数据
      const carIndex = AppState.cars.findIndex((c) => c.id === car.id);
      if (carIndex !== -1) {
        AppState.cars[carIndex] = { ...car };
      } else {
        AppState.cars.push({ ...car });
      }
      saveData(AppState, showToast);
      showToast("当前编辑已保存");
    }
  });

  // 下一步按钮点击事件
  $("#next-step-btn").on("click", function () {
    if (saveCurrentStepData(AppState, showToast)) {
      if (step < steps.length - 1) {
        AppState.currentStep = step + 1;
        navigateTo("record", { edit: !isNew });
      } else {
        // 保存车辆数据
        const carIndex = AppState.cars.findIndex((c) => c.id === car.id);
        if (carIndex !== -1) {
          AppState.cars[carIndex] = { ...car };
        } else {
          AppState.cars.push({ ...car });
        }
        saveData(AppState, showToast);
        AppState.currentStep = 0;
        AppState.currentCar = null;
        navigateTo("home");
        showToast("车辆评测数据已保存");
      }
    }
  });

  // 文件上传处理
  $("#file-upload").on("change", function (e) {
    const files = e.target.files;
    if (files.length > 0) {
      handleImageUpload(files, AppState);
    }
  });

  // 拖放文件处理
  const dropZone = document.querySelector(".border-dashed");
  if (dropZone) {
    dropZone.addEventListener("dragover", function (e) {
      e.preventDefault();
      e.stopPropagation();
      this.classList.add("border-primary-500");
    });

    dropZone.addEventListener("dragleave", function (e) {
      e.preventDefault();
      e.stopPropagation();
      this.classList.remove("border-primary-500");
    });

    dropZone.addEventListener("drop", function (e) {
      e.preventDefault();
      e.stopPropagation();
      this.classList.remove("border-primary-500");

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleImageUpload(files, AppState);
      }
    });
  }

  // 删除图片按钮点击事件
  $("#image-preview").on("click", ".remove-image", function () {
    const index = $(this).data("index");
    AppState.currentCar.images.splice(index, 1);
    renderImagePreview(AppState);
  });

  // 添加优点按钮点击事件
  $(".add-pro-btn").on("click", function () {
    const category = $(this).data("category");
    const proText = $(`#${category}-pro-input`).val().trim();

    if (proText) {
      AppState.currentCar.ratings[category].pros.push(proText);
      $(`#${category}-pro-input`).val("");
      renderProsCons(category, AppState);
    }
  });

  // 添加缺点按钮点击事件
  $(".add-con-btn").on("click", function () {
    const category = $(this).data("category");
    const conText = $(`#${category}-con-input`).val().trim();

    if (conText) {
      AppState.currentCar.ratings[category].cons.push(conText);
      $(`#${category}-con-input`).val("");
      renderProsCons(category, AppState);
    }
  });

  // 删除优点按钮点击事件
  $(".pros-list").on("click", ".remove-item", function () {
    const category = $(this).closest(".pros-list").data("category");
    const index = $(this).data("index");
    AppState.currentCar.ratings[category].pros.splice(index, 1);
    renderProsCons(category, AppState);
  });

  // 删除缺点按钮点击事件
  $(".cons-list").on("click", ".remove-item", function () {
    const category = $(this).closest(".cons-list").data("category");
    const index = $(this).data("index");
    AppState.currentCar.ratings[category].cons.splice(index, 1);
    renderProsCons(category, AppState);
  });

  // 评分滑块变化事件
  $(".rating-slider").on("input", function () {
    const category = $(this).data("category");
    const value = parseFloat($(this).val());
    $(`#${category}-score`).text(value.toFixed(1));
  });
}

/**
 * 渲染对比视图
 * @param {Object} AppState - 应用状态
 * @param {Function} showToast - 显示提示消息函数
 * @param {Function} navigateTo - 导航函数
 */
function renderCompareView(AppState, showToast, navigateTo) {
  // 对比视图的渲染逻辑
  const fragment = document.createDocumentFragment();
  const container = document.createElement('div');
  container.className = 'space-y-6';
  
  let html = `
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold">车型对比</h2>
      ${AppState.compareList && AppState.compareList.length > 0 ? `
        <button id="clear-compare-btn" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          清空对比
        </button>
      ` : ''}
    </div>
  `;
  
  if (!AppState.compareList || AppState.compareList.length < 2) {
    html += `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <h3 class="text-xl font-semibold mb-2">暂无足够数据进行对比</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          请至少添加两辆车到对比列表
        </p>
        <button
          id="go-home-btn"
          class="bg-primary-600 dark:bg-primary-700 hover:bg-primary-700 dark:hover:bg-primary-800 text-white rounded-lg px-4 py-2"
        >
          返回首页添加
        </button>
      </div>
    `;
  } else {
    // 对比表格
    html += `
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <thead>
            <tr class="bg-gray-100 dark:bg-gray-700">
              <th class="py-3 px-4 text-left">对比项目</th>
              ${AppState.compareList
                .map(
                  (car) => `
                <th class="py-3 px-4 text-left">
                  <div class="flex items-center justify-between">
                    <span>${car.brand} ${car.model}</span>
                    <button class="remove-from-compare text-red-500 hover:text-red-700" data-id="${car.id}">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </th>
              `
                )
                .join("")}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="py-3 px-4 font-semibold bg-gray-50 dark:bg-gray-900">综合评分</td>
              ${AppState.compareList
                .map(
                  (car) => `
                <td class="py-3 px-4">
                  <span class="text-xl font-bold text-primary-600 dark:text-primary-400">${calculateTotalScore(
                    car
                  ).toFixed(1)}</span>
                </td>
              `
                )
                .join("")}
            </tr>
            <tr>
              <td class="py-3 px-4 font-semibold bg-gray-50 dark:bg-gray-900">价格</td>
              ${AppState.compareList
                .map(
                  (car) => `
                <td class="py-3 px-4">
                  ${
                    car.price
                      ? `¥${car.price.toLocaleString("zh-CN")}万`
                      : "暂无"
                  }
                  ${
                    car.discountPrice
                      ? `<br><span class="text-red-500">优惠价: ¥${car.discountPrice.toLocaleString(
                          "zh-CN"
                        )}万</span>`
                      : ""
                  }
                </td>
              `
                )
                .join("")}
            </tr>
            <tr>
              <td class="py-3 px-4 font-semibold bg-gray-50 dark:bg-gray-900">外观评分</td>
              ${AppState.compareList
                .map(
                  (car) => `
                <td class="py-3 px-4">${car.ratings?.exterior?.score.toFixed(
                  1
                ) || "暂无"}</td>
              `
                )
                .join("")}
            </tr>
            <tr>
              <td class="py-3 px-4 font-semibold bg-gray-50 dark:bg-gray-900">内饰评分</td>
              ${AppState.compareList
                .map(
                  (car) => `
                <td class="py-3 px-4">${car.ratings?.interior?.score.toFixed(
                  1
                ) || "暂无"}</td>
              `
                )
                .join("")}
            </tr>
            <tr>
              <td class="py-3 px-4 font-semibold bg-gray-50 dark:bg-gray-900">空间评分</td>
              ${AppState.compareList
                .map(
                  (car) => `
                <td class="py-3 px-4">${car.ratings?.space?.score.toFixed(
                  1
                ) || "暂无"}</td>
              `
                )
                .join("")}
            </tr>
            <tr>
              <td class="py-3 px-4 font-semibold bg-gray-50 dark:bg-gray-900">动力评分</td>
              ${AppState.compareList
                .map(
                  (car) => `
                <td class="py-3 px-4">${car.ratings?.power?.score.toFixed(
                  1
                ) || "暂无"}</td>
              `
                )
                .join("")}
            </tr>
            <tr>
              <td class="py-3 px-4 font-semibold bg-gray-50 dark:bg-gray-900">操控评分</td>
              ${AppState.compareList
                .map(
                  (car) => `
                <td class="py-3 px-4">${car.ratings?.handling?.score.toFixed(
                  1
                ) || "暂无"}</td>
              `
                )
                .join("")}
            </tr>
            <tr>
              <td class="py-3 px-4 font-semibold bg-gray-50 dark:bg-gray-900">NVH评分</td>
              ${AppState.compareList
                .map(
                  (car) => `
                <td class="py-3 px-4">${car.ratings?.nvh?.score.toFixed(
                  1
                ) || "暂无"}</td>
              `
                )
                .join("")}
            </tr>
            <tr>
              <td class="py-3 px-4 font-semibold bg-gray-50 dark:bg-gray-900">智能系统评分</td>
              ${AppState.compareList
                .map(
                  (car) => `
                <td class="py-3 px-4">${car.ratings?.intelligence?.score.toFixed(
                  1
                ) || "暂无"}</td>
              `
                )
                .join("")}
            </tr>
            <tr>
              <td class="py-3 px-4 font-semibold bg-gray-50 dark:bg-gray-900">油耗评分</td>
              ${AppState.compareList
                .map(
                  (car) => `
                <td class="py-3 px-4">${car.ratings?.fuelConsumption?.score.toFixed(
                  1
                ) || "暂无"}</td>
              `
                )
                .join("")}
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 雷达图对比 -->
      <div class="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 class="text-xl font-bold mb-4">评分对比图</h3>
        <div id="radar-chart" class="h-96"></div>
      </div>
      
      <!-- 优缺点对比 -->
      <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 class="text-xl font-bold mb-4">优点对比</h3>
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            ${AppState.compareList
              .map(
                (car) => `
              <div class="mb-4">
                <h4 class="font-semibold text-primary-600 dark:text-primary-400">${
                  car.brand
                } ${car.model}</h4>
                <ul class="list-disc list-inside mt-2 space-y-1">
                  ${getAllPros(car).length > 0 ? 
                    getAllPros(car)
                    .map((pro) => `<li>${pro}</li>`)
                    .join("") 
                    : '<li class="text-gray-500">未记录优点</li>'}
                </ul>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
        <div>
          <h3 class="text-xl font-bold mb-4">缺点对比</h3>
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            ${AppState.compareList
              .map(
                (car) => `
              <div class="mb-4">
                <h4 class="font-semibold text-primary-600 dark:text-primary-400">${
                  car.brand
                } ${car.model}</h4>
                <ul class="list-disc list-inside mt-2 space-y-1">
                  ${getAllCons(car).length > 0 ? 
                    getAllCons(car)
                    .map((con) => `<li>${con}</li>`)
                    .join("") 
                    : '<li class="text-gray-500">未记录缺点</li>'}
                </ul>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      </div>
    `;
  }
  
  container.innerHTML = html;
  fragment.appendChild(container);
  
  $("#view-container").empty().append(fragment);
  
  // 绑定事件
  
  // 返回首页按钮
  $("#go-home-btn").on("click", function() {
    navigateTo("home");
  });
  
  // 清空对比按钮
  $("#clear-compare-btn").on("click", function() {
    if (confirm("确定要清空对比列表吗？")) {
      AppState.compareList = [];
      renderCompareView(AppState, showToast, navigateTo);
      showToast("对比列表已清空");
    }
  });
  
  // 从对比中移除按钮
  $(".remove-from-compare").on("click", function() {
    const id = $(this).data("id");
    const index = AppState.compareList.findIndex(car => car.id === id);
    
    if (index !== -1) {
      AppState.compareList.splice(index, 1);
      renderCompareView(AppState, showToast, navigateTo);
      showToast("已从对比列表中移除");
    }
  });
  
  // 如果有足够的对比车辆，绘制雷达图
  if (AppState.compareList && AppState.compareList.length >= 2) {
    // 首先尝试使用本地SVG图表作为备选
    try {
      createFallbackRadarChart("radar-chart", AppState.compareList);
      console.log("使用备用雷达图渲染成功");
    } catch (err) {
      console.error("备用雷达图渲染失败:", err);
    }
    
    // 然后尝试加载Highcharts并替换
    loadChartLibraries().then(() => {
      try {
        renderRadarChart("radar-chart", AppState.compareList);
        console.log("Highcharts雷达图渲染成功");
      } catch (error) {
        console.error("Highcharts雷达图渲染失败:", error);
        // 已经有备用图表，不需要显示错误信息
      }
    }).catch(error => {
      console.error("加载图表库失败:", error);
      // 已经有备用图表，所以这里不需要显示错误信息
    });
  }
}

/**
 * 渲染设置视图
 * @param {Object} AppState - 应用状态
 * @param {Function} saveData - 保存数据函数
 * @param {Function} showToast - 显示提示消息函数
 * @param {Function} navigateTo - 导航函数
 */
function renderSettingsView(AppState, saveData, showToast, navigateTo) {
  // 设置视图的渲染逻辑
  const fragment = document.createDocumentFragment();
  const container = document.createElement('div');
  container.className = 'space-y-6';
  
  let html = `
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold">设置</h2>
    </div>
    
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div class="p-6 space-y-4">
        <div class="flex justify-between items-center">
          <span class="text-gray-700 dark:text-gray-300">暗色模式</span>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" id="dark-mode-toggle" class="sr-only peer" ${AppState.settings.darkMode ? 'checked' : ''}>
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
          </label>
        </div>
        
        <div class="flex justify-between items-center">
          <span class="text-gray-700 dark:text-gray-300">自动保存</span>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" id="auto-save-toggle" class="sr-only peer" ${AppState.settings.autoSave ? 'checked' : ''}>
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
          </label>
        </div>
        
        <div class="flex justify-between items-center">
          <span class="text-gray-700 dark:text-gray-300">离线模式</span>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" id="offline-mode-toggle" class="sr-only peer" ${AppState.settings.offlineMode ? 'checked' : ''}>
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
          </label>
        </div>
      </div>
      
      <div class="border-t border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <h3 class="text-lg font-semibold">数据管理</h3>
        
        <div class="flex justify-between items-center">
          <span class="text-gray-700 dark:text-gray-300">导出数据</span>
          <button id="export-data-btn" class="bg-primary-600 dark:bg-primary-700 hover:bg-primary-700 dark:hover:bg-primary-800 text-white rounded-lg px-4 py-2">
            导出
          </button>
        </div>
        
        <div class="flex justify-between items-center">
          <span class="text-gray-700 dark:text-gray-300">导入数据</span>
          <label for="import-file" class="bg-primary-600 dark:bg-primary-700 hover:bg-primary-700 dark:hover:bg-primary-800 text-white rounded-lg px-4 py-2 cursor-pointer">
            导入
          </label>
          <input type="file" id="import-file" class="hidden" accept=".json">
        </div>
        
        <div class="flex justify-between items-center">
          <span class="text-gray-700 dark:text-gray-300">清除所有数据</span>
          <button id="clear-data-btn" class="bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2">
            清除
          </button>
        </div>
      </div>
      
      <div class="border-t border-gray-200 dark:border-gray-700 p-6">
        <div class="text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>版本：1.0.0</p>
          <p class="mt-1">© 2023 车评家 - 专业的紧凑级车试驾数据收集工具</p>
        </div>
      </div>
    </div>
  `;
  
  container.innerHTML = html;
  fragment.appendChild(container);
  
  $("#view-container").empty().append(fragment);
  
  // 暗色模式切换
  $("#dark-mode-toggle").on("change", function() {
    AppState.settings.darkMode = this.checked;
    document.documentElement.classList.toggle("dark", this.checked);
    $("#theme-color").attr("content", this.checked ? "#1f2937" : "#ffffff");
    if (this.checked) {
      $("#light-icon").removeClass("hidden");
      $("#dark-icon").addClass("hidden");
    } else {
      $("#light-icon").addClass("hidden");
      $("#dark-icon").removeClass("hidden");
    }
    saveData(AppState, showToast);
  });
  
  // 自动保存切换
  $("#auto-save-toggle").on("change", function() {
    AppState.settings.autoSave = this.checked;
    saveData(AppState, showToast);
  });
  
  // 离线模式切换
  $("#offline-mode-toggle").on("change", function() {
    AppState.settings.offlineMode = this.checked;
    saveData(AppState, showToast);
  });
  
  // 导出数据
  $("#export-data-btn").on("click", function() {
    try {
      const data = {
        cars: AppState.cars,
        settings: AppState.settings,
      };
      
      const dataStr = JSON.stringify(data, null, 2);
      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
      
      const exportFileName = `车评家数据_${new Date().toISOString().split("T")[0]}.json`;
      
      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileName);
      linkElement.click();
      
      showToast("数据导出成功");
    } catch (error) {
      console.error("导出数据失败:", error);
      showToast("导出数据失败：" + error.message);
    }
  });
  
  // 导入数据
  $("#import-file").on("change", function(e) {
    if (e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
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
            document.documentElement.classList.toggle("dark", AppState.settings.darkMode);
            $("#theme-color").attr("content", AppState.settings.darkMode ? "#1f2937" : "#ffffff");
            
            renderSettingsView(AppState, saveData, showToast, navigateTo);
            showToast("数据导入成功");
          }
        } else {
          showToast("无效的数据格式");
        }
      } catch (error) {
        console.error("导入数据失败:", error);
        showToast("导入数据失败：" + error.message);
      }
    };
    
    reader.readAsText(file);
  });
  
  // 清除所有数据
  $("#clear-data-btn").on("click", function() {
    if (confirm("确定要清除所有数据吗？此操作不可恢复！")) {
      // 保留设置，只清除车辆数据
      AppState.cars = [];
      saveData(AppState, showToast);
      showToast("数据已清除");
    }
  });
}

/**
 * 展示车辆详细信息
 * @param {Object} car - 车辆对象
 */
function showCarDetail(car) {
  const totalScore = calculateTotalScore(car);
  
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50';
  modal.id = 'car-detail-modal';
  
  modal.innerHTML = `
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-90vh overflow-y-auto">
      <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 class="text-xl font-bold">${car.brand} ${car.model}</h3>
        <button id="close-detail-modal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div class="p-4">
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <span class="text-gray-500 dark:text-gray-400 text-sm">版本</span>
            <p>${car.version || "未指定"}</p>
          </div>
          <div>
            <span class="text-gray-500 dark:text-gray-400 text-sm">指导价</span>
            <p>${car.price ? `¥${car.price.toLocaleString("zh-CN")}万` : "暂无"}</p>
          </div>
          <div>
            <span class="text-gray-500 dark:text-gray-400 text-sm">试驾日期</span>
            <p>${car.testDate ? new Date(car.testDate).toLocaleDateString("zh-CN") : "未记录"}</p>
          </div>
          <div>
            <span class="text-gray-500 dark:text-gray-400 text-sm">试驾地点</span>
            <p>${car.testLocation || "未记录"}</p>
          </div>
        </div>
        
        <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4">
          <div class="text-center mb-2">
            <span class="text-3xl font-bold text-primary-600 dark:text-primary-400">${totalScore.toFixed(1)}</span>
            <span class="text-lg">/10</span>
            <p class="text-sm text-gray-500 dark:text-gray-400">综合评分</p>
          </div>
          
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
            <div class="text-center">
              <div class="text-sm text-gray-600 dark:text-gray-400">外观</div>
              <div class="font-semibold">${car.ratings?.exterior?.score?.toFixed(1) || "暂无"}</div>
            </div>
            <div class="text-center">
              <div class="text-sm text-gray-600 dark:text-gray-400">内饰</div>
              <div class="font-semibold">${car.ratings?.interior?.score?.toFixed(1) || "暂无"}</div>
            </div>
            <div class="text-center">
              <div class="text-sm text-gray-600 dark:text-gray-400">空间</div>
              <div class="font-semibold">${car.ratings?.space?.score?.toFixed(1) || "暂无"}</div>
            </div>
            <div class="text-center">
              <div class="text-sm text-gray-600 dark:text-gray-400">动力</div>
              <div class="font-semibold">${car.ratings?.power?.score?.toFixed(1) || "暂无"}</div>
            </div>
            <div class="text-center">
              <div class="text-sm text-gray-600 dark:text-gray-400">操控</div>
              <div class="font-semibold">${car.ratings?.handling?.score?.toFixed(1) || "暂无"}</div>
            </div>
            <div class="text-center">
              <div class="text-sm text-gray-600 dark:text-gray-400">NVH</div>
              <div class="font-semibold">${car.ratings?.nvh?.score?.toFixed(1) || "暂无"}</div>
            </div>
            <div class="text-center">
              <div class="text-sm text-gray-600 dark:text-gray-400">智能</div>
              <div class="font-semibold">${car.ratings?.intelligence?.score?.toFixed(1) || "暂无"}</div>
            </div>
            <div class="text-center">
              <div class="text-sm text-gray-600 dark:text-gray-400">油耗</div>
              <div class="font-semibold">${car.ratings?.fuelConsumption?.score?.toFixed(1) || "暂无"}</div>
            </div>
          </div>
        </div>
        
        <div class="mb-4">
          <h4 class="font-semibold mb-2">优点</h4>
          <ul class="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
            ${getAllPros(car).map(pro => `<li>${pro}</li>`).join('') || '<li class="text-gray-500">未记录优点</li>'}
          </ul>
        </div>
        
        <div class="mb-4">
          <h4 class="font-semibold mb-2">缺点</h4>
          <ul class="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
            ${getAllCons(car).map(con => `<li>${con}</li>`).join('') || '<li class="text-gray-500">未记录缺点</li>'}
          </ul>
        </div>
        
        ${car.overallComment ? `
        <div>
          <h4 class="font-semibold mb-2">综合评价</h4>
          <p class="text-sm text-gray-700 dark:text-gray-300">${car.overallComment}</p>
        </div>
        ` : ''}
      </div>
      
      <div class="p-4 border-t border-gray-200 dark:border-gray-700 text-right">
        <button id="close-detail-btn" class="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded">
          关闭
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // 关闭按钮事件
  document.getElementById('close-detail-modal').addEventListener('click', () => {
    document.getElementById('car-detail-modal').remove();
  });
  
  document.getElementById('close-detail-btn').addEventListener('click', () => {
    document.getElementById('car-detail-modal').remove();
  });
  
  // 点击背景关闭
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

/**
 * 渲染评分部分
 * @param {string} category - 类别
 * @param {string} title - 标题
 * @param {Object} car - 车辆对象
 * @returns {string} - HTML字符串
 */
function renderRatingSection(category, title, car) {
  const categoryLabels = {
    exterior: {
      title: "外观评测",
      desc: "评价车辆的外观设计、做工质感和颜色选择",
      pros: "外观优点",
      cons: "外观缺点",
    },
    interior: {
      title: "内饰评测",
      desc: "评价车辆的内饰材质、布局、人机工程学和科技感",
      pros: "内饰优点",
      cons: "内饰缺点",
    },
    space: {
      title: "空间表现",
      desc: "评价车辆的前/后排空间、后备箱和储物空间",
      pros: "空间优点",
      cons: "空间缺点",
    },
    power: {
      title: "动力系统",
      desc: "评价车辆的加速表现、平顺性和换挡逻辑",
      pros: "动力优点",
      cons: "动力缺点",
    },
    handling: {
      title: "操控性能",
      desc: "评价车辆的转向精准度、刹车表现和悬挂调校",
      pros: "操控优点",
      cons: "操控缺点",
    },
    nvh: {
      title: "NVH表现",
      desc: "评价车辆的怠速噪音、行驶噪音、路噪和风噪",
      pros: "NVH优点",
      cons: "NVH缺点",
    },
    intelligence: {
      title: "智能系统",
      desc: "评价车辆的车机系统、驾驶辅助和智能互联",
      pros: "智能系统优点",
      cons: "智能系统缺点",
    },
    fuelConsumption: {
      title: "油耗表现",
      desc: "记录车辆的实测油耗/电耗",
      pros: "油耗优点",
      cons: "油耗缺点",
    },
  };

  const label = categoryLabels[category];

  return `
    <div class="space-y-6">
      <div>
        <h4 class="text-lg font-medium mb-2">评分</h4>
        <div class="flex items-center space-x-4">
          <input type="range" class="rating-slider flex-grow" min="1" max="10" step="0.1" value="${
            car.ratings[category].score
          }" data-category="${category}">
          <div class="text-2xl font-bold text-primary-600 dark:text-primary-400 w-16 text-center" id="${category}-score">${car.ratings[
    category
  ].score.toFixed(1)}</div>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 class="text-lg font-medium mb-2">${label.pros}</h4>
          <div class="flex items-center space-x-2 mb-4">
            <input type="text" id="${category}-pro-input" class="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white" placeholder="添加优点...">
            <button class="add-pro-btn bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md" data-category="${category}">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
          <ul class="pros-list space-y-2" data-category="${category}">
            ${car.ratings[category].pros
              .map(
                (pro, index) => `
              <li class="flex items-center justify-between bg-green-50 dark:bg-green-900 p-2 rounded">
                <span class="text-green-800 dark:text-green-200">${pro}</span>
                <button class="remove-item text-red-500 hover:text-red-700" data-index="${index}">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </li>
            `
              )
              .join("")}
          </ul>
        </div>
        
        <div>
          <h4 class="text-lg font-medium mb-2">${label.cons}</h4>
          <div class="flex items-center space-x-2 mb-4">
            <input type="text" id="${category}-con-input" class="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white" placeholder="添加缺点...">
            <button class="add-con-btn bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md" data-category="${category}">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
          <ul class="cons-list space-y-2" data-category="${category}">
            ${car.ratings[category].cons
              .map(
                (con, index) => `
              <li class="flex items-center justify-between bg-red-50 dark:bg-red-900 p-2 rounded">
                <span class="text-red-800 dark:text-red-200">${con}</span>
                <button class="remove-item text-red-500 hover:text-red-700" data-index="${index}">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </li>
            `
              )
              .join("")}
          </ul>
        </div>
      </div>
      
      <div>
        <h4 class="text-lg font-medium mb-2">备注</h4>
        <textarea id="${category}-notes" rows="4" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white" placeholder="添加备注...">${
          car.ratings[category].notes || ""
        }</textarea>
      </div>
    </div>
  `;
}

/**
 * 保存当前步骤数据
 * @param {Object} AppState - 应用状态
 * @param {Function} showToast - 显示提示消息函数
 * @returns {boolean} - 是否保存成功
 */
function saveCurrentStepData(AppState, showToast) {
  const car = AppState.currentCar;
  const step = AppState.currentStep;

  switch (step) {
    case 0: // 基本信息
      car.brand = $("#brand").val().trim();
      car.model = $("#model").val().trim();
      car.version = $("#version").val().trim();
      car.price = $("#price").val() ? parseFloat($("#price").val()) : null;
      car.discountPrice = $("#discountPrice").val() ? parseFloat($("#discountPrice").val()) : null;
      car.testDate = $("#testDate").val();
      car.testLocation = $("#testLocation").val().trim();
      car.salesConsultant = $("#salesConsultant").val().trim();

      // 验证必填字段
      if (!car.brand || !car.model) {
        showToast("请填写品牌和车型");
        return false;
      }
      break;

    case 1: // 外观评测
    case 2: // 内饰评测
    case 3: // 空间表现
    case 4: // 动力系统
    case 5: // 操控性能
    case 6: // NVH表现
    case 7: // 智能系统
    case 8: // 油耗表现
      const categories = [
        "exterior",
        "interior",
        "space",
        "power",
        "handling",
        "nvh",
        "intelligence",
        "fuelConsumption",
      ];
      const category = categories[step - 1];

      car.ratings[category].score = parseFloat($(".rating-slider").val());
      car.ratings[category].notes = $(`#${category}-notes`).val().trim();
      break;

    case 9: // 总结评价
      car.overallComment = $("#overallComment").val().trim();
      break;
  }

  // 如果启用了自动保存，保存数据
  if (AppState.settings.autoSave) {
    const carIndex = AppState.cars.findIndex((c) => c.id === car.id);
    if (carIndex !== -1) {
      AppState.cars[carIndex] = { ...car };
    }
    // 不在这里调用saveData，避免循环调用
  }

  return true;
}

/**
 * 处理图片上传
 * @param {FileList} files - 文件列表
 * @param {Object} AppState - 应用状态
 */
function handleImageUpload(files, AppState) {
  const car = AppState.currentCar;
  car.images = car.images || [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    // 检查文件类型
    if (!file.type.match("image.*")) {
      showToast("只能上传图片文件");
      continue;
    }

    // 检查文件大小
    if (file.size > 10 * 1024 * 1024) {
      // 10MB
      showToast("图片大小不能超过10MB");
      continue;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      car.images.push(e.target.result);
      renderImagePreview(AppState);
    };
    reader.readAsDataURL(file);
  }
}

/**
 * 渲染图片预览
 * @param {Object} AppState - 应用状态
 */
function renderImagePreview(AppState) {
  const car = AppState.currentCar;
  let html = "";

  if (car.images && car.images.length > 0) {
    car.images.forEach((img, idx) => {
      html += `
        <div class="relative">
          <img src="${img}" alt="车辆照片" class="h-24 w-full object-cover rounded-md">
          <button type="button" class="remove-image absolute top-1 right-1 bg-red-500 text-white rounded-full p-1" data-index="${idx}">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      `;
    });
  }

  $("#image-preview").html(html);
}

/**
 * 渲染优缺点列表
 * @param {string} category - 类别
 * @param {Object} AppState - 应用状态
 */
function renderProsCons(category, AppState) {
  const car = AppState.currentCar;

  // 渲染优点列表
  let prosHtml = "";
  car.ratings[category].pros.forEach((pro, index) => {
    prosHtml += `
      <li class="flex items-center justify-between bg-green-50 dark:bg-green-900 p-2 rounded">
        <span class="text-green-800 dark:text-green-200">${pro}</span>
        <button class="remove-item text-red-500 hover:text-red-700" data-index="${index}">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </li>
    `;
  });
  $(`.pros-list[data-category="${category}"]`).html(prosHtml);

  // 渲染缺点列表
  let consHtml = "";
  car.ratings[category].cons.forEach((con, index) => {
    consHtml += `
      <li class="flex items-center justify-between bg-red-50 dark:bg-red-900 p-2 rounded">
        <span class="text-red-800 dark:text-red-200">${con}</span>
        <button class="remove-item text-red-500 hover:text-red-700" data-index="${index}">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </li>
    `;
  });
  $(`.cons-list[data-category="${category}"]`).html(consHtml);
}

// 导出函数
export {
  renderHomeView,
  renderRecordView,
  renderCompareView,
  renderSettingsView,
  showCarDetail,
  saveCurrentStepData,
  renderRatingSection,
  renderProsCons,
  renderImagePreview,
  handleImageUpload
}; 