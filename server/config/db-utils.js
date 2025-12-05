// 数据库工具脚本 - 合并了初始化、更新和索引添加功能
const mysql = require('mysql2/promise');
const pool = require('./db');
require('dotenv').config();

class DatabaseUtils {
    /**
     * 初始化数据库 - 创建表结构
     */
    static async initDatabase() {
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

            console.log('✅ Users table created successfully');

            // 创建排行榜表 - 修复了原脚本中的pool.execute错误，使用connection.execute
            await connection.execute(`
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

            console.log('✅ Leaderboard table created successfully');

            // 创建索引，优化查询性能
            await connection.execute('CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard(score DESC)');
            await connection.execute('CREATE INDEX IF NOT EXISTS idx_leaderboard_user_id ON leaderboard(user_id)');

            console.log('✅ Initial indexes created successfully');

            // 关闭连接
            await connection.end();
            console.log('✅ Database initialization completed');
        } catch (error) {
            console.error('❌ Database initialization failed:', error);
            if (connection) {
                await connection.end();
            }
            throw error;
        }
    }

    /**
     * 更新数据库结构
     */
    static async updateDatabase() {
        try {
            console.log('开始更新数据库结构...');
            
            // 1. 检查并添加session_id字段
            try {
                await pool.execute('ALTER TABLE leaderboard ADD COLUMN IF NOT EXISTS session_id VARCHAR(50) NULL');
                console.log('✅ session_id字段已存在或添加成功');
            } catch (error) {
                throw error;
            }
            
            // 2. 检查并添加updated_at字段
            try {
                await pool.execute('ALTER TABLE leaderboard ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
                console.log('✅ updated_at字段已存在或添加成功');
            } catch (error) {
                throw error;
            }
            
            // 3. 添加唯一索引
            try {
                await pool.execute('ALTER TABLE leaderboard ADD UNIQUE KEY IF NOT EXISTS unique_session (user_id, session_id)');
                console.log('✅ 唯一索引已存在或添加成功');
            } catch (error) {
                throw error;
            }
            
            console.log('✅ 数据库结构更新完成！');
        } catch (error) {
            console.error('❌ 数据库结构更新失败:', error);
            console.error('错误代码:', error.code);
            console.error('错误信息:', error.message);
            throw error;
        }
    }

    /**
     * 添加数据库索引
     */
    static async addIndexes() {
        try {
            console.log('开始添加数据库索引...');
            
            // 1. 为leaderboard表添加索引
            console.log('\n1. 为leaderboard表添加索引...');
            
            // 为score列添加索引（用于排序）
            await pool.execute('CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard(score DESC)');
            console.log('✅ idx_leaderboard_score 索引已存在或添加成功');
            
            // 为user_id列添加索引（用于关联查询）
            await pool.execute('CREATE INDEX IF NOT EXISTS idx_leaderboard_user_id ON leaderboard(user_id)');
            console.log('✅ idx_leaderboard_user_id 索引已存在或添加成功');
            
            // 为session_id列添加索引（用于唯一约束和查询）
            await pool.execute('CREATE INDEX IF NOT EXISTS idx_leaderboard_session_id ON leaderboard(session_id)');
            console.log('✅ idx_leaderboard_session_id 索引已存在或添加成功');
            
            // 为created_at列添加索引（用于时间排序）
            await pool.execute('CREATE INDEX IF NOT EXISTS idx_leaderboard_created_at ON leaderboard(created_at)');
            console.log('✅ idx_leaderboard_created_at 索引已存在或添加成功');
            
            // 2. 为users表添加索引
            console.log('\n2. 为users表添加索引...');
            
            // 为username列添加唯一索引（用于快速查找和唯一性约束）
            await pool.execute('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username)');
            console.log('✅ idx_users_username 索引已存在或添加成功');
            
            console.log('\n✅ 所有索引添加完成！');
            console.log('\n索引添加总结：');
            console.log('1. leaderboard表：idx_leaderboard_score, idx_leaderboard_user_id, idx_leaderboard_session_id, idx_leaderboard_created_at');
            console.log('2. users表：idx_users_username');
        } catch (error) {
            console.error('❌ 添加索引失败:', error);
            console.error('错误代码:', error.code);
            console.error('错误信息:', error.message);
            throw error;
        }
    }

    /**
     * 运行所有数据库维护操作
     */
    static async runAll() {
        try {
            console.log('====================================');
            console.log('开始数据库维护操作');
            console.log('====================================');
            
            await this.initDatabase();
            await this.updateDatabase();
            await this.addIndexes();
            
            console.log('====================================');
            console.log('✅ 所有数据库维护操作完成！');
            console.log('====================================');
        } catch (error) {
            console.error('====================================');
            console.error('❌ 数据库维护操作失败！');
            console.error('====================================');
            process.exit(1);
        } finally {
            // 关闭连接池
            await pool.end();
        }
    }
}

// 命令行接口
if (require.main === module) {
    const args = process.argv.slice(2);
    
    async function main() {
        try {
            if (args.includes('--init')) {
                await DatabaseUtils.initDatabase();
            } else if (args.includes('--update')) {
                await DatabaseUtils.updateDatabase();
            } else if (args.includes('--indexes')) {
                await DatabaseUtils.addIndexes();
            } else {
                // 默认运行所有操作
                await DatabaseUtils.runAll();
            }
            process.exit(0);
        } catch (error) {
            process.exit(1);
        }
    }
    
    main();
}

module.exports = DatabaseUtils;