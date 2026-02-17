const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function listAllUsers() {
    try {
        const mongoUri = process.env.MONGODB_URI;
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        const users = await User.find({}, 'username firstName lastName email');
        console.log(`\n📋 All Users in DB (${users.length}):`);
        users.forEach(u => {
            console.log(`- ${u.username} | ${u.firstName} ${u.lastName} | ${u.email} (${u._id})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

listAllUsers();
