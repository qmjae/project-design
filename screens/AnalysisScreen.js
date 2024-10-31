import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';

export default function AnalysisScreen({ navigation }) {
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
    });

    if (!result.canceled) {
      const newFiles = result.assets.map(asset => ({
        uri: asset.uri,
        imageUri: asset.uri,
        name: asset.uri.split('/').pop(),
        size: '999 KB', // You would calculate actual size
        status: 'Upload Failed' // Default status, you can modify based on upload result
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={35} color="black" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Analysis</Text>
        </View>
      </View>

      {/* Import Section */}
      <TouchableOpacity 
        style={styles.importSection}
        onPress={pickImage}
      >
        <Ionicons name="cloud-upload-outline" size={50} color="#FFD700" />
        <Text style={styles.importText}>Import your image</Text>
        <Text style={styles.clickText}>Click to upload</Text>
      </TouchableOpacity>

      {/* Uploaded Files Section */}
      <View style={styles.filesSection}>
        <View style={styles.sectionHeader}>
          <Ionicons name="document-outline" size={35} color="#FFD700" />
          <Text style={styles.sectionTitle}>Uploaded Files</Text>
        </View>
        <ScrollView style={styles.filesList}>
          {uploadedFiles.map((file, index) => (
            <View key={index} style={styles.fileItem}>
              <View style={styles.fileInfo}>
                <Ionicons name="image-outline" size={35} color="#FFD700" />
                <View style={styles.fileDetails}>
                  <Text style={styles.fileName}>{file.name}</Text>
                  <Text style={styles.fileSize}>{file.size}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => removeFile(index)}>
                <Ionicons name="trash-outline" size={24} color="red" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Results Button */}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    position: 'relative',
  },
  backButton: {
    marginRight: 15,
    zIndex: 1,
    position: 'absolute',
    left: 0,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 29,
    fontWeight: '500',
    color: '#FFD700',
  },
  importSection: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#FFD700',
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    padding: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  importText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#FFD700',
  },
  clickText: {
    color: '#B2B2B8',
    marginTop: 5,
    fontSize: 20,
  },
  filesSection: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#FFD700',
  },
  filesList: {
    flex: 1,
    marginTop: 5,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 8,
    borderColor: '#F0EFE7',
    borderWidth: 1,
    backgroundColor: 'white',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileDetails: {
    marginLeft: 10,
  },
  fileName: {
    fontSize: 13,
    fontWeight: '500',
  },
  fileSize: {
    color: '#666',
    fontSize: 12,
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
