// 数据库更新脚本
const pool = require('./db');

async function updateDatabase() {
    try {
        console.log('开始更新数据库结构...');
        
        // 1. 检查并添加session_id字段
        try {
            await pool.execute('ALTER TABLE leaderboard ADD COLUMN session_id VARCHAR(50) NULL');
            console.log('✅ 添加session_id字段成功');
        } catch (error) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ session_id字段已存在');
            } else {
                throw error;
            }
        }
        
        // 2. 检查并添加updated_at字段
        try {
            await pool.execute('ALTER TABLE leaderboard ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
            console.log('✅ 添加updated_at字段成功');
        } catch (error) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ updated_at字段已存在');
            } else {
                throw error;
            }
        }
        
        // 3. 添加唯一索引
        try {
            await pool.execute('ALTER TABLE leaderboard ADD UNIQUE KEY unique_session (user_id, session_id)');
            console.log('✅ 添加唯一索引成功');
        } catch (error) {
            if (error.code === 'ER_DUP_KEYNAME') {
                console.log('ℹ️ 唯一索引已存在');
            } else {
                throw error;
            }
        }
        
        console.log('✅ 数据库结构更新完成！');
        
        // 关闭连接池
        await pool.end();
    } catch (error) {
        console.error('❌ 数据库结构更新失败:', error);
        console.error('错误代码:', error.code);
        console.error('错误信息:', error.message);
        process.exit(1);
    }
}

// 执行更新
updateDatabase();
