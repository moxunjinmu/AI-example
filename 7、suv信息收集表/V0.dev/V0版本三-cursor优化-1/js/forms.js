// 初始化表单处理
document.addEventListener("DOMContentLoaded", function() {
  initFormHandlers();
});

// 初始化表单处理函数
function initFormHandlers() {
  // 添加车型表单提交
  $("#add-car-form").on("submit", function(e) {
    e.preventDefault();
    handleCarFormSubmit();
  });
  
  // 评分滑块变化事件
  $(".rating-input").on("input", function() {
    updateRatingDisplay($(this));
  });
  
  // 搜索框输入事件
  $("#car-search").on("input", debounce(function() {
    const searchTerm = $(this).val().toLowerCase().trim();
    filterCarList(searchTerm);
  }, 300));
  
  // 数据导出按钮
  $("#export-data").on("click", function() {
    exportData();
  });
  
  // 数据导入按钮
  $("#import-data").on("click", function() {
    $("#import-file").click();
  });
  
  // 文件选择变化
  $("#import-file").on("change", function(e) {
    if (e.target.files.length > 0) {
      importData(e.target.files[0]);
    }
  });
}

// 车辆表单提交处理
function handleCarFormSubmit() {
  showLoader();
  
  try {
    // 获取表单数据
    const formData = {
      brand: $("#car-brand").val().trim(),
      model: $("#car-model").val().trim(),
      year: parseInt($("#car-year").val().trim()),
      price: parseFloat($("#car-price").val().trim()),
      notes: $("#car-notes").val().trim(),
      ratings: {
        driving: parseInt($("#rating-driving").val()),
        comfort: parseInt($("#rating-comfort").val()),
        interior: parseInt($("#rating-interior").val()),
        features: parseInt($("#rating-features").val()),
        value: parseInt($("#rating-value").val())
      }
    };
    
    // 表单验证
    if (!formData.brand) {
      showToast("请输入品牌");
      return;
    }
    
    if (!formData.model) {
      showToast("请输入型号");
      return;
    }
    
    if (isNaN(formData.year) || formData.year < 1900 || formData.year > 2100) {
      showToast("请输入有效的年份");
      return;
    }
    
    if (isNaN(formData.price) || formData.price <= 0) {
      showToast("请输入有效的价格");
      return;
    }
    
    // 检查是否是编辑模式
    const isEdit = $("#edit-mode").val() === "edit";
    const editIndex = parseInt($("#edit-index").val());
    
    if (isEdit && !isNaN(editIndex)) {
      // 更新现有车辆
      AppState.cars[editIndex] = formData;
      showToast("车型已更新");
    } else {
      // 添加新车辆
      AppState.cars.push(formData);
      showToast("车型已添加");
    }
    
    // 保存数据
    saveData();
    
    // 重置表单
    $("#add-car-form")[0].reset();
    
    // 返回首页
    navigateTo("home");
  } catch (error) {
    console.error("提交表单失败:", error);
    showToast("保存失败，请重试");
  } finally {
    hideLoader();
  }
}

// 筛选车辆列表
function filterCarList(searchTerm) {
  if (!searchTerm) {
    // 如果搜索词为空，显示所有车辆
    $(".car-card").removeClass("hidden");
    return;
  }
  
  // 遍历所有车辆卡片
  $(".car-card").each(function() {
    const index = $(this).data("index");
    const car = AppState.cars[index];
    
    // 搜索品牌、型号、年份
    const matchText = `${car.brand} ${car.model} ${car.year}`.toLowerCase();
    
    if (matchText.includes(searchTerm)) {
      $(this).removeClass("hidden");
    } else {
      $(this).addClass("hidden");
    }
  });
  
  // 检查是否有可见结果
  const visibleCount = $(".car-card:not(.hidden)").length;
  
  if (visibleCount === 0 && AppState.cars.length > 0) {
    $("#no-results").removeClass("hidden");
  } else {
    $("#no-results").addClass("hidden");
  }
}

// 导出数据
async function exportData() {
  try {
    showLoader();
    
    // 检查是否有数据可导出
    if (AppState.cars.length === 0) {
      showToast("没有数据可导出");
      return;
    }
    
    // 按需加载PDF库
    if (typeof jspdf === 'undefined') {
      await loadLibrary('pdf');
      await loadLibrary('html2canvas');
    }
    
    // 创建暂存的数据视图
    const $exportView = $("<div>")
      .addClass("p-8 bg-white")
      .css({
        position: "absolute",
        left: "-9999px",
        width: "800px"
      })
      .appendTo("body");
    
    // 添加标题
    $exportView.append(`
      <h1 class="text-2xl font-bold mb-4">车评家 - 数据导出</h1>
      <p class="mb-6">导出时间: ${new Date().toLocaleString()}</p>
    `);
    
    // 添加车辆数据
    AppState.cars.forEach((car, index) => {
      $exportView.append(`
        <div class="car-export mb-8 pb-4 border-b">
          <h2 class="text-xl font-bold">${index + 1}. ${car.brand} ${car.model}</h2>
          <p class="mb-2">${car.year}年款，${car.price}万元</p>
          
          <h3 class="font-bold mt-3 mb-2">评分</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p>驾驶体验: ${car.ratings.driving || 0}/5</p>
              <p>舒适性: ${car.ratings.comfort || 0}/5</p>
              <p>内饰品质: ${car.ratings.interior || 0}/5</p>
            </div>
            <div>
              <p>配置水平: ${car.ratings.features || 0}/5</p>
              <p>性价比: ${car.ratings.value || 0}/5</p>
            </div>
          </div>
          
          <h3 class="font-bold mt-3 mb-2">备注</h3>
          <p>${car.notes || "无备注"}</p>
        </div>
      `);
    });
    
    // 生成PDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // 使用html2canvas转换为图片
    const canvas = await html2canvas($exportView[0], {
      scale: 2,
      useCORS: true,
      logging: false
    });
    
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210; // A4宽度 (mm)
    const pageHeight = 295; // A4高度 (mm)
    const imgHeight = canvas.height * imgWidth / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    
    // 添加第一页
    doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    // 添加额外页面（如果需要）
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      doc.addPage();
      doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    // 保存PDF
    doc.save('车评家数据导出.pdf');
    
    // 删除暂存视图
    $exportView.remove();
    
    showToast("数据导出成功");
  } catch (error) {
    console.error("导出数据失败:", error);
    showToast("导出失败，请重试");
  } finally {
    hideLoader();
  }
}

// 导入数据
function importData(file) {
  const reader = new FileReader();
  
  reader.onload = function(e) {
    try {
      showLoader();
      
      const data = JSON.parse(e.target.result);
      
      // 验证数据结构
      if (!Array.isArray(data)) {
        showToast("数据格式不正确");
        return;
      }
      
      // 确认导入
      if (confirm(`确定要导入${data.length}条车辆数据吗？现有数据将被合并。`)) {
        // 合并数据，避免重复
        const existingIds = new Set(AppState.cars.map(car => `${car.brand}-${car.model}-${car.year}`));
        
        let newCount = 0;
        
        data.forEach(car => {
          const carId = `${car.brand}-${car.model}-${car.year}`;
          
          if (!existingIds.has(carId)) {
            AppState.cars.push(car);
            existingIds.add(carId);
            newCount++;
          }
        });
        
        // 保存并更新UI
        saveData();
        renderCarList();
        
        showToast(`成功导入${newCount}条新数据`);
      }
    } catch (error) {
      console.error("导入数据失败:", error);
      showToast("导入失败，文件格式不正确");
    } finally {
      hideLoader();
    }
  };
  
  reader.onerror = function() {
    showToast("读取文件失败");
  };
  
  reader.readAsText(file);
} 