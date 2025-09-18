const admin = require('firebase-admin');

const db = admin.firestore();

// User operations
const usersCollection = db.collection('users');
const productsCollection = db.collection('products');

// User service
const userService = {
  // Create user
  async createUser(userData) {
    const docRef = await usersCollection.add({
      ...userData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return { id: docRef.id, ...userData };
  },

  // Get user by ID
  async getUserById(userId) {
    const doc = await usersCollection.doc(userId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  // Get user by email
  async getUserByEmail(email) {
    const snapshot = await usersCollection.where('email', '==', email).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  },

  // Update user
  async updateUser(userId, updateData) {
    await usersCollection.doc(userId).update({
      ...updateData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return this.getUserById(userId);
  },

  // Add to favorites
  async addToFavorites(userId, productId) {
    const userRef = usersCollection.doc(userId);
    await userRef.update({
      favorites: admin.firestore.FieldValue.arrayUnion(productId),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return this.getUserById(userId);
  },

  // Remove from favorites
  async removeFromFavorites(userId, productId) {
    const userRef = usersCollection.doc(userId);
    await userRef.update({
      favorites: admin.firestore.FieldValue.arrayRemove(productId),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return this.getUserById(userId);
  }
};

// Product service
const productService = {
  // Get all products
  async getAllProducts() {
    const snapshot = await productsCollection.where('isActive', '==', true).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Get product by ID
  async getProductById(productId) {
    const doc = await productsCollection.doc(productId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  // Get products by category
  async getProductsByCategory(category) {
    const snapshot = await productsCollection
      .where('category', '==', category)
      .where('isActive', '==', true)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Find matching shades
  async findMatchingShades(userProfile) {
    const products = await this.getAllProducts();
    const matches = [];

    products.forEach(product => {
      const matchingShades = product.shades.filter(shade => {
        const depthMatch = shade.depth === userProfile.skinTone;
        const undertoneMatch = shade.undertone === userProfile.undertone || 
                              shade.undertone === 'neutral' || 
                              userProfile.undertone === 'neutral';
        return depthMatch && undertoneMatch;
      });

      if (matchingShades.length > 0) {
        matches.push({
          product: {
            id: product.id,
            name: product.name,
            brand: product.brand,
            category: product.category,
            images: product.images
          },
          matchingShades
        });
      }
    });

    return matches;
  }
};

module.exports = {
  userService,
  productService,
  db
}; 