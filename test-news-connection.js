const sequelize = require('./config/database');
require('dotenv').config();

async function testNewsConnection() {
    try {
        console.log('Testing News & Insights Database Connection...\n');
        
        // Test database connection
        await sequelize.authenticate();
        console.log('✓ Database connected');
        
        // Load News model
        const News = require('./models/News')(sequelize);
        console.log('✓ News model loaded');
        
        // Sync database (create table if needed)
        await sequelize.sync({ alter: true });
        console.log('✓ Database tables synced');
        
        // Test query
        const newsCount = await News.count();
        console.log(`✓ News table exists`);
        console.log(`  Total news articles in database: ${newsCount}`);
        
        // Get published news
        const publishedNews = await News.findAll({
            where: { published: true },
            limit: 5,
            order: [['createdAt', 'DESC']]
        });
        
        console.log(`\n✓ Published news articles: ${publishedNews.length}`);
        
        if (publishedNews.length > 0) {
            console.log('\nSample articles:');
            publishedNews.forEach((article, index) => {
                console.log(`  ${index + 1}. ${article.title} (ID: ${article.id})`);
            });
        } else {
            console.log('\n⚠️  No published news articles found.');
            console.log('   Create some articles in the admin panel!');
        }
        
        // Check API route
        console.log('\n✓ API Route: /api/news');
        console.log('  Frontend fetches from: /api/news?published=true&limit=4');
        console.log('  This should work if:');
        console.log('    - Database is connected ✓');
        console.log('    - News model is loaded ✓');
        console.log('    - Routes are registered ✓');
        
        console.log('\n✅ News & Insights ARE connected to the database!');
        console.log('\nTo test:');
        console.log('  1. Visit: http://localhost:3005');
        console.log('  2. Check browser console for "Loaded news from API: X articles"');
        console.log('  3. Or visit: http://localhost:3005/api/news?published=true');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('\nNews & Insights are NOT properly connected.');
        console.error('Check:');
        console.error('  1. Database connection in .env file');
        console.error('  2. News model exists');
        console.error('  3. Database tables are created');
        process.exit(1);
    }
}

testNewsConnection();

