import { uploadFilesToAppwrite, saveDefectResult } from '../../../backend/lib/appwrite';
import { Alert } from 'react-native';
import { BACKEND_API_URL } from '../../config';
import { isSolarPanel } from './thermalPatternAnalysis';

/**
 * Processes images for defect detection, saves results, and navigates to the results screen.
 * @param {Array} images - Array of image objects (from gallery or snapshot).
 * @param {Function} setIsAnalyzing - Function to update the analyzing state.
 * @param {Function} addNotification - Function to add notifications.
 * @param {Object} navigation - React Navigation object.
 * @param {Object} user - User object with user ID.
 */
export const processAndAnalyzeImages = async (images, setIsAnalyzing, addNotification, navigation, user) => {
  if (images.length === 0) {
    Alert.alert("No Images", "No uploaded image! Please upload an image!", [{ text: "OK" }]);
    return;
  }

  setIsAnalyzing(true);
  try {
    // Step 1: Upload images to Appwrite
    const uploadedFilesData = await uploadFilesToAppwrite(images);
    console.log('Uploaded Files Data:', uploadedFilesData);

    // Step 2: Send each file to the defect detection API
    const analysisResults = await Promise.all(
      images.map(async (file, index) => {
        const formData = new FormData();
        formData.append('file', {
          uri: file.imageUri,
          type: file.type || 'image/jpeg',
          name: file.name,
        });

        const tryFetch = async (url) => {
          const response = await fetch(url, {
            method: 'POST',
            body: formData,
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'multipart/form-data',
            },
          });

          if (!response.ok) {
            throw new Error(`Fetch failed with status: ${response.status}`);
          }

          return response.json();
        };

        let result;
        try {
          // Try primary server
          result = await tryFetch(BACKEND_API_URL); 
        } catch (errPrimary) {
          console.warn(`Primary server failed for ${file.name}: ${errPrimary.message}`);
          try {
            // Fallback to secondary server
            result = await tryFetch('https://yeti-fleet-distinctly.ngrok-free.app/detect/'); 
          } catch (errSecondary) {
            console.error(`Secondary server also failed for ${file.name}: ${errSecondary.message}`);
            throw new Error(`Analysis failed for ${file.name}`);
          }
        }

        // NEW: Check if the image contains a solar panel
        const containsSolarPanel = isSolarPanel(result, file.imageUri);
        
        return {
          ...uploadedFilesData[index],
          fileName: file.name,
          imageUri: file.imageUri,
          detections: result.detections,
          uploadId: uploadedFilesData[index].$id,
          containsSolarPanel: containsSolarPanel // Add this flag to the result
        };
      })
    );

    console.log('Final analysis results:', analysisResults);

    // Step 3: Save defect results and create notifications
    const savedNotifications = await Promise.all(
      analysisResults.map(async (result) => {
        // NEW: Check if it's a solar panel before processing defects
        if (!result.containsSolarPanel) {
          // Return notification for non-solar panel image
          return {
            id: `no-solar-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            type: 'Warning',
            priority: 'High',
            datetime: new Date().toISOString(),
            name: result.fileName,
            message: 'No solar panel detected in this image',
            file: [{
              fileName: result.fileName,
              imageUri: result.imageUri,
              detections: [] // No defects since it's not a solar panel
            }]
          };
        }
        
        // Process solar panel images
        if (result.detections && result.detections.length > 0) {
          // Solar panel with defects detected
          try {
            const savedDocument = await saveDefectResult(user.$id, result);
            console.log('Saved defect to database:', savedDocument);

            return {
              id: savedDocument.$id,
              type: 'Detected',
              priority: result.detections[0].priority.match(/^(\d+)/)?.[0],
              datetime: new Date().toISOString(),
              name: result.fileName,
              file: [result],
            };
          } catch (err) {
            console.error('Error saving defect:', err);
            return null;
          }
        } else {
          // NEW: Solar panel with no defects - don't create a notification
          // This will prevent it from showing up in the notifications section altogether
          return {
            id: `no-defect-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            type: 'Info',
            priority: 'Low',
            datetime: new Date().toISOString(),
            name: result.fileName,
            message: 'No defects detected on this solar panel',
            file: [{
              fileName: result.fileName,
              imageUri: result.imageUri,
              detections: [{
                class: 'No defect',
                priority: 'Low'
              }] 
            }],
            skipNotification: true // Add flag to skip adding to notifications
          };
        }
      })
    );

    // Step 4: Add notifications - filter out nulls and notifications flagged to skip
    savedNotifications
      .filter(notification => notification !== null && !notification.skipNotification)
      .forEach(notification => addNotification(notification));

    // Step 5: Navigate to Results
    navigation.navigate('Results', { files: images, analysisResults });

  } catch (error) {
    console.error('Error:', error);
    Alert.alert('Error', error.message || 'Failed to process images. Please try again.');
  } finally {
    setIsAnalyzing(false);
  }
};