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
import { Ionicons } from '@expo/vector-icons';

export const ShadeFinderScreen: React.FC = () => {
  const navigation = useNavigation();
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [showManualModal, setShowManualModal] = useState(false);
  const [selectedSkinTone, setSelectedSkinTone] = useState<string>('');
  const [selectedUndertone, setSelectedUndertone] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCameraAnalysis = () => {
    // Navigate to the camera screen for live camera analysis
    navigation.navigate('Camera' as never);
  };

  const handleManualInput = async () => {
    setShowManualModal(true);
  };

  const handleManualSubmit = async () => {
    if (!selectedSkinTone || !selectedUndertone) {
      Alert.alert('Error', 'Please select both skin tone and undertone');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
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

  const MethodCard = ({ title, description, icon, onPress }: any) => (
    <TouchableOpacity style={styles.methodCard} onPress={onPress}>
      <View style={styles.methodContent}>
        <View style={styles.methodIcon}>
          <Ionicons name={icon as any} size={32} color="#000000" />
        </View>
        <Text style={styles.methodTitle}>{title}</Text>
        <Text style={styles.methodDescription}>{description}</Text>
      </View>
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
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Find Your Perfect Shade</Text>
          <Text style={styles.subtitle}>
            Choose how you'd like to analyze your skin tone
          </Text>
        </View>

        <View style={styles.methodsSection}>
          <MethodCard
            title="Camera Analysis"
            description="Take a photo of your skin for instant analysis"
            icon="camera-outline"
            onPress={handleCameraAnalysis}
          />
          
          <MethodCard
            title="Manual Input"
            description="Tell us about your skin tone and undertone"
            icon="person-outline"
            onPress={handleManualInput}
          />
        </View>

        <View style={styles.tipsSection}>
          <View style={styles.tipCard}>
            <Ionicons name="bulb-outline" size={20} color="#666666" />
            <Text style={styles.tipText}>
              For best results, take photos in natural lighting
            </Text>
          </View>
          
          <View style={styles.tipCard}>
            <Ionicons name="bulb-outline" size={20} color="#666666" />
            <Text style={styles.tipText}>
              Avoid heavy makeup or filters for accurate analysis
            </Text>
          </View>
          
          <View style={styles.tipCard}>
            <Ionicons name="bulb-outline" size={20} color="#666666" />
            <Text style={styles.tipText}>
              You can always update your preferences later
            </Text>
          </View>
        </View>

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
                <Text style={styles.modalTitle}>Manual Skin Tone Input</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowManualModal(false)}
                >
                  <Ionicons name="close" size={24} color="#000000" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Skin Tone</Text>
                  <Text style={styles.sectionDescription}>
                    Select the shade that most closely matches your skin tone
                  </Text>
                  
                  <View style={styles.optionsGrid}>
                    {['very_fair', 'fair', 'light', 'medium', 'dark', 'very_dark'].map((tone) => (
                      <OptionButton
                        key={tone}
                        title={getSkinToneDisplayName(tone)}
                        selected={selectedSkinTone === tone}
                        onPress={() => setSelectedSkinTone(tone)}
                      />
                    ))}
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Undertone</Text>
                  <Text style={styles.sectionDescription}>
                    Choose your skin's underlying tone
                  </Text>
                  
                  <View style={styles.optionsGrid}>
                    {['warm', 'cool', 'neutral'].map((tone) => (
                      <OptionButton
                        key={tone}
                        title={getUndertoneDisplayName(tone)}
                        selected={selectedUndertone === tone}
                        onPress={() => setSelectedUndertone(tone)}
                      />
                    ))}
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleManualSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitButtonText}>Save Preferences</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
    padding: 24,
  },
  header: {
    marginBottom: 32,
    paddingVertical: 32,
    paddingHorizontal: 24,
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
  methodsSection: {
    marginBottom: 32,
  },
  methodCard: {
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
  methodContent: {
    alignItems: 'center',
  },
  methodIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  methodTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  tipsSection: {
    marginTop: 32,
    marginBottom: 32,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
    lineHeight: 20,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  optionButtonSelected: {
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
  },
  optionButtonDisabled: {
    opacity: 0.5,
  },
  optionButtonText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },
  optionButtonTextSelected: {
    fontWeight: '700',
    color: '#000000',
  },
  modalFooter: {
    marginTop: 16,
    paddingTop: 16,
    borderTopColor: '#E5E5E5',
    borderTopWidth: 1,
  },
  submitButton: {
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
}); 