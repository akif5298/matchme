import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      AsyncStorage.removeItem('authToken');
    }
    return Promise.reject(error);
  }
);

export interface SkinToneAnalysis {
  skinTone: string;
  undertone: string;
  confidence: number;
  probabilities: number[];
}

export interface ProductRecommendation {
  skinTone: string;
  undertone: string;
  matchingShades: string[];
  confidence: number;
  recommendations: {
    foundation: any[];
    concealer: any[];
    powder: any[];
    blush: any[];
    lipstick: any[];
  };
  timestamp: string;
}

export interface ShadeOptions {
  skinTones: string[];
  undertones: string[];
}

class ApiService {
  // Authentication
  async login(email: string, password: string) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  }

  async register(userData: any) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  }

  // Skin tone analysis
  async analyzeSkinTone(imageUri: string): Promise<{
    analysis: SkinToneAnalysis;
    recommendations: ProductRecommendation;
    message: string;
  }> {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'skin_tone_analysis.jpg',
    } as any);

    const response = await api.post('/shades/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  // Get shade matches
  async getShadeMatches(): Promise<ProductRecommendation> {
    const response = await api.get('/shades/matches');
    return response.data;
  }

  // Get personalized recommendations
  async getRecommendations(productType: string = 'foundation', preferences: any = {}): Promise<ProductRecommendation> {
    const response = await api.get('/shades/recommendations', {
      params: { productType, preferences },
    });
    return response.data;
  }

  // Manual skin tone input
  async setManualSkinTone(skinTone: string, undertone: string): Promise<{
    message: string;
    recommendations: ProductRecommendation;
  }> {
    const response = await api.post('/shades/manual-input', {
      skinTone,
      undertone,
    });
    return response.data;
  }

  // Get available options
  async getShadeOptions(): Promise<ShadeOptions> {
    const response = await api.get('/shades/options');
    return response.data;
  }

  // Products
  async getProducts(category?: string) {
    const response = await api.get('/products', {
      params: { category },
    });
    return response.data;
  }

  async getProductById(productId: string) {
    const response = await api.get(`/products/${productId}`);
    return response.data;
  }

  // User favorites
  async addToFavorites(productId: string) {
    const response = await api.post(`/users/favorites/${productId}`);
    return response.data;
  }

  async removeFromFavorites(productId: string) {
    const response = await api.delete(`/users/favorites/${productId}`);
    return response.data;
  }

  async getFavorites() {
    const response = await api.get('/users/favorites');
    return response.data;
  }

  // User profile
  async updateProfile(profileData: any) {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  }

  async getProfile() {
    const response = await api.get('/users/profile');
    return response.data;
  }
}

export default new ApiService(); 