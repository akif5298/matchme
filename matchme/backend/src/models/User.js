const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const beautyProfileSchema = new mongoose.Schema({
  skinTone: {
    type: String,
    required: true,
    enum: ['fair', 'light', 'medium', 'tan', 'deep', 'dark']
  },
  undertone: {
    type: String,
    required: true,
    enum: ['warm', 'cool', 'neutral']
  },
  skinType: {
    type: String,
    required: true,
    enum: ['oily', 'dry', 'combination', 'normal']
  },
  concerns: [{
    type: String,
    enum: ['acne', 'aging', 'pigmentation', 'sensitivity', 'dryness', 'oiliness']
  }],
  preferences: {
    coverage: {
      type: String,
      enum: ['light', 'medium', 'full'],
      default: 'medium'
    },
    finish: {
      type: String,
      enum: ['matte', 'dewy', 'natural'],
      default: 'natural'
    },
    brands: [String]
  }
});

const currentProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  category: { type: String, required: true },
  shade: { type: String },
  rating: { type: Number },
  photos: [{ type: String }] // Array of photo URLs
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profile: {
    type: beautyProfileSchema,
    required: true
  },
  currentProducts: [currentProductSchema],
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  matches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON response
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema); 