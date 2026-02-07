
// 引入mysql2
const mysql = require('mysql2');

// 服务器上连内网ip
const dbConfig = {
  host: '192.168.16.2', // 公网地址（小程序后端部署在公网）或内网地址（后端与MySQL同VPC）
  port: 3306, // 百度智能云MySQL端口（默认3306，修改过则填实际端口）
  user: 'root', // 控制台账号管理中的完整账号cd
  password: 'suzhisanlian1.', // 控制台重置后的密码
  database: 'sys', // 已创建的数据库（可选，可在查询时指定）
  timezone: '+08:00', // 东八区，和Node.js时区一致
  dateStrings: true,  // ② 关键！查询时返回字符串而非Date对象，避免时区解析错误
};

// 本地测试链接服务器数据库
// const dbConfig = {
//   host: '180.76.238.182', // 公网地址（小程序后端部署在公网）或内网地址（后端与MySQL同VPC）
//   port: 3306, // 百度智能云MySQL端口（默认3306，修改过则填实际端口）
//   user: 'root', // 控制台账号管理中的完整账号cd
//   password: 'suzhisanlian1.', // 控制台重置后的密码
//   database: 'test', // 已创建的数据库（可选，可在查询时指定）
//   timezone: '+08:00', // 东八区，和Node.js时区一致
//   dateStrings: true,  // ② 关键！查询时返回字符串而非Date对象，避免时区解析错误
// };


// 创建连接池并导出（所有模型共享同一个连接池，提升性能）
const pool = mysql.createPool(dbConfig).promise();

module.exports = pool;