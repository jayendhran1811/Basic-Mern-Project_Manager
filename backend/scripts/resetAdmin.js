const mongoose = require('mongoose');
const User = require('../models/User');
const Organization = require('../models/Organization');
const Tracker = require('../models/Tracker');
require('dotenv').config();

async function resetAdmin() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/projectmanagement';
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB');

        // 1. Remove all current admin accounts
        const deletedAdmins = await User.deleteMany({ role: 'admin' });
        console.log(`🗑️ Removed ${deletedAdmins.deletedCount} existing admin account(s)`);

        // 2. Ensure a default organization exists
        let organization = await Organization.findOne({ name: 'Basic Corp' });
        if (!organization) {
            organization = new Organization({
                name: 'Basic Corp',
                industry: 'IT',
                description: 'Default organization created by system reset'
            });
            await organization.save();
            console.log('🏢 Created default organization: Basic Corp');
        } else {
            console.log('🏢 Using existing organization: Basic Corp');
        }

        // 3. Create the new default admin account
        const adminEmail = 'admin@basic.com';
        const adminPassword = 'admin@123';

        // Check if a user with this email already exists (even if not admin)
        // If it exists but is an employee, we'll convert it, or if it doesn't exist, create it.
        let adminUser = await User.findOne({ email: adminEmail });

        if (adminUser) {
            console.log('👤 User with admin email already exists, updating to default admin...');
            adminUser.role = 'admin';
            adminUser.password = adminPassword;
            adminUser.organizationId = organization._id;
            adminUser.username = 'admin';
            await adminUser.save();
        } else {
            adminUser = new User({
                username: 'admin',
                email: adminEmail,
                password: adminPassword,
                firstName: 'Default',
                lastName: 'Admin',
                role: 'admin',
                organizationId: organization._id
            });
            await adminUser.save();
            console.log('👤 Created default admin account');
        }

        // Update organization with this adminId if not already set or was reset
        organization.adminId = adminUser._id;
        if (!organization.employees.includes(adminUser._id)) {
            organization.employees.push(adminUser._id);
        }
        await organization.save();

        // Ensure a tracker exists for the admin
        const existingTracker = await Tracker.findOne({ userId: adminUser._id });
        if (!existingTracker) {
            const tracker = new Tracker({
                userId: adminUser._id,
                organizationId: organization._id
            });
            await tracker.save();
            console.log('📊 Created tracker for admin');
        }

        console.log('\n✨ Reset process completed successfully!');
        console.log(`📧 Email: ${adminEmail}`);
        console.log(`🔑 Password: ${adminPassword}`);
        console.log(`🏢 Organization ID: ${organization._id}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error resetting admin accounts:', error);
        process.exit(1);
    }
}

resetAdmin();
