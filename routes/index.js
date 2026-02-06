// 导入各业务模块路由
const inventoryRouter = require('./inventoryRoutes');
const positionRouter = require('./positionRoutes');
const categoryRouter = require('./categoryRoutes');
const userRouter = require('./userRoutes');
const homeGroupRouter = require('./homeGroupRoutes');
//const userRouter = require('./userRoutes'); // 后续添加用户路由后，导入这里

// 汇总并导出所有路由
module.exports = (app) => {
  // 给每个模块路由添加统一前缀，区分业务模块（更清晰）
  app.use('/api/inventory', inventoryRouter); // 库存接口前缀：/api/inventory
  app.use('/api/position', positionRouter); 
  app.use('/api/category', categoryRouter); 
  app.use('/api/user', userRouter); 
  app.use('/api/homeGroup', homeGroupRouter); 
 // app.use('/api/user', userRouter); // 用户接口前缀：/api/user
};