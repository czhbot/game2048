// 数据库索引添加脚本
const pool = require('./db');

async function addIndexes() {
    try {
        console.log('开始添加数据库索引...');
        
        // 1. 为leaderboard表添加索引
        console.log('\n1. 为leaderboard表添加索引...');
        
        // 为score列添加索引（用于排序）
        try {
            await pool.execute('CREATE INDEX idx_leaderboard_score ON leaderboard(score DESC)');
            console.log('✅ 添加索引 idx_leaderboard_score 成功');
        } catch (error) {
            if (error.code === 'ER_DUP_KEYNAME') {
                console.log('ℹ️ idx_leaderboard_score 索引已存在');
            } else {
                throw error;
            }
        }
        
        // 为user_id列添加索引（用于关联查询）
        try {
            await pool.execute('CREATE INDEX idx_leaderboard_user_id ON leaderboard(user_id)');
            console.log('✅ 添加索引 idx_leaderboard_user_id 成功');
        } catch (error) {
            if (error.code === 'ER_DUP_KEYNAME') {
                console.log('ℹ️ idx_leaderboard_user_id 索引已存在');
            } else {
                throw error;
            }
        }
        
        // 为session_id列添加索引（用于唯一约束和查询）
        try {
            await pool.execute('CREATE INDEX idx_leaderboard_session_id ON leaderboard(session_id)');
            console.log('✅ 添加索引 idx_leaderboard_session_id 成功');
        } catch (error) {
            if (error.code === 'ER_DUP_KEYNAME') {
                console.log('ℹ️ idx_leaderboard_session_id 索引已存在');
            } else {
                throw error;
            }
        }
        
        // 为created_at列添加索引（用于时间排序）
        try {
            await pool.execute('CREATE INDEX idx_leaderboard_created_at ON leaderboard(created_at)');
            console.log('✅ 添加索引 idx_leaderboard_created_at 成功');
        } catch (error) {
            if (error.code === 'ER_DUP_KEYNAME') {
                console.log('ℹ️ idx_leaderboard_created_at 索引已存在');
            } else {
                throw error;
            }
        }
        
        // 2. 为users表添加索引
        console.log('\n2. 为users表添加索引...');
        
        // 为username列添加唯一索引（用于快速查找和唯一性约束）
        try {
            await pool.execute('CREATE UNIQUE INDEX idx_users_username ON users(username)');
            console.log('✅ 添加索引 idx_users_username 成功');
        } catch (error) {
            if (error.code === 'ER_DUP_KEYNAME') {
                console.log('ℹ️ idx_users_username 索引已存在');
            } else {
                throw error;
            }
        }
        
        // 为id列添加主键索引（如果尚未存在）
        try {
            await pool.execute('ALTER TABLE users ADD PRIMARY KEY (id)');
            console.log('✅ 添加主键索引 成功');
        } catch (error) {
            if (error.code === 'ER_DUP_KEYNAME' || error.code === 'ER_MULTIPLE_PRI_KEY') {
                console.log('ℹ️ 主键索引已存在');
            } else {
                throw error;
            }
        }
        
        console.log('\n✅ 所有索引添加完成！');
        console.log('\n索引添加总结：');
        console.log('1. leaderboard表：idx_leaderboard_score, idx_leaderboard_user_id, idx_leaderboard_session_id, idx_leaderboard_created_at');
        console.log('2. users表：idx_users_username');
        
        // 关闭连接池
        await pool.end();
    } catch (error) {
        console.error('❌ 添加索引失败:', error);
        console.error('错误代码:', error.code);
        console.error('错误信息:', error.message);
        process.exit(1);
    }
}

// 执行索引添加
addIndexes();
