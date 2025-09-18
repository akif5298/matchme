import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../services/api';

interface Preference {
  id: string;
  category: string;
  brand: string;
  shade: string;
  hex_value: string;
}

const ProductPreferencesScreen: React.FC = () => {
  const navigation = useNavigation();
  const [preferences, setPreferences] = useState<Preference[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPreferences();
      setPreferences(response.data || []);
    } catch (error) {
      console.error('Error fetching preferences:', error);
      // Use mock data for now
      setPreferences([
        {
          id: '1',
          category: 'foundation',
          brand: 'BeautyBrand',
          shade: 'Natural Beige',
          hex_value: '#D4B996',
        },
        {
          id: '2',
          category: 'concealer',
          brand: 'PerfectMatch',
          shade: 'Warm Ivory',
          hex_value: '#F5E6D3',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePreference = async (id: string) => {
    try {
      await apiService.removePreference(id);
      setPreferences(preferences.filter(item => item.id !== id));
      Alert.alert('Success', 'Preference removed');
    } catch (error) {
      Alert.alert('Error', 'Failed to remove preference');
    }
  };

  const handleAddPreference = () => {
    navigation.navigate('ShadeFinder' as never);
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      foundation: 'color-palette-outline',
      concealer: 'eye-outline',
      powder: 'cloud-outline',
      blush: 'heart-outline',
      lipstick: 'lips-outline',
    };
    return icons[category] || 'color-palette-outline';
  };

  const getCategoryDisplayName = (category: string) => {
    const names: { [key: string]: string } = {
      foundation: 'Foundation',
      concealer: 'Concealer',
      powder: 'Powder',
      blush: 'Blush',
      lipstick: 'Lipstick',
    };
    return names[category] || category;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
          <Text style={styles.loadingText}>Loading your preferences...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Product Preferences</Text>
          <Text style={styles.subtitle}>
            Manage your preferred shades and products
          </Text>
        </View>

        {preferences.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="color-palette-outline" size={64} color="#666666" />
            <Text style={styles.emptyTitle}>No Preferences Yet</Text>
            <Text style={styles.emptySubtitle}>
              Add your preferred shades to get better recommendations
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddPreference}
            >
              <Text style={styles.addButtonText}>Add Preferences</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.preferencesSection}>
            <Text style={styles.sectionTitle}>Your Preferences</Text>
            
            {preferences.map((preference) => (
              <View key={preference.id} style={styles.preferenceCard}>
                <View style={styles.preferenceHeader}>
                  <View style={styles.preferenceInfo}>
                    <View style={styles.categoryIcon}>
                      <Ionicons 
                        name={getCategoryIcon(preference.category) as any} 
                        size={20} 
                        color="#000000" 
                      />
                    </View>
                    <View style={styles.preferenceDetails}>
                      <Text style={styles.preferenceCategory}>
                        {getCategoryDisplayName(preference.category)}
                      </Text>
                      <Text style={styles.preferenceBrand}>
                        {preference.brand} - {preference.shade}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemovePreference(preference.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FF6666" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.colorPreview}>
                  <View 
                    style={[
                      styles.colorSwatch, 
                      { backgroundColor: preference.hex_value }
                    ]} 
                  />
                  <Text style={styles.hexValue}>{preference.hex_value}</Text>
                </View>
              </View>
            ))}
            
            <TouchableOpacity
              style={styles.addPreferenceButton}
              onPress={handleAddPreference}
            >
              <Ionicons name="add" size={24} color="#000000" />
              <Text style={styles.addPreferenceText}>Add New Preference</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    marginBottom: 32,
    paddingVertical: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  addButton: {
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  preferencesSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
  },
  preferenceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  preferenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  preferenceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  preferenceDetails: {
    flex: 1,
  },
  preferenceCategory: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 2,
  },
  preferenceBrand: {
    fontSize: 14,
    color: '#666666',
  },
  removeButton: {
    padding: 8,
  },
  colorPreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorSwatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  hexValue: {
    fontSize: 14,
    color: '#666666',
  },
  addPreferenceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  addPreferenceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 8,
  },
});

export default ProductPreferencesScreen; 