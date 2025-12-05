// NTP客户端模块，用于从阿里云NTP服务器获取标准北京时间
const dgram = require('dgram');

// NTP时间戳到Unix时间戳的转换常量
const NTP_EPOCH_OFFSET = 2208988800; // NTP起始时间1900-01-01到Unix起始时间1970-01-01的秒数

/**
 * 从阿里云NTP服务器获取标准北京时间
 * @param {string} server - NTP服务器地址，默认为阿里云NTP服务器
 * @param {number} port - NTP服务器端口，默认为123
 * @param {number} timeout - 超时时间，默认为5000毫秒
 * @returns {Promise<Date>} - 返回标准北京时间的Date对象
 */
async function getNTPTime(server = 'ntp.cloud.aliyuncs.com', port = 123, timeout = 5000) {
    return new Promise((resolve, reject) => {
        // 创建UDP套接字
        const socket = dgram.createSocket('udp4');
        
        // 设置超时
        const timeoutId = setTimeout(() => {
            socket.close();
            reject(new Error('NTP请求超时'));
        }, timeout);
        
        // NTP请求包（48字节）
        // 前4个字节：LI=0（无警告）, VN=3（NTP版本3）, Mode=3（客户端模式）
        const ntpPacket = Buffer.alloc(48);
        ntpPacket[0] = 0x1B; // LI=0, VN=3, Mode=3
        
        // 发送NTP请求
        socket.send(ntpPacket, 0, ntpPacket.length, port, server, (err) => {
            if (err) {
                clearTimeout(timeoutId);
                socket.close();
                reject(err);
            }
        });
        
        // 处理NTP响应
        socket.on('message', (msg) => {
            clearTimeout(timeoutId);
            socket.close();
            
            try {
                // 解析NTP响应包
                // NTP响应包的第40-43字节是服务器时间戳（秒部分）
                // 第44-47字节是服务器时间戳（毫秒部分）
                const seconds = msg.readUInt32BE(40);
                const fractionalSeconds = msg.readUInt32BE(44);
                
                // 转换为Unix时间戳（秒）
                const unixSeconds = seconds - NTP_EPOCH_OFFSET;
                
                // 转换小数秒为毫秒（0x100000000 = 2^32）
                const milliseconds = Math.round((fractionalSeconds / 0x100000000) * 1000);
                
                // 创建Date对象
                const ntpTime = new Date(unixSeconds * 1000 + milliseconds);
                
                resolve(ntpTime);
            } catch (e) {
                reject(new Error('NTP响应解析失败: ' + e.message));
            }
        });
        
        // 处理套接字错误
        socket.on('error', (err) => {
            clearTimeout(timeoutId);
            socket.close();
            reject(err);
        });
    });
}

/**
 * 获取标准北京时间的备用方案：如果NTP请求失败，使用系统时间并添加固定偏移
 * @returns {Promise<Date>} - 返回标准北京时间的Date对象
 */
async function getStandardBeijingTime() {
    try {
        // 尝试从NTP服务器获取时间
        return await getNTPTime();
    } catch (error) {
        console.warn('NTP请求失败，使用备用方案获取时间:', error.message);
        
        // 备用方案：使用系统时间，并假设系统时间是UTC时间
        // 注意：这只是一个备用方案，准确性取决于系统时间的设置
        const now = new Date();
        const utcTime = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
        const beijingTime = new Date(utcTime + 8 * 60 * 60 * 1000);
        
        return beijingTime;
    }
}

module.exports = {
    getNTPTime,
    getStandardBeijingTime
};