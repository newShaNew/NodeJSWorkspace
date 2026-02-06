// 引入Express路由
const express = require('express');
const router = express.Router();
// 引入库存业务层
const inventoryService = require('../services/inventoryService');
// 引入统一响应工具
const { successResponse, errorResponse } = require('../utils/responseUtil');

/**
 * 查（多个）：多条件可选查询（仅openId必填，其他参数可为空）
 * POST /api/inventory/queryByParams
 */
router.post('/queryQcCode', async (req, res) => {
  try {
    const APPID = "wx5ea8e6f0e044efcd";
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

    // 3. 统一成功响应
    return successResponse(res, inventoryList, `查询成功，共找到${inventoryList.length}条数据`);
  } catch (error) {
    console.log(error)
    return errorResponse(res, error.message, 400, error.message);
  }
});

/**
 * 查（多个）：多条件可选查询（仅openId必填，其他参数可为空）
 * POST /api/inventory/queryByParams
 */
router.post('/queryByParams', async (req, res) => {
  try {
    // 1. 提取请求体参数，openId单独提取（必填），其余为可选参数
    const { openId, ...optionalParams } = req.body;

    // 2. 调用业务层方法（传递必填openId和可选参数）
    const inventoryList = await inventoryService.getInventoryByCondition(openId, optionalParams);

    // 3. 统一成功响应
    return successResponse(res, inventoryList, `查询成功，共找到${inventoryList.length}条数据`);
  } catch (error) {
    console.log(error)
    return errorResponse(res, error.message, 400, error.message);
  }
});

/**
 * 3. 增：新增库存
 * POST /api/inventory/add
 */
router.post('/add', async (req, res) => {
  try {
    const inventoryData = req.body;
    const result = await inventoryService.addInventory(inventoryData);
    return successResponse(res, result, '新增库存成功', 201); // 201表示创建成功
  } catch (error) {
    console.log(error)
    return errorResponse(res, error.message, 400, error.message);
  }
});

/**
 * 4. 改：更新库存
 * PUT /api/inventory/update/:id
 */
router.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const result = await inventoryService.updateInventory(id, updateData);
    return successResponse(res, result, '更新库存成功');
  } catch (error) {
    console.log(error)
    return errorResponse(res, error.message, 400, error.message);
  }
});


// 导出路由
module.exports = router;