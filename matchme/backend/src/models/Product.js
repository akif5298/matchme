const mongoose = require('mongoose');

const shadeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  hexCode: {
    type: String,
    required: true
  },
  rgbCode: {
    r: Number,
    g: Number,
    b: Number
  },
  undertone: {
    type: String,
    enum: ['warm', 'cool', 'neutral'],
    required: true
  },
  depth: {
    type: String,
    enum: ['fair', 'light', 'medium', 'tan', 'deep', 'dark'],
    required: true
  },
  intensity: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  }
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  brand: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['foundation', 'concealer', 'powder', 'blush', 'bronzer', 'highlighter', 'lipstick', 'lipgloss', 'eyeshadow', 'eyeliner', 'mascara']
  },
  type: {
    type: String,
    required: true,
    enum: ['liquid', 'cream', 'powder', 'stick', 'pencil', 'gel']
  },
  shades: [shadeSchema],
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  images: [{
    url: String,
    alt: String
  }],
  features: [{
    type: String,
    enum: ['long-lasting', 'waterproof', 'matte', 'dewy', 'natural', 'full-coverage', 'buildable', 'blendable', 'non-comedogenic', 'fragrance-free', 'cruelty-free', 'vegan']
  }],
  ingredients: [String],
  size: {
    type: String,
    trim: true
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  availability: {
    type: String,
    enum: ['in-stock', 'limited', 'out-of-stock'],
    default: 'in-stock'
  },
  retailers: [{
    name: String,
    url: String,
    price: Number
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient searching
productSchema.index({ brand: 1, category: 1 });
productSchema.index({ 'shades.undertone': 1, 'shades.depth': 1 });
productSchema.index({ features: 1 });

// Virtual for getting primary shade
productSchema.virtual('primaryShade').get(function() {
  return this.shades.length > 0 ? this.shades[0] : null;
});

// Method to find matching shades
productSchema.methods.findMatchingShades = function(userProfile) {
  return this.shades.filter(shade => {
    const depthMatch = shade.depth === userProfile.skinTone;
    const undertoneMatch = shade.undertone === userProfile.undertone || 
                          shade.undertone === 'neutral' || 
                          userProfile.undertone === 'neutral';
    return depthMatch && undertoneMatch;
  });
};

module.exports = mongoose.model('Product', productSchema); 