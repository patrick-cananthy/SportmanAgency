const sequelize = require('./config/database');
require('dotenv').config();

async function updateDates() {
    try {
        const Event = require('./models/Event')(sequelize);
        const Job = require('./models/Job')(sequelize);

        await sequelize.authenticate();
        console.log('✓ Database connected\n');

        // Update Events to future dates
        console.log('📅 Updating Events...');
        const now = new Date();
        const futureDate1 = new Date(now);
        futureDate1.setMonth(now.getMonth() + 2); // 2 months from now
        futureDate1.setHours(10, 0, 0, 0);

        const futureDate2 = new Date(now);
        futureDate2.setMonth(now.getMonth() + 3); // 3 months from now
        futureDate2.setHours(9, 0, 0, 0);

        await Event.update(
            { 
                eventDate: futureDate1,
                eventTime: '10:00 AM - 6:00 PM'
            },
            { where: { title: 'Annual Sports Summit 2025' } }
        );
        console.log(`  ✓ Updated: Annual Sports Summit 2025 to ${futureDate1.toLocaleDateString()}`);

        await Event.update(
            { 
                eventDate: futureDate2,
                eventTime: '9:00 AM - 4:00 PM'
            },
            { where: { title: 'Youth Football Development Camp' } }
        );
        console.log(`  ✓ Updated: Youth Football Development Camp to ${futureDate2.toLocaleDateString()}`);

        // Update Jobs closing dates to future dates
        console.log('\n💼 Updating Jobs...');
        const jobClosingDate1 = new Date(now);
        jobClosingDate1.setMonth(now.getMonth() + 1); // 1 month from now

        const jobClosingDate2 = new Date(now);
        jobClosingDate2.setMonth(now.getMonth() + 2); // 2 months from now

        await Job.update(
            { closingDate: jobClosingDate1 },
            { where: { title: 'Senior Talent Manager' } }
        );
        console.log(`  ✓ Updated: Senior Talent Manager closing date to ${jobClosingDate1.toLocaleDateString()}`);

        await Job.update(
            { closingDate: jobClosingDate2 },
            { where: { title: 'Digital Marketing Specialist' } }
        );
        console.log(`  ✓ Updated: Digital Marketing Specialist closing date to ${jobClosingDate2.toLocaleDateString()}`);

        // Verify
        console.log('\n🔍 Verifying Updates...');
        const { Op } = require('sequelize');
        
        const upcomingEvents = await Event.findAll({
            where: {
                published: true,
                eventDate: {
                    [Op.gte]: new Date()
                }
            }
        });
        console.log(`  ✓ Upcoming events: ${upcomingEvents.length}`);
        
        const openJobs = await Job.findAll({
            where: {
                published: true,
                [Op.or]: [
                    { closingDate: null },
                    { closingDate: { [Op.gte]: new Date() } }
                ]
            }
        });
        console.log(`  ✓ Open jobs: ${openJobs.length}`);

        console.log('\n✅ Dates updated successfully!');
        console.log('Refresh your homepage to see the events and jobs.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

updateDates();

