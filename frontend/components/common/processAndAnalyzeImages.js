import { uploadFilesToAppwrite, saveDefectResult } from '../../../backend/lib/appwrite';
import { Alert } from 'react-native';

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
          //result = await tryFetch('https://yeti-fleet-distinctly.ngrok-free.app/detect/'); 
          result = await tryFetch('http://192.168.1.18:8000/detect/'); 
        } catch (errPrimary) {
          console.warn(`Primary server failed for ${file.name}: ${errPrimary.message}`);
          try {
            // Fallback to secondary server
            result = await tryFetch('https://yeti-fleet-distinctly.ngrok-free.app/detect/'); 
           // result = await tryFetch('https://midge-unique-cow.ngrok-free.app/detect/');
          } catch (errSecondary) {
            console.error(`Secondary server also failed for ${file.name}: ${errSecondary.message}`);
            throw new Error(`Analysis failed for ${file.name}`);
          }
        }

        return {
          ...uploadedFilesData[index],
          fileName: file.name,
          imageUri: file.imageUri,
          detections: result.detections,
          uploadId: uploadedFilesData[index].$id,
        };
      })
    );

    console.log('Final analysis results:', analysisResults);

    // Step 3: Save defect results and create notifications
    const savedNotifications = await Promise.all(
      analysisResults.map(async (result) => {
        if (result.detections && result.detections.length > 0) {
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
        }
        return null;
      })
    );

    // Step 4: Add notifications
    savedNotifications
      .filter(notification => notification !== null)
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