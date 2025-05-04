import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Dimensions, Text } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';

const DEFECT_COLORS = {
  'short-circuit': 'red',
  'open-circuit': 'green',
  'dust-deposit': 'blue',
  'substring': 'purple',
  'single-cell': 'yellow',
};

const screenWidth = Dimensions.get('window').width;

export const BoundedImage = ({ imageUri, detections = [] }) => {
  const [imageLayout, setImageLayout] = useState({ width: 0, height: 0 });
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });

  // Ensure detections is always an array
  const safeDetections = Array.isArray(detections) ? detections : [];

  useEffect(() => {
    if (imageUri) {
      Image.getSize(imageUri, (width, height) => {
        setNaturalSize({ width, height });
      }, (error) => {
        console.error('Error loading image dimensions:', error);
      });
    }
  }, [imageUri]);

  const scaleCoordinates = (bbox) => {
    if (!bbox || !Array.isArray(bbox) || bbox.length < 4) return [0, 0, 0, 0];
    if (naturalSize.width === 0 || naturalSize.height === 0) return bbox;

    const [x1, y1, x2, y2] = bbox;
    const scaleX = imageLayout.width / naturalSize.width;
    const scaleY = imageLayout.height / naturalSize.height;

    return [
      x1 * scaleX,
      y1 * scaleY,
      x2 * scaleX,
      y2 * scaleY
    ];
  };

  if (!imageUri) {
    return (
      <View style={[styles.container, styles.noImage]}>
        <Text style={styles.noImageText}>No image available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View 
        style={styles.imageContainer}
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          setImageLayout({ width, height });
        }}
      >
        <Image 
          source={{ uri: imageUri }} 
          style={styles.image}
        />
        
        <Svg style={StyleSheet.absoluteFill}>
          {safeDetections.map((detection, index) => {
            // Skip if detection doesn't have the expected structure
            if (!detection || !detection.bbox) {
              return null;
            }
            
            const scaledBbox = scaleCoordinates(detection.bbox);
            const [x1, y1, x2, y2] = scaledBbox;
            const color = DEFECT_COLORS[detection.class] || 'red';
            const label = `${detection.class || 'Unknown'}`;
            
            return (
              <React.Fragment key={index}>
                <SvgText
                  x={x1}
                  y={y1 - 5}
                  fill={color}
                  fontSize="15"
                  fontWeight="bold"
                >
                  {label}
                </SvgText>
                <Rect
                  x={x1}
                  y={y1}
                  width={x2 - x1}
                  height={y2 - y1}
                  strokeWidth="2"
                  stroke={color}
                  fill="transparent"
                />
              </React.Fragment>
            );
          })}
        </Svg>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 300,
    backgroundColor: '#F6F6F6',
    borderRadius: 10,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain'
  },
  noImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: '#999',
    fontSize: 16,
  },
});