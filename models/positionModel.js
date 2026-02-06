// 导入数据库连接池
const pool = require('./db');

/**
 * 查：多条件可选查询（仅openId必填，其他参数可为空）
 * @param {string} openId - 小程序用户openId（必填）
 * @param {Object} optionalParams - 可选查询参数（positionName、price等，可为空）
 * @returns {Promise<Array>} 库存列表
 */
const getPositionByCondition = async (openId, optionalParams = {}) => {
  // 1. 基础SQL（必带openId条件，因为openId必填）
  let sql = 'SELECT * FROM position_table WHERE openId in (select openId from home_group_table where id = (select id from home_group_table where openId = ?) union all select ?) ORDER BY position';
  // 2. 存储所有查询参数（先放入必填的openId）
  const queryParams = [openId,openId];

  // 5. 执行参数化查询（无论条件多少，都用占位符，防SQL注入）
  const [rows] = await pool.query(sql, queryParams);
  return rows;
};

/**
 * 增：新增库存
 * @param {Object} positionData - 库存数据
 * @returns {Promise<Object>} 新增结果（包含库存ID）
 */
const addPosition = async (positionData) => {
  // 业务校验（核心字段不能为空）
  const { openId, position } = positionData;
  if (!openId) throw new Error('openId不能为空');
  if (!position) throw new Error('名称不能为空');

  const sql = `
    INSERT INTO 
    position_table 
    (id,openId,position) 
    VALUES 
    (UUID(), ?, ?)
  `;
  const [result] = await pool.query(sql, [openId, position]);

  if (result.affectedRows === 0) {
    throw new Error('新增库存失败，请稍后重试');
  }

  // 返回新增库存的完整信息（包含ID）
  return {
    positionId: result.id,
    message: '新增库存成功',
    ...positionData
  };
};

/**
 * 改：更新库存
 * @param {number} id - 库存ID
 * @param {Object} updateData - 要更新的数据
 * @returns {Promise<Object>} 更新结果
 */
const updatePosition = async (id, updateData) => {

  // 业务校验（核心字段不能为空）
  const { openId, position } = updateData;
  // 业务校验
  if (!id) throw new Error('库存ID无效');
  if (!openId) throw new Error('openId不能为空');

  // 先校验库存是否存在
  const existingPosition = await getPositionByCondition(id);
  if (!existingPosition) {
    throw new Error('该库存不存在或已被删除，无法更新');
  }

  const sql = `UPDATE position_table SET position = ? WHERE id = ? AND
   openId in (select openId from home_group_table where id = (select id from home_group_table where openId = ?) union all select ?)`;
  const updateParams = [];
  updateParams.push(position);
  updateParams.push(id);
  updateParams.push(openId);
  updateParams.push(openId);

  const [result] = await pool.query(sql, updateParams);
  if (result.affectedRows === 0) {
    throw new Error('更新库存失败，请稍后重试');
  }

  return {
    positionId: id,
    affectedRows: result.affectedRows,
    changedRows: result.changedRows,
    message: '更新库存成功'
  };
};

/**
 * 删：删除库存
 * @param {number} id - 库存ID
 * @param {Object} deleteData - 要更新的库存数据（可选字段）
 * @returns {Promise<Object>} 删除结果
 */
const deletePosition = async (id, deleteData) => {

  // 业务校验（核心字段不能为空）
  const { openId } = deleteData;
  // 业务校验
  if (!id) throw new Error('库存ID无效');
  if (!openId) throw new Error('openId不能为空');

  // 先校验库存是否存在
  const existingPosition = await getPositionByCondition(id);
  if (!existingPosition) {
    throw new Error('该库存不存在或已被删除，无需重复删除');
  }

  const sql = 'DELETE FROM position_table WHERE id = ? and openId in (select openId from home_group_table where id = (select id from home_group_table where openId = ?) union all select ?)';
  const [result] = await pool.query(sql, [id, openId,openId]);

  if (result.affectedRows === 0) {
    throw new Error('删除库存失败，请稍后重试');
  }

  return {
    positionId: id,
    affectedRows: result.affectedRows,
    message: '删除库存成功'
  };
};

// 导出所有数据操作方法
module.exports = {
  getPositionByCondition,
  addPosition,
  updatePosition,
  deletePosition

};