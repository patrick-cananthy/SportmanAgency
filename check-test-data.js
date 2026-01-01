const sequelize = require('./config/database');
require('dotenv').config();

async function checkData() {
    try {
        const Event = require('./models/Event')(sequelize);
        const Job = require('./models/Job')(sequelize);
        const Talent = require('./models/Talent')(sequelize);

        await sequelize.authenticate();
        console.log('✓ Database connected\n');

        // Check Events
        console.log('📅 Checking Events...');
        const events = await Event.findAll();
        console.log(`Total events: ${events.length}`);
        events.forEach(event => {
            console.log(`  - ${event.title}`);
            console.log(`    Published: ${event.published}, Featured: ${event.featured}`);
            console.log(`    Event Date: ${event.eventDate}`);
            console.log(`    Is Future: ${new Date(event.eventDate) >= new Date()}`);
        });

        // Check Jobs
        console.log('\n💼 Checking Jobs...');
        const jobs = await Job.findAll();
        console.log(`Total jobs: ${jobs.length}`);
        jobs.forEach(job => {
            console.log(`  - ${job.title}`);
            console.log(`    Published: ${job.published}, Featured: ${job.featured}`);
            console.log(`    Closing Date: ${job.closingDate}`);
            const isOpen = !job.closingDate || new Date(job.closingDate) >= new Date();
            console.log(`    Is Open: ${isOpen}`);
        });

        // Check Talents
        console.log('\n⭐ Checking Talents...');
        const talents = await Talent.findAll();
        console.log(`Total talents: ${talents.length}`);
        talents.forEach(talent => {
            console.log(`  - ${talent.name} (${talent.sport})`);
            console.log(`    Published: ${talent.published}, Featured: ${talent.featured}`);
        });

        // Test API queries
        console.log('\n🔍 Testing API Queries...');
        
        const { Op } = require('sequelize');
        const upcomingEvents = await Event.findAll({
            where: {
                published: true,
                eventDate: {
                    [Op.gte]: new Date()
                }
            }
        });
        console.log(`Upcoming events: ${upcomingEvents.length}`);
        
        const openJobs = await Job.findAll({
            where: {
                published: true,
                [Op.or]: [
                    { closingDate: null },
                    { closingDate: { [Op.gte]: new Date() } }
                ]
            }
        });
        console.log(`Open jobs: ${openJobs.length}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkData();

