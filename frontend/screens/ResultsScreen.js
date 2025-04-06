import React from 'react';
import { View, Alert, Dimensions } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { useGlobalContext } from '../../backend/context/GlobalProvider';
import { HeaderResults } from '../components/results/HeaderResults';
import { ResultCard } from '../components/results/ResultCard';
import { PaginationDots } from '../components/results/PaginationDots';
import BackgroundWrapper from '../components/common/BackgroundWrapper';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ActionButtons from '../components/navigation/ActionButtons';
import { globalStyles } from '../styles/globalStyles';

const PAGE_WIDTH = Dimensions.get('window').width;
const PAGE_PADDING = 16;

export default function ResultsScreen({ route }) {
  const navigation = useNavigation();
  const { notificationId, analysisResults } = route.params;
  const { updateNotificationType } = useGlobalContext();
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const handleBack = () => {
    Alert.alert(
      "Leave Results",
      "Are you sure? Only resolved results will be saved.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: () => {
            if (notificationId) {
              updateNotificationType(notificationId, 'Unresolved');
            }
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            });
          }
        }
      ]
    );
  };

  return (
    <BackgroundWrapper>
      <SafeAreaView style={globalStyles.safeArea}>
        <View style={globalStyles.container}>
          <View style={styles.cardsContainer}>
            <HeaderResults onBack={handleBack} />
            <Carousel
              loop={false}
              width={PAGE_WIDTH}
              data={analysisResults}
              onSnapToItem={(index) => setCurrentIndex(index)}
              renderItem={({ item }) => (
                <View style={styles.cardWrapper}>
                  <ResultCard
                    item={item}
                    width={PAGE_WIDTH - (PAGE_PADDING * 2)}
                    notificationId={notificationId}
                  />
                </View>
              )}
              style={{ width: PAGE_WIDTH }}
              defaultIndex={0}
              enabled={true}
              snapEnabled={true}
              panGestureHandlerProps={{
                activeOffsetX: [-10, 10],
              }}
            />
          </View>
          <PaginationDots
            totalDots={analysisResults.length}
            activeIndex={currentIndex}
          />
        </View>
        <ActionButtons navigation={navigation} currentScreen="Analysis" />
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

const styles = {
  cardsContainer: {
    flex: 1,
    position: 'relative',
    paddingBottom: 10, // Add space for pagination dots
  },
  cardWrapper: {
    padding: PAGE_PADDING,
    width: PAGE_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
};