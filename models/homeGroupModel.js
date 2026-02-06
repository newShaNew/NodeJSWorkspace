// 导入数据库连接池
const pool = require('./db');

/**
 * 查：多条件可选查询（仅openId必填，其他参数可为空）
 * @param {string} openId - 小程序用户openId（必填）
 * @returns {Promise<Array>} 家庭组列表
 */
const getHomeGroupByCondition = async (openId) => {
  // 1. 基础SQL（必带openId条件，因为openId必填）
  let sql = 'SELECT * FROM home_group_table WHERE openId in (select openId from home_group_table where id = (select id from home_group_table where openId = ?) union all select ?) ';
  // 2. 存储所有查询参数（先放入必填的openId）
  const queryParams = [openId, openId];

  // 5. 执行参数化查询（无论条件多少，都用占位符，防SQL注入）
  const [rows] = await pool.query(sql, queryParams);
  return rows;
};

/**
 * 增：新增家庭组
 * @param {Object} homeGroupData - 家庭组数据
 * @returns {Promise<Object>} 新增结果（包含家庭组ID）
 */
const addHomeGroup = async (homeGroupData) => {
  // 业务校验（核心字段不能为空）
  const { openId } = homeGroupData;
  if (!openId) throw new Error('openId不能为空');

  const sql = `
    INSERT INTO 
    home_group_table 
    (id,openId,isOwner,nickName) 
    VALUES 
    (UUID(), ?, 1,(SELECT nickName FROM user_table WHERE openId = ?))
  `;
  const [result] = await pool.query(sql, [openId,openId]);

  if (result.affectedRows === 0) {
    throw new Error('新增家庭组失败，请稍后重试');
  }

  // 返回新增家庭组的完整信息（包含ID）
  return {
    homeGroupId: result.id,
    message: '新增家庭组成功',
    ...homeGroupData
  };
};

/**
 * 增：新增家庭组成员
 * @param {Object} homeGroupData - 家庭组数据
 * @returns {Promise<Object>} 新增结果（包含家庭组ID）
 */
const addHomeGroupMember = async (homeGroupData) => {
  // 业务校验（核心字段不能为空）
  const { openId, inviterOpenId } = homeGroupData;
  if (!openId) throw new Error('openId不能为空');
  if (!inviterOpenId) throw new Error('邀请者openId不能为空');

  const sql = `
    INSERT INTO 
    home_group_table 
    (id,openId) 
    VALUES 
    ((SELECT id FROM home_group_table WHERE openId = ?), ?)
  `;
  const [result] = await pool.query(sql, [inviterOpenId, openId]);

  if (result.affectedRows === 0) {
    throw new Error('新增家庭组失败，请稍后重试');
  }

  // 返回新增家庭组的完整信息（包含ID）
  return {
    homeGroupId: result.id,
    message: '新增家庭组成功',
    ...homeGroupData
  };
};

/**
 * 改：更新家庭组
 * @param {Object} updateData - 要更新的数据
 * @returns {Promise<Object>} 更新结果
 */
const updateHomeGroup = async (updateData) => {

  // 业务校验（核心字段不能为空）
  const { openId,nickName } = updateData;
  // 业务校验
  if (!openId) throw new Error('openId不能为空');

  // 先校验家庭组是否存在
  const existingHomeGroup = await getHomeGroupByCondition(id);
  if (!existingHomeGroup) {
    throw new Error('该家庭组不存在或已被删除，无法更新');
  }

  const sql = `UPDATE homeGroup_table SET nickName = ? WHERE openId = ?`;
  const updateParams = [];
  updateParams.push(nickName);
  updateParams.push(openId);

  const [result] = await pool.query(sql, updateParams);
  if (result.affectedRows === 0) {
    throw new Error('更新家庭组失败，请稍后重试');
  }

  return {
    homeGroupId: id,
    affectedRows: result.affectedRows,
    changedRows: result.changedRows,
    message: '更新家庭组成功'
  };
};

/**
 * 删：删除家庭组
 * @param {Object} deleteData - 要更新的家庭组数据（可选字段）
 * @returns {Promise<Object>} 删除结果
 */
const deleteHomeGroup = async (id, deleteData) => {

  // 业务校验（核心字段不能为空）
  const { openId } = deleteData;
  // 业务校验
  if (!openId) throw new Error('openId不能为空');

  // 先校验家庭组是否存在
  const existingHomeGroup = await getHomeGroupByCondition(openId);
  if (!existingHomeGroup) {
    throw new Error('该家庭组不存在或已被删除，无需重复删除');
  }

  const sql = 'DELETE FROM homeGroup_table WHERE openId in (select openId from home_group_table where id = (select id from home_group_table where openId = ?) union all select ?)';
  const [result] = await pool.query(sql, [openId, openId]);

  if (result.affectedRows === 0) {
    throw new Error('删除家庭组失败，请稍后重试');
  }

  return {
    affectedRows: result.affectedRows,
    message: '删除家庭组成功'
  };
};

/**
 * 删：删除家庭组成员
 * @param {Object} deleteData - 要更新的家庭组数据（可选字段）
 * @returns {Promise<Object>} 删除结果
 */
const deleteHomeGroupMember = async (deleteData) => {

  // 业务校验（核心字段不能为空）
  const { openId } = deleteData;
  // 业务校验
  if (!openId) throw new Error('openId不能为空');

  // 先校验家庭组是否存在
  const existingHomeGroup = await getHomeGroupByCondition(id);
  if (!existingHomeGroup) {
    throw new Error('该家庭组不存在或已被删除，无需重复删除');
  }

  const sql = 'DELETE FROM homeGroup_table WHERE openId = ?';
  const [result] = await pool.query(sql, [openId]);

  if (result.affectedRows === 0) {
    throw new Error('删除家庭组失败，请稍后重试');
  }

  return {
    affectedRows: result.affectedRows,
    message: '删除家庭组成功'
  };
};

// 导出所有数据操作方法
module.exports = {
  getHomeGroupByCondition,
  addHomeGroup,
  addHomeGroupMember,
  updateHomeGroup,
  deleteHomeGroup,
  deleteHomeGroupMember

};