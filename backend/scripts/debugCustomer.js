const mongoose = require('mongoose');
const User = require('../models/User');
const Organization = require('../models/Organization');
require('dotenv').config();

async function debugCustomer() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const users = await User.find().populate('organizationId');
        console.log('Total users:', users.length);

        users.forEach(u => {
            console.log(`User: ${u.email}, Role: ${u.role}, OrgName: ${u.organizationId?.name}, OrgID: ${u.organizationId?._id}`);
        });

        const orgs = await Organization.find();
        console.log('\nOrganizations:');
        orgs.forEach(o => {
            console.log(`Org: ${o.name}, ID: ${o._id}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debugCustomer();
