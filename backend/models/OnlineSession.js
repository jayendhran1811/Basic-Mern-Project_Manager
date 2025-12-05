const mongoose = require('mongoose');

const onlineSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  lastSeen: { type: Date, default: Date.now }
});

module.exports = mongoose.model('OnlineSession', onlineSessionSchema);

