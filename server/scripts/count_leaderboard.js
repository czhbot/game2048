// 查询leaderboard表记录数的脚本
const pool = require('./server/config/db');

console.log('开始执行leaderboard记录数查询...');

async function countLeaderboard() {
    try {
        console.log('正在连接数据库...');
        const [rows] = await pool.query('SELECT COUNT(*) as total FROM leaderboard');
        console.log(`查询成功! leaderboard表共有 ${rows[0].total} 条记录`);
        process.exit(0);
    } catch (error) {
        console.error('查询失败:', error);
        process.exit(1);
    }
}

countLeaderboard();