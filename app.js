const express = require('express');
const cors = require('cors');
const path = require('path');

// 导入路由汇总
const mountRoutes = require('./routes');
// 导入统一响应工具（可选，这里仅做配置）

const app = express();
const port = 3000;

// 1. 配置静态文件目录（关键：让Node.js能访问到index.html）
app.use(express.static(path.join(__dirname, 'public')));

// 2. 配置根路径访问，直接返回备案页面（核心：访问域名/IP时展示备案页）
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 3. 你的小程序后台接口（比如 /api 开头的接口，不受影响）
app.get('/api', (req, res) => {
  res.json({ code: 0, data: '小程序后台数据' });
});

// 1. 配置全局中间件
app.use(cors()); // 解决跨域
app.use(express.json()); // 解析JSON请求体
app.use(express.urlencoded({ extended: true })); // 解析urlencoded请求体

// 2. 挂载所有路由
mountRoutes(app);

// 3. 启动后端服务
app.listen(port,'0.0.0.0', () => {
  console.log(`后端服务已启动，监听端口：${port}`);
  console.log(`库存接口示例：http://localhost:${port}/api/inventory/queryByParams`);
  console.log(`库存详情接口示例：http://localhost:${port}/api/inventory/queryById/1`);
});