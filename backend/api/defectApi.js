import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/';  // Replace with your computer's IP

export const defectApi = {
  async detectDefects(imageUri) {
    try {
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
      console.error('Error detecting defects:', error);
      throw error;
    }
  }
};