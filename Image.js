const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  img: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { collection: 'Images' });

const Image = mongoose.model('Image', imageSchema);

module.exports = Image;
