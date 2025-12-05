// 主应用文件
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const bcrypt = require('bcrypt');
const pool = require('./config/db');
require('dotenv').config();

// bcrypt预热初始化
bcrypt.hash("warmup", 10).then(() => console.log("bcrypt warmed up"));

// 数据库预热
async function warmUpDatabase() {
    try {
        console.log("Warming up database connection...");
        await pool.query("SELECT 1");
        console.log("Database warmed up.");
        // 预热排行榜表
        await pool.query("SELECT * FROM leaderboard LIMIT 1");
        console.log("Leaderboard cached.");
    } catch (e) {
        console.error("DB warm-up failed:", e);
    }
}

warmUpDatabase();

// 创建Express应用
const app = express();

// 中间件
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:8000',
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use(express.static(path.join(__dirname, '..')));
app.use(express.static(__dirname));

// 路由
const routes = require('./routes');

// 使用合并后的路由
app.use('/', routes);

// 根路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// 404处理
app.use((req, res) => {
    res.status(404).json({ message: '请求的资源不存在' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
    // 根据错误类型返回更友好的错误信息
    if (err.code === 'ECONNRESET') {
        res.status(500).json({ 
            message: '数据库连接失败，请稍后重试',
            error: 'ECONNRESET' 
        });
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
        res.status(401).json({ 
            message: '数据库访问被拒绝，请检查用户名和密码',
            error: 'ER_ACCESS_DENIED_ERROR' 
        });
    } else {
        res.status(500).json({ 
            message: '服务器内部错误',
            error: err.code 
        });
    }
});

const PORT = process.env.PORT || 7860;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
