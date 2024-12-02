import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { HeaderAnalysis } from '../components/analysis/HeaderAnalysis';
import { ImportSection } from '../components/analysis/ImportSection';
import { FilesList } from '../components/analysis/FilesList';
import { uploadFilesToAppwrite } from '../../backend/lib/appwrite';
import BackgroundWrapper from '../components/common/BackgroundWrapper';

export default function AnalysisScreen({ navigation }) {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleBack = () => {
    // Clear the navigation stack and go back to Home
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
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

          const response = await fetch('https://adlaw-api.onrender.com/detect/', {
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
      <SafeAreaView style={styles.container}>
        <HeaderAnalysis onBack={handleBack} />
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
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 20,
  },
  resultsButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#76c0df',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultsButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultsButtonDisabled: {
    backgroundColor: '#D3D3D3',
  },
}); 