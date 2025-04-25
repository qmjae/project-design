import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions, BackHandler } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { StyleSheet } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { useGlobalContext } from '../../backend/context/GlobalProvider';
import ActionButtons from '../components/navigation/ActionButtons';
import BackgroundWrapper from '../components/common/BackgroundWrapper';
import { colors, shadows } from '../styles/globalStyles';
import HeaderThermal from '../components/thermal/HeaderThermal';
import LoadingOverlay from '../components/thermal/LoadingOverlay';
import SnapshotButton from '../components/thermal/SnapshotButton';
import generateThermalHTML from '../components/thermal/generateThermalHTML';
import cleanupWebView from '../components/thermal/cleanupWebView';
import { processAndAnalyzeImages } from '../components/common/processAndAnalyzeImages';
import { CAMERA_URL, SNAPSHOT_API_URL } from '../config'

const ThermalScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { addNotification, user } = useGlobalContext();
  const [mountKey, setMountKey] = useState(Date.now());
  const webViewRef = useRef(null);
  const screenWidth = Dimensions.get('window').width;
  const containerWidth = screenWidth - 30;
  const containerHeight = containerWidth * (7 / 8);

  useFocusEffect(
    React.useCallback(() => {
      setMountKey(Date.now());
      setIsLoading(true);
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        cleanupWebView(webViewRef, true);
        return false;
      });

      return () => {
        backHandler.remove();
        cleanupWebView(webViewRef, true);
      };
    }, [])
  );

  useEffect(() => {
    return () => {
      cleanupWebView(webViewRef, true);
    };
  }, []);

  const handleReload = () => {
    setIsLoading(true);
    setMountKey(Date.now());
  };

  const handleSnapshot = async (base64Image) => {
    try {
      const fileUri = FileSystem.documentDirectory + `snapshot_${Date.now()}.jpg`;
      await FileSystem.writeAsStringAsync(fileUri, base64Image.split(',')[1], {
        encoding: FileSystem.EncodingType.Base64,
      });

      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      const fileSize = fileInfo.size; // Size in bytes

      const snapshotImage = [{
        imageUri: fileUri,
        name: `snapshot_${Date.now()}.jpg`,
        type: 'image/jpeg',
        size: fileSize,
      }];

      processAndAnalyzeImages(snapshotImage, setIsAnalyzing, addNotification, navigation, user);
    } catch (error) {
      console.error('Error converting base64 to file:', error);
    }
  };

  return (
    <BackgroundWrapper>
      <StatusBar style="light" />
      <SafeAreaView style={styles.container}>
        <HeaderThermal/>
        <View style={styles.body}>
          <View style={[styles.cameraContainer, { width: containerWidth, height: containerHeight }]}>
            {isLoading && <LoadingOverlay />}
            <WebView
              key={mountKey}
              ref={webViewRef}
              source={{
                html: generateThermalHTML(CAMERA_URL, SNAPSHOT_API_URL),
              }}
              style={styles.webview}
              onLoadEnd={() => setIsLoading(false)}
              onError={() => setIsLoading(false)}
              onMessage={async (event) => {
                try {
                  const data = JSON.parse(event.nativeEvent.data);

                  if (data.event === 'loaded') {
                    setIsLoading(false);
                  } else if (data.event === 'snapshot') {
                    const base64Image = data.data;
                    console.log('Received snapshot:', base64Image.substring(0, 100));

                    await handleSnapshot(base64Image);
                  }
                } catch (e) {
                  console.error('WebView message parse error:', e);
                }
              }}
              javaScriptEnabled
              domStorageEnabled
              originWhitelist={['*']}
              cacheEnabled={false}
              incognito
              useWebKit
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
            />
            <TouchableOpacity onPress={handleReload} style={styles.reloadButton}>
              <Ionicons name="refresh" size={24} color={colors.text.light} />
            </TouchableOpacity>
          </View>
          <SnapshotButton onPress={() => {
            if (webViewRef.current) {
              webViewRef.current.injectJavaScript('captureSnapshot();');
            }
          }} />
        </View >
        <ActionButtons navigation={navigation} currentScreen="Camera" />
      </SafeAreaView>
    </BackgroundWrapper>
  );
};

export default ThermalScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    backgroundColor: colors.background.main,
  },
  body: {
    flex: 1,
    gap: 20,
    justifyContent: 'center',
    ...StyleSheet.absoluteFillObject,
  },  
  cameraContainer: {
    backgroundColor: colors.background.dark,
    alignSelf: 'center',
    borderRadius: 12,
    overflow: 'hidden',
    ...shadows.medium,
  },
  reloadButton: {
    position: 'absolute',
    bottom: 7,
    right: 10,
    backgroundColor: 'transparent',
    padding: 8,
    zIndex: 10,
  }, 
  webview: {
    flex: 1,
  },
});