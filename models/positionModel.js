// 导入数据库连接池
const pool = require('./db');

/**
 * 查：多条件可选查询（仅openId必填，其他参数可为空）
 * @param {string} openId - 小程序用户openId（必填）
 * @param {Object} optionalParams - 可选查询参数（positionName、price等，可为空）
 * @returns {Promise<Array>} 位置信息列表
 */
const getPositionByCondition = async (openId, optionalParams = {}) => {
  // 1. 基础SQL（必带openId条件，因为openId必填）
  let sql = 'SELECT * FROM position_table WHERE openId in (select openId from home_group_table where id = (select id from home_group_table where openId = ?) union all select ?) ORDER BY position';
  // 2. 存储所有查询参数（先放入必填的openId）
  const queryParams = [openId, openId];

  // 5. 执行参数化查询（无论条件多少，都用占位符，防SQL注入）
  let [rows] = await pool.query(sql, queryParams);
  // 为空的话插入默认数据
  if (rows == null || rows.length == 0) {
    addPosition({ 'openId': openId, 'position': '客厅' });
    addPosition({ 'openId': openId, 'position': '客可在设置中自定义位置信息' });
    rows = await pool.query(sql, queryParams);
  }
  return rows;
};

/**
 * 增：新增位置信息
 * @param {Object} positionData - 位置信息数据
 * @returns {Promise<Object>} 新增结果（包含位置信息ID）
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
    throw new Error('新增位置信息失败，请稍后重试');
  }

  // 返回新增位置信息的完整信息（包含ID）
  return {
    positionId: result.id,
    message: '新增位置信息成功',
    ...positionData
  };
};

/**
 * 改：更新位置信息
 * @param {number} id - 位置信息ID
 * @param {Object} updateData - 要更新的数据
 * @returns {Promise<Object>} 更新结果
 */
const updatePosition = async (id, updateData) => {

  // 业务校验（核心字段不能为空）
  const { openId, position, exPosition } = updateData;
  // 业务校验
  if (!id) throw new Error('位置信息ID无效');
  if (!openId) throw new Error('openId不能为空');

  const sql = `UPDATE position_table SET position = ? WHERE id = ? AND
   openId in (select openId from home_group_table where id = (select id from home_group_table where openId = ?) union all select ?)`;
  const updateParams = [];
  updateParams.push(position);
  updateParams.push(id);
  updateParams.push(openId);
  updateParams.push(openId);
  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    await connection.execute(sql, updateParams)
    // 拼接完整SQL，最后添加WHERE条件（库存ID）
    const inventorySql = `UPDATE inventory_table SET position = ? WHERE position = ? AND 
      openId in (select openId from home_group_table where id = (select id from home_group_table where openId = ?) union all select ?)`;
    const updateInventoryParams = [];
    updateInventoryParams.push(position);
    updateInventoryParams.push(exPosition);
    updateInventoryParams.push(openId);
    updateInventoryParams.push(openId);
    await connection.execute(inventorySql, updateInventoryParams);

    await connection.commit();

  } catch (error) {
    await connection.rollback();
    console.error('Transaction failed:', error);
  }

  return {
    positionId: id,
    message: '更新位置信息成功'
  };
};

/**
 * 删：删除位置信息
 * @param {number} id - 位置信息ID
 * @param {Object} deleteData - 要更新的位置信息数据（可选字段）
 * @returns {Promise<Object>} 删除结果
 */
const deletePosition = async (id, deleteData) => {

  // 业务校验（核心字段不能为空）
  const { openId } = deleteData;
  // 业务校验
  if (!id) throw new Error('位置信息ID无效');
  if (!openId) throw new Error('openId不能为空');

  const sql = 'DELETE FROM position_table WHERE id = ? and openId in (select openId from home_group_table where id = (select id from home_group_table where openId = ?) union all select ?)';
  const [result] = await pool.query(sql, [id, openId, openId]);

  if (result.affectedRows === 0) {
    throw new Error('删除位置信息失败，请稍后重试');
  }

  return {
    positionId: id,
    affectedRows: result.affectedRows,
    message: '删除位置信息成功'
  };
};

// 导出所有数据操作方法
module.exports = {
  getPositionByCondition,
  addPosition,
  updatePosition,
  deletePosition

};