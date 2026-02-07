// 导入数据库连接池
const pool = require('./db');

/**
 * 查：多条件可选查询（仅openId必填，其他参数可为空）
 * @param {string} openId - 小程序用户openId（必填）
 * @param {Object} optionalParams - 可选查询参数（categoryName、price等，可为空）
 * @returns {Promise<Array>} 分类信息列表
 */
const getCategoryByCondition = async (openId, optionalParams = {}) => {
  // 1. 基础SQL（必带openId条件，因为openId必填）
  let sql = 'SELECT * FROM category_table WHERE openId in (select openId from home_group_table where id = (select id from home_group_table where openId = ?) union all select ?) ORDER BY category';
  // 2. 存储所有查询参数（先放入必填的openId）
  const queryParams = [openId, openId];

  // 5. 执行参数化查询（无论条件多少，都用占位符，防SQL注入）
  let [rows] = await pool.query(sql, queryParams);

  if (rows == null || rows.length == 0) {
    addCategory({ 'openId': openId, 'category': '眼霜' });
    addCategory({ 'openId': openId, 'category': '可在设置中自定义分类信息' });
    rows = await pool.query(sql, queryParams);
  }
  return rows;
};

/**
 * 增：新增分类信息
 * @param {Object} categoryData - 分类信息数据
 * @returns {Promise<Object>} 新增结果（包含分类信息ID）
 */
const addCategory = async (categoryData) => {
  // 业务校验（核心字段不能为空）
  const { openId, category } = categoryData;
  if (!openId) throw new Error('openId不能为空');
  if (!category) throw new Error('名称不能为空');

  const sql = `
    INSERT INTO 
    category_table 
    (id,openId,category) 
    VALUES 
    (UUID(), ?, ?)
  `;
  const [result] = await pool.query(sql, [openId, category]);

  if (result.affectedRows === 0) {
    throw new Error('新增分类信息失败，请稍后重试');
  }

  // 返回新增分类信息的完整信息（包含ID）
  return {
    categoryId: result.id,
    message: '新增分类信息成功',
    ...categoryData
  };
};

/**
 * 改：更新分类信息
 * @param {number} id - 分类信息ID
 * @param {Object} updateData - 要更新的数据
 * @returns {Promise<Object>} 更新结果
 */
const updateCategory = async (id, updateData) => {

  // 业务校验（核心字段不能为空）
  const { openId, category, exCategory } = updateData;
  // 业务校验
  if (!id) throw new Error('分类信息ID无效');
  if (!openId) throw new Error('openId不能为空');

  const sql = `UPDATE category_table SET category = ? WHERE id = ? AND 
  openId in (select openId from home_group_table where id = (select id from home_group_table where openId = ?) union all select ?)`;
  const updateParams = [];
  updateParams.push(category);
  updateParams.push(id);
  updateParams.push(openId);
  updateParams.push(openId);
  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    await connection.execute(sql, updateParams)
    // 拼接完整SQL，最后添加WHERE条件（库存ID）
    const inventorySql = `UPDATE inventory_table SET category = ? WHERE category = ? AND 
      openId in (select openId from home_group_table where id = (select id from home_group_table where openId = ?) union all select ?)`;
    const updateInventoryParams = [];
    updateInventoryParams.push(category);
    updateInventoryParams.push(exCategory);
    updateInventoryParams.push(openId);
    updateInventoryParams.push(openId);
    await connection.execute(inventorySql, updateInventoryParams);

    await connection.commit();

  } catch (error) {
    await connection.rollback();
    console.error('Transaction failed:', error);
  }

  return {
    categoryId: id,
    message: '更新分类信息成功'
  };
};

/**
 * 删：删除分类信息
 * @param {number} id - 分类信息ID
 * @param {Object} deleteData - 要更新的分类信息数据（可选字段）
 * @returns {Promise<Object>} 删除结果
 */
const deleteCategory = async (id, deleteData) => {

  // 业务校验（核心字段不能为空）
  const { openId } = deleteData;
  // 业务校验
  if (!id) throw new Error('分类信息ID无效');
  if (!openId) throw new Error('openId不能为空');

  const sql = 'DELETE FROM category_table WHERE id = ? and openId in (select openId from home_group_table where id = (select id from home_group_table where openId = ?) union all select ?)';
  const [result] = await pool.query(sql, [id, openId, openId]);

  if (result.affectedRows === 0) {
    throw new Error('删除分类信息失败，请稍后重试');
  }

  return {
    categoryId: id,
    affectedRows: result.affectedRows,
    message: '删除分类信息成功'
  };
};

// 导出所有数据操作方法
module.exports = {
  getCategoryByCondition,
  addCategory,
  updateCategory,
  deleteCategory

};