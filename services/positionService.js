// 导入位置信息数据访问层
const positionModel = require('../models/positionModel');


/**
 * 查：多条件可选查询（仅openId必填，其他参数可为空）
 * @param {string} openId - 小程序用户openId（必填）
 * @param {Object} optionalParams - 可选查询参数（可为空）
 * @returns {Promise<Array>} 处理后的位置信息列表
 */
const getPositionByCondition = async (openId, optionalParams = {}) => {
  // 1. 仅校验openId为必填，其他参数不做非空校验
  if (!openId || openId.trim() === '') {
    throw new Error('openId不能为空');
  }

  // 2. 调用数据层方法，传递必填openId和可选参数
  const processedList = await positionModel.getPositionByCondition(openId, optionalParams);

  // 3. 业务加工（格式化价格等，保持不变）
  // const processedList = positionList.map(item => ({
  //   ...item,
  //   position: item.position ? item.position : '未知位置'
  // }));

  return processedList;
};

/**
 * 增：新增位置信息
 * @param {Object} positionData - 位置信息数据对象（包含所有需要插入的字段）
 * @returns {Promise<Object>} 新增结果（包含插入的ID）
 */
const addPosition = async (positionData) => {

  return await positionModel.addPosition(positionData);
};

/**
 * 改：根据位置信息ID更新位置信息信息
 * @param {number} id - 位置信息ID
 * @param {Object} updateData - 要更新的位置信息数据（可选字段）
 * @returns {Promise<Object>} 更新结果
 */
const updatePosition = async (id, updateData) => {
  return await positionModel.updatePosition(id, updateData);

};

/**
 * 删：根据位置信息ID删除位置信息
 * @param {number} id - 位置信息ID
 * @param {Object} deleteData - 要删除的位置信息数据
 * @returns {Promise<Object>} 删除结果
 */
const deletePosition = async (id, deleteData) => {
  return await positionModel.deletePosition(id, deleteData);
};

module.exports = {
  getPositionByCondition,
  addPosition,
  updatePosition,
  deletePosition
};