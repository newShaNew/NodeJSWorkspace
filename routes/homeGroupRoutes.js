// 引入Express路由
const express = require('express');
const router = express.Router();
// 引入家庭组业务层
const homeGroupService = require('../services/homeGroupService');
// 引入统一响应工具
const { successResponse, errorResponse } = require('../utils/responseUtil');

/**
 * 查（多个）：多条件可选查询（仅openId必填，其他参数可为空）
 * POST /api/homeGroup/queryByParams
 */
router.post('/queryByParams', async (req, res) => {
  try {
    // 1. 提取请求体参数，openId单独提取（必填），其余为可选参数
    const { openId } = req.body;

    // 2. 调用业务层方法（传递必填openId和可选参数）
    const homeGroupList = await homeGroupService.getHomeGroupByCondition(openId);

    // 3. 统一成功响应
    return successResponse(res, homeGroupList, `查询成功，共找到${homeGroupList.length}条数据`);
  } catch (error) {
    console.log(error)
    return errorResponse(res, error.message, 400, error.message);
  }
});

/**
 * 3. 增：新增家庭组
 * POST /api/homeGroup/add
 */
router.post('/add', async (req, res) => {
  try {
    const homeGroupData = req.body;
    const result = await homeGroupService.addHomeGroup(homeGroupData);
    return successResponse(res, result, '新增家庭组成功', 201); // 201表示创建成功
  } catch (error) {
    console.log(error)
    return errorResponse(res, error.message, 400, error.message);
  }
});

/**
 * 3. 增：新增家庭组
 * POST /api/homeGroup/add
 */
router.post('/addMember', async (req, res) => {
  try {
    const homeGroupData = req.body;
    const result = await homeGroupService.addHomeGroupMember(homeGroupData);
    return successResponse(res, result, '新增家庭组成功', 201); // 201表示创建成功
  } catch (error) {
    console.log(error)
    return errorResponse(res, error.message, 400, error.message);
  }
});

/**
 * 4. 改：更新家庭组
 * PUT /api/homeGroup/update
 */
router.put('/update', async (req, res) => {
  try {
    const updateData = req.body;
    const result = await homeGroupService.updateHomeGroup(updateData);
    return successResponse(res, result, '更新家庭组成功');
  } catch (error) {
    console.log(error)
    return errorResponse(res, error.message, 400, error.message);
  }
});

/**
 * 5. 删：删除家庭组
 * DELETE /api/homeGroup/delete
 */
router.delete('/delete', async (req, res) => {
  try {
    const deleteData = req.body;
    const result = await homeGroupService.deleteHomeGroup( deleteData);
    return successResponse(res, result, '删除家庭组成功');
  } catch (error) {
    console.log(error)
    return errorResponse(res, error.message, 400, error.message);
  }
});

/**
 * 5. 删：删除家庭组
 * DELETE /api/homeGroup/delete
 */
router.delete('/deleteMember', async (req, res) => {
  try {
    const deleteData = req.body;
    const result = await homeGroupService.deleteHomeGroupMember( deleteData);
    return successResponse(res, result, '删除家庭组成功');
  } catch (error) {
    console.log(error)
    return errorResponse(res, error.message, 400, error.message);
  }
});

// 导出路由
module.exports = router;