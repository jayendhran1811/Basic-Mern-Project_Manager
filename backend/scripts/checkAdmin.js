const mongoose = require('mongoose');
const User = require('../models/User');
const Organization = require('../models/Organization');
require('dotenv').config();

async function checkAdmin() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/projectmanagement';
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB');

        const adminEmail = 'admin@basic.com';
        const user = await User.findOne({ email: adminEmail }).populate('organizationId');

        if (user) {
            console.log('👤 Found user:');
            console.log('  Username:', user.username);
            console.log('  Email:', user.email);
            console.log('  Role:', user.role);
            console.log('  Org Name:', user.organizationId ? user.organizationId.name : 'N/A');
            console.log('  Org ID:', user.organizationId ? user.organizationId._id : 'N/A');

            // Test comparePassword
            const password = 'admin@123';
            const isMatch = await user.comparePassword(password);
            console.log('🔑 Password "admin@123" matches:', isMatch);
        } else {
            console.log('❌ User admin@basic.com NOT found');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkAdmin();
