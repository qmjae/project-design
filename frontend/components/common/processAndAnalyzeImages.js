import { uploadFilesToAppwrite, saveDefectResult } from '../../../backend/lib/appwrite';
import { Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import { BACKEND_API_URL } from '../../config';

export const processAndAnalyzeImages = async (
  images,
  setIsAnalyzing,
  addNotification,
  navigation,
  user
) => {
  if (!images.length) {
    return Alert.alert(
      'No Images',
      'No uploaded image! Please upload an image!',
      [{ text: 'OK' }]
    );
  }

  setIsAnalyzing(true);

  try {
    // UPLOAD RAW FILES
    const uploadedFilesData = await uploadFilesToAppwrite(images);
    console.log('Uploaded Files Data:', uploadedFilesData);

    // Helper that retries with timeout
    const tryFetch = async (url, formData, timeout = 40000) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(url, {
          method: 'POST',
          body: formData,
          signal: controller.signal,
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

    // CLASSIFY  ➜  DETECT  ➜  BUILD BASE results[]
    const analysisResults = await Promise.all(
      images.map(async (file, index) => {
        const formData = new FormData();
        formData.append('file', {
          uri: file.imageUri,
          type: file.type || 'image/jpeg',
          name: file.name,
        });

        // Classify
        let classifyResponse;
        try {
          classifyResponse = await tryFetch(
            `${BACKEND_API_URL}/classify/`,
            formData
          );
        } catch (err) {
          console.warn(`Classification server failed: ${err.message}`);
          throw err;
        }

        const imageClass = classifyResponse.prediction || classifyResponse.label;
        console.log('Classification Result:', imageClass);

        // Skipped images
        if (['Not-Solar', 'Not-Thermal'].includes(imageClass)) {
          return {
            ...uploadedFilesData[index],
            fileName: file.name,
            imageUri: file.imageUri,
            imageClass,
            skipAnalysis: true,
          };
        }

        // Detect
        let detectResponse;
        try {
          detectResponse = await tryFetch(
            `${BACKEND_API_URL}/detect/`,
            formData
          );
        } catch (err) {
          console.warn(`Detection server failed: ${err.message}`);
          throw err;
        }

        return {
          ...uploadedFilesData[index],
          fileName: file.name,
          imageUri: file.imageUri,
          detections: detectResponse.detections,
          uploadId: uploadedFilesData[index].$id,
          imageClass,
          skipAnalysis: false,
        };
      })
    );

    console.log('Final analysis results:', analysisResults);

    // PER-RESULT POST-PROCESS
    const augmentedAnalysisResults = [];
    const notificationsToCreate = [];
    let primaryNotificationId = undefined;

    for (const result of analysisResults) {
      // SKIPPED OR EMPTY
      if (result.skipAnalysis) {
        const reason =
          result.imageClass === 'Not-Solar'
            ? 'No solar panel detected.'
            : 'This is not a thermal image.';

        const notification = {
          id: `skip-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          type: 'Warning',
          priority: 'Medium',
          datetime: new Date().toISOString(),
          name: result.fileName,
          message: `Image skipped. ${reason}`,
          file: [
            {
              fileName: result.fileName,
              imageUri: result.imageUri,
              detections: [],
            },
          ],
        };
        augmentedAnalysisResults.push(result);
        notificationsToCreate.push(notification);

        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Image Skipped',
            body: `${result.fileName}: ${reason}`,
            data: { fileName: result.fileName },
          },
          trigger: null,
        });

        continue; // Move to next result
      }

      // GROUP BY defect class
      const grouped =
        result.detections?.reduce((acc, det) => {
          const key = det.class || 'Unknown';
          if (!acc[key]) acc[key] = [];
          acc[key].push(det);
          return acc;
        }, {}) || {}; // Ensures we always have an object

      if (Object.keys(grouped).length === 0) {
        // No detections
        const notification = {
          id: `no-defect-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          type: 'Info',
          priority: 'Low',
          datetime: new Date().toISOString(),
          name: result.fileName,
          message: 'No defects detected on this solar panel',
          file: [
            {
              fileName: result.fileName,
              imageUri: result.imageUri,
              detections: [{ class: 'No defect', priority: 'Low' }],
            },
          ],
          skipNotification: true,
        };
        augmentedAnalysisResults.push(result);
        notificationsToCreate.push(notification);

        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Analysis Complete',
            body: `No defects found in ${result.fileName}.`,
            data: { fileName: result.fileName },
          },
          trigger: null,
        });

        continue;
      }

      // CREATE A CARD PER DEFECT CLASS
      for (const [defectName, detectionsOfThatClass] of Object.entries(
        grouped
      )) {
        const uniqueId = `${result.uploadId}-${defectName}-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 5)}`;

        const individualResult = {
          ...result,
          detections: result.detections, // keep ALL boxes changed
          primaryDetection: detectionsOfThatClass[0], // representative
          defectName,
          id: uniqueId,
        };

        // Save in DB & build notification
        try {
          const savedDoc = await saveDefectResult(user.$id, individualResult);
          individualResult.databaseId = savedDoc.$id;
          individualResult.status = savedDoc.status;

          // In-app notification object
          const notification = {
            id: savedDoc.$id,
            type: 'Detected',
            status: savedDoc.status,
            priority:
              detectionsOfThatClass[0].priority.match(/^(\d+)/)?.[0] ||
              'Medium',
            datetime: new Date().toISOString(),
            name: result.fileName,
            file: [individualResult],
          };

          if (!primaryNotificationId) primaryNotificationId = savedDoc.$id;
          notificationsToCreate.push(notification);

          // OS-level push
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `Defect Detected: ${defectName}`,
              body: `${detectionsOfThatClass.length} instance(s) of ${defectName} detected in ${result.fileName}.`,
              data: {
                notificationId: savedDoc.$id,
                fileName: result.fileName,
              },
            },
            trigger: null,
          });
        } catch (err) {
          console.error('Error saving defect result:', err);
        }

        augmentedAnalysisResults.push(individualResult);
      }
    }

    // PUSH IN-APP NOTIFICATIONS & NAVIGATE
    notificationsToCreate
      .filter((n) => n && !n.skipNotification)
      .forEach(addNotification);

    console.log(
      'Navigating to Results with notificationId:',
      primaryNotificationId,
      'and analysisResults:',
      augmentedAnalysisResults
    );

    navigation.navigate('Results', {
      analysisResults: augmentedAnalysisResults,
      notificationId: primaryNotificationId,
    });
  } catch (err) {
    console.error('Processing error:', err);
    Alert.alert(
      'Error',
      err.message || 'Failed to process images. Please try again.'
    );
  } finally {
    setIsAnalyzing(false);
  }
};