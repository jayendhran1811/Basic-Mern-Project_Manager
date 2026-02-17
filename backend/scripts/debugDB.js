const mongoose = require('mongoose');
const User = require('../models/User');
const Organization = require('../models/Organization');
require('dotenv').config();

async function debug() {
    try {
        const mongoUri = process.env.MONGODB_URI;
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        const email = 'admin@basic.com';
        const users = await User.find({ email }).populate('organizationId');
        console.log(`👤 Found ${users.length} user(s) with email ${email}:`);
        users.forEach((u, i) => {
            console.log(`  User ${i + 1}:`);
            console.log('    ID:', u._id);
            console.log('    Role:', u.role);
            console.log('    Org Name:', u.organizationId ? u.organizationId.name : 'N/A');
            console.log('    Org ID:', u.organizationId ? u.organizationId._id : 'N/A');
        });

        const orgs = await Organization.find({ name: 'Basic Corp' });
        console.log(`🏢 Found ${orgs.length} organization(s) with name "Basic Corp":`);
        orgs.forEach((o, i) => {
            console.log(`  Org ${i + 1}:`);
            console.log('    ID:', o._id);
        });

        const allOrgs = await Organization.find().select('name');
        console.log(`\n📋 All Organizations in DB (${allOrgs.length}):`);
        allOrgs.forEach(o => console.log(`  - ${o.name} (${o._id})`));

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

debug();
