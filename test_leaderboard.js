// 测试排行榜数据获取
const Leaderboard = require('./server/models/leaderboardModel');

async function testLeaderboard() {
    console.log('开始测试排行榜数据获取...');
    
    try {
        // 测试获取排行榜数据
        const leaderboard = await Leaderboard.getTopScores(10);
        console.log('排行榜数据:', leaderboard);
        console.log('排行榜数据数量:', leaderboard.length);
        
        // 测试获取用户分数记录
        if (leaderboard.length > 0) {
            const userId = leaderboard[0].user_id;
            console.log(`\n测试获取用户 ${userId} 的分数记录...`);
            const userScores = await Leaderboard.getUserScores(userId);
            console.log('用户分数记录:', userScores);
        }
        
        console.log('\n测试完成');
    } catch (error) {
        console.error('测试失败:', error);
    }
}

testLeaderboard();