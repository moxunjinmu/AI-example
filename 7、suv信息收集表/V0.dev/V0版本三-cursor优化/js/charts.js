/**
 * 图表相关函数
 */

import { loadScript } from '../utils/helpers.js';

// 图表配置
const chartOptions = {
  darkMode: false,
  radarChart: {
    categories: [
      "外观设计",
      "内饰质感",
      "空间表现",
      "动力性能",
      "操控表现",
      "NVH静音性",
      "智能科技",
      "油耗水平",
    ]
  }
};

/**
 * 加载图表库
 * @returns {Promise} - 加载完成的Promise
 */
function loadChartLibraries() {
  return loadScript('/js/libs/highcharts.min.js')
    .then(() => loadScript('/js/libs/highcharts-more.min.js'))
    .then(() => loadScript('/js/libs/accessibility.js'))
    .then(() => {
      // 初始化Highcharts全局设置
      if (window.Highcharts) {
        window.Highcharts.setOptions({
          accessibility: {
            enabled: true
          }
        });
      }
    })
    .catch(err => {
      console.error('加载图表库失败:', err);
      throw new Error('加载图表库失败，请检查网络连接');
    });
}

/**
 * 渲染雷达图
 * @param {string} containerId - 容器ID
 * @param {Array} cars - 车辆数组
 */
function renderRadarChart(containerId, cars) {
  try {
    if (!window.Highcharts) {
      console.error('Highcharts未加载');
      document.getElementById(containerId).innerHTML = `
        <div class="p-4 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg">
          图表库未加载，请刷新页面重试
        </div>
      `;
      return;
    }
    
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`容器 ${containerId} 不存在`);
      return;
    }

    const categories = chartOptions.radarChart.categories;
    const series = [];

    // 为每辆车生成数据
    cars.forEach((car) => {
      const data = [
        parseFloat(car.ratings.exterior.score) || 0,
        parseFloat(car.ratings.interior.score) || 0,
        parseFloat(car.ratings.space.score) || 0,
        parseFloat(car.ratings.power.score) || 0,
        parseFloat(car.ratings.handling.score) || 0,
        parseFloat(car.ratings.nvh.score) || 0,
        parseFloat(car.ratings.intelligence.score) || 0,
        parseFloat(car.ratings.fuelConsumption.score) || 0,
      ];

      series.push({
        name: `${car.brand} ${car.model}`,
        data: data,
        pointPlacement: "on",
      });
    });

    // 创建图表
    return window.Highcharts.chart(containerId, {
      chart: {
        polar: true,
        type: "line",
        backgroundColor: document.documentElement.classList.contains("dark")
          ? "#1f2937"
          : "#ffffff",
      },
      title: {
        text: "车型评分雷达图",
        style: {
          color: document.documentElement.classList.contains("dark")
            ? "#ffffff"
            : "#000000",
        },
      },
      credits: {
        enabled: false
      },
      pane: {
        size: "80%",
      },
      xAxis: {
        categories: categories,
        tickmarkPlacement: "on",
        lineWidth: 0,
        labels: {
          style: {
            color: document.documentElement.classList.contains("dark")
              ? "#d1d5db"
              : "#4b5563",
          },
        },
      },
      yAxis: {
        gridLineInterpolation: "polygon",
        lineWidth: 0,
        min: 0,
        max: 10,
        labels: {
          style: {
            color: document.documentElement.classList.contains("dark")
              ? "#d1d5db"
              : "#4b5563",
          },
        },
      },
      tooltip: {
        shared: true,
        pointFormat:
          '<span style="color:{series.color}">{series.name}: <b>{point.y:,.1f}</b><br/>',
      },
      legend: {
        itemStyle: {
          color: document.documentElement.classList.contains("dark")
            ? "#d1d5db"
            : "#4b5563",
        },
      },
      series: series,
      responsive: {
        rules: [
          {
            condition: {
              maxWidth: 500,
            },
            chartOptions: {
              legend: {
                align: "center",
                verticalAlign: "bottom",
              },
              pane: {
                size: "70%",
              },
            },
          },
        ],
      },
    });
  } catch (error) {
    console.error('渲染雷达图出错:', error);
    document.getElementById(containerId).innerHTML = `
      <div class="p-4 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg">
        图表渲染失败: ${error.message}
      </div>
    `;
  }
}

/**
 * 创建备用雷达图（使用SVG）
 * @param {string} containerId - 容器ID
 * @param {Array} cars - 车辆数组
 */
function createFallbackRadarChart(containerId, cars) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const categories = chartOptions.radarChart.categories;
  const categoryCount = categories.length;
  
  // 计算多边形顶点
  const getCoordinates = (value, index, total, radius) => {
    const angle = (Math.PI * 2 * index) / total;
    const adjustedValue = value / 10 * radius; // 最大值10调整到半径范围内
    return {
      x: adjustedValue * Math.sin(angle),
      y: -adjustedValue * Math.cos(angle)
    };
  };
  
  // 创建SVG
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  svg.setAttribute("viewBox", "-150 -150 300 300");
  
  // 是否为暗色模式
  const isDarkMode = document.documentElement.classList.contains("dark");
  const textColor = isDarkMode ? "#d1d5db" : "#4b5563";
  const gridColor = isDarkMode ? "#374151" : "#e5e7eb";
  const bgColor = isDarkMode ? "#1f2937" : "#ffffff";
  
  // 设置背景
  const background = document.createElementNS(svgNS, "rect");
  background.setAttribute("x", "-150");
  background.setAttribute("y", "-150");
  background.setAttribute("width", "300");
  background.setAttribute("height", "300");
  background.setAttribute("fill", bgColor);
  svg.appendChild(background);
  
  // 绘制网格线
  for (let r = 0; r <= 10; r += 2) {
    const circle = document.createElementNS(svgNS, "polygon");
    let points = "";
    
    for (let i = 0; i < categoryCount; i++) {
      const pos = getCoordinates(r, i, categoryCount, 10);
      points += `${pos.x * 10},${pos.y * 10} `;
    }
    
    circle.setAttribute("points", points);
    circle.setAttribute("fill", "none");
    circle.setAttribute("stroke", gridColor);
    circle.setAttribute("stroke-width", "0.5");
    svg.appendChild(circle);
  }
  
  // 绘制轴线
  for (let i = 0; i < categoryCount; i++) {
    const pos = getCoordinates(10, i, categoryCount, 10);
    
    const line = document.createElementNS(svgNS, "line");
    line.setAttribute("x1", "0");
    line.setAttribute("y1", "0");
    line.setAttribute("x2", pos.x * 10);
    line.setAttribute("y2", pos.y * 10);
    line.setAttribute("stroke", gridColor);
    line.setAttribute("stroke-width", "0.5");
    svg.appendChild(line);
    
    // 添加类别文本
    const label = document.createElementNS(svgNS, "text");
    const labelPos = getCoordinates(11, i, categoryCount, 10);
    label.setAttribute("x", labelPos.x * 10);
    label.setAttribute("y", labelPos.y * 10);
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("dominant-baseline", "middle");
    label.setAttribute("fill", textColor);
    label.setAttribute("font-size", "8");
    label.textContent = categories[i];
    svg.appendChild(label);
  }
  
  // 为每辆车绘制数据线
  const colors = ["#0284c7", "#16a34a", "#dc2626", "#9333ea", "#f97316", "#0891b2"];
  
  // 图例
  const legend = document.createElementNS(svgNS, "g");
  legend.setAttribute("transform", "translate(-140, -140)");
  
  cars.forEach((car, carIndex) => {
    const color = colors[carIndex % colors.length];
    
    // 绘制图例项
    const legendItem = document.createElementNS(svgNS, "g");
    legendItem.setAttribute("transform", `translate(0, ${carIndex * 15})`);
    
    const legendRect = document.createElementNS(svgNS, "rect");
    legendRect.setAttribute("width", "10");
    legendRect.setAttribute("height", "10");
    legendRect.setAttribute("fill", color);
    legendItem.appendChild(legendRect);
    
    const legendText = document.createElementNS(svgNS, "text");
    legendText.setAttribute("x", "15");
    legendText.setAttribute("y", "8");
    legendText.setAttribute("fill", textColor);
    legendText.setAttribute("font-size", "8");
    legendText.textContent = `${car.brand} ${car.model}`;
    legendItem.appendChild(legendText);
    
    legend.appendChild(legendItem);
    
    // 绘制数据线
    const polygon = document.createElementNS(svgNS, "polygon");
    let points = "";
    
    const data = [
      parseFloat(car.ratings.exterior.score) || 0,
      parseFloat(car.ratings.interior.score) || 0,
      parseFloat(car.ratings.space.score) || 0,
      parseFloat(car.ratings.power.score) || 0,
      parseFloat(car.ratings.handling.score) || 0,
      parseFloat(car.ratings.nvh.score) || 0,
      parseFloat(car.ratings.intelligence.score) || 0,
      parseFloat(car.ratings.fuelConsumption.score) || 0,
    ];
    
    for (let i = 0; i < categoryCount; i++) {
      const pos = getCoordinates(data[i], i, categoryCount, 10);
      points += `${pos.x * 10},${pos.y * 10} `;
    }
    
    polygon.setAttribute("points", points);
    polygon.setAttribute("fill", color);
    polygon.setAttribute("fill-opacity", "0.2");
    polygon.setAttribute("stroke", color);
    polygon.setAttribute("stroke-width", "2");
    svg.appendChild(polygon);
    
    // 绘制数据点
    for (let i = 0; i < categoryCount; i++) {
      const pos = getCoordinates(data[i], i, categoryCount, 10);
      
      const circle = document.createElementNS(svgNS, "circle");
      circle.setAttribute("cx", pos.x * 10);
      circle.setAttribute("cy", pos.y * 10);
      circle.setAttribute("r", "3");
      circle.setAttribute("fill", color);
      
      // 添加提示文本
      circle.setAttribute("data-value", data[i].toFixed(1));
      circle.setAttribute("data-category", categories[i]);
      circle.setAttribute("data-car", `${car.brand} ${car.model}`);
      
      svg.appendChild(circle);
    }
  });
  
  svg.appendChild(legend);
  
  // 添加标题
  const title = document.createElementNS(svgNS, "text");
  title.setAttribute("x", "0");
  title.setAttribute("y", "-130");
  title.setAttribute("text-anchor", "middle");
  title.setAttribute("fill", textColor);
  title.setAttribute("font-size", "12");
  title.setAttribute("font-weight", "bold");
  title.textContent = "车型评分雷达图";
  svg.appendChild(title);
  
  container.innerHTML = "";
  container.appendChild(svg);
  
  // 简单的提示功能
  const tooltip = document.createElement("div");
  tooltip.style.position = "absolute";
  tooltip.style.padding = "8px";
  tooltip.style.background = isDarkMode ? "#374151" : "#ffffff";
  tooltip.style.color = textColor;
  tooltip.style.border = "1px solid " + gridColor;
  tooltip.style.borderRadius = "4px";
  tooltip.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
  tooltip.style.display = "none";
  tooltip.style.zIndex = "1000";
  tooltip.style.fontSize = "12px";
  document.body.appendChild(tooltip);
  
  const circles = svg.querySelectorAll("circle");
  circles.forEach(circle => {
    circle.addEventListener("mouseover", function(e) {
      const value = this.getAttribute("data-value");
      const category = this.getAttribute("data-category");
      const car = this.getAttribute("data-car");
      
      tooltip.innerHTML = `
        <div><strong>${car}</strong></div>
        <div>${category}: ${value}</div>
      `;
      tooltip.style.display = "block";
      tooltip.style.left = (e.pageX + 10) + "px";
      tooltip.style.top = (e.pageY + 10) + "px";
    });
    
    circle.addEventListener("mousemove", function(e) {
      tooltip.style.left = (e.pageX + 10) + "px";
      tooltip.style.top = (e.pageY + 10) + "px";
    });
    
    circle.addEventListener("mouseout", function() {
      tooltip.style.display = "none";
    });
  });
  
  return svg;
}

/**
 * 加载PDF导出库
 * @returns {Promise} - 加载完成的Promise
 */
function loadPdfLibraries() {
  return Promise.all([
    loadScript('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js'),
    loadScript('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js')
  ]).catch(err => {
    console.error('加载PDF库失败:', err);
    throw new Error('加载PDF导出库失败，请检查网络连接');
  });
}

// 导出函数
export {
  loadChartLibraries,
  renderRadarChart,
  createFallbackRadarChart,
  loadPdfLibraries
}; 