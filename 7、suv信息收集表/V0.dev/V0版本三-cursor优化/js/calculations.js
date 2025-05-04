/**
 * 计算相关工具函数
 */

/**
 * 计算车辆总得分
 * @param {Object} car - 车辆对象
 * @returns {number} - 总分
 */
function calculateTotalScore(car) {
  const categories = [
    "exterior", 
    "interior", 
    "space", 
    "power", 
    "handling",
    "nvh", 
    "intelligence", 
    "fuelConsumption"
  ];
  
  let totalScore = 0;
  let validCategoryCount = 0;
  
  for (const category of categories) {
    if (car.ratings && car.ratings[category] && car.ratings[category].score) {
      totalScore += car.ratings[category].score;
      validCategoryCount++;
    }
  }
  
  return validCategoryCount > 0 ? totalScore / validCategoryCount : 0;
}

/**
 * 获取车辆所有优点
 * @param {Object} car - 车辆对象
 * @returns {Array} - 优点列表
 */
function getAllPros(car) {
  const allPros = [];
  
  if (car.ratings) {
    for (const category in car.ratings) {
      if (car.ratings[category].pros && Array.isArray(car.ratings[category].pros)) {
        allPros.push(...car.ratings[category].pros.filter(item => item.trim() !== ''));
      }
    }
  }
  
  return allPros;
}

/**
 * 获取车辆所有缺点
 * @param {Object} car - 车辆对象
 * @returns {Array} - 缺点列表
 */
function getAllCons(car) {
  const allCons = [];
  
  if (car.ratings) {
    for (const category in car.ratings) {
      if (car.ratings[category].cons && Array.isArray(car.ratings[category].cons)) {
        allCons.push(...car.ratings[category].cons.filter(item => item.trim() !== ''));
      }
    }
  }
  
  return allCons;
}

// 导出函数
export {
  calculateTotalScore,
  getAllPros,
  getAllCons
}; 