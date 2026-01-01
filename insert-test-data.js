const sequelize = require('./config/database');
require('dotenv').config();

async function insertTestData() {
    try {
        // Import models
        const Event = require('./models/Event')(sequelize);
        const Job = require('./models/Job')(sequelize);
        const Talent = require('./models/Talent')(sequelize);

        // Connect to database
        await sequelize.authenticate();
        console.log('✓ Database connected');

        // Sync models
        await sequelize.sync({ alter: true });
        console.log('✓ Models synced');

        // Insert Events
        console.log('\n📅 Inserting Events...');
        const events = [
            {
                title: 'Annual Sports Summit 2025',
                description: 'Join us for our annual sports summit featuring keynote speakers, networking opportunities, and insights into the future of sports management. This event brings together industry leaders, athletes, and sports professionals from around the world.',
                shortDescription: 'Join industry leaders and athletes for our annual sports summit featuring keynote speakers and networking opportunities.',
                location: 'Accra, Ghana',
                eventDate: new Date('2025-03-15T10:00:00'),
                eventTime: '10:00 AM - 6:00 PM',
                category: 'Conference',
                featured: true,
                published: true,
                registrationUrl: 'https://example.com/register/summit2025',
                contactEmail: 'events@sportsmantalent.com',
                contactPhone: '+233 123 456 789'
            },
            {
                title: 'Youth Football Development Camp',
                description: 'A comprehensive football development camp for young athletes aged 12-18. Professional coaches will provide training in technical skills, tactical awareness, and physical conditioning. Includes scouting opportunities for talented players.',
                shortDescription: 'Professional football development camp for young athletes with scouting opportunities.',
                location: 'Kumasi, Ghana',
                eventDate: new Date('2025-04-20T09:00:00'),
                eventTime: '9:00 AM - 4:00 PM',
                category: 'Training',
                featured: false,
                published: true,
                registrationUrl: 'https://example.com/register/football-camp',
                contactEmail: 'training@sportsmantalent.com',
                contactPhone: '+233 123 456 790'
            }
        ];

        for (const event of events) {
            const [created, isNew] = await Event.findOrCreate({
                where: { title: event.title },
                defaults: event
            });
            if (isNew) {
                console.log(`  ✓ Created: ${event.title}`);
            } else {
                console.log(`  - Already exists: ${event.title}`);
            }
        }

        // Insert Jobs
        console.log('\n💼 Inserting Jobs...');
        const jobs = [
            {
                title: 'Senior Talent Manager',
                description: 'We are seeking an experienced Senior Talent Manager to join our team. You will be responsible for managing a portfolio of elite athletes, negotiating contracts, developing brand partnerships, and providing strategic career guidance. The ideal candidate will have 5+ years of experience in sports management, excellent negotiation skills, and a strong network in the sports industry.',
                shortDescription: 'Manage elite athletes, negotiate contracts, and develop brand partnerships. 5+ years experience required.',
                location: 'Accra, Ghana',
                jobType: 'Full-time',
                department: 'Talent Management',
                requirements: '• 5+ years experience in sports management\n• Strong negotiation and communication skills\n• Bachelor\'s degree in Sports Management or related field\n• Existing network in sports industry\n• Ability to travel frequently',
                salary: '$60,000 - $80,000',
                applicationUrl: 'https://example.com/apply/senior-talent-manager',
                contactEmail: 'careers@sportsmantalent.com',
                featured: true,
                published: true,
                postedDate: new Date(),
                closingDate: new Date('2025-02-28')
            },
            {
                title: 'Digital Marketing Specialist',
                description: 'Join our marketing team as a Digital Marketing Specialist. You will create and execute digital marketing campaigns for our athletes and brand partners, manage social media accounts, produce content, and analyze campaign performance. This role requires creativity, strong analytical skills, and a passion for sports marketing.',
                shortDescription: 'Create digital marketing campaigns for athletes and brands. Strong social media and content creation skills required.',
                location: 'Remote (Ghana)',
                jobType: 'Full-time',
                department: 'Marketing',
                requirements: '• 3+ years experience in digital marketing\n• Proficiency in social media management\n• Content creation and video editing skills\n• Analytics and reporting experience\n• Bachelor\'s degree in Marketing or related field',
                salary: '$40,000 - $55,000',
                applicationUrl: 'https://example.com/apply/digital-marketing',
                contactEmail: 'careers@sportsmantalent.com',
                featured: false,
                published: true,
                postedDate: new Date(),
                closingDate: new Date('2025-03-15')
            }
        ];

        for (const job of jobs) {
            const [created, isNew] = await Job.findOrCreate({
                where: { title: job.title },
                defaults: job
            });
            if (isNew) {
                console.log(`  ✓ Created: ${job.title}`);
            } else {
                console.log(`  - Already exists: ${job.title}`);
            }
        }

        // Insert Talents
        console.log('\n⭐ Inserting Talents...');
        const talents = [
            {
                name: 'Kwame Asante',
                sport: 'Football',
                bio: 'Kwame Asante is a professional football player with over 10 years of experience in top-tier leagues. Known for his exceptional speed, agility, and leadership on the field, Kwame has represented his country in multiple international competitions. He is a dedicated athlete who consistently demonstrates excellence both on and off the field, making him a valuable asset to any team.',
                shortBio: 'Professional football player with 10+ years experience, known for exceptional speed and leadership.',
                nationality: 'Ghana',
                age: 28,
                position: 'Forward',
                team: 'Ghana National Team',
                achievements: 'NFL Pro Bowl Selection (2022, 2023)\nSuper Bowl Champion (2023)\nAfrican Player of the Year (2021)\nTop Scorer - Premier League (2020)',
                stats: 'Career Goals: 156\nAssists: 89\nInternational Caps: 45\nGoals per Game: 0.68',
                socialMedia: 'Instagram: @kwameasante\nTwitter: @kwameasante_official\nFacebook: Kwame Asante Official',
                featured: true,
                published: true,
                image: ''
            },
            {
                name: 'Akosua Mensah',
                sport: 'Basketball',
                bio: 'Akosua Mensah is a rising star in women\'s basketball, known for her versatility and court vision. She has excelled at both the collegiate and professional levels, earning multiple accolades for her outstanding performance. Akosua is passionate about inspiring the next generation of female athletes and is actively involved in community outreach programs.',
                shortBio: 'Versatile basketball player excelling at collegiate and professional levels, passionate about inspiring young athletes.',
                nationality: 'Ghana',
                age: 25,
                position: 'Point Guard',
                team: 'WNBA - Chicago Sky',
                achievements: 'WNBA All-Star (2023, 2024)\nOlympic Gold Medalist (2024)\nNCAA Championship Winner (2020)\nRookie of the Year (2021)',
                stats: 'Points per Game: 18.5\nAssists per Game: 7.2\nRebounds per Game: 5.8\nField Goal %: 45.3%',
                socialMedia: 'Instagram: @akosuamensah\nTwitter: @akosuamensah_bb\nTikTok: @akosuamensah',
                featured: false,
                published: true,
                image: ''
            }
        ];

        for (const talent of talents) {
            const [created, isNew] = await Talent.findOrCreate({
                where: { name: talent.name },
                defaults: talent
            });
            if (isNew) {
                console.log(`  ✓ Created: ${talent.name}`);
            } else {
                console.log(`  - Already exists: ${talent.name}`);
            }
        }

        console.log('\n✅ Test data insertion completed!');
        console.log('\nSummary:');
        console.log('  • Events: 2 entries');
        console.log('  • Jobs: 2 entries');
        console.log('  • Talents: 2 entries');
        console.log('\nYou can now view these in:');
        console.log('  • Homepage: http://localhost:3005');
        console.log('  • Admin Panel: http://localhost:3005/admin');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error inserting test data:', error);
        process.exit(1);
    }
}

insertTestData();

