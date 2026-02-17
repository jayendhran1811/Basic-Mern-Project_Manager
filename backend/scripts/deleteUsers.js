const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function deleteSpecificUsers() {
    try {
        const mongoUri = process.env.MONGODB_URI;
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        const userIdsToDelete = [
            '698ec814b2f57e828aaefe4a', // Hemachandiran M P
            '698ec881b2f57e828aaefe5f', // hema chandiran
            '698eca2eb2f57e828aaeffbb'  // Balaji S S
        ];

        console.log('\n🗑️  Starting deletion process...');

        for (const id of userIdsToDelete) {
            const user = await User.findById(id);
            if (!user) {
                console.log(`⚠️  User with ID ${id} not found.`);
                continue;
            }

            const username = user.username;
            const fullName = `${user.firstName} ${user.lastName}`;

            const result = await User.deleteOne({ _id: id });
            if (result.deletedCount === 1) {
                console.log(`✅ Successfully deleted: ${fullName} (${username})`);
            } else {
                console.log(`❌ Failed to delete: ${fullName} (${username})`);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

deleteSpecificUsers();
