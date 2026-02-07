// 引入Express路由
const express = require('express');
const router = express.Router();
// 引入用户业务层
const userService = require('../services/userService');
// 引入统一响应工具
const { successResponse, errorResponse } = require('../utils/responseUtil');


/**
 * 获取openId
 * POST /api/user/getOpenId
 */
router.post('/getOpenId', async (req, res) => {
  try {
    // 1. 提取请求体参数，openId单独提取（必填），其余为可选参数
    const { code } = req.body;
    if (!code) {
      return res.json({
        code: 400,
        message: '缺少必要参数code',
        data: null
      });
    }

    // 2. 调用业务层方法（传递必填openId和可选参数）
    const openId = await userService.getOpenId(code);

    // 3. 统一成功响应
    return successResponse(res, openId, `查询成功`);
  } catch (error) {
    console.log(error)
    return errorResponse(res, error.message, 400, error.message);
  }
});

/**
 * 查（多个）：多条件可选查询（仅openId必填，其他参数可为空）
 * POST /api/user/queryByParams
 */
router.post('/queryByParams', async (req, res) => {
  try {
    // 1. 提取请求体参数，openId单独提取（必填），其余为可选参数
    const { openId, ...optionalParams } = req.body;

    // 2. 调用业务层方法（传递必填openId和可选参数）
    const userList = await userService.getUserByCondition(openId, optionalParams);

    // 3. 统一成功响应
    return successResponse(res, userList, `查询成功，共找到${userList.length}条数据`);
  } catch (error) {
    console.log(error)
    return errorResponse(res, error.message, 400, error.message);
  }
});

/**
 * 3. 增：新增用户
 * POST /api/user/add
 */
router.post('/add', async (req, res) => {
  try {
    const userData = req.body;
    const result = await userService.addUser(userData);
    return successResponse(res, result, '新增用户成功', 201); // 201表示创建成功
  } catch (error) {
    console.log(error)
    return errorResponse(res, error.message, 400, error.message);
  }
});

/**
 * 4. 改：更新用户
 * PUT /api/user/update
 */
router.post('/update', async (req, res) => {
  try {
    const updateData = req.body;
    const result = await userService.updateUser(updateData);
    return successResponse(res, result, '更新用户成功');
  } catch (error) {
    console.log(error)
    return errorResponse(res, error.message, 400, error.message);
  }
});


// 导出路由
module.exports = router;