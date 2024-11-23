import axios from 'axios';

const API_URL = 'http://192.168.1.56:8000';

export const defectApi = {
  async detectDefects(imageUri) {
    try {
      console.log('Making API request to:', `${API_URL}/detect/`);
      
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'image.jpg',
      });

      const response = await axios.post(`${API_URL}/detect/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error detecting defects:', error.response || error);
      throw error;
    }
  },

  async detectMultipleDefects(files) {
    try {
      console.log('Processing multiple files for detection...');
      const results = await Promise.all(
        files.map(async (file) => {
          const result = await this.detectDefects(file.imageUri);
          return {
            ...file,
            detections: result.detections
          };
        })
      );
      console.log('Multiple detection results:', results);
      return results;
    } catch (error) {
      console.error('Error detecting multiple defects:', error);
      throw error;
    }
  }
};