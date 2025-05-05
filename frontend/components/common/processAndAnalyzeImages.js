import { uploadFilesToAppwrite, saveDefectResult } from '../../../backend/lib/appwrite';
import { Alert } from 'react-native';
import { BACKEND_API_URL } from '../../config';

export const processAndAnalyzeImages = async (images, setIsAnalyzing, addNotification, navigation, user) => {
  if (!images.length) {
    return Alert.alert("No Images", "No uploaded image! Please upload an image!", [{ text: "OK" }]);
  }

  setIsAnalyzing(true);
  try {
    const uploadedFilesData = await uploadFilesToAppwrite(images);
    console.log('Uploaded Files Data:', uploadedFilesData);

    const tryFetch = async (url, formData) => {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (!response.ok) throw new Error(`Fetch failed with status: ${response.status}`);
      return response.json();
    };

    const analysisResults = await Promise.all(images.map(async (file, index) => {
      const formData = new FormData();
      formData.append('file', {
        uri: file.imageUri,
        type: file.type || 'image/jpeg',
        name: file.name,
      });

      // Classify first
      const classifyResponse = await tryFetch(`${BACKEND_API_URL}/classify/`, formData);
      const imageClass = classifyResponse.prediction || classifyResponse.label;
      console.log("Classification Result:", imageClass);

      if (["Not-Solar", "Not-Thermal"].includes(imageClass)) {
        return {
          ...uploadedFilesData[index],
          fileName: file.name,
          imageUri: file.imageUri,
          imageClass,
          skipAnalysis: true
        };
      }

      // Try primary and secondary detect endpoints
      let result;
      try {
        result = await tryFetch(`${BACKEND_API_URL}/detect/`, formData);
      } catch (primaryError) {
        console.warn(`Primary server failed: ${primaryError.message}`);
        result = await tryFetch('https://yeti-fleet-distinctly.ngrok-free.app/detect/', formData);
      }

      return {
        ...uploadedFilesData[index],
        fileName: file.name,
        imageUri: file.imageUri,
        detections: result.detections,
        uploadId: uploadedFilesData[index].$id,
        imageClass,
        skipAnalysis: false,
      };
    }));

    console.log('Final analysis results:', analysisResults);

    const savedNotifications = await Promise.all(analysisResults.map(async result => {
      if (result.skipAnalysis) {
        const reason = result.imageClass === "Not-Solar"
          ? "No solar panel detected."
          : "This is not a thermal image.";
        return {
          id: `skip-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          type: 'Warning',
          priority: 'Medium',
          datetime: new Date().toISOString(),
          name: result.fileName,
          message: `Image skipped. ${reason}`,
          file: [{ fileName: result.fileName, imageUri: result.imageUri, detections: [] }]
        };
      }

      if (result.detections?.length > 0) {
        try {
          const savedDoc = await saveDefectResult(user.$id, result);
          return {
            id: savedDoc.$id,
            type: 'Detected',
            priority: result.detections[0].priority.match(/^(\d+)/)?.[0] || 'Medium',
            datetime: new Date().toISOString(),
            name: result.fileName,
            file: [result],
          };
        } catch (err) {
          console.error('Error saving result:', err);
          return null;
        }
      }

      return {
        id: `no-defect-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        type: 'Info',
        priority: 'Low',
        datetime: new Date().toISOString(),
        name: result.fileName,
        message: 'No defects detected on this solar panel',
        file: [{
          fileName: result.fileName,
          imageUri: result.imageUri,
          detections: [{ class: 'No defect', priority: 'Low' }]
        }],
        skipNotification: true
      };
    }));

    savedNotifications
      .filter(n => n && !n.skipNotification)
      .forEach(addNotification);

    navigation.navigate('Results', { files: images, analysisResults });

  } catch (err) {
    console.error('Processing error:', err);
    Alert.alert('Error', err.message || 'Failed to process images. Please try again.');
  } finally {
    setIsAnalyzing(false);
  }
};