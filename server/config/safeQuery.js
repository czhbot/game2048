// config/safeQuery.js
const pool = require('./db');

// 自动重试次数
const RETRY_LIMIT = 2;

async function safeQuery(sql, params = []) {
    let attempt = 0;

    while (attempt <= RETRY_LIMIT) {
        let conn;
        try {
            // 获取连接
            conn = await pool.getConnection();

            // 执行查询
            const result = await conn.query(sql, params);

            conn.release();
            return result; // 必须保证是 [rows, fields]

        } catch (error) {
            const recoverable = [
                'PROTOCOL_CONNECTION_LOST',
                'ECONNRESET',
                'ECONNREFUSED',
                'ETIMEDOUT',
                'EPIPE'
            ].includes(error.code);

            console.error(`❌ Query Failed [${attempt + 1}]`, error.code);

            if (conn) conn.release();

            // 可恢复 & 还可以重试
            if (recoverable && attempt < RETRY_LIMIT) {
                attempt++;
                console.log("🔄 尝试自动重连...");
                continue;
            }

            // 不可恢复，直接抛出
            throw error;
        }
    }
}

module.exports = safeQuery;
