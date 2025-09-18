import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import apiService from '../services/api';
import { ProductRecommendation } from '../services/api';

const MatchesScreen: React.FC = () => {
  const navigation = useNavigation();
  const [recommendations, setRecommendations] = useState<ProductRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('foundation');

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const data = await apiService.getShadeMatches();
      setRecommendations(data);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecommendations();
    setRefreshing(false);
  };

  const getSkinToneDisplayName = (skinTone: string) => {
    const names: { [key: string]: string } = {
      very_fair: 'Very Fair',
      fair: 'Fair',
      light: 'Light',
      medium: 'Medium',
      dark: 'Dark',
      very_dark: 'Very Dark'
    };
    return names[skinTone] || skinTone;
  };

  const getUndertoneDisplayName = (undertone: string) => {
    const names: { [key: string]: string } = {
      warm: 'Warm',
      cool: 'Cool',
      neutral: 'Neutral'
    };
    return names[undertone] || undertone;
  };

  const getCategoryDisplayName = (category: string) => {
    const names: { [key: string]: string } = {
      foundation: 'Foundation',
      concealer: 'Concealer',
      powder: 'Powder',
      blush: 'Blush',
      lipstick: 'Lipstick'
    };
    return names[category] || category;
  };

  const CategoryButton = ({ category, selected, onPress }: {
    category: string;
    selected: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.categoryButton, selected && styles.categoryButtonSelected]}
      onPress={onPress}
    >
      <Text style={[styles.categoryButtonText, selected && styles.categoryButtonTextSelected]}>
        {getCategoryDisplayName(category)}
      </Text>
    </TouchableOpacity>
  );

  const ProductCard = ({ product }: { product: any }) => (
    <TouchableOpacity style={styles.productCard}>
      <View style={styles.productImageContainer}>
        <Image
          source={{ uri: product.image || 'https://via.placeholder.com/100x100' }}
          style={styles.productImage}
        />
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productBrand}>{product.brand}</Text>
        <Text style={styles.productShade}>{product.shade}</Text>
        <View style={styles.productRating}>
          <Icon name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>{product.rating || '4.5'}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.favoriteButton}>
        <Icon name="heart-outline" size={20} color="#FF69B4" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF69B4" />
          <Text style={styles.loadingText}>Loading your perfect matches...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!recommendations) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Icon name="palette" size={80} color="#CCC" />
          <Text style={styles.emptyTitle}>No Recommendations Yet</Text>
          <Text style={styles.emptySubtitle}>
            Complete your skin tone analysis to get personalized recommendations
          </Text>
          <TouchableOpacity
            style={styles.analyzeButton}
            onPress={() => navigation.navigate('ShadeFinder' as never)}
          >
            <Text style={styles.analyzeButtonText}>Start Analysis</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Profile Summary */}
        <View style={styles.profileSection}>
          <View style={styles.profileInfo}>
            <Text style={styles.profileTitle}>Your Profile</Text>
            <View style={styles.profileDetails}>
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Skin Tone:</Text>
                <Text style={styles.profileValue}>
                  {getSkinToneDisplayName(recommendations.skinTone)}
                </Text>
              </View>
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Undertone:</Text>
                <Text style={styles.profileValue}>
                  {getUndertoneDisplayName(recommendations.undertone)}
                </Text>
              </View>
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Confidence:</Text>
                <Text style={styles.profileValue}>
                  {(recommendations.confidence * 100).toFixed(1)}%
        </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={() => navigation.navigate('ShadeFinder' as never)}
          >
            <Icon name="pencil" size={16} color="#FF69B4" />
            <Text style={styles.editProfileText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Matching Shades */}
        <View style={styles.shadesSection}>
          <Text style={styles.sectionTitle}>Matching Shades</Text>
          <View style={styles.shadesContainer}>
            {recommendations.matchingShades.map((shade, index) => (
              <View key={index} style={styles.shadeTag}>
                <Text style={styles.shadeText}>{shade}</Text>
              </View>
            ))}
          </View>
      </View>

        {/* Category Tabs */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Product Recommendations</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            {Object.keys(recommendations.recommendations).map((category) => (
              <CategoryButton
                key={category}
                category={category}
                selected={selectedCategory === category}
                onPress={() => setSelectedCategory(category)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Products */}
        <View style={styles.productsSection}>
          {recommendations.recommendations[selectedCategory]?.length > 0 ? (
            recommendations.recommendations[selectedCategory].map((product, index) => (
              <ProductCard key={index} product={product} />
            ))
      ) : (
            <View style={styles.noProductsContainer}>
              <Icon name="package-variant" size={50} color="#CCC" />
              <Text style={styles.noProductsText}>
                No {getCategoryDisplayName(selectedCategory)} recommendations yet
              </Text>
              <Text style={styles.noProductsSubtext}>
                Check back later for personalized {getCategoryDisplayName(selectedCategory)} matches
          </Text>
        </View>
      )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F5',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  analyzeButton: {
    backgroundColor: '#FF69B4',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  analyzeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileSection: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  profileDetails: {
    gap: 8,
  },
  profileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  profileLabel: {
    fontSize: 14,
    color: '#666',
  },
  profileValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  editProfileText: {
    color: '#FF69B4',
    marginLeft: 5,
    fontWeight: '500',
  },
  shadesSection: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  shadesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  shadeTag: {
    backgroundColor: '#FFE6F0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  shadeText: {
    color: '#FF69B4',
    fontSize: 14,
    fontWeight: '500',
  },
  categoriesSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  categoriesScroll: {
    marginTop: 10,
  },
  categoryButton: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 10,
  },
  categoryButtonSelected: {
    backgroundColor: '#FF69B4',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryButtonTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  productsSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  productImageContainer: {
    marginRight: 15,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  productBrand: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  productShade: {
    fontSize: 14,
    color: '#FF69B4',
    fontWeight: '500',
    marginBottom: 5,
  },
  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  favoriteButton: {
    padding: 10,
  },
  noProductsContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  noProductsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 5,
  },
  noProductsSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default MatchesScreen; 