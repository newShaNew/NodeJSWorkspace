// 引入Express路由
const express = require('express');
const router = express.Router();
// 引入位置信息业务层
const positionService = require('../services/positionService');
// 引入统一响应工具
const { successResponse, errorResponse } = require('../utils/responseUtil');

/**
 * 查（多个）：多条件可选查询（仅openId必填，其他参数可为空）
 * POST /api/position/queryByParams
 */
router.post('/queryByParams', async (req, res) => {
  try {
    // 1. 提取请求体参数，openId单独提取（必填），其余为可选参数
    const { openId, ...optionalParams } = req.body;

    // 2. 调用业务层方法（传递必填openId和可选参数）
    const positionList = await positionService.getPositionByCondition(openId, optionalParams);

    // 3. 统一成功响应
    return successResponse(res, positionList, `查询成功，共找到${positionList.length}条数据`);
  } catch (error) {
    console.log(error)
    return errorResponse(res, error.message, 400, error.message);
  }
});

/**
 * 3. 增：新增位置信息
 * POST /api/position/add
 */
router.post('/add', async (req, res) => {
  try {
    const positionData = req.body;
    const result = await positionService.addPosition(positionData);
    return successResponse(res, result, '新增位置信息成功', 201); // 201表示创建成功
  } catch (error) {
    console.log(error)
    return errorResponse(res, error.message, 400, error.message);
  }
});

/**
 * 4. 改：更新位置信息
 * PUT /api/position/update/:id
 */
router.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const result = await positionService.updatePosition(id, updateData);
    return successResponse(res, result, '更新位置信息成功');
  } catch (error) {
    console.log(error)
    return errorResponse(res, error.message, 400, error.message);
  }
});

/**
 * 5. 删：删除位置信息
 * DELETE /api/position/delete/:id
 */
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleteData = req.body;
    const result = await positionService.deletePosition(id, deleteData);
    return successResponse(res, result, '删除位置信息成功');
  } catch (error) {
    console.log(error)
    return errorResponse(res, error.message, 400, error.message);
  }
});

// 导出路由
module.exports = router;