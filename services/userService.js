// 导入用户数据访问层
const userModel = require('../models/userModel');
const axios = require('axios');


/**
 * 查openid
 * @param {string} code - 小程序用户openId（必填）
 * @returns {Promise<Array>} 处理后的用户列表
 */
const getOpenId = async (code) => {
  // 1. 仅校验openId为必填，其他参数不做非空校验
  if (!code || code.trim() === '') {
    throw new Error('openId不能为空');
  }

  const APPID = "wx5ea8e6f0e044efcd";
  const APPSECRET = "1da5c4a90ef3ae13b8b73c72aa58ec83";
  // 步骤2：后端调用微信官方jscode2session接口
  const wxApiUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${APPID}&secret=${APPSECRET}&js_code=${code}&grant_type=authorization_code`;
  const wxRes = await axios.get(wxApiUrl);
  const wxData = wxRes.data;

  // 步骤3：判断微信接口返回结果
  if (wxData.errcode) {
    return res.json({
      code: 500,
      message: `换取openId失败：${wxData.errmsg}`,
      data: null
    });
  }

  // 步骤4：提取openId（可按需存储到数据库，再返回给前端）
  const { openid, session_key } = wxData;

  // 查询是否为第一次登入
  const processedList = await userModel.getUserByCondition(openId);

  // 是的话user表添加数据
  if (!processedList) userModel.addUser(userData);
  // return res.json({
  //   code: 200,
  //   message: '获取openId成功',
  //   data: {
  //     openId: openid, // 返回openId给前端
  //     sessionKey: session_key // 可选，若前端需要解密用户信息可返回（需妥善保管）
  //   }
  // });

  return openid;
};

/**
 * 查：多条件可选查询（仅openId必填，其他参数可为空）
 * @param {string} openId - 小程序用户openId（必填）
 * @returns {Promise<Array>} 处理后的用户列表
 */
const getUserByCondition = async (openId) => {
  // 1. 仅校验openId为必填，其他参数不做非空校验
  if (!openId || openId.trim() === '') {
    throw new Error('openId不能为空');
  }

  // 2. 调用数据层方法，传递必填openId和可选参数
  const processedList = await userModel.getUserByCondition(openId);

  // 3. 业务加工（格式化价格等，保持不变）
  // const processedList = userList.map(item => ({
  //   ...item,
  //   user: item.user ? item.user : '未知位置'
  // }));

  return processedList;
};

/**
 * 增：新增用户
 * @param {Object} userData - 用户数据对象（包含所有需要插入的字段）
 * @returns {Promise<Object>} 新增结果（包含插入的ID）
 */
const addUser = async (userData) => {

  return await userModel.addUser(userData);
};

/**
 * 改：根据用户ID更新用户信息
 * @param {number} id - 用户ID
 * @param {Object} updateData - 要更新的用户数据（可选字段）
 * @returns {Promise<Object>} 更新结果
 */
const updateUser = async (id, updateData) => {
  return await userModel.updateUser(id, updateData);

};


module.exports = {
  getOpenId,
  getUserByCondition,
  addUser,
  updateUser
};