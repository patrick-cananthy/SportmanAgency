const fs = require('fs');
const path = require('path');

// List of upload directories needed
const uploadDirs = [
    'uploads',
    'uploads/news',
    'uploads/events',
    'uploads/jobs',
    'uploads/talents',
    'uploads/sales-rentals',
    'uploads/services'
];

console.log('Creating upload directories...');

uploadDirs.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    try {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
            console.log(`✓ Created: ${dir}`);
        } else {
            console.log(`✓ Exists: ${dir}`);
        }
    } catch (error) {
        console.error(`✗ Error creating ${dir}:`, error.message);
    }
});

console.log('Upload directories ready!');

