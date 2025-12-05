// 数据库初始化脚本
const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDatabase() {
    let connection;
    try {
        // 创建数据库连接
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'db4free.net',
            port: parseInt(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER || 'admin_czzzzh',
            password: process.env.DB_PASSWORD || 'asdfghjk',
            database: process.env.DB_NAME || 'game2048',
            connectTimeout: 30000
        });

        console.log('成功连接到数据库！');

        // 创建用户表
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(20) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                is_admin BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        console.log('Users table created successfully');

        // 创建排行榜表
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS leaderboard (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                session_id VARCHAR(50) NULL,
                score INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE KEY unique_session (user_id, session_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        console.log('Leaderboard table created successfully');

        // 创建索引，优化查询性能
        await connection.execute('CREATE INDEX idx_leaderboard_score ON leaderboard(score DESC)');
        await connection.execute('CREATE INDEX idx_leaderboard_user_id ON leaderboard(user_id)');

        console.log('Indexes created successfully');

        // 关闭连接
        await connection.end();
        console.log('Database initialization completed');
    } catch (error) {
        console.error('Database initialization failed:', error);
        if (connection) {
            await connection.end();
        }
        process.exit(1);
    }
}

// 执行初始化
initDatabase();
