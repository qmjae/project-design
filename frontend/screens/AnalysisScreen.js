import React, { useState } from 'react';
import { SafeAreaView, TouchableOpacity, Text, Alert, View} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import { useGlobalContext } from '../../backend/context/GlobalProvider';
import { HeaderAnalysis } from '../components/analysis/HeaderAnalysis';
import { ImportSection } from '../components/analysis/ImportSection';
import { FilesList } from '../components/analysis/FilesList';
import { uploadFilesToAppwrite } from '../../backend/lib/appwrite';
import BackgroundWrapper from '../components/common/BackgroundWrapper';
import ActionButtons from '../components/navigation/ActionButtons';
import { saveDefectResult } from '../../backend/lib/appwrite';
import { globalStyles, colors, shadows } from '../styles/globalStyles';

export default function AnalysisScreen({ navigation }) {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { setAnalysisResults, addNotification, user } = useGlobalContext();

  const formatDateTime = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
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

  // Update the handleResults function

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
      // First, upload files to Appwrite
      const uploadedFilesData = await uploadFilesToAppwrite(uploadedFiles);
      console.log('Analysis Screen Uploaded Files Data:', uploadedFilesData);

      // Then process each file for defect detection
      const analysisResults = await Promise.all(
        uploadedFiles.map(async (file, index) => {
          const formData = new FormData();
          formData.append('file', {
            uri: file.imageUri,
            type: file.type || 'image/jpeg',
            name: file.name
          });

          const response = await fetch('https://yeti-fleet-distinctly.ngrok-free.app/detect/', {
            method: 'POST',
            body: formData,
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'multipart/form-data',
            },
          });

          if (!response.ok) {
            throw new Error(`Analysis failed for ${file.name}`);
          }

          const result = await response.json();
          
          // Combine Appwrite data with detection results
          return {
            ...uploadedFilesData[index], // Appwrite file data
            fileName: file.name,
            imageUri: file.imageUri,
            detections: result.detections,
            uploadId: uploadedFilesData[index].$id // Appwrite file ID
          };
        })
      );

      console.log('Final analysis results:', analysisResults);

      // Save defect results to database BEFORE adding to notifications
      const savedNotifications = await Promise.all(
        analysisResults.map(async (result) => {
          if (result.detections && result.detections.length > 0) {
            try {
              // Save to database first to get a valid document ID
              const savedDocument = await saveDefectResult(user.$id, result);
              console.log('Saved defect to database:', savedDocument);
              
              // Return notification with valid database ID
              return {
                id: savedDocument.$id, // Use the actual database ID!
                type: 'Detected',
                priority: result.detections[0].priority.match(/^(\d+)/)?.[0],
                datetime: formatDateTime(new Date()),
                name: result.fileName,
                file: [result],
              };
            } catch (err) {
              console.error('Error saving defect:', err);
              return null;
            }
          }
          return null;
        })
      );
      
      // Filter out nulls and add to notifications
      savedNotifications
        .filter(notification => notification !== null)
        .forEach(notification => {
          addNotification(notification);
        });

      navigation.navigate('Results', { 
        files: uploadedFiles,
        analysisResults: analysisResults 
      });

    } catch (error) {
      console.error('Error:', error);
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