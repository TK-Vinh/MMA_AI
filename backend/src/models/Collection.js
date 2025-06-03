const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fragranceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Fragrance',
    required: true
  },
  status: {
    type: String,
    enum: ['owned', 'wishlist', 'tried', 'sold'],
    default: 'owned'
  },
  purchaseDate: Date,
  purchasePrice: Number,
  size: Number, // in ml
  remainingAmount: {
    type: Number,
    min: 0,
    max: 100,
    default: 100 // percentage
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  personalNotes: {
    type: String,
    maxlength: 500
  },
  occasions: [String], // ['Date Night', 'Office', 'Casual', 'Special Events']
  seasons: [String], // ['Spring', 'Summer', 'Fall', 'Winter']
  timeOfDay: [String], // ['Morning', 'Afternoon', 'Evening', 'Night']
  isFavorite: {
    type: Boolean,
    default: false
  },
  wearCount: {
    type: Number,
    default: 0
  },
  lastWorn: Date
}, {
  timestamps: true
});

// Ensure user can't have duplicate fragrances in same status
collectionSchema.index({ userId: 1, fragranceId: 1, status: 1 }, { unique: true });

// Methods
collectionSchema.methods.updateWearCount = function() {
  this.wearCount += 1;
  this.lastWorn = new Date();
  return this.save();
};

module.exports = mongoose.model('Collection', collectionSchema);