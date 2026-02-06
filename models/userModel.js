const util = require('../utils/stringUtil');

// 导入数据库连接池
const pool = require('./db');

/**
 * 查：多条件可选查询（仅openId必填，其他参数可为空）
 * @param {string} openId - 小程序用户openId（必填）
 * @returns {Promise<Array>} 用户列表
 */
const getUserByCondition = async (openId) => {
  // 1. 基础SQL（必带openId条件，因为openId必填）
  let sql = 'SELECT * FROM user_table WHERE openId = ? ';
  // 2. 存储所有查询参数（先放入必填的openId）
  const queryParams = [openId];

  // 5. 执行参数化查询（无论条件多少，都用占位符，防SQL注入）
  const [rows] = await pool.query(sql, queryParams);
  return rows;
};

/**
 * 增：新增用户
 * @param {Object} userData - 用户数据
 * @returns {Promise<Object>} 新增结果（包含用户ID）
 */
const addUser = async (userData) => {
  // 业务校验（核心字段不能为空）
  const { openId, user } = userData;
  if (!openId) throw new Error('openId不能为空');

  const sql = `
    INSERT INTO 
    user_table 
    (openId,nickName) 
    VALUES 
    ( ?, ?)
  `;
  const [result] = await pool.query(sql, [openId, util.generateNicknames()]);

  if (result.affectedRows === 0) {
    throw new Error('新增用户失败，请稍后重试');
  }

  // 返回新增用户的完整信息（包含ID）
  return {
    userId: result.id,
    message: '新增用户成功',
    ...userData
  };
};

/**
 * 改：更新用户
 * @param {Object} updateData - 要更新的数据
 * @returns {Promise<Object>} 更新结果
 */
const updateUser = async (updateData) => {

  // 业务校验（核心字段不能为空）
  const { openId, nickName } = updateData;
  // 业务校验
  if (!openId) throw new Error('openId不能为空');

  // 先校验用户是否存在
  const existingUser = await getUserByCondition(openId);
  if (!existingUser) {
    throw new Error('该用户不存在或已被删除，无法更新');
  }

  const sql = `UPDATE user_table SET nickName = ? WHERE openId = ?`;
  const updateParams = [];
  updateParams.push(nickName);
  updateParams.push(openId);

  const [result] = await pool.query(sql, updateParams);
  if (result.affectedRows === 0) {
    throw new Error('更新用户失败，请稍后重试');
  }

  return {
    openId: openId,
    affectedRows: result.affectedRows,
    changedRows: result.changedRows,
    message: '更新用户成功'
  };
};


// 导出所有数据操作方法
module.exports = {
  getUserByCondition,
  addUser,
  updateUser

};