import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SafeAreaView, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { HeaderAnalysis } from '../components/analysis/HeaderAnalysis';
import { ImportSection } from '../components/analysis/ImportSection';
import { FilesList } from '../components/analysis/FilesList';

export default function AnalysisScreen({ navigation }) {
  const [uploadedFiles, setUploadedFiles] = useState([]);

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
          uri: asset.uri,
          imageUri: asset.uri,
          name: asset.uri.split('/').pop(),
          size: '999 KB',
        }));
      setUploadedFiles([...uploadedFiles, ...newFiles]);
    }
  };

  const removeFile = (index) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
  };

  const handleResults = () => {
    if (uploadedFiles.length === 0) {
      Alert.alert(
        "No Images",
        "No uploaded image! Please upload an image!",
        [{ text: "OK" }]
      );
    } else {
      navigation.navigate('Results', { files: uploadedFiles });
    }
  };

  return (
      <SafeAreaView style={styles.container}>
        <HeaderAnalysis onBack={() => navigation.goBack()} />
        <ImportSection onPress={pickImage} />
        <FilesList 
          files={uploadedFiles}
          onRemoveFile={removeFile}
        />
        <TouchableOpacity 
          style={[
            styles.resultsButton,
            uploadedFiles.length === 0 && styles.resultsButtonDisabled
          ]}
          onPress={handleResults}
        >
          <Text style={styles.resultsButtonText}>Results</Text>
        </TouchableOpacity>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  resultsButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#FFD700',
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