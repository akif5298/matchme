const productDataService = require('./matchme/backend/src/services/product-data-service');

async function testHexParsing() {
  console.log('Testing hex color parsing from CSV...');
  
  // Wait for products to load
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const products = productDataService.getAllProducts();
  console.log(`Loaded ${products.length} products`);
  
  // Find products with hex colors
  const productsWithHex = products.filter(p => 
    p.colors && p.colors.length > 0 && 
    p.colors.some(c => c.hex && c.hex.startsWith('#'))
  );
  
  console.log(`Found ${productsWithHex.length} products with hex colors`);
  
  // Show some examples
  productsWithHex.slice(0, 5).forEach((product, index) => {
    console.log(`\nProduct ${index + 1}: ${product.name} by ${product.brand}`);
    console.log('Colors:');
    product.colors.forEach(color => {
      console.log(`  - ${color.name}: ${color.hex}`);
    });
  });
  
  // Test color compatibility
  const testSkinTone = 'medium';
  const testUndertone = 'warm';
  
  const compatibleProducts = productsWithHex.filter(p => 
    productDataService.isCompatibleWithSkinTone(p, testSkinTone, testUndertone)
  );
  
  console.log(`\nFound ${compatibleProducts.length} products compatible with ${testSkinTone} skin tone and ${testUndertone} undertone`);
  
  process.exit(0);
}

testHexParsing().catch(console.error); 