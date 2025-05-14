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

    const tryFetch = async (url, formData, timeout = 40000) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(url, {
          method: 'POST',
          body: formData,
          signal: controller.signal,
          // Do NOT set Content-Type manually when using FormData
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Fetch failed with status: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    };

    const analysisResults = await Promise.all(images.map(async (file, index) => {
      const formData = new FormData();
      formData.append('file', {
        uri: file.imageUri,
        type: file.type || 'image/jpeg',
        name: file.name,
      });

      // Classify first with fallback
      let classifyResponse;
      try {
        classifyResponse = await tryFetch(`${BACKEND_API_URL}/classify/`, formData);
      } catch (primaryError) {
        console.warn(`Classification server failed: ${primaryError.message}`);
        throw primaryError;
      }

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
        console.warn(`Detection server failed: ${primaryError.message}`);
        throw primaryError;
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

    // Augment analysisResults with databaseId and prepare notifications
    const augmentedAnalysisResults = [];
    const notificationsToCreate = [];
    let primaryNotificationId = undefined; // To store the ID of the first detected defect notification

    for (const result of analysisResults) {
      let notification;
      let augmentedResult = { ...result }; // Start with the original result

      if (result.skipAnalysis) {
        const reason = result.imageClass === "Not-Solar"
          ? "No solar panel detected."
          : "This is not a thermal image.";
        notification = {
          id: `skip-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          type: 'Warning',
          priority: 'Medium',
          datetime: new Date().toISOString(),
          name: result.fileName,
          message: `Image skipped. ${reason}`,
          file: [{ fileName: result.fileName, imageUri: result.imageUri, detections: [] }]
        };
      } else if (result.detections?.length > 0) {
        try {
          const savedDoc = await saveDefectResult(user.$id, result);
          augmentedResult.databaseId = savedDoc.$id; // Augment with databaseId
          augmentedResult.status = savedDoc.status; // Carry over the status from Appwrite doc
          notification = {
            id: savedDoc.$id, // This is the notificationId for this specific defect
            type: 'Detected',
            status: savedDoc.status, // Add status here for the initial notification object
            priority: result.detections[0].priority.match(/^(\d+)/)?.[0] || 'Medium',
            datetime: new Date().toISOString(),
            name: result.fileName,
            file: [augmentedResult], // Use augmented result
          };
          if (!primaryNotificationId) {
            primaryNotificationId = savedDoc.$id; // Capture the first detected defect's ID
          }
        } catch (err) {
          console.error('Error saving result:', err);
          notification = null; // Or handle error appropriately
        }
      } else {
        notification = {
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
      }

      augmentedAnalysisResults.push(augmentedResult);
      if (notification) {
        notificationsToCreate.push(notification);
      }
    }

    notificationsToCreate
      .filter(n => n && !n.skipNotification)
      .forEach(addNotification);

    console.log('Navigating to Results with notificationId:', primaryNotificationId, 'and analysisResults:', augmentedAnalysisResults);
    navigation.navigate('Results', { 
      analysisResults: augmentedAnalysisResults, 
      notificationId: primaryNotificationId 
    });

  } catch (err) {
    console.error('Processing error:', err);
    Alert.alert('Error', err.message || 'Failed to process images. Please try again.');
  } finally {
    setIsAnalyzing(false);
  }
};