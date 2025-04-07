import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { 
  FadeOut,
  FadeIn,
  LinearTransition,
  SlideOutRight
} from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';

export const FileItem = memo(({ file, onRemove }) => (
  <Animated.View 
    entering={FadeIn}
    exiting={SlideOutRight.duration(200)}
    layout={LinearTransition.springify()}
    style={styles.fileItem}
  >
    <View style={styles.fileInfo}>
      <Ionicons name="image-outline" size={35} color="#76c0df" />
      <View style={styles.fileDetails}>
        <Text style={styles.fileName}>{file.name}</Text>
        <Text style={styles.fileSize}>{file.size}</Text>
      </View>
    </View>
    <TouchableOpacity onPress={onRemove}>
        <Ionicons name="trash-outline" size={24} color="red" />
    </TouchableOpacity>
  </Animated.View>
));

const styles = StyleSheet.create({
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 8,
    borderColor: '#F0EFE7',
    borderWidth: 1,
    backgroundColor: 'white',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileDetails: {
    marginLeft: 10,
  },
  fileName: {
    fontSize: 13,
    fontWeight: '500',
  },
  fileSize: {
    color: '#666',
    fontSize: 12,
  },
}); 