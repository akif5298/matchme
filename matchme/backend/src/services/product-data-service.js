const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const fetch = require('node-fetch');

class ProductDataService {
  constructor() {
    this.products = [];
    this.isLoaded = false;
    this.loadProducts();
  }

  convertToCAD(price, currency) {
    if (!price || price <= 0) return 0;
    
    // Simple conversion rates (you can update these as needed)
    const rates = {
      'USD': 1.35, // 1 USD = 1.35 CAD
      'EUR': 1.47, // 1 EUR = 1.47 CAD
      'GBP': 1.72, // 1 GBP = 1.72 CAD
      'CAD': 1.0,  // Already in CAD
    };
    
    const rate = rates[currency] || 1.0;
    return Math.round(price * rate * 100) / 100; // Round to 2 decimal places
  }

  async loadProducts() {
    try {
      // Load CSV data
      const csvPath = path.join(__dirname, '../uploads/output.csv');
      const jsonPath = path.join(__dirname, '../uploads/makeup_data.json');

      // Read CSV file
      const csvData = await this.readCSVFile(csvPath);
      
      // Read JSON file
      const jsonData = await this.readJSONFile(jsonPath);

      // Combine and process data
      this.products = this.processProductData(csvData, jsonData);
      this.isLoaded = true;
      
      console.log(`Loaded ${this.products.length} products from data files`);
    } catch (error) {
      console.error('Error loading product data:', error);
      // Fallback to mock data if files don't exist
      this.products = this.getMockProducts();
      this.isLoaded = true;
    }
  }

  async readCSVFile(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', reject);
    });
  }

  async readJSONFile(filePath) {
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading JSON file:', error);
      return [];
    }
  }

  processProductData(csvData, jsonData) {
    const processedProducts = [];

    // Process CSV data
    csvData.forEach(item => {
      if (item.name && item.brand) {
        processedProducts.push({
          id: item.id || `csv-${Date.now()}-${Math.random()}`,
          name: item.name,
          brand: item.brand,
          category: this.mapCategory(item.category),
          productType: item.product_type,
          price: this.convertToCAD(parseFloat(item.price) || 0, item.currency || 'USD'),
          currency: 'CAD',
          image: this.processImageUrl(item.image_link),
          rating: parseFloat(item.rating) || 4.0,
          description: item.description,
          tags: item.tag_list ? this.parseTags(item.tag_list) : [],
          colors: this.parseColors(item.product_colors),
          source: 'csv'
        });
      }
    });

    // Process JSON data
    jsonData.forEach(item => {
      if (item.name && item.brand) {
        processedProducts.push({
          id: item.id || `json-${Date.now()}-${Math.random()}`,
          name: item.name,
          brand: item.brand,
          category: this.mapCategory(item.category),
          productType: item.product_type,
          price: this.convertToCAD(parseFloat(item.price) || 0, item.currency || 'USD'),
          currency: 'CAD',
          image: this.processImageUrl(item.image_link),
          rating: parseFloat(item.rating) || 4.0,
          description: item.description,
          tags: item.tag_list || [],
          colors: this.parseColors(item.product_colors),
          source: 'json'
        });
      }
    });

    return processedProducts;
  }

  processImageUrl(imageUrl) {
    if (!imageUrl) {
      return 'https://via.placeholder.com/300x300?text=No+Image';
    }

    // Clean and validate image URL
    let cleanUrl = imageUrl.trim();
    
    // Handle relative URLs
    if (cleanUrl.startsWith('//')) {
      cleanUrl = 'https:' + cleanUrl;
    }
    
    // Handle URLs without protocol
    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
      // URL is already complete
    } else if (cleanUrl.startsWith('www.')) {
      cleanUrl = 'https://' + cleanUrl;
    } else if (cleanUrl.includes('.')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    // Validate URL format
    try {
      new URL(cleanUrl);
      return cleanUrl;
    } catch (error) {
      console.warn(`Invalid image URL: ${imageUrl}, using placeholder`);
      return 'https://via.placeholder.com/300x300?text=No+Image';
    }
  }

  parseTags(tagString) {
    if (!tagString) return [];
    try {
      // Handle different tag string formats
      if (tagString.startsWith('[') && tagString.endsWith(']')) {
        return JSON.parse(tagString.replace(/'/g, '"'));
      } else if (tagString.includes(',')) {
        return tagString.split(',').map(tag => tag.trim().replace(/['"]/g, ''));
      } else {
        return [tagString.trim()];
      }
    } catch (error) {
      console.warn(`Error parsing tags: ${tagString}`);
      return [];
    }
  }

  mapCategory(category) {
    const categoryMap = {
      'foundation': 'foundation',
      'liquid': 'foundation',
      'powder': 'foundation',
      'concealer': 'concealer',
      'lipstick': 'lipstick',
      'lip_gloss': 'lipstick',
      'lip_liner': 'lipstick',
      'eyeshadow': 'eyeshadow',
      'eyeliner': 'eyeliner',
      'mascara': 'mascara',
      'blush': 'blush',
      'bronzer': 'bronzer',
      'highlighter': 'highlighter',
      'eyebrow': 'eyebrow'
    };
    return categoryMap[category] || 'other';
  }

  parseColors(colorString) {
    if (!colorString) return [];
    // Handle case where colorString is already an object or array
    if (typeof colorString === 'object') {
      if (Array.isArray(colorString)) {
        return colorString.map(color => this.parseColorObject(color));
      } else {
        return [this.parseColorObject(colorString)];
      }
    }
    try {
      let colors;
      let cleanString = String(colorString).trim();
      if (cleanString.startsWith('[') && cleanString.endsWith(']')) {
        try {
          cleanString = cleanString.replace(/'/g, '"');
          colors = JSON.parse(cleanString);
        } catch (parseError) {
          colors = this.parseColorStringAlternative(cleanString);
        }
      } else {
        colors = [colorString];
      }
      const parsed = colors.map(color => this.parseColorObject(color)).filter(c => c && c.hex && c.hex.startsWith('#'));
      if (parsed.length === 0) {
        console.warn(`Color parsing failed for: ${colorString}`);
      }
      return parsed;
    } catch (error) {
      console.warn(`Error parsing colors: ${colorString}`, error);
      return [];
    }
  }

  parseColorStringAlternative(colorString) {
    // Robustly extract all {hex_value, colour_name} pairs from any string
    const colors = [];
    // Regex to match {hex_value: '...', colour_name: '...'} or {hex_value: "...", colour_name: "..."}
    const regex = /\{[^}]*hex_value['"]?\s*:\s*['"](#[0-9A-Fa-f]{6})['"],?\s*colour_name['"]?\s*:\s*['"]([^'"]*)['"][^}]*\}/g;
    let match;
    while ((match = regex.exec(colorString)) !== null) {
      colors.push({ colour_name: match[2], hex_value: match[1] });
    }
    // If nothing matched, try to extract all hexes and names in order as a fallback
    if (colors.length === 0) {
      const hexes = colorString.match(/#[0-9A-Fa-f]{6}/g) || [];
      const names = colorString.match(/colour_name['"]?\s*:\s*['"]([^'"]*)['"]/g) || [];
      for (let i = 0; i < hexes.length; i++) {
        colors.push({ colour_name: names[i] ? names[i].replace(/.*:\s*['"]/, '').replace(/['"]$/, '') : `Color ${i+1}`, hex_value: hexes[i] });
      }
    }
    return colors;
  }

  parseColorObject(color) {
    if (typeof color === 'string') {
      return { name: color, hex: this.generateHexFromName(color) };
    } else if (color.colour_name && color.hex_value) {
      return { name: color.colour_name, hex: color.hex_value };
    } else if (color.name && color.hex) {
      return { name: color.name, hex: color.hex };
    } else {
      return null;
    }
  }

  generateHexFromName(colorName) {
    // Simple color name to hex mapping
    const colorMap = {
      'black': '#000000',
      'white': '#FFFFFF',
      'red': '#FF0000',
      'blue': '#0000FF',
      'green': '#008000',
      'yellow': '#FFFF00',
      'pink': '#FFC0CB',
      'purple': '#800080',
      'orange': '#FFA500',
      'brown': '#A52A2A',
      'gray': '#808080',
      'gold': '#FFD700',
      'silver': '#C0C0C0',
      'bronze': '#CD7F32',
      'copper': '#B87333',
      'rose': '#FF007F',
      'coral': '#FF7F50',
      'peach': '#FFCBA4',
      'nude': '#E3BC9A',
      'beige': '#F5F5DC',
      'ivory': '#FFFFF0',
      'cream': '#FFFDD0',
      'tan': '#D2B48C',
      'caramel': '#C68E17',
      'honey': '#FDB347',
      'amber': '#FFBF00',
      'mahogany': '#C04000',
      'espresso': '#4A3728',
      'chocolate': '#7B3F00'
    };
    
    const lowerName = colorName.toLowerCase();
    return colorMap[lowerName] || '#CCCCCC';
  }

  getMockProducts() {
    return [
      {
        id: '1',
        name: 'Perfect Match Foundation',
        brand: 'BeautyBrand',
        category: 'foundation',
        price: 25.99,
        currency: 'USD',
        image: 'https://via.placeholder.com/300x300?text=Foundation',
        rating: 4.5,
        description: 'A perfect match for your skin tone',
        tags: ['cruelty free', 'vegan'],
        colors: [{ name: 'Natural', hex: '#F2DEC3' }],
        source: 'mock'
      }
    ];
  }

  // Get products by category
  getProductsByCategory(category) {
    if (!this.isLoaded) return [];
    return this.products.filter(product => product.category === category);
  }

  // Get products by brand
  getProductsByBrand(brand) {
    if (!this.isLoaded) return [];
    return this.products.filter(product => 
      product.brand.toLowerCase().includes(brand.toLowerCase())
    );
  }

  // Get products excluding certain brands
  getProductsExcludingBrands(excludedBrands) {
    if (!this.isLoaded) return [];
    const excludedSet = new Set(excludedBrands.map(b => b.toLowerCase()));
    return this.products.filter(product => 
      !excludedSet.has(product.brand.toLowerCase())
    );
  }

  // Get products by price range
  getProductsByPriceRange(minPrice, maxPrice) {
    if (!this.isLoaded) return [];
    return this.products.filter(product => 
      product.price >= minPrice && product.price <= maxPrice
    );
  }

  // Get top rated products
  getTopRatedProducts(limit = 10) {
    if (!this.isLoaded) return [];
    return this.products
      .filter(product => product.rating > 0)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }

  // Get products by skin tone compatibility
  getProductsBySkinTone(skinTone, undertone) {
    if (!this.isLoaded) return [];
    
    // Filter products based on skin tone and undertone
    return this.products.filter(product => {
      // For foundation and concealer, check color compatibility
      if (product.category === 'foundation' || product.category === 'concealer') {
        return this.isCompatibleWithSkinTone(product, skinTone, undertone);
      }
      // For other products, return based on general compatibility
      return true;
    });
  }

  isCompatibleWithSkinTone(product, skinTone, undertone) {
    // Simple compatibility logic based on product colors
    if (!product.colors || product.colors.length === 0) return true;
    
    // Check if any color is compatible with the skin tone
    return product.colors.some(color => {
      const hex = color.hex.toLowerCase();
      // Simple color analysis - this could be enhanced with more sophisticated logic
      return this.analyzeColorCompatibility(hex, skinTone, undertone);
    });
  }

  analyzeColorCompatibility(hex, skinTone, undertone) {
    // Convert hex to RGB
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    // Calculate brightness
    const brightness = (r + g + b) / 3;
    
    // Simple compatibility rules
    if (skinTone === 'very_fair' && brightness > 200) return true;
    if (skinTone === 'fair' && brightness > 180) return true;
    if (skinTone === 'light' && brightness > 150) return true;
    if (skinTone === 'medium' && brightness > 120 && brightness < 180) return true;
    if (skinTone === 'dark' && brightness > 80 && brightness < 150) return true;
    if (skinTone === 'very_dark' && brightness < 120) return true;
    
    return false;
  }

  // Get random products for variety
  getRandomProducts(limit = 5) {
    if (!this.isLoaded) return [];
    const shuffled = [...this.products].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, limit);
  }

  // Get all products
  getAllProducts() {
    return this.products;
  }

  // Get product by ID
  getProductById(id) {
    return this.products.find(product => product.id == id);
  }

  // Validate image URLs
  async validateImageUrl(url) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new ProductDataService(); 