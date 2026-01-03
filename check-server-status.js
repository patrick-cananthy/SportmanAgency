/**
 * Server Status Checker
 * Run this script to check if the backend server is running and accessible
 */

const http = require('http');

const PORT = process.env.PORT || 3005;
const HOST = 'localhost';

function checkServerStatus() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: HOST,
            port: PORT,
            path: '/api/news?limit=1',
            method: 'GET',
            timeout: 3000
        };

        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode === 200 || res.statusCode === 400) {
                    resolve({
                        status: 'running',
                        code: res.statusCode,
                        message: 'Server is running and responding'
                    });
                } else {
                    resolve({
                        status: 'error',
                        code: res.statusCode,
                        message: `Server responded with status ${res.statusCode}`
                    });
                }
            });
        });

        req.on('error', (error) => {
            if (error.code === 'ECONNREFUSED') {
                reject({
                    status: 'not_running',
                    message: `Server is not running on ${HOST}:${PORT}`,
                    error: error.message
                });
            } else if (error.code === 'ETIMEDOUT') {
                reject({
                    status: 'timeout',
                    message: `Server did not respond within timeout period`,
                    error: error.message
                });
            } else {
                reject({
                    status: 'error',
                    message: `Error connecting to server: ${error.message}`,
                    error: error
                });
            }
        });

        req.on('timeout', () => {
            req.destroy();
            reject({
                status: 'timeout',
                message: 'Connection timeout'
            });
        });

        req.end();
    });
}

// Run the check
console.log(`Checking server status at http://${HOST}:${PORT}...\n`);

checkServerStatus()
    .then((result) => {
        console.log('✓', result.message);
        console.log(`   Status Code: ${result.code}`);
        console.log(`   Server URL: http://${HOST}:${PORT}`);
        console.log(`   Admin Panel: http://${HOST}:${PORT}/admin`);
        process.exit(0);
    })
    .catch((error) => {
        console.error('✗', error.message);
        console.error('\nTroubleshooting steps:');
        console.error('1. Make sure the server is running: npm start');
        console.error('2. Check if port', PORT, 'is available');
        console.error('3. Verify database connection in .env file');
        console.error('4. Check server logs for errors');
        process.exit(1);
    });

