import React, { useState } from 'react';
import { View, StyleSheet, Alert, Dimensions } from 'react-native';
import { HeaderResults } from '../components/results/HeaderResults';
import { ResultCard } from '../components/results/ResultCard';
import { PaginationDots } from '../components/results/PaginationDots';
import BackgroundWrapper from '../components/common/BackgroundWrapper';
import { useNavigation } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  runOnJS,
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

export default function ResultsScreen({ route }) {
  const navigation = useNavigation();
  const { analysisResults } = route.params;
  const [currentIndex, setCurrentIndex] = useState(0);
  const translateX = useSharedValue(0);

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

  const updateIndex = (newIndex) => {
    if (newIndex >= 0 && newIndex < analysisResults.length) {
      setCurrentIndex(newIndex);
      translateX.value = 0;
    }
  };

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startX = translateX.value;
    },
    onActive: (event, context) => {
      const newTranslateX = context.startX + event.translationX;
      if (
        (currentIndex === 0 && newTranslateX > 0) ||
        (currentIndex === analysisResults.length - 1 && newTranslateX < 0)
      ) {
        translateX.value = newTranslateX / 3;
      } else {
        translateX.value = newTranslateX;
      }
    },
    onEnd: (event) => {
      if (Math.abs(event.velocityX) > 500 || Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        if (event.velocityX > 0 && currentIndex > 0) {
          runOnJS(updateIndex)(currentIndex - 1);
        } else if (event.velocityX < 0 && currentIndex < analysisResults.length - 1) {
          runOnJS(updateIndex)(currentIndex + 1);
        } else {
          translateX.value = withSpring(0, {
            velocity: event.velocityX,
            stiffness: 100,
            damping: 10
          });
        }
      } else {
        translateX.value = withSpring(0, {
          velocity: event.velocityX,
          stiffness: 100,
          damping: 10
        });
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BackgroundWrapper>
        <View style={styles.container}>
          <HeaderResults onBack={handleBack} />
          <View style={styles.contentContainer}>
            <PanGestureHandler onGestureEvent={gestureHandler}>
              <Animated.View style={[styles.cardsContainer, animatedStyle]}>
                {analysisResults.map((result, index) => (
                  <View
                    key={index}
                    style={[
                      styles.cardWrapper,
                      { 
                        opacity: currentIndex === index ? 1 : 0,
                        pointerEvents: currentIndex === index ? 'auto' : 'none'
                      }
                    ]}
                  >
                    <ResultCard
                      item={result}
                      width="100%"
                    />
                  </View>
                ))}
              </Animated.View>
            </PanGestureHandler>
          </View>
          <PaginationDots
            totalDots={analysisResults.length}
            activeIndex={currentIndex}
          />
        </View>
      </BackgroundWrapper>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardsContainer: {
    flex: 1,
    width: '100%',
  },
  cardWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});