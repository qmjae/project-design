import React, { useState, useEffect } from 'react';
import { SafeAreaView, TouchableOpacity, Text, Alert, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useGlobalContext } from '../../backend/context/GlobalProvider';
import { HeaderAnalysis } from '../components/analysis/HeaderAnalysis';
import { ImportSection } from '../components/analysis/ImportSection';
import { FilesList } from '../components/analysis/FilesList';
import { uploadFilesToAppwrite, saveDefectResult } from '../../backend/lib/appwrite';
import BackgroundWrapper from '../components/common/BackgroundWrapper';
import ActionButtons from '../components/navigation/ActionButtons';
import { globalStyles, colors, shadows } from '../styles/globalStyles';
import Constants from 'expo-constants';
import NetInfo from '@react-native-community/netinfo';

export default function AnalysisScreen({ navigation }) {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { addNotification, user } = useGlobalContext();
  const [apiUrl, setApiUrl] = useState('https://yeti-fleet-distinctly.ngrok-free.app/detect/');
  const [isProduction, setIsProduction] = useState(false);

  // Set up environment detection on component mount
  useEffect(() => {
    const checkEnv = async () => {
      try {
        // Determine if we're in production based on Expo release channel
        const environment = Constants.expoConfig?.releaseChannel;
        const isProd = environment === 'production' || environment === 'prod';
        setIsProduction(isProd);
        
        // Log the environment for debugging
        console.log(`App environment: ${isProd ? 'PRODUCTION' : 'DEVELOPMENT'}`);
        
        // Check connectivity to our API
        const networkState = await NetInfo.fetch();
        console.log(`Network state: ${networkState.isConnected ? 'Connected' : 'Disconnected'}`);
      } catch (error) {
        console.log('Error checking environment:', error);
      }
    };
    
    checkEnv();
  }, []);

  const formatDateTime = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? String(hours).padStart(2, '0') : '12';
    return `${month}-${day}-${year} ${hours}:${minutes} ${ampm}`;
  };

  const pickImage = async () => {
    if (uploadedFiles.length >= 5) {
      Alert.alert(
        "Upload Limit Reached!",
        "You can only upload up to 5 images!",
        [{ text: "OK" }]
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
    });

    if (!result.canceled) {
      const remainingSlots = 5 - uploadedFiles.length;
      const newFiles = result.assets
        .slice(0, remainingSlots)
        .map(asset => ({
          imageUri: asset.uri,
          name: asset.uri.split('/').pop(),
          type: asset.mimeType,
          size: asset.fileSize,
        }));
      setUploadedFiles([...uploadedFiles, ...newFiles]);
    }
  };

  const removeFile = (index) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
  };

  // Specially modified handleResults function that prioritizes the API call working
  const handleResults = async () => {
    if (uploadedFiles.length === 0) {
      Alert.alert(
        "No Images",
        "No uploaded image! Please upload an image!",
        [{ text: "OK" }]
      );
      return;
    }

    setIsAnalyzing(true);
    try {
      // Upload files to Appwrite first
      const uploadedFilesData = await uploadFilesToAppwrite(uploadedFiles);
      console.log('Analysis Screen Uploaded Files Data:', uploadedFilesData);

      // Then process each file for defect detection
      // This is the critical part that might be failing in production
      const analysisResults = await Promise.all(
        uploadedFiles.map(async (file, index) => {
          const formData = new FormData();
          formData.append('file', {
            uri: file.imageUri,
            type: file.type || 'image/jpeg',
            name: file.name
          });

          console.log(`Making API request to: ${apiUrl}`);
          
          try {
            // Add timeout to prevent hanging requests
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);
            
            const response = await fetch(apiUrl, {
              method: 'POST',
              body: formData,
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'multipart/form-data',
              },
              signal: controller.signal
            });
            
            clearTimeout(timeoutId);

            if (!response.ok) {
              const errorText = await response.text();
              console.error(`API Error (${response.status}):`, errorText);
              throw new Error(`Analysis failed for ${file.name}: ${response.status} ${errorText || ''}`);
            }

            const result = await response.json();
            
            return {
              ...uploadedFilesData[index],
              fileName: file.name,
              imageUri: file.imageUri,
              detections: result.detections,
              uploadId: uploadedFilesData[index].$id
            };
          } catch (fetchError) {
            // If the main API fails, we could handle a fallback here
            console.error(`Fetch error:`, fetchError);
            
            if (fetchError.message.includes('Network request failed') || 
                fetchError.name === 'AbortError') {
              // Return a placeholder result to prevent the whole analysis from failing
              return {
                ...uploadedFilesData[index],
                fileName: file.name,
                imageUri: file.imageUri,
                detections: [{
                  class: 'Network Error',
                  probability: 0,
                  priority: 'Unknown',
                  description: 'Could not connect to analysis server. Try again later.',
                  recommendations: ['Check your internet connection', 'Retry the analysis']
                }],
                uploadId: uploadedFilesData[index].$id,
                isError: true
              };
            } else {
              throw fetchError; // Re-throw other errors
            }
          }
        })
      );

      console.log('Final analysis results:', analysisResults);

      // Navigate to results immediately (this is what worked before!)
      navigation.navigate('Results', { 
        files: uploadedFiles,
        analysisResults: analysisResults 
      });

      // AFTER navigation - try to save to database in the background
      // This way, if it fails, the user still sees results
      if (user && user.$id) {
        setTimeout(() => {
          try {
            analysisResults.forEach(async (result) => {
              if (result.detections && result.detections.length > 0 && !result.isError) {
                try {
                  const savedDocument = await saveDefectResult(user.$id, result);
                  
                  if (savedDocument && savedDocument.$id) {
                    // Create notification
                    const newNotification = {
                      id: savedDocument.$id,
                      type: 'Detected',
                      priority: result.detections[0]?.priority?.match(/^(\d+)/)?.[0] || 'N/A',
                      datetime: formatDateTime(new Date()),
                      name: result.fileName || 'Unnamed',
                      file: [result]
                    };
                    addNotification(newNotification);
                  }
                } catch (saveError) {
                  console.error('Error saving defect (non-blocking):', saveError);
                }
              }
            });
          } catch (err) {
            console.error('Background saving error (non-blocking):', err);
          }
        }, 0);
      }

    } catch (error) {
      console.error('Error in handleResults:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to process images. Please try again.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <BackgroundWrapper>
      <SafeAreaView style={globalStyles.safeArea} edges={['top']}>
        <View style={styles.contentContainer}>
          <HeaderAnalysis />
          <ImportSection onPress={pickImage} />
          <FilesList 
            files={uploadedFiles}
            onRemoveFile={removeFile}
          />
          <TouchableOpacity 
            style={[
              styles.resultsButton,
              (uploadedFiles.length === 0 || isAnalyzing) && styles.resultsButtonDisabled
            ]}
            onPress={handleResults}
            disabled={uploadedFiles.length === 0 || isAnalyzing}
          >
            <Text style={styles.resultsButtonText}>
              {isAnalyzing ? 'Analyzing...' : 'Results'}
            </Text>
          </TouchableOpacity>
        </View>
        <ActionButtons navigation={navigation} currentScreen="Analysis" />
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

const styles = {
  contentContainer: {
    flex: 1,
    padding: 20,
    paddingBottom: 90, // Add padding to avoid overlap with bottom navigation
  },
  resultsButton: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10, // Add some bottom margin
    ...shadows.light,
  },
  resultsButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultsButtonDisabled: {
    backgroundColor: '#D3D3D3',
  },
};