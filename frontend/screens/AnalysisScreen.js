import React, { useState } from 'react';
import { SafeAreaView, TouchableOpacity, Text, Alert, View} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import { useGlobalContext } from '../../backend/context/GlobalProvider';
import { HeaderAnalysis } from '../components/analysis/HeaderAnalysis';
import { ImportSection } from '../components/analysis/ImportSection';
import { FilesList } from '../components/analysis/FilesList';
import BackgroundWrapper from '../components/common/BackgroundWrapper';
import ActionButtons from '../components/navigation/ActionButtons';
import { globalStyles, colors, shadows } from '../styles/globalStyles';
import { processAndAnalyzeImages } from '../components/common/processAndAnalyzeImages';

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
    processAndAnalyzeImages(uploadedFiles, setIsAnalyzing, addNotification, navigation, user);
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
    paddingBottom: 90,
  },
  resultsButton: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
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