import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';

const DEFECT_COLORS = {
  'short-circuit': 'red',
  'partial-shading': 'green',
  'dust-deposit': 'blue',
  'bypass-diode': 'orange',
};

const screenWidth = Dimensions.get('window').width;

export const BoundedImage = ({ imageUri, detections }) => {
  const [imageLayout, setImageLayout] = useState({ width: 0, height: 0 });
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    Image.getSize(imageUri, (width, height) => {
      setNaturalSize({ width, height });
    });
  }, [imageUri]);

  const scaleCoordinates = (bbox) => {
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
          {detections?.map((detection, index) => {
            const scaledBbox = scaleCoordinates(detection.bbox);
            const [x1, y1, x2, y2] = scaledBbox;
            const color = DEFECT_COLORS[detection.class] || 'red';
            const label = `${detection.class}`;
            
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
  }
});