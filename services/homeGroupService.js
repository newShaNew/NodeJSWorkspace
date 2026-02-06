// 导入家庭组数据访问层
const homeGroupModel = require('../models/homeGroupModel');


/**
 * 查：多条件可选查询（仅openId必填，其他参数可为空）
 * @param {string} openId - 小程序用户openId（必填）
 * @returns {Promise<Array>} 处理后的家庭组列表
 */
const getHomeGroupByCondition = async (openId) => {
  // 1. 仅校验openId为必填，其他参数不做非空校验
  if (!openId || openId.trim() === '') {
    throw new Error('openId不能为空');
  }

  // 2. 调用数据层方法，传递必填openId和可选参数
  const processedList = await homeGroupModel.getHomeGroupByCondition(openId, optionalParams);

  // 3. 业务加工（格式化价格等，保持不变）
  // const processedList = homeGroupList.map(item => ({
  //   ...item,
  //   homeGroup: item.homeGroup ? item.homeGroup : '未知位置'
  // }));

  return processedList;
};

/**
 * 增：新增家庭组
 * @param {Object} homeGroupData - 家庭组数据对象（包含所有需要插入的字段）
 * @returns {Promise<Object>} 新增结果（包含插入的ID）
 */
const addHomeGroupMember = async (homeGroupData) => {

  return await homeGroupModel.addHomeGroupMember(homeGroupData);
};

/**
 * 增：新增家庭组成员
 * @param {Object} homeGroupData - 家庭组数据对象（包含所有需要插入的字段）
 * @returns {Promise<Object>} 新增结果（包含插入的ID）
 */
const addHomeGroup = async (homeGroupData) => {

  return await homeGroupModel.addHomeGroup(homeGroupData);
};

/**
 * 改：根据家庭组ID更新家庭组信息
 * @param {Object} updateData - 要更新的家庭组数据（可选字段）
 * @returns {Promise<Object>} 更新结果
 */
const updateHomeGroup = async (updateData) => {
  return await homeGroupModel.updateHomeGroup(updateData);

};

/**
 * 删：根据家庭组ID删除家庭组
 * @param {Object} deleteData - 要删除的家庭组数据
 * @returns {Promise<Object>} 删除结果
 */
const deleteHomeGroup = async (deleteData) => {
  return await homeGroupModel.deleteHomeGroup(deleteData);
};

/**
 * 删：根据家庭组ID删除家庭组
 * @param {Object} deleteData - 要删除的家庭组数据
 * @returns {Promise<Object>} 删除结果
 */
const deleteHomeGroupMember = async (deleteData) => {
  return await homeGroupModel.deleteHomeGroupMember(deleteData);
};

module.exports = {
  getHomeGroupByCondition,
  addHomeGroupMember,
  addHomeGroup,
  updateHomeGroup,
  deleteHomeGroup,
  deleteHomeGroupMember
};