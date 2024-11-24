import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { FileItem } from './FileItem';

export const FilesList = ({ files, onRemoveFile }) => (
  <View style={styles.filesSection}>
    <View style={styles.sectionHeader}>
      <Ionicons name="document" size={35} color="#76c0df" />
      <Text style={styles.sectionTitle}>Uploaded Files</Text>
    </View>
    <ScrollView style={styles.filesList}>
      {files.map((file, index) => (
        <FileItem 
          key={index}
          file={file}
          onRemove={() => onRemoveFile(index)}
        />
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
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
}); 