import React, { useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Text, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useGlobalContext } from '../../../backend/context/GlobalProvider';
import { uploadImage, updateUserProfilePicture } from '../../../backend/lib/appwrite';

const ImageProfile = () => {
  const { user, setUser } = useGlobalContext();
  const [imageUri, setImageUri] = useState(user ? user.avatar : null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImageUri(uri);

      try {
        const imageUrl = await uploadImage(uri);
        const updatedUser = await updateUserProfilePicture(user.$id, imageUrl);
        setUser(updatedUser);
        Alert.alert('Success', 'Profile picture updated successfully');
      } catch (error) {
        Alert.alert('Error', error.message || 'An unexpected error occurred');
      }
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <Ionicons name="person-circle-outline" size={100} color="#ccc" />
        )}
      </TouchableOpacity>
      <Text style={styles.text}>{user ? user.username : 'User'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  imageContainer: {
    borderRadius: 50,
    overflow: 'hidden',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  text: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
});

export default ImageProfile;