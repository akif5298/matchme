const express = require('express');
const { userService, productService } = require('../services/firebase');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user favorites
router.get('/favorites', auth, async (req, res) => {
  try {
    const user = await userService.getUserById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get favorite products
    const favoriteProducts = [];
    for (const productId of user.favorites || []) {
      const product = await productService.getProductById(productId);
      if (product) {
        favoriteProducts.push({
          id: product.id,
          name: product.name,
          brand: product.brand,
          category: product.category,
          images: product.images,
          price: product.price
        });
      }
    }

    res.json(favoriteProducts);
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Failed to get favorites' });
  }
});

// Add to favorites
router.post('/favorites', auth, async (req, res) => {
  try {
    const { productId } = req.body;
    
    const user = await userService.getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = await userService.addToFavorites(req.user.userId, productId);

    // Remove password from response
    const { password: _, ...userResponse } = updatedUser;

    res.json(userResponse);
  } catch (error) {
    console.error('Add to favorites error:', error);
    res.status(500).json({ error: 'Failed to add to favorites' });
  }
});

// Remove from favorites
router.delete('/favorites/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;
    
    const user = await userService.getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = await userService.removeFromFavorites(req.user.userId, productId);

    // Remove password from response
    const { password: _, ...userResponse } = updatedUser;

    res.json(userResponse);
  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({ error: 'Failed to remove from favorites' });
  }
});

module.exports = router; 