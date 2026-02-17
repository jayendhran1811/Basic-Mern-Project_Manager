const mongoose = require('mongoose');
const Team = require('../models/Team');
require('dotenv').config();

async function cleanTeams() {
    try {
        const mongoUri = process.env.MONGODB_URI;
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        const deletedIds = [
            '698ec814b2f57e828aaefe4a',
            '698ec881b2f57e828aaefe5f',
            '698eca2eb2f57e828aaeffbb'
        ];

        const teams = await Team.find({
            $or: [
                { members: { $in: deletedIds } },
                { managerId: { $in: deletedIds } }
            ]
        });

        if (teams.length === 0) {
            console.log('\n✅ No teams found referencing the deleted users.');
        } else {
            console.log(`\n📋 Found ${teams.length} teams referencing deleted users:`);
            for (const team of teams) {
                console.log(`- Team: ${team.name} (${team._id})`);

                // Remove from members
                const originalCount = team.members.length;
                team.members = team.members.filter(id => !deletedIds.includes(id.toString()));

                if (team.members.length < originalCount) {
                    console.log(`  ✅ Removed ${originalCount - team.members.length} member(s)`);
                }

                // Check managerId
                if (deletedIds.includes(team.managerId.toString())) {
                    console.log(`  ⚠️  Manager (${team.managerId}) was a deleted user!`);
                    // Note: We might need to assign a new manager, but for now we'll just log it.
                }

                await team.save();
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

cleanTeams();
