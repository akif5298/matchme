import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import apiService from '../services/api';
import { SkinToneAnalysis, ProductRecommendation } from '../services/api';

const CameraScreen: React.FC = () => {
  const navigation = useNavigation();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<SkinToneAnalysis | null>(null);
  const [recommendations, setRecommendations] = useState<ProductRecommendation | null>(null);

  const handleTakePhoto = async () => {
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false,
      });

      if (result.assets && result.assets[0]) {
        setCapturedImage(result.assets[0].uri || null);
        setAnalysis(null);
        setRecommendations(null);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handleUploadPhoto = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false,
      });

      if (result.assets && result.assets[0]) {
        setCapturedImage(result.assets[0].uri || null);
        setAnalysis(null);
        setRecommendations(null);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload photo');
    }
  };

  const handleAnalyze = async () => {
    if (!capturedImage) {
      Alert.alert('Error', 'Please take or upload a photo first');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await apiService.analyzeSkinTone(capturedImage);
      setAnalysis(result.analysis);
      setRecommendations(result.recommendations);
      
    Alert.alert(
        'Analysis Complete',
        `Your skin tone: ${result.analysis.skinTone}\nUndertone: ${result.analysis.undertone}\nConfidence: ${(result.analysis.confidence * 100).toFixed(1)}%`,
        [
          { text: 'View Recommendations', onPress: () => navigation.navigate('Matches' as never) },
          { text: 'OK' }
      ]
    );
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze skin tone. Please try again.');
    } finally {
      setIsAnalyzing(false);
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Skin Tone Analysis</Text>
          <Text style={styles.subtitle}>
            Take a photo or upload one for AI-powered analysis
          </Text>
        </View>

        {capturedImage ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
            <TouchableOpacity 
              style={styles.retakeButton}
              onPress={() => setCapturedImage(null)}
            >
              <Icon name="camera-retake" size={24} color="white" />
              <Text style={styles.retakeText}>Retake</Text>
            </TouchableOpacity>
          </View>
        ) : (
        <View style={styles.cameraContainer}>
          <View style={styles.cameraPlaceholder}>
            <Icon name="camera" size={80} color="#CCC" />
            <Text style={styles.placeholderText}>Camera Preview</Text>
          </View>
        </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleTakePhoto}>
            <Icon name="camera" size={32} color="white" />
            <Text style={styles.actionText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleUploadPhoto}>
            <Icon name="image-plus" size={32} color="white" />
            <Text style={styles.actionText}>Upload Photo</Text>
          </TouchableOpacity>
        </View>

        {capturedImage && (
          <TouchableOpacity 
            style={[styles.analyzeButton, isAnalyzing && styles.analyzeButtonDisabled]}
            onPress={handleAnalyze}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <ActivityIndicator color="white" />
            ) : (
              <Icon name="brain" size={24} color="white" />
            )}
            <Text style={styles.analyzeText}>
              {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
            </Text>
          </TouchableOpacity>
        )}

        {analysis && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Analysis Results</Text>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Skin Tone:</Text>
              <Text style={styles.resultValue}>
                {getSkinToneDisplayName(analysis.skinTone)}
              </Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Undertone:</Text>
              <Text style={styles.resultValue}>
                {getUndertoneDisplayName(analysis.undertone)}
              </Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Confidence:</Text>
              <Text style={styles.resultValue}>
                {(analysis.confidence * 100).toFixed(1)}%
              </Text>
            </View>
          </View>
        )}

        <View style={styles.tips}>
          <Text style={styles.tipsTitle}>💡 Tips for Best Results</Text>
          <Text style={styles.tipText}>• Take photo in natural lighting</Text>
          <Text style={styles.tipText}>• Remove makeup and ensure clean face</Text>
          <Text style={styles.tipText}>• Hold phone at arm's length</Text>
          <Text style={styles.tipText}>• Avoid shadows on your face</Text>
          <Text style={styles.tipText}>• Look directly at the camera</Text>
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
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  cameraContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  cameraPlaceholder: {
    width: 300,
    height: 400,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
  },
  imageContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  capturedImage: {
    width: 300,
    height: 400,
    borderRadius: 20,
    marginBottom: 10,
  },
  retakeButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },
  retakeText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  actionButton: {
    backgroundColor: '#FF69B4',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    minWidth: 120,
  },
  actionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
  },
  analyzeButton: {
    backgroundColor: '#9370DB',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 30,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  analyzeButtonDisabled: {
    opacity: 0.7,
  },
  analyzeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  resultsContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  resultLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  resultValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  tips: {
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
  tipText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
});

export default CameraScreen; 