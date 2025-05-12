import React, { useEffect, useState } from 'react'; // Added useEffect, useState
import { View, Alert, Dimensions, Text } from 'react-native';
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
  const { notificationId, analysisResults = [] } = route.params || {};
  const { updateNotificationType, notifications } = useGlobalContext(); // Get notifications from context
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isResolvedOnScreen, setIsResolvedOnScreen] = useState(false);

  const resultsData = Array.isArray(analysisResults) ? analysisResults : [];

  useEffect(() => {
    // Find the specific notification when the component mounts or relevant params change
    const currentNotificationFromParams = notifications.find(n => n.id === notificationId);

    const unsubscribeBlur = navigation.addListener('blur', () => {
      console.log('ResultsScreen: blur event. isResolvedOnScreen:', isResolvedOnScreen, 'notificationId:', notificationId);

      // It's important to get the latest version of the notification list here if other operations could modify it.
      // However, for the initial type/status and datetime, currentNotificationFromParams should be sufficient if it's found.
      const notificationToProcess = notifications.find(n => n.id === notificationId) || currentNotificationFromParams;

      if (!isResolvedOnScreen && notificationId && notificationToProcess) {
        const isDetectedAndRecent = 
          (notificationToProcess.status === 'pending' || notificationToProcess.type === 'Detected') &&
          notificationToProcess.datetime &&
          (new Date().getTime() - new Date(notificationToProcess.datetime).getTime()) < 60000; // 60 seconds

        if (isDetectedAndRecent) {
          console.log(`ResultsScreen: blur - Notification ${notificationId} is ${notificationToProcess.status || notificationToProcess.type} and recent. Not changing to Unresolved yet.`);
          return; // Do nothing, let it stay as is (Detected/pending)
        }

        // If not recent and detected, or if it's some other status that should become Unresolved
        console.log(`ResultsScreen: blur - Automatically updating ${notificationId} to Unresolved.`);
        updateNotificationType(notificationId, 'Unresolved');
      }
    });

    return unsubscribeBlur; // Cleanup the blur listener on unmount
  }, [navigation, notificationId, isResolvedOnScreen, updateNotificationType, notifications]); // Add notifications to dependency array

  // Handle the case with no valid data
  if (!resultsData.length) {
    return (
      <BackgroundWrapper>
        <SafeAreaView style={globalStyles.safeArea}>
          <View style={globalStyles.container}>
            <HeaderResults onBack={() => navigation.navigate('Home')} />
            <View style={styles.emptyState}>
              <Text>No analysis results to display</Text>
            </View>
          </View>
          <ActionButtons navigation={navigation} currentScreen="Analysis" />
        </SafeAreaView>
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper>
      <SafeAreaView style={globalStyles.safeArea}>
        <View style={globalStyles.container}>
          <View style={styles.cardsContainer}>
            {/* Changed onBack to simple goBack, beforeRemove will handle the logic */}
            <HeaderResults onBack={() => navigation.goBack()} />
            <Carousel
              loop={false}
              width={PAGE_WIDTH}
              data={resultsData}
              onSnapToItem={(index) => setCurrentIndex(index)}
              renderItem={({ item }) => (
                <View style={styles.cardWrapper}>
                  <ResultCard
                    item={item}
                    width={PAGE_WIDTH - (PAGE_PADDING * 2)}
                    // Pass the specific item's databaseId as notificationId to ResultCard
                    notificationId={item.databaseId || notificationId}
                    onResolve={() => setIsResolvedOnScreen(true)} // Callback to set isResolvedOnScreen
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
            totalDots={resultsData.length}
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
};