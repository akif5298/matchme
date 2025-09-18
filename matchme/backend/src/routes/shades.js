const express = require('express');
const multer = require('multer');
const fetch = require('node-fetch');
const { productService, userService } = require('../services/firebase');
const mlService = require('../services/ml-service');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Image proxy endpoint to handle external images
router.get('/image-proxy', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    // Validate URL
    let imageUrl = url;
    if (imageUrl.startsWith('//')) {
      imageUrl = 'https:' + imageUrl;
    } else if (!imageUrl.startsWith('http')) {
      imageUrl = 'https://' + imageUrl;
    }

    // Fetch the image
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      // Return placeholder if image not found
      const placeholderResponse = await fetch('https://via.placeholder.com/300x300?text=No+Image');
      const placeholderBuffer = await placeholderResponse.buffer();
      
      res.set('Content-Type', 'image/png');
      res.set('Cache-Control', 'public, max-age=3600');
      return res.send(placeholderBuffer);
    }

    const buffer = await response.buffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    res.send(buffer);
  } catch (error) {
    console.error('Image proxy error:', error);
    
    // Return placeholder on error
    try {
      const placeholderResponse = await fetch('https://via.placeholder.com/300x300?text=Error');
      const placeholderBuffer = await placeholderResponse.buffer();
      
      res.set('Content-Type', 'image/png');
      res.send(placeholderBuffer);
    } catch (placeholderError) {
      res.status(500).json({ error: 'Failed to load image' });
    }
  }
});

// Get shade matches for user
router.get('/matches', auth, async (req, res) => {
  try {
    const user = await userService.getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Use ML service to find matching shades
    const matches = await mlService.getProductRecommendations(
      user.profile?.skinTone || 'medium',
      user.profile?.undertone || 'neutral'
    );

    res.json(matches);
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ error: 'Failed to get matches' });
  }
});

// Analyze skin tone from uploaded image (development route - no auth required)
router.post('/analyze-dev', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Analyze skin tone using ML service
    const analysis = await mlService.analyzeSkinTone(req.file.buffer);
    
    // Get product recommendations based on analysis
    const recommendations = await mlService.getProductRecommendations(
      analysis.skinTone,
      analysis.undertone
    );

    res.json({
      analysis,
      recommendations,
      message: 'Skin tone analysis completed successfully'
    });
  } catch (error) {
    console.error('Analyze skin tone error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze skin tone',
      details: error.message 
    });
  }
});

// Get shade matches for user (development route - no auth required)
router.get('/matches-dev', async (req, res) => {
  try {
    // Use default values for development
    const matches = await mlService.getProductRecommendations(
      'medium',
      'warm'
    );

    res.json(matches);
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ error: 'Failed to get matches' });
  }
});

// Get personalized recommendations
router.get('/recommendations', auth, async (req, res) => {
  try {
    const { productType = 'foundation', preferences = {} } = req.query;
    
    const user = await userService.getUserById(req.user.userId);
    if (!user || !user.profile) {
      return res.status(404).json({ 
        error: 'User profile not found. Please complete skin tone analysis first.' 
      });
    }

    const recommendations = await mlService.getProductRecommendations(
      user.profile.skinTone,
      user.profile.undertone,
      { productType, ...preferences },
      user.currentProducts || []
    );

    res.json(recommendations);
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Manual skin tone input
router.post('/manual-input', auth, async (req, res) => {
  try {
    const { skinTone, undertone } = req.body;
    
    if (!skinTone || !undertone) {
      return res.status(400).json({ 
        error: 'Skin tone and undertone are required' 
      });
    }

    // Update user profile
    await userService.updateUser(req.user.userId, {
      profile: {
        skinTone,
        undertone,
        lastAnalysis: new Date().toISOString(),
        confidence: 0.9 // High confidence for manual input
      }
    });

    // Get recommendations
    const recommendations = await mlService.getProductRecommendations(
      skinTone,
      undertone
    );

    res.json({
      message: 'Profile updated successfully',
      recommendations
    });
  } catch (error) {
    console.error('Manual input error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get available skin tones and undertones
router.get('/options', (req, res) => {
  const options = {
    skinTones: [
      'very_fair',
      'fair',
      'light', 
      'medium',
      'dark',
      'very_dark'
    ],
    undertones: [
      'warm',
      'cool',
      'neutral'
    ]
  };
  
  res.json(options);
});

module.exports = router; 