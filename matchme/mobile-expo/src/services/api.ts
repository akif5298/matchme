import axios from 'axios';

// Use your computer's IP address instead of localhost for mobile testing
const API_BASE_URL = 'http://10.0.0.145:5000/api';

// Mock data for when backend is not available
const mockAnalysis = {
  skinTone: 'medium',
  undertone: 'warm',
  confidence: 0.85,
};

const mockRecommendations = {
  skinTone: 'medium',
  undertone: 'warm',
  confidence: 0.85,
  matchingShades: ['Beige', 'Golden', 'Warm Ivory', 'Caramel'],
  recommendations: {
    foundation: [
      {
        id: '1',
        name: 'Natural Beige Foundation',
        brand: 'BeautyBrand',
        shade: 'Beige',
        image: 'https://via.placeholder.com/100x100',
        rating: 4.5,
      },
      {
        id: '2',
        name: 'Golden Glow Foundation',
        brand: 'GlowCosmetics',
        shade: 'Golden',
        image: 'https://via.placeholder.com/100x100',
        rating: 4.3,
      },
    ],
    concealer: [
      {
        id: '3',
        name: 'Warm Ivory Concealer',
        brand: 'PerfectMatch',
        shade: 'Warm Ivory',
        image: 'https://via.placeholder.com/100x100',
        rating: 4.7,
      },
    ],
    powder: [
      {
        id: '4',
        name: 'Caramel Setting Powder',
        brand: 'StayPut',
        shade: 'Caramel',
        image: 'https://via.placeholder.com/100x100',
        rating: 4.2,
      },
    ],
    blush: [
      {
        id: '5',
        name: 'Warm Peach Blush',
        brand: 'Cheeky',
        shade: 'Warm Peach',
        image: 'https://via.placeholder.com/100x100',
        rating: 4.6,
      },
    ],
    lipstick: [
      {
        id: '6',
        name: 'Coral Kiss Lipstick',
        brand: 'LipLux',
        shade: 'Coral',
        image: 'https://via.placeholder.com/100x100',
        rating: 4.4,
      },
    ],
  },
};

export interface SkinToneAnalysis {
  skinTone: string;
  undertone: string;
  confidence: number;
}

export interface ProductRecommendation {
  skinTone: string;
  undertone: string;
  confidence: number;
  matchingShades: string[];
  recommendations: {
    [category: string]: Array<{
      id: string;
      name: string;
      brand: string;
      category: string;
      price: number;
      currency: string;
      image: string;
      rating: number;
      description: string;
      colors: Array<{ name: string; hex: string }>;
      tags: string[];
      mlScore?: number;
    }>;
  };
  highlight?: {
    id: string;
    name: string;
    brand: string;
    category: string;
    price: number;
    currency: string;
    image: string;
    rating: number;
    description: string;
    colors: Array<{ name: string; hex: string }>;
    tags: string[];
    mlScore?: number;
  };
  insights: string[];
  timestamp: string;
}

class ApiService {
  private async makeRequest(endpoint: string, options: any = {}) {
    try {
      const response = await axios({
        url: `${API_BASE_URL}${endpoint}`,
        ...options,
      });
      return response.data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      
      // Return mock data for development
      if (endpoint.includes('analyze')) {
        return {
          analysis: mockAnalysis,
          recommendations: mockRecommendations,
        };
      } else if (endpoint.includes('matches')) {
        return mockRecommendations;
      }
      
      throw error;
    }
  }

  // Authentication
  async login(email: string, password: string) {
    return this.makeRequest('/auth/login', {
      method: 'POST',
      data: { email, password },
    });
  }

  async register(name: string, email: string, password: string) {
    return this.makeRequest('/auth/register', {
      method: 'POST',
      data: { name, email, password },
    });
  }

  async logout() {
    return this.makeRequest('/auth/logout', {
      method: 'POST',
    });
  }

  // User profile
  async getUserProfile() {
    return this.makeRequest('/users/profile');
  }

  async updateUserProfile(profile: any) {
    return this.makeRequest('/users/profile', {
      method: 'PUT',
      data: profile,
    });
  }

  // Skin tone analysis
  async analyzeSkinTone(imageUri: string): Promise<{
    analysis: SkinToneAnalysis;
    recommendations: ProductRecommendation;
  }> {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    } as any);

    return this.makeRequest('/shades/analyze-dev', {
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Image analysis (alias for analyzeSkinTone)
  async analyzeImage(formData: FormData): Promise<{
    analysis: SkinToneAnalysis;
    recommendations: ProductRecommendation;
  }> {
    return this.makeRequest('/shades/analyze-dev', {
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Get matches/recommendations
  async getMatches(): Promise<ProductRecommendation> {
    return this.makeRequest('/shades/matches-dev');
  }

  async getShadeMatches(): Promise<ProductRecommendation> {
    return this.makeRequest('/shades/matches-dev');
  }

  // Product preferences
  async getCurrentProducts() {
    return this.makeRequest('/users/current-products');
  }

  async addCurrentProduct(product: any) {
    return this.makeRequest('/users/current-products', {
      method: 'POST',
      data: product,
    });
  }

  async updateCurrentProduct(productId: string, product: any) {
    return this.makeRequest(`/users/current-products/${productId}`, {
      method: 'PUT',
      data: product,
    });
  }

  async deleteCurrentProduct(productId: string) {
    return this.makeRequest(`/users/current-products/${productId}`, {
      method: 'DELETE',
    });
  }

  // Photo upload
  async uploadPhoto(imageUri: string, productId?: string) {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'product_photo.jpg',
    } as any);

    if (productId) {
      formData.append('productId', productId);
    }

    return this.makeRequest('/users/upload-photo', {
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Favorites
  async getFavorites() {
    return this.makeRequest('/users/favorites');
  }

  async addToFavorites(productId: string) {
    return this.makeRequest('/users/favorites', {
      method: 'POST',
      data: { productId },
    });
  }

  async removeFromFavorites(productId: string) {
    return this.makeRequest(`/users/favorites/${productId}`, {
      method: 'DELETE',
    });
  }

  // Preferences
  async getPreferences() {
    return this.makeRequest('/users/preferences');
  }

  async addPreference(preference: any) {
    return this.makeRequest('/users/preferences', {
      method: 'POST',
      data: preference,
    });
  }

  async removePreference(preferenceId: string) {
    return this.makeRequest(`/users/preferences/${preferenceId}`, {
      method: 'DELETE',
    });
  }
}

export default new ApiService(); 