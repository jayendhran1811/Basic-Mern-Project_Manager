const mongoose = require('mongoose');
const Task = require('../models/Task');
require('dotenv').config();

async function checkOrphanedTasks() {
    try {
        const mongoUri = process.env.MONGODB_URI;
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        const deletedIds = [
            '698ec814b2f57e828aaefe4a',
            '698ec881b2f57e828aaefe5f',
            '698eca2eb2f57e828aaeffbb'
        ];

        const tasks = await Task.find({
            $or: [
                { assignedEmployees: { $in: deletedIds } },
                { createdBy: { $in: deletedIds } }
            ]
        });

        if (tasks.length === 0) {
            console.log('\n✅ No tasks found referencing the deleted users.');
        } else {
            console.log(`\n📋 Found ${tasks.length} tasks referencing deleted users:`);
            tasks.forEach(task => {
                console.log(`- Task: ${task.title} (${task._id})`);
                console.log(`  Assigned: ${task.assignedEmployees}`);
                console.log(`  Created By: ${task.createdBy}`);
            });

            // Clean up: Remove these IDs from assignedEmployees
            for (const task of tasks) {
                task.assignedEmployees = task.assignedEmployees.filter(id => !deletedIds.includes(id.toString()));
                await task.save();
                console.log(`  ✅ Cleaned up task: ${task.title}`);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkOrphanedTasks();
