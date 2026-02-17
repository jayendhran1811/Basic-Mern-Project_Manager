const mongoose = require('mongoose');
const User = require('./backend/models/User');

const MONGODB_URI = 'mongodb+srv://jayyuntoldz2004_db_user:KLeAGBzrEq7BKtEb@cluster0.n6phvay.mongodb.net/projectmanager?retryWrites=true&w=majority&appName=Cluster0';

const updateUsers = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const usersToUpdate = [
            { name: 'arun', designation: 'Manager' },
            { name: 'deepak', designation: 'Developer' },
            { name: 'jayendhran', designation: 'Business Analyst' }
        ];

        for (const data of usersToUpdate) {
            const user = await User.findOne({
                $or: [
                    { username: new RegExp(data.name, 'i') },
                    { firstName: new RegExp(data.name, 'i') }
                ]
            });

            if (user) {
                user.designation = data.designation;
                await user.save();
                console.log(`Updated ${user.username} to ${data.designation} (Role: ${user.role})`);
            } else {
                console.log(`User ${data.name} not found`);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Error updating users:', error);
        process.exit(1);
    }
};

updateUsers();
