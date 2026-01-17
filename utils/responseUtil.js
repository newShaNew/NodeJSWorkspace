/**
 * 统一成功响应
 * @param {Object} res - Express的响应对象
 * @param {any} data - 要返回的数据（可选，默认null）
 * @param {string} message - 成功提示信息（可选，默认"操作成功"）
 * @param {number} code - 成功状态码（可选，默认200）
 */
const successResponse = (res, data = null, message = '操作成功', code = 200) => {
  return res.status(code).json({
    code,        // 状态码（200成功，400参数错误，500服务器错误等）
    message,     // 提示信息
    data,        // 业务数据（查询结果、新增结果等，无数据则为null）
    timestamp: new Date().getTime() // 时间戳（可选，方便排查问题）
  });
};

/**
 * 统一失败响应
 * @param {Object} res - Express的响应对象
 * @param {string} message - 失败提示信息（可选，默认"操作失败"）
 * @param {number} code - 失败状态码（可选，默认500）
 * @param {any} error - 错误详情（可选，仅开发环境返回，线上环境可隐藏）
 */
const errorResponse = (res, message = '操作失败', code = 500, error = null) => {
  return res.status(code).json({
    code,
    message,
    data: null,
    timestamp: new Date().getTime(),
    ...(error && { error }) // 仅当有error时，才返回error字段（可选）
  });
};

module.exports = {
  successResponse,
  errorResponse
};