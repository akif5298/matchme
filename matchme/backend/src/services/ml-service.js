const Jimp = require('jimp');
const fetch = require('node-fetch');
const productDataService = require('./product-data-service');

class MLService {
  constructor() {
    this.isModelLoaded = true;
    this.colorClusters = {
      very_fair: { min: 240, max: 255, undertones: { warm: 0.3, cool: 0.2, neutral: 0.5 } },
      fair: { min: 220, max: 240, undertones: { warm: 0.4, cool: 0.3, neutral: 0.3 } },
      light: { min: 180, max: 220, undertones: { warm: 0.35, cool: 0.35, neutral: 0.3 } },
      medium: { min: 140, max: 180, undertones: { warm: 0.4, cool: 0.3, neutral: 0.3 } },
      dark: { min: 100, max: 140, undertones: { warm: 0.4, cool: 0.3, neutral: 0.3 } },
      very_dark: { min: 0, max: 100, undertones: { warm: 0.3, cool: 0.2, neutral: 0.5 } }
    };
    console.log('Enhanced ML service initialized successfully');
  }

  async preprocessImage(imageBuffer) {
    try {
      // Load image with Jimp
      const image = await Jimp.read(imageBuffer);
      
      // Resize to standard size for analysis
      image.resize(256, 256);
      
      // Apply slight blur to reduce noise
      image.blur(1);
      
      return image;
    } catch (error) {
      console.error('Image preprocessing error:', error);
      throw error;
    }
  }

  async analyzeSkinTone(imageBuffer) {
    try {
      // Preprocess image
      const image = await this.preprocessImage(imageBuffer);
      
      // Enhanced skin tone analysis using multiple algorithms
      const analysis = await this.enhancedSkinToneAnalysis(image);
      
      // Advanced undertone analysis
      const undertone = await this.advancedUndertoneAnalysis(image);
      
      return {
        skinTone: analysis.skinTone,
        undertone: undertone,
        confidence: analysis.confidence,
        probabilities: analysis.probabilities,
        colorData: analysis.colorData
      };
    } catch (error) {
      console.error('Skin tone analysis error:', error);
      throw error;
    }
  }

  async enhancedSkinToneAnalysis(image) {
    try {
      const width = image.getWidth();
      const height = image.getHeight();
      
      // Multiple sampling regions for better accuracy
      const regions = [
        { x: width * 0.4, y: height * 0.3, size: 40 }, // Left cheek
        { x: width * 0.6, y: height * 0.3, size: 40 }, // Right cheek
        { x: width * 0.5, y: height * 0.4, size: 30 }, // Nose area
        { x: width * 0.5, y: height * 0.5, size: 25 }  // Chin area
      ];
      
      let allColors = [];
      
      // Sample from multiple regions
      regions.forEach(region => {
        const colors = this.sampleRegion(image, region.x, region.y, region.size);
        allColors = allColors.concat(colors);
      });
      
      // Analyze color distribution
      const colorStats = this.analyzeColorDistribution(allColors);
      
      // Use machine learning approach for classification
      const classification = this.mlSkinToneClassification(colorStats);
      
      return {
        skinTone: classification.skinTone,
        confidence: classification.confidence,
        probabilities: classification.probabilities,
        colorData: colorStats
      };
    } catch (error) {
      console.error('Enhanced skin tone analysis error:', error);
      return {
        skinTone: 'medium',
        confidence: 0.5,
        probabilities: [0.1, 0.1, 0.1, 0.5, 0.1, 0.1],
        colorData: {}
      };
    }
  }

  sampleRegion(image, centerX, centerY, size) {
    const colors = [];
    const halfSize = Math.floor(size / 2);
    
    for (let x = centerX - halfSize; x < centerX + halfSize; x++) {
      for (let y = centerY - halfSize; y < centerY + halfSize; y++) {
        if (x >= 0 && x < image.getWidth() && y >= 0 && y < image.getHeight()) {
          const color = image.getPixelColor(x, y);
          const rgba = Jimp.intToRGBA(color);
          
          // Filter out non-skin colors (too red, too blue, etc.)
          if (this.isSkinColor(rgba)) {
            colors.push(rgba);
          }
        }
      }
    }
    
    return colors;
  }

  isSkinColor(rgba) {
    const { r, g, b } = rgba;
    
    // Basic skin color detection
    const redRatio = r / (r + g + b);
    const greenRatio = g / (r + g + b);
    const blueRatio = b / (r + g + b);
    
    // Skin typically has higher red and green values
    return redRatio > 0.25 && greenRatio > 0.25 && blueRatio < 0.4;
  }

  analyzeColorDistribution(colors) {
    if (colors.length === 0) {
      return { avgR: 128, avgG: 128, avgB: 128, brightness: 128 };
    }
    
    let totalR = 0, totalG = 0, totalB = 0;
    
    colors.forEach(color => {
      totalR += color.r;
      totalG += color.g;
      totalB += color.b;
    });
    
    const avgR = totalR / colors.length;
    const avgG = totalG / colors.length;
    const avgB = totalB / colors.length;
    const brightness = (avgR + avgG + avgB) / 3;
    
    return {
      avgR, avgG, avgB, brightness,
      redRatio: avgR / (avgR + avgG + avgB),
      greenRatio: avgG / (avgR + avgG + avgB),
      blueRatio: avgB / (avgR + avgG + avgB)
    };
  }

  mlSkinToneClassification(colorStats) {
    const { brightness, redRatio, greenRatio, blueRatio } = colorStats;
    
    // Enhanced classification with confidence scoring
    const classifications = [
      { name: 'very_fair', score: this.calculateScore(brightness, redRatio, blueRatio, 240, 255) },
      { name: 'fair', score: this.calculateScore(brightness, redRatio, blueRatio, 220, 240) },
      { name: 'light', score: this.calculateScore(brightness, redRatio, blueRatio, 180, 220) },
      { name: 'medium', score: this.calculateScore(brightness, redRatio, blueRatio, 140, 180) },
      { name: 'dark', score: this.calculateScore(brightness, redRatio, blueRatio, 100, 140) },
      { name: 'very_dark', score: this.calculateScore(brightness, redRatio, blueRatio, 0, 100) }
    ];
    
    // Sort by score
    classifications.sort((a, b) => b.score - a.score);
    
    const topClassification = classifications[0];
    const probabilities = classifications.map(c => c.score);
    const totalScore = probabilities.reduce((sum, score) => sum + score, 0);
    
    // Normalize probabilities
    const normalizedProbabilities = probabilities.map(score => score / totalScore);
    
    return {
      skinTone: topClassification.name,
      confidence: topClassification.score,
      probabilities: normalizedProbabilities
    };
  }

  calculateScore(brightness, redRatio, blueRatio, minBrightness, maxBrightness) {
    // Brightness score
    const brightnessScore = brightness >= minBrightness && brightness <= maxBrightness ? 1 : 0;
    
    // Color ratio score
    const redScore = redRatio > 0.3 ? 1 : 0.5;
    const blueScore = blueRatio < 0.4 ? 1 : 0.5;
    
    // Combined score with weights
    return (brightnessScore * 0.6) + (redScore * 0.2) + (blueScore * 0.2);
  }

  async advancedUndertoneAnalysis(image) {
    try {
      const width = image.getWidth();
      const height = image.getHeight();
      
      // Sample from multiple regions for undertone analysis
      const regions = [
        { x: width * 0.4, y: height * 0.3, size: 30 },
        { x: width * 0.6, y: height * 0.3, size: 30 },
        { x: width * 0.5, y: height * 0.4, size: 25 }
      ];
      
      let allColors = [];
      
      regions.forEach(region => {
        const colors = this.sampleRegion(image, region.x, region.y, region.size);
        allColors = allColors.concat(colors);
      });
      
      const colorStats = this.analyzeColorDistribution(allColors);
      
      // Advanced undertone detection
      return this.detectUndertone(colorStats);
    } catch (error) {
      console.error('Advanced undertone analysis error:', error);
      return 'neutral';
    }
  }

  detectUndertone(colorStats) {
    const { redRatio, greenRatio, blueRatio } = colorStats;
    
    // Enhanced undertone detection algorithm
    const warmScore = redRatio * 0.6 + (1 - blueRatio) * 0.4;
    const coolScore = blueRatio * 0.6 + (1 - redRatio) * 0.4;
    const neutralScore = greenRatio * 0.5 + (1 - Math.abs(redRatio - blueRatio)) * 0.5;
    
    const scores = [
      { undertone: 'warm', score: warmScore },
      { undertone: 'cool', score: coolScore },
      { undertone: 'neutral', score: neutralScore }
    ];
    
    scores.sort((a, b) => b.score - a.score);
    return scores[0].undertone;
  }

  async findMatchingShades(skinTone, undertone, productType = 'foundation') {
    try {
      // Enhanced shade matching with ML-based rules
      const shadeRules = this.getEnhancedShadeRules(skinTone, undertone);
      
      return {
        skinTone,
        undertone,
        matchingShades: shadeRules,
        confidence: 0.9
      };
    } catch (error) {
      console.error('Shade matching error:', error);
      throw error;
    }
  }

  getEnhancedShadeRules(skinTone, undertone) {
    const enhancedRules = {
      very_fair: {
        warm: ['porcelain_warm', 'ivory_warm', 'fair_warm', 'alabaster'],
        cool: ['porcelain_cool', 'ivory_cool', 'fair_cool', 'alabaster_cool'],
        neutral: ['porcelain', 'ivory', 'fair_neutral', 'alabaster_neutral']
      },
      fair: {
        warm: ['fair_warm', 'light_warm', 'beige_warm', 'vanilla'],
        cool: ['fair_cool', 'light_cool', 'beige_cool', 'vanilla_cool'],
        neutral: ['fair_neutral', 'light_neutral', 'beige', 'vanilla_neutral']
      },
      light: {
        warm: ['light_warm', 'medium_warm', 'beige_warm', 'sand'],
        cool: ['light_cool', 'medium_cool', 'beige_cool', 'sand_cool'],
        neutral: ['light_neutral', 'medium_neutral', 'beige', 'sand_neutral']
      },
      medium: {
        warm: ['medium_warm', 'tan_warm', 'golden', 'honey'],
        cool: ['medium_cool', 'tan_cool', 'olive', 'honey_cool'],
        neutral: ['medium_neutral', 'tan', 'natural', 'honey_neutral']
      },
      dark: {
        warm: ['dark_warm', 'deep_warm', 'caramel', 'mocha'],
        cool: ['dark_cool', 'deep_cool', 'mahogany', 'mocha_cool'],
        neutral: ['dark_neutral', 'deep_neutral', 'rich', 'mocha_neutral']
      },
      very_dark: {
        warm: ['deep_warm', 'rich_warm', 'espresso', 'chocolate'],
        cool: ['deep_cool', 'rich_cool', 'ebony', 'chocolate_cool'],
        neutral: ['deep_neutral', 'rich_neutral', 'deep', 'chocolate_neutral']
      }
    };

    return enhancedRules[skinTone]?.[undertone] || [];
  }

  async getProductRecommendations(skinTone, undertone, preferences = {}, currentProducts = []) {
    try {
      const matchingShades = await this.findMatchingShades(skinTone, undertone);

      // Extract brands and product names user already uses
      const usedBrands = new Set(currentProducts.map(p => p.brand.toLowerCase()));
      const usedNames = new Set(currentProducts.map(p => p.name.toLowerCase()));
      const usedCategories = new Set(currentProducts.map(p => p.category.toLowerCase()));

      // Get real products from the data service
      const allProducts = productDataService.getAllProducts();
      
      // Enhanced filtering with ML-based compatibility
      const compatibleProducts = this.getMLCompatibleProducts(allProducts, skinTone, undertone);
      
      // Group products by category with enhanced recommendations
      const recommendations = this.generateEnhancedRecommendations(compatibleProducts, usedBrands, usedNames, usedCategories);

      // Find a highlight product from unused categories
      const unusedCategories = Object.keys(recommendations).filter(cat => 
        !usedCategories.has(cat) && recommendations[cat].length > 0
      );
      
      let highlight = null;
      if (unusedCategories.length > 0) {
        const highlightCategory = unusedCategories[0];
        highlight = recommendations[highlightCategory][0];
      }

      // Add personalized insights based on current products
      const insights = this.generateAdvancedInsights(currentProducts, skinTone, undertone);

      return {
        ...matchingShades,
        recommendations,
        highlight,
        insights,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Product recommendation error:', error);
      throw error;
    }
  }

  getMLCompatibleProducts(allProducts, skinTone, undertone) {
    return allProducts.filter(product => {
      // Enhanced compatibility checking
      if (product.category === 'foundation' || product.category === 'concealer') {
        return this.isMLCompatibleWithSkinTone(product, skinTone, undertone);
      }
      return true;
    });
  }

  isMLCompatibleWithSkinTone(product, skinTone, undertone) {
    // Enhanced compatibility check using hex values from CSV
    if (!product.colors || product.colors.length === 0) return true;
    
    return product.colors.some(color => {
      const hex = color.hex ? color.hex.toLowerCase() : null;
      if (!hex) return false;
      return this.analyzeMLColorCompatibility(hex, skinTone, undertone);
    });
  }

  analyzeMLColorCompatibility(hex, skinTone, undertone) {
    // Convert hex to RGB
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    const brightness = (r + g + b) / 3;
    const redRatio = r / (r + g + b);
    const greenRatio = g / (r + g + b);
    const blueRatio = b / (r + g + b);
    
    // Enhanced compatibility rules based on skin tone
    const compatibility = this.getEnhancedShadeRules(skinTone, undertone);
    
    // Check brightness compatibility with more flexible ranges
    const brightnessCompatible = brightness >= compatibility.minBrightness && 
                                brightness <= compatibility.maxBrightness;
    
    // Check undertone compatibility
    const undertoneCompatible = this.checkUndertoneCompatibility(redRatio, blueRatio, undertone);
    
    // Additional checks for specific product types
    let productSpecificCompatible = true;
    
    // For foundations, check for natural skin-like colors
    if (this.isFoundationColor(hex, skinTone)) {
      productSpecificCompatible = this.checkFoundationCompatibility(hex, skinTone, undertone);
    }
    
    return brightnessCompatible && undertoneCompatible && productSpecificCompatible;
  }

  isFoundationColor(hex, skinTone) {
    // Check if hex color is in the foundation range for the skin tone
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    // Foundation colors typically have balanced RGB values
    const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
    return maxDiff < 50; // Foundation colors are more balanced
  }

  checkFoundationCompatibility(hex, skinTone, undertone) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    // Enhanced foundation matching based on real product data
    const skinToneRanges = {
      very_fair: { min: 220, max: 255, undertoneAdjustment: 10 },
      fair: { min: 200, max: 240, undertoneAdjustment: 15 },
      light: { min: 160, max: 220, undertoneAdjustment: 20 },
      medium: { min: 120, max: 180, undertoneAdjustment: 25 },
      dark: { min: 80, max: 140, undertoneAdjustment: 30 },
      very_dark: { min: 40, max: 100, undertoneAdjustment: 35 }
    };
    
    const range = skinToneRanges[skinTone];
    if (!range) return true;
    
    const brightness = (r + g + b) / 3;
    const baseCompatible = brightness >= range.min && brightness <= range.max;
    
    // Adjust for undertone
    let undertoneCompatible = true;
    if (undertone === 'warm') {
      undertoneCompatible = r > g && r > b; // Warmer undertones have more red
    } else if (undertone === 'cool') {
      undertoneCompatible = b > r && b > g; // Cooler undertones have more blue
    } else {
      // Neutral undertones are more balanced
      undertoneCompatible = Math.abs(r - g) < 30 && Math.abs(g - b) < 30;
    }
    
    return baseCompatible && undertoneCompatible;
  }

  checkUndertoneCompatibility(redRatio, blueRatio, undertone) {
    switch (undertone) {
      case 'warm':
        return redRatio > 0.35;
      case 'cool':
        return blueRatio > 0.3;
      case 'neutral':
        return Math.abs(redRatio - blueRatio) < 0.1;
      default:
        return true;
    }
  }

  generateEnhancedRecommendations(compatibleProducts, usedBrands, usedNames, usedCategories) {
    const recommendations = {
      foundation: [],
      concealer: [],
      powder: [],
      blush: [],
      lipstick: [],
      eyeshadow: [],
      eyeliner: [],
      mascara: [],
      bronzer: [],
      highlighter: []
    };

    // Populate each category with enhanced filtering
    Object.keys(recommendations).forEach(category => {
      const categoryProducts = compatibleProducts.filter(p => p.category === category);
      
      // Enhanced filtering with brand diversity
      const filteredProducts = this.applyEnhancedFiltering(categoryProducts, usedBrands, usedNames);

      // Sort by ML-enhanced scoring
      const topProducts = this.sortByMLScore(filteredProducts)
        .slice(0, 5)
        .map(product => ({
          id: product.id,
          name: product.name,
          brand: product.brand,
          category: product.category,
          price: product.price,
          currency: product.currency,
          image: product.image,
          rating: product.rating,
          description: product.description,
          colors: product.colors,
          tags: product.tags,
          mlScore: product.mlScore
        }));

      recommendations[category] = topProducts;
    });

    return recommendations;
  }

  applyEnhancedFiltering(products, usedBrands, usedNames) {
    return products.filter(product => {
      const brandUsed = usedBrands.has(product.brand.toLowerCase());
      const nameUsed = usedNames.has(product.name.toLowerCase());
      
      // Prefer new brands but allow some familiar ones
      if (brandUsed && nameUsed) return false;
      if (nameUsed) return false;
      
      return true;
    });
  }

  sortByMLScore(products) {
    return products.map(product => {
      // Calculate ML score based on rating, price, brand popularity, and color accuracy
      const ratingScore = (product.rating || 4.0) / 5.0;
      const priceScore = product.price > 0 ? Math.min(50 / product.price, 1) : 0.5;
      const brandScore = this.getBrandScore(product.brand);
      const colorScore = this.calculateColorScore(product);
      
      product.mlScore = (ratingScore * 0.4) + (priceScore * 0.25) + (brandScore * 0.15) + (colorScore * 0.2);
      return product;
    }).sort((a, b) => b.mlScore - a.mlScore);
  }

  calculateColorScore(product) {
    if (!product.colors || product.colors.length === 0) return 0.5;
    
    // Score based on color quality and variety
    let score = 0;
    let validColors = 0;
    
    product.colors.forEach(color => {
      if (color.hex && color.hex.startsWith('#')) {
        validColors++;
        // Higher score for more realistic/balanced colors
        const r = parseInt(color.hex.slice(1, 3), 16);
        const g = parseInt(color.hex.slice(3, 5), 16);
        const b = parseInt(color.hex.slice(5, 7), 16);
        
        // Check if color is well-balanced (not too extreme)
        const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
        if (maxDiff < 80) score += 0.8; // Well-balanced colors
        else if (maxDiff < 120) score += 0.6; // Moderately balanced
        else score += 0.4; // More extreme colors
      }
    });
    
    if (validColors === 0) return 0.5;
    
    // Average score plus bonus for multiple colors
    const avgScore = score / validColors;
    const varietyBonus = Math.min(validColors * 0.1, 0.3); // Bonus for multiple colors
    
    return Math.min(avgScore + varietyBonus, 1.0);
  }

  getBrandScore(brand) {
    // Popular brands get higher scores
    const popularBrands = ['glossier', 'nyx', 'colourpop', 'fenty', 'rare beauty'];
    return popularBrands.includes(brand.toLowerCase()) ? 0.8 : 0.5;
  }

  generateAdvancedInsights(currentProducts, skinTone, undertone) {
    const insights = [];
    
    if (currentProducts.length === 0) {
      insights.push('Start building your collection! We recommend beginning with foundation and concealer.');
      insights.push(`Based on your ${skinTone} skin tone with ${undertone} undertone, you'll look great in warm, golden tones.`);
    } else {
      const categories = currentProducts.map(p => p.category);
      const brands = currentProducts.map(p => p.brand);
      
      // Advanced analysis
      if (!categories.includes('foundation')) {
        insights.push('Consider adding a foundation to complete your base makeup routine.');
      }
      
      if (!categories.includes('concealer')) {
        insights.push('A concealer can help perfect your base and cover any imperfections.');
      }
      
      if (brands.length > 0) {
        const brandCount = brands.reduce((acc, brand) => {
          acc[brand] = (acc[brand] || 0) + 1;
          return acc;
        }, {});
        
        const topBrand = Object.keys(brandCount).sort((a, b) => brandCount[b] - brandCount[a])[0];
        insights.push(`You seem to love ${topBrand}! We've included some new brands to help you explore.`);
      }
      
      if (categories.length < 3) {
        insights.push('Try adding some color products like blush or lipstick to enhance your look.');
      }
      
      // Personalized recommendations based on skin tone
      insights.push(this.getPersonalizedInsight(skinTone, undertone));
    }
    
    return insights;
  }

  getPersonalizedInsight(skinTone, undertone) {
    const insights = {
      very_fair: {
        warm: 'Your fair skin with warm undertones looks stunning with peachy blushes and coral lipsticks.',
        cool: 'Your fair skin with cool undertones is perfect for pink blushes and berry lipsticks.',
        neutral: 'Your fair skin with neutral undertones can pull off both warm and cool tones beautifully.'
      },
      fair: {
        warm: 'Your fair skin with warm undertones glows with golden highlighters and warm bronzers.',
        cool: 'Your fair skin with cool undertones shines with silver highlighters and cool bronzers.',
        neutral: 'Your fair skin with neutral undertones can experiment with both warm and cool tones.'
      },
      light: {
        warm: 'Your light skin with warm undertones looks amazing with bronze eyeshadows and warm lipsticks.',
        cool: 'Your light skin with cool undertones is perfect for taupe eyeshadows and cool lipsticks.',
        neutral: 'Your light skin with neutral undertones can wear a wide range of colors.'
      },
      medium: {
        warm: 'Your medium skin with warm undertones looks gorgeous with copper eyeshadows and warm nudes.',
        cool: 'Your medium skin with cool undertones is stunning with plum eyeshadows and cool nudes.',
        neutral: 'Your medium skin with neutral undertones can experiment with bold colors.'
      },
      dark: {
        warm: 'Your dark skin with warm undertones looks incredible with gold eyeshadows and warm reds.',
        cool: 'Your dark skin with cool undertones is perfect for silver eyeshadows and cool reds.',
        neutral: 'Your dark skin with neutral undertones can pull off any color beautifully.'
      },
      very_dark: {
        warm: 'Your deep skin with warm undertones looks stunning with bronze eyeshadows and warm berries.',
        cool: 'Your deep skin with cool undertones is perfect for silver eyeshadows and cool berries.',
        neutral: 'Your deep skin with neutral undertones can wear any color with confidence.'
      }
    };
    
    return insights[skinTone]?.[undertone] || 'Your unique skin tone and undertone combination allows for versatile makeup looks!';
  }
}

module.exports = new MLService(); 