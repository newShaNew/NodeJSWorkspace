const express = require('express');
const cors = require('cors');
// 导入路由汇总
const mountRoutes = require('./routes');
// 导入统一响应工具（可选，这里仅做配置）

const app = express();
const port = 3000;

// 1. 配置全局中间件
app.use(cors()); // 解决跨域
app.use(express.json()); // 解析JSON请求体
app.use(express.urlencoded({ extended: true })); // 解析urlencoded请求体

// 2. 挂载所有路由
mountRoutes(app);

// 3. 启动后端服务
app.listen(port, () => {
  console.log(`后端服务已启动，监听端口：${port}`);
  console.log(`库存接口示例：http://localhost:${port}/api/inventory/queryByParams`);
  console.log(`库存详情接口示例：http://localhost:${port}/api/inventory/queryById/1`);
});