/**
 * Test API Endpoints
 * Run this to test if all API endpoints are working
 */

const http = require('http');

const PORT = process.env.PORT || 3005;
const HOST = 'localhost';

const endpoints = [
    { name: 'News', path: '/api/news?published=true&limit=4' },
    { name: 'Events', path: '/api/events?published=true&upcoming=true&limit=6' },
    { name: 'Jobs', path: '/api/jobs?published=true&open=true&limit=8' },
    { name: 'Talents', path: '/api/talents?published=true' },
    { name: 'Sales/Rentals', path: '/api/sales-rentals?published=true&available=true&limit=12' }
];

function testEndpoint(name, path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: HOST,
            port: PORT,
            path: path,
            method: 'GET',
            timeout: 5000
        };

        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({
                        name,
                        status: 'success',
                        code: res.statusCode,
                        count: Array.isArray(jsonData) ? jsonData.length : 'N/A',
                        message: `✓ ${name}: ${res.statusCode} - ${Array.isArray(jsonData) ? jsonData.length + ' items' : 'OK'}`
                    });
                } catch (e) {
                    resolve({
                        name,
                        status: 'error',
                        code: res.statusCode,
                        message: `✗ ${name}: ${res.statusCode} - Invalid JSON response`
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject({
                name,
                status: 'error',
                message: `✗ ${name}: Connection failed - ${error.message}`
            });
        });

        req.on('timeout', () => {
            req.destroy();
            reject({
                name,
                status: 'timeout',
                message: `✗ ${name}: Request timeout`
            });
        });

        req.end();
    });
}

async function testAllEndpoints() {
    console.log(`Testing API endpoints on http://${HOST}:${PORT}\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const results = [];

    for (const endpoint of endpoints) {
        try {
            const result = await testEndpoint(endpoint.name, endpoint.path);
            results.push(result);
            console.log(result.message);
        } catch (error) {
            results.push(error);
            console.log(error.message);
        }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error' || r.status === 'timeout').length;

    console.log(`Results: ${successCount} successful, ${errorCount} failed\n`);

    if (errorCount > 0) {
        console.log('Troubleshooting:');
        console.log('1. Make sure the server is running: npm start');
        console.log('2. Check if database is connected');
        console.log('3. Verify routes are registered in server.js');
        console.log('4. Check server logs for errors');
        process.exit(1);
    } else {
        console.log('✓ All endpoints are working correctly!');
        process.exit(0);
    }
}

testAllEndpoints();

