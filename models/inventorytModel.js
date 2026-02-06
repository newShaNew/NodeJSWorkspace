// 导入数据库连接池
const pool = require('./db');

/**
 * 查：多条件可选查询（仅openId必填，其他参数可为空）
 * @param {string} openId - 小程序用户openId（必填）
 * @param {Object} optionalParams - 可选查询参数（inventoryName、price等，可为空）
 * @returns {Promise<Array>} 库存列表
 */
const getInventoryByCondition = async (openId, optionalParams = {}) => {
  // 1. 基础SQL（必带openId条件，因为openId必填）
  let sql = 'SELECT * FROM inventory_table WHERE openId in (select openId from home_group_table where id = (select id from home_group_table where openId = ?) union all select ?)';
  // 2. 存储所有查询参数（先放入必填的openId）
  const queryParams = [openId,openId];

  // 3. 解构可选参数（根据你的业务需求扩展，如price、description等）
  const { id, inventoryName, date, position, category, isDelete, showIndex, sort, order } = optionalParams;

  if (id && !id.trim() !== '') {
    sql += ' AND id = ?';
    queryParams.push(id.trim());
  }

  if (inventoryName && inventoryName.trim() !== '') {
    sql += ' AND inventoryName LIKE CONCAT("%", ?, "%")';
    queryParams.push(inventoryName.trim());
  }

  if (date && !id.trim() !== '') {
    if (date == '0') {
      sql += ' AND date < NOW()';
    } else {
      sql += ' AND date >= NOW()';
    }
  }

  if (isDelete && !isDelete.trim() !== '') {
    sql += ' AND isDelete = ?';
    queryParams.push(isDelete.trim());
  }

  if (showIndex && !showIndex.trim() !== '') {
    sql += ' AND showIndex = ?';
    queryParams.push(showIndex.trim());
  }

  if (category && Array.isArray(category) && category.length > 0) {
    // 过滤数组中的无效值（空字符串、undefined、null）
    const validCategory = category.filter(item => item && item.trim() !== '');
    if (validCategory.length > 0) {
      // 拼接占位符：根据有效数组长度，生成 "?, ?, ..."
      const placeholders = validCategory.map(() => '?').join(', ');
      // 拼接IN条件SQL
      sql += ` AND category IN (${placeholders})`;
      // 将有效数组元素追加到查询参数列表（参数化查询，防SQL注入）
      queryParams.push(...validCategory);
    }
  }

  if (position && Array.isArray(position) && position.length > 0) {
    const validPosition = category.filter(item => item && item.trim() !== '');
    if (validPosition.length > 0) {
      const placeholders = validPosition.map(() => '?').join(', ');
      sql += ` AND position IN (${placeholders})`;
      queryParams.push(...validPosition);
    }
  }

  if (sort && !sort.trim() !== '') {
    sql += ' ORDER BY ' + sort + ' ' + order;
  }

  // 5. 执行参数化查询（无论条件多少，都用占位符，防SQL注入）
  const [rows] = await pool.query(sql, queryParams);
  return rows;
};

/**
 * 增：新增库存
 * @param {Object} inventoryData - 库存数据
 * @returns {Promise<Object>} 新增结果（包含库存ID）
 */
const addInventory = async (inventoryData) => {
  // 业务校验（核心字段不能为空）
  const { openId, inventoryName, category, position, date, quantity, description, showIndex, capacity } = inventoryData;
  if (!openId) throw new Error('openId不能为空');
  if (!inventoryName) throw new Error('名称不能为空');
  if (!category) throw new Error('品类不能为空');
  if (!position) throw new Error('位置不能为空');
  if (!date) throw new Error('日期不能为空');
  if (!quantity || isNaN(Number(quantity)) || Number(quantity) < 0) {
    throw new Error('数量无效，必须为非负数字');
  }

  const sql = `
    INSERT INTO inventory_table (
      id,openId,category,
      inventoryName,quantity,date,
      position,description,showIndex,
      capacity,insertDate,isDelete) 
    VALUES (
      UUID(),?, ?,
      ?, ?, ?,
      ?, ?, ?,
      ?, NOW(), 0)
  `;
  const [result] = await pool.query(sql, [
    openId, category,
    inventoryName, quantity, date,
    position, description, showIndex,
    capacity]);

  if (result.affectedRows === 0) {
    throw new Error('新增库存失败，请稍后重试');
  }

  // 返回新增库存的完整信息（包含ID）
  return {
    inventoryId: result.id,
    message: '新增库存成功',
    ...inventoryData
  };
};

/**
 * 改：更新库存
 * @param {number} id - 库存ID
 * @param {Object} updateData - 要更新的数据
 * @returns {Promise<Object>} 更新结果
 */
const updateInventory = async (id, updateData) => {

  // 业务校验（核心字段不能为空）
  const { openId, category, inventoryName,
    quantity, date, position,
    description, showIndex, capacity,
    isDelete } = updateData;
  // 业务校验
  if (!id) throw new Error('库存ID无效，必须为有效数字');
  if (!openId) throw new Error('openId不能为空');

  // 先校验库存是否存在
  const existingInventory = await getInventoryByCondition(id);
  if (!existingInventory) {
    throw new Error('该库存不存在或已被删除，无法更新');
  }
  const updateFields = [];
  const updateParams = [];

  // 遍历要更新的数据，拼接字段和参数（根据你的表字段扩展）
  if (category) {
    updateFields.push('category = ?');
    updateParams.push(category);
  }
  if (inventoryName) {
    updateFields.push('inventoryName = ?');
    updateParams.push(inventoryName);
  }
  if (quantity) {
    updateFields.push('quantity = ?');
    updateParams.push(quantity);
  }
  if (date) {
    updateFields.push('date = ?');
    updateParams.push(date);
  }
  if (position) {
    updateFields.push('position = ?');
    updateParams.push(position);
  }
  if (description) {
    updateFields.push('description = ?');
    updateParams.push(description);
  }
  if (showIndex) {
    updateFields.push('showIndex = ?');
    updateParams.push(showIndex);
  }
  if (capacity) {
    updateFields.push('capacity = ?');
    updateParams.push(capacity);
  }
  if (isDelete) {
    updateFields.push('isDelete = ?');
    updateParams.push(isDelete);
  }
  updateFields.push('updateDate = NOW()');

  // 若无更新字段，直接返回空结果
  if (updateFields.length === 0) {
    return { affectedRows: 0 };
  }

  // 拼接完整SQL，最后添加WHERE条件（库存ID）
  const sql = `UPDATE inventory_table SET ${updateFields.join(', ')} WHERE id = ? AND 
  openId in (select openId from home_group_table where id = (select id from home_group_table where openId = ?) union all select ?)`;
  updateParams.push(id); // 把库存ID加入参数列表（对应WHERE后的?）
  updateParams.push(openId);
  updateParams.push(openId);

  const [result] = await pool.query(sql, updateParams);
  if (result.affectedRows === 0) {
    throw new Error('更新库存失败，请稍后重试');
  }

  return {
    inventoryId: id,
    affectedRows: result.affectedRows,
    changedRows: result.changedRows,
    message: '更新库存成功'
  };
};

// 导出所有数据操作方法
module.exports = {
  getInventoryByCondition,
  addInventory,
  updateInventory

};