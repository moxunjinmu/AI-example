// 渲染车辆列表
function renderCarList() {
  const $carList = $("#car-list");
  $carList.empty();

  if (AppState.cars.length === 0) {
    $carList.html(`
      <div class="text-center py-10">
        <svg class="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path>
        </svg>
        <h3 class="mt-4 text-lg font-medium">没有车辆数据</h3>
        <p class="mt-1 text-gray-500 dark:text-gray-400">点击下方添加按钮开始您的评测</p>
        <button id="empty-add-car" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
          <svg class="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          添加车型
        </button>
      </div>
    `);

    // 空状态添加按钮点击事件
    $("#empty-add-car").on("click", function () {
      navigateTo("add");
    });

    return;
  }

  // 渲染每个车辆卡片
  AppState.cars.forEach((car, index) => {
    const $carCard = $(`
      <div class="car-card data-card bg-white dark:bg-gray-800 p-4 mb-4 slide-in" data-index="${index}">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="text-lg font-bold">${car.brand} ${car.model}</h3>
            <p class="text-gray-600 dark:text-gray-400">${car.year}年款 · ${car.price}万元</p>
          </div>
          <div class="flex space-x-2">
            <button class="edit-car p-1 text-gray-500 hover:text-blue-500" data-index="${index}">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
              </svg>
            </button>
            <button class="delete-car p-1 text-gray-500 hover:text-red-500" data-index="${index}">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">驾驶体验</p>
            <div class="star-rating mt-1" data-rating="${car.ratings.driving || 0}">
              ${generateStarRating(car.ratings.driving || 0)}
            </div>
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">内饰品质</p>
            <div class="star-rating mt-1" data-rating="${car.ratings.interior || 0}">
              ${generateStarRating(car.ratings.interior || 0)}
            </div>
          </div>
        </div>
        
        <div class="mt-4 flex space-x-2">
          <button class="view-details flex-1 py-2 px-3 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 rounded-lg" data-index="${index}">
            查看详情
          </button>
          <button class="add-to-compare flex-1 py-2 px-3 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 rounded-lg" data-index="${index}">
            ${AppState.compareList.includes(index) ? "取消对比" : "加入对比"}
          </button>
        </div>
      </div>
    `);

    $carList.append($carCard);
  });

  // 绑定事件
  $(".view-details").on("click", function () {
    const index = $(this).data("index");
    viewCarDetails(index);
  });

  $(".edit-car").on("click", function (e) {
    e.stopPropagation();
    const index = $(this).data("index");
    editCar(index);
  });

  $(".delete-car").on("click", function (e) {
    e.stopPropagation();
    const index = $(this).data("index");
    confirmDeleteCar(index);
  });

  $(".add-to-compare").on("click", function (e) {
    e.stopPropagation();
    const index = $(this).data("index");
    toggleCompare(index);
    $(this).text(AppState.compareList.includes(index) ? "取消对比" : "加入对比");
  });
}

// 生成星级评分HTML
function generateStarRating(rating) {
  let stars = "";
  for (let i = 1; i <= 5; i++) {
    const starClass = i <= rating ? "star-filled" : "star-empty";
    stars += `<span class="${starClass}" data-value="${i}">★</span>`;
  }
  return stars;
}

// 查看车辆详情
function viewCarDetails(index) {
  const car = AppState.cars[index];
  
  // 显示详情模态框
  const $modal = $("#car-detail-modal");
  
  // 填充详情内容
  $("#detail-title").text(`${car.brand} ${car.model}`);
  $("#detail-subtitle").text(`${car.year}年款 · ${car.price}万元`);
  
  // 填充评分
  $("#detail-driving").html(generateStarRating(car.ratings.driving || 0));
  $("#detail-comfort").html(generateStarRating(car.ratings.comfort || 0));
  $("#detail-interior").html(generateStarRating(car.ratings.interior || 0));
  $("#detail-features").html(generateStarRating(car.ratings.features || 0));
  $("#detail-value").html(generateStarRating(car.ratings.value || 0));
  
  // 填充备注
  $("#detail-notes").text(car.notes || "暂无备注");
  
  // 显示模态框
  $modal.removeClass("hidden");
  
  // 绑定关闭事件
  $("#close-detail-modal").on("click", function() {
    $modal.addClass("hidden");
  });
}

// 编辑车辆
function editCar(index) {
  // 导航到添加视图，同时设置编辑模式
  navigateTo("add");
  
  // 填充表单数据
  const car = AppState.cars[index];
  $("#edit-mode").val("edit");
  $("#edit-index").val(index);
  $("#car-brand").val(car.brand);
  $("#car-model").val(car.model);
  $("#car-year").val(car.year);
  $("#car-price").val(car.price);
  
  // 填充评分
  $(".rating-input").each(function() {
    const category = $(this).data("category");
    $(this).val(car.ratings[category] || 0);
    updateRatingDisplay($(this));
  });
  
  // 填充备注
  $("#car-notes").val(car.notes || "");
  
  // 更新标题
  $("#add-car-title").text("编辑车型");
}

// 确认删除车辆
function confirmDeleteCar(index) {
  const car = AppState.cars[index];
  
  if (confirm(`确定要删除 ${car.brand} ${car.model} 吗？此操作不可撤销。`)) {
    deleteCar(index);
  }
}

// 删除车辆
function deleteCar(index) {
  // 从对比列表中移除
  const compareIndex = AppState.compareList.indexOf(index);
  if (compareIndex !== -1) {
    AppState.compareList.splice(compareIndex, 1);
  }
  
  // 更新大于当前索引的对比项
  AppState.compareList = AppState.compareList.map(i => i > index ? i - 1 : i);
  
  // 删除车辆数据
  AppState.cars.splice(index, 1);
  
  // 保存数据
  saveData();
  
  // 重新渲染列表
  renderCarList();
  
  // 显示提示
  showToast("车型已删除");
}

// 切换对比
function toggleCompare(index) {
  const position = AppState.compareList.indexOf(index);
  
  if (position === -1) {
    // 限制对比数量
    if (AppState.compareList.length >= 3) {
      showToast("最多只能对比3个车型");
      return;
    }
    
    // 添加到对比列表
    AppState.compareList.push(index);
  } else {
    // 从对比列表中移除
    AppState.compareList.splice(position, 1);
  }
  
  // 更新底部对比栏
  updateCompareBar();
}

// 更新底部对比栏
function updateCompareBar() {
  const $compareBar = $("#compare-bar");
  
  if (AppState.compareList.length === 0) {
    $compareBar.addClass("hidden");
    return;
  }
  
  // 显示对比栏
  $compareBar.removeClass("hidden");
  
  // 更新对比数量
  $("#compare-count").text(AppState.compareList.length);
}

// 渲染设置视图
function renderSettingsView() {
  // 填充设置值
  $("#setting-dark-mode").prop("checked", AppState.settings.darkMode);
  $("#setting-auto-save").prop("checked", AppState.settings.autoSave);
  $("#setting-offline-mode").prop("checked", AppState.settings.offlineMode);
  
  // 绑定事件
  $(".setting-toggle").off("change").on("change", function() {
    const setting = $(this).data("setting");
    const value = $(this).prop("checked");
    
    // 更新设置
    AppState.settings[setting] = value;
    
    // 特殊设置处理
    if (setting === "darkMode") {
      initTheme();
    }
    
    // 保存设置
    saveData();
  });
}

// 重置添加车辆表单
function resetAddCarForm() {
  $("#add-car-form")[0].reset();
  $("#edit-mode").val("add");
  $("#edit-index").val("");
  $("#add-car-title").text("添加新车型");
  
  // 重置评分显示
  $(".rating-input").each(function() {
    updateRatingDisplay($(this));
  });
}

// 更新评分显示
function updateRatingDisplay($input) {
  const value = $input.val();
  const $display = $input.siblings(".rating-display");
  const $stars = $display.find(".star-rating");
  
  // 更新星级显示
  $stars.html(generateStarRating(value));
  
  // 更新数值显示
  $display.find(".rating-value").text(value);
}

// 渲染对比视图
function renderCompareView() {
  const $compareContent = $("#compare-content");
  $compareContent.empty();
  
  if (AppState.compareList.length === 0) {
    $compareContent.html(`
      <div class="text-center py-10">
        <svg class="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>
        <h3 class="mt-4 text-lg font-medium">暂无对比车型</h3>
        <p class="mt-1 text-gray-500 dark:text-gray-400">请在车辆列表中选择要对比的车型</p>
        <button id="goto-car-list" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
          返回车辆列表
        </button>
      </div>
    `);
    
    // 绑定返回事件
    $("#goto-car-list").on("click", function() {
      navigateTo("home");
    });
    
    return;
  }
  
  // 构建对比表格
  const compareTable = buildCompareTable();
  $compareContent.html(compareTable);
  
  // 检查图表库并加载图表
  if (AppState.compareList.length >= 2) {
    if (typeof Highcharts !== 'undefined') {
      renderComparisonCharts();
    } else {
      loadLibrary('charts').then(() => {
        renderComparisonCharts();
      });
    }
  }
}

// 构建对比表格
function buildCompareTable() {
  // 获取对比车辆数据
  const cars = AppState.compareList.map(index => AppState.cars[index]);
  
  let tableHtml = `
    <div class="overflow-x-auto">
      <table class="comparison-table w-full text-left">
        <thead>
          <tr class="bg-gray-100 dark:bg-gray-700">
            <th class="py-3 px-4">对比项目</th>
  `;
  
  // 添加车型列
  cars.forEach(car => {
    tableHtml += `<th class="py-3 px-4">${car.brand} ${car.model}</th>`;
  });
  
  tableHtml += `
        </tr>
      </thead>
      <tbody>
  `;
  
  // 基本信息对比
  tableHtml += addComparisonRow("品牌", cars.map(car => car.brand));
  tableHtml += addComparisonRow("型号", cars.map(car => car.model));
  tableHtml += addComparisonRow("年款", cars.map(car => car.year));
  tableHtml += addComparisonRow("价格 (万元)", cars.map(car => car.price));
  
  // 评分对比
  tableHtml += `<tr><td colspan="${cars.length + 1}" class="py-2 px-4 bg-gray-200 dark:bg-gray-600 font-medium">评分对比</td></tr>`;
  
  const ratingCategories = {
    "driving": "驾驶体验",
    "comfort": "舒适性",
    "interior": "内饰品质",
    "features": "配置水平",
    "value": "性价比"
  };
  
  for (const [key, label] of Object.entries(ratingCategories)) {
    tableHtml += addComparisonRow(
      label,
      cars.map(car => {
        const rating = car.ratings[key] || 0;
        return `<div class="star-rating inline-block" data-rating="${rating}">${generateStarRating(rating)}</div>`;
      }),
      true
    );
  }
  
  // 平均评分
  tableHtml += addComparisonRow(
    "综合评分",
    cars.map(car => {
      const ratings = Object.values(car.ratings || {});
      const avg = ratings.length > 0 
        ? (ratings.reduce((sum, val) => sum + val, 0) / ratings.length).toFixed(1)
        : "0.0";
      return `<span class="font-bold text-lg">${avg}</span>`;
    })
  );
  
  // 备注
  tableHtml += `<tr><td colspan="${cars.length + 1}" class="py-2 px-4 bg-gray-200 dark:bg-gray-600 font-medium">备注</td></tr>`;
  tableHtml += addComparisonRow(
    "试驾备注",
    cars.map(car => car.notes || "无备注"),
    true,
    true
  );
  
  tableHtml += `
      </tbody>
    </table>
  </div>`;
  
  // 添加对比图表容器
  if (cars.length >= 2) {
    tableHtml += `
      <div class="mt-8">
        <h3 class="text-lg font-bold mb-4">评分雷达图对比</h3>
        <div id="radar-chart" class="chart-container"></div>
      </div>
      
      <div class="mt-8">
        <h3 class="text-lg font-bold mb-4">评分对比柱状图</h3>
        <div id="bar-chart" class="chart-container"></div>
      </div>
    `;
  }
  
  return tableHtml;
}

// 添加对比行
function addComparisonRow(label, values, isHtml = false, isLongText = false) {
  let rowHtml = `
    <tr class="border-b border-gray-200 dark:border-gray-700">
      <td class="py-3 px-4 font-medium">${label}</td>
  `;
  
  values.forEach(value => {
    const cellClass = isLongText ? "max-w-xs truncate" : "";
    if (isHtml) {
      rowHtml += `<td class="py-3 px-4 ${cellClass}">${value}</td>`;
    } else {
      rowHtml += `<td class="py-3 px-4 ${cellClass}">${value}</td>`;
    }
  });
  
  rowHtml += `</tr>`;
  return rowHtml;
}

// 渲染对比图表
function renderComparisonCharts() {
  if (!document.getElementById('radar-chart')) return;
  
  const cars = AppState.compareList.map(index => AppState.cars[index]);
  const categories = ["驾驶体验", "舒适性", "内饰品质", "配置水平", "性价比"];
  const categoryKeys = ["driving", "comfort", "interior", "features", "value"];
  
  // 准备图表数据
  const series = cars.map(car => {
    return {
      name: `${car.brand} ${car.model}`,
      data: categoryKeys.map(key => car.ratings[key] || 0)
    };
  });
  
  // 雷达图
  Highcharts.chart('radar-chart', {
    chart: {
      polar: true,
      type: 'line',
      backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff'
    },
    title: {
      text: '',
      style: {
        color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#000000'
      }
    },
    pane: {
      size: '80%'
    },
    xAxis: {
      categories: categories,
      tickmarkPlacement: 'on',
      lineWidth: 0,
      labels: {
        style: {
          color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#4b5563'
        }
      }
    },
    yAxis: {
      gridLineInterpolation: 'polygon',
      lineWidth: 0,
      min: 0,
      max: 5,
      tickInterval: 1,
      labels: {
        style: {
          color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#4b5563'
        }
      }
    },
    tooltip: {
      shared: true,
      pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y:,.1f}</b><br/>'
    },
    legend: {
      itemStyle: {
        color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#4b5563'
      }
    },
    series: series,
    responsive: {
      rules: [{
        condition: {
          maxWidth: 500
        },
        chartOptions: {
          legend: {
            align: 'center',
            verticalAlign: 'bottom',
            layout: 'horizontal'
          },
          pane: {
            size: '70%'
          }
        }
      }]
    }
  });
  
  // 柱状图
  Highcharts.chart('bar-chart', {
    chart: {
      type: 'column',
      backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff'
    },
    title: {
      text: '',
      style: {
        color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#000000'
      }
    },
    xAxis: {
      categories: categories,
      labels: {
        style: {
          color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#4b5563'
        }
      }
    },
    yAxis: {
      min: 0,
      max: 5,
      title: {
        text: '评分 (1-5)',
        style: {
          color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#4b5563'
        }
      },
      labels: {
        style: {
          color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#4b5563'
        }
      }
    },
    tooltip: {
      valueSuffix: ' 分'
    },
    plotOptions: {
      column: {
        borderRadius: 5
      }
    },
    legend: {
      itemStyle: {
        color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#4b5563'
      }
    },
    series: series
  });
} 