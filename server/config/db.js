// 数据库连接配置
const mysql = require('mysql2/promise');
require('dotenv').config();

// 创建数据库连接池
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'db4free.net',
    port: parseInt(process.env.DB_PORT) || 3306, // 确保端口是数字类型
    user: process.env.DB_USER || 'admin_czzzzh',
    password: process.env.DB_PASSWORD || 'asdfghjk',
    database: process.env.DB_NAME || 'game2048',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // 添加连接选项
    connectTimeout: 30000, // 连接超时时间30秒
    // 移除SSL配置，因为db4free.net可能不支持SSL
    ssl: false,
    
    // 保持连接活跃（3 分钟发送一次）
    enableKeepAlive: true,
    keepAliveInitialDelay: 180000, // 3 分钟
    
    // 设置时区为北京时间
    timezone: '+08:00'
});

// 数据库预热，执行轻量级初始化查询
pool.query("SELECT 1")
    .then(() => console.log("数据库预热完成"))
    .catch(error => console.error("数据库预热失败:", error));

module.exports = pool;
