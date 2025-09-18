import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import apiService from '../services/api';
import { ShadeOptions } from '../services/api';

const ShadeFinderScreen: React.FC = () => {
  const navigation = useNavigation();
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [showManualModal, setShowManualModal] = useState(false);
  const [selectedSkinTone, setSelectedSkinTone] = useState<string>('');
  const [selectedUndertone, setSelectedUndertone] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [shadeOptions, setShadeOptions] = useState<ShadeOptions | null>(null);

  const handleCameraAnalysis = () => {
    navigation.navigate('Camera' as never);
  };

  const handleManualInput = async () => {
    try {
      if (!shadeOptions) {
        const options = await apiService.getShadeOptions();
        setShadeOptions(options);
      }
      setShowManualModal(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to load shade options');
    }
  };

  const handleManualSubmit = async () => {
    if (!selectedSkinTone || !selectedUndertone) {
      Alert.alert('Error', 'Please select both skin tone and undertone');
      return;
    }

    setIsLoading(true);
    try {
      const result = await apiService.setManualSkinTone(selectedSkinTone, selectedUndertone);
      setShowManualModal(false);
      setSelectedSkinTone('');
      setSelectedUndertone('');
      
    Alert.alert(
        'Success',
        'Your skin tone profile has been updated!',
      [
          { text: 'View Recommendations', onPress: () => navigation.navigate('Matches' as never) },
          { text: 'OK' }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update skin tone profile');
    } finally {
      setIsLoading(false);
    }
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

  const MethodCard = ({ title, description, icon, onPress, color }: any) => (
    <TouchableOpacity style={styles.methodCard} onPress={onPress}>
      <LinearGradient
        colors={[color, color + '80']}
        style={styles.methodGradient}
      >
        <Icon name={icon} size={40} color="white" />
        <Text style={styles.methodTitle}>{title}</Text>
        <Text style={styles.methodDescription}>{description}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const OptionButton = ({ 
    title, 
    selected, 
    onPress, 
    disabled = false 
  }: { 
    title: string; 
    selected: boolean; 
    onPress: () => void; 
    disabled?: boolean;
  }) => (
    <TouchableOpacity
      style={[
        styles.optionButton,
        selected && styles.optionButtonSelected,
        disabled && styles.optionButtonDisabled
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[
        styles.optionButtonText,
        selected && styles.optionButtonTextSelected
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Find Your Perfect Shade</Text>
          <Text style={styles.subtitle}>
            Choose how you'd like to analyze your skin tone
          </Text>
        </View>

        <View style={styles.methodsContainer}>
          <MethodCard
            title="AI Camera Analysis"
            description="Take a photo for instant AI-powered skin tone analysis"
            icon="camera"
            color="#FF69B4"
            onPress={handleCameraAnalysis}
          />

          <MethodCard
            title="Manual Input"
            description="Enter your skin tone details manually"
            icon="account-edit"
            color="#9370DB"
            onPress={handleManualInput}
          />
        </View>

        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 Tips for Best Results</Text>
          <View style={styles.tipItem}>
            <Icon name="lightbulb" size={20} color="#FFD700" />
            <Text style={styles.tipText}>
              Take photos in natural lighting for accurate results
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Icon name="lightbulb" size={20} color="#FFD700" />
            <Text style={styles.tipText}>
              Remove makeup and ensure your face is clean
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Icon name="lightbulb" size={20} color="#FFD700" />
            <Text style={styles.tipText}>
              Hold your phone at arm's length for best framing
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Manual Input Modal */}
      <Modal
        visible={showManualModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowManualModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Your Skin Tone</Text>
              <TouchableOpacity
                onPress={() => setShowManualModal(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.sectionTitle}>Skin Tone</Text>
              <View style={styles.optionsGrid}>
                {shadeOptions?.skinTones.map((tone) => (
                  <OptionButton
                    key={tone}
                    title={getSkinToneDisplayName(tone)}
                    selected={selectedSkinTone === tone}
                    onPress={() => setSelectedSkinTone(tone)}
                  />
                ))}
              </View>

              <Text style={styles.sectionTitle}>Undertone</Text>
              <View style={styles.optionsGrid}>
                {shadeOptions?.undertones.map((tone) => (
                  <OptionButton
                    key={tone}
                    title={getUndertoneDisplayName(tone)}
                    selected={selectedUndertone === tone}
                    onPress={() => setSelectedUndertone(tone)}
                  />
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.submitButton, (!selectedSkinTone || !selectedUndertone) && styles.submitButtonDisabled]}
                onPress={handleManualSubmit}
                disabled={!selectedSkinTone || !selectedUndertone || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.submitButtonText}>Save & Get Recommendations</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F5',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  methodsContainer: {
    marginBottom: 30,
  },
  methodCard: {
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  methodGradient: {
    padding: 25,
    alignItems: 'center',
    minHeight: 150,
  },
  methodTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  methodDescription: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.9,
  },
  tipsSection: {
    backgroundColor: 'white',
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
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    flex: 1,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginTop: 20,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    marginBottom: 10,
    minWidth: '48%',
    alignItems: 'center',
  },
  optionButtonSelected: {
    backgroundColor: '#FF69B4',
  },
  optionButtonDisabled: {
    opacity: 0.5,
  },
  optionButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  optionButtonTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalFooter: {
    marginTop: 20,
  },
  submitButton: {
    backgroundColor: '#9370DB',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ShadeFinderScreen; 