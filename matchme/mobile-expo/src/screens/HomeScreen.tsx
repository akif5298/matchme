import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Header } from '../components/ui/Header';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation();

  const features = [
    {
      id: '1',
      title: 'Shade Analysis',
      description: 'Analyze your skin tone and get personalized recommendations',
      icon: 'camera-outline',
      onPress: () => navigation.navigate('ShadeFinder' as never),
    },
    {
      id: '2',
      title: 'Product Matches',
      description: 'Discover products that match your skin tone perfectly',
      icon: 'color-palette-outline',
      onPress: () => navigation.navigate('Matches' as never),
    },
    {
      id: '3',
      title: 'Favorites',
      description: 'Save and organize your favorite products',
      icon: 'heart-outline',
      onPress: () => navigation.navigate('Favorites' as never),
    },
    {
      id: '4',
      title: 'Product Preferences',
      description: 'Tell us about products you use for better recommendations',
      icon: 'list-outline',
      onPress: () => navigation.navigate('ProductPreferences' as never),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="MatchMe"
        subtitle="Find your perfect shade"
        variant="minimal"
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome to MatchMe</Text>
          <Text style={styles.welcomeText}>
            Discover makeup and skincare products that perfectly match your skin tone
          </Text>
        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>What would you like to do?</Text>
          
          <View style={styles.featuresGrid}>
            {features.map((feature) => (
              <TouchableOpacity
                key={feature.id}
                style={styles.featureCard}
                onPress={feature.onPress}
                activeOpacity={0.8}
              >
                <View style={styles.featureIcon}>
                  <Ionicons
                    name={feature.icon as keyof typeof Ionicons.glyphMap}
                    size={24}
                    color="#000000"
                  />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>
                  {feature.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.quickActions}>
            <Button
              title="Analyze My Shade"
              onPress={() => navigation.navigate('ShadeFinder' as never)}
              variant="primary"
              style={styles.quickActionButton}
            />
            <Button
              title="View Matches"
              onPress={() => navigation.navigate('Matches' as never)}
              variant="secondary"
              style={styles.quickActionButton}
            />
          </View>
        </View>
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
    paddingHorizontal: 16,
  },
  welcomeSection: {
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },
  featuresSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    width: '48%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  quickActionsSection: {
    marginBottom: 32,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
  },
}); 