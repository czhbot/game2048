// 检查MySQL连接数脚本
const pool = require('./server/config/db');

async function checkConnections() {
    try {
        console.log('正在查询MySQL连接数...');
        const [rows] = await pool.query('SHOW PROCESSLIST');
        
        console.log('\nMySQL当前连接列表:');
        console.table(rows);
        
        console.log(`\n总连接数: ${rows.length}`);
        
        // 统计空闲连接数
        const idleConnections = rows.filter(row => row.Command === 'Sleep').length;
        console.log(`空闲连接数: ${idleConnections}`);
        
        // 统计活跃连接数
        const activeConnections = rows.length - idleConnections;
        console.log(`活跃连接数: ${activeConnections}`);
        
        // 检查是否有大量空闲连接
        if (idleConnections > rows.length * 0.7) {
            console.log('\n⚠️ 警告: 存在大量空闲连接，建议优化连接池配置');
        } else {
            console.log('\n✅ 连接状态正常');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('查询连接数失败:', error);
        process.exit(1);
    }
}

checkConnections();
