const mongoose = require('mongoose');

const fragranceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Fragrance name is required'],
    trim: true
  },
  images: [{
    url: String,
    key: String, // S3 object key
    altText: String
  }],
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Fresh', 'Floral', 'Oriental', 'Woody', 'Citrus', 'Gourmand', 'Aquatic', 'Spicy', 'Green', 'Fruity'],
    default: 'Fresh'
  },
  subcategory: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    maxlength: 1000
  },
  notes: {
    top: [String],
    middle: [String],
    base: [String]
  },
  concentration: {
    type: String,
    enum: ['EDT', 'EDP', 'Parfum', 'EDC', 'Cologne'],
    default: 'EDT'
  },
  size: [{
    volume: Number, // in ml
    price: Number
  }],
  gender: {
    type: String,
    enum: ['Men', 'Women', 'Unisex'],
    default: 'Unisex'
  },
  releaseYear: {
    type: Number,
    min: 1900,
    max: new Date().getFullYear()
  },
  perfumer: String,
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  imageUrl: String,
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [String]
}, {
  timestamps: true
});
fragranceSchema.pre('remove', async function(next) {
  try {
    const s3 = new mongoose.mongo.s3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION
    });
    
    const deletePromises = this.images.map(image => {
      return s3.deleteObject({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: image.key
      }).promise();
    });
    
    await Promise.all(deletePromises);
    next();
  } catch (err) {
    next(err);
  }
});
// Index for better search performance
fragranceSchema.index({ name: 'text', brand: 'text', description: 'text' });
fragranceSchema.index({ category: 1 });
fragranceSchema.index({ brand: 1 });
fragranceSchema.index({ rating: -1 });

module.exports = mongoose.model('Fragrance', fragranceSchema);