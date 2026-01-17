// 导入库存数据访问层
const inventoryModel = require('../models/inventorytModel');


/**
 * 查：多条件可选查询（仅openId必填，其他参数可为空）
 * @param {string} openId - 小程序用户openId（必填）
 * @param {Object} optionalParams - 可选查询参数（可为空）
 * @returns {Promise<Array>} 处理后的库存列表
 */
const getInventoryByCondition = async (openId, optionalParams = {}) => {
  // 1. 仅校验openId为必填，其他参数不做非空校验
  if (!openId || openId.trim() === '') {
    throw new Error('openId不能为空');
  }

  // 2. 调用数据层方法，传递必填openId和可选参数
  const inventoryList = await inventoryModel.getInventoryByCondition(openId, optionalParams);

  // 3. 业务加工（格式化价格等，保持不变）
  const processedList = inventoryList.map(item => ({
    ...item,
    position: item.position ? item.position : '未知位置'
  }));

  return processedList;
};

/**
 * 增：新增库存
 * @param {Object} inventoryData - 库存数据对象（包含所有需要插入的字段）
 * @returns {Promise<Object>} 新增结果（包含插入的ID）
 */
const addInventory = async (inventoryData) => {
  return await inventoryModel.addInventory(inventoryData);
};

/**
 * 改：根据库存ID更新库存信息
 * @param {number} id - 库存ID
 * @param {Object} updateData - 要更新的库存数据（可选字段）
 * @returns {Promise<Object>} 更新结果
 */
const updateInventory = async (id, updateData) => {
  return await inventoryModel.updateInventory(id, updateData);
};

module.exports = {
  getInventoryByCondition,
  addInventory,
  updateInventory
};