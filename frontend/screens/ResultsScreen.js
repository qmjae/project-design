import React, { useState, useRef } from 'react';
import { View, StyleSheet, Alert, Animated, PanResponder } from 'react-native';
import { HeaderResults } from '../components/results/HeaderResults';
import { ResultCard } from '../components/results/ResultCard';
import { PaginationDots } from '../components/results/PaginationDots';
import BackgroundWrapper from '../components/common/BackgroundWrapper';
import { useNavigation } from '@react-navigation/native';

export default function ResultsScreen({ route }) {
  const navigation = useNavigation();
  const { analysisResults } = route.params;
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const pan = useRef(new Animated.ValueXY()).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (e, gestureState) => {
        const screenWidth = 300; // Approximate card width
        const moveX = gestureState.dx;
        const threshold = screenWidth / 3;

        if (Math.abs(moveX) > threshold) {
          const newIndex = moveX > 0 
            ? Math.max(0, currentIndex - 1)
            : Math.min(analysisResults.length - 1, currentIndex + 1);
          
          setCurrentIndex(newIndex);
        }

        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false
        }).start();
      }
    })
  ).current;

  const handleBack = () => {
    Alert.alert(
      "Leave Results",
      "Are you sure you want to go back? Your results will not be saved.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Leave",
          style: "destructive",
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Analysis' }],
            });
          }
        }
      ]
    );
  };

  return (
    <BackgroundWrapper>
      <View style={styles.container}>
        <HeaderResults onBack={handleBack} />
        <Animated.View 
          style={[styles.cardsContainer, { transform: [{ translateX: pan.x }] }]}
          {...panResponder.panHandlers}
        >
          {analysisResults.map((result, index) => (
            <View
              key={index}
              style={[
                styles.cardWrapper,
                { display: currentIndex === index ? 'flex' : 'none' }
              ]}
            >
              <ResultCard
                item={result}
                width={styles.cardWrapper.width}
              />
            </View>
          ))}
        </Animated.View>
        <PaginationDots
          totalDots={analysisResults.length}
          activeIndex={currentIndex}
        />
      </View>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  cardsContainer: {
    flex: 1,
    position: 'relative',
  },
  cardWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    width: '100%',
  },
});