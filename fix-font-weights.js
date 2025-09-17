const fs = require('fs');
const path = require('path');

const screensDir = './matchme/mobile-expo/src/screens';

function fixFontWeights(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace all "fontWeight: theme.typography.fontWeight.xxx as any," with "fontWeight: theme.typography.fontWeight.xxx,"
  content = content.replace(/fontWeight:\s*theme\.typography\.fontWeight\.\w+\s+as\s+any,/g, (match) => {
    return match.replace(' as any,', ',');
  });
  
  fs.writeFileSync(filePath, content);
  console.log(`Fixed font weights in ${filePath}`);
}

// Fix all screen files
const screenFiles = [
  'MatchesScreen.tsx',
  'LoginScreen.tsx',
  'RegisterScreen.tsx',
  'ProfileScreen.tsx',
  'ProductPreferencesScreen.tsx',
  'FavoritesScreen.tsx',
  'CameraScreen.tsx'
];

screenFiles.forEach(file => {
  const filePath = path.join(screensDir, file);
  if (fs.existsSync(filePath)) {
    fixFontWeights(filePath);
  }
});

console.log('All font weight issues fixed!'); 