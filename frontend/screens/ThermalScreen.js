import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity, 
  Alert,
  Dimensions
} from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import ActionButtons from '../components/navigation/ActionButtons';
import BackgroundWrapper from '../components/common/BackgroundWrapper';
import { colors, shadows } from '../styles/globalStyles';

const ThermalScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const webViewRef = useRef(null);
  
  // Camera stream settings
  const CAMERA_URL = 'http://192.168.1.18:5000/camera';
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height * 0.6; // Use 60% of screen height
  
  // Check if camera server is reachable
  useEffect(() => {
    const checkCameraConnection = async () => {
      try {
        const response = await fetch(CAMERA_URL, { method: 'HEAD', timeout: 5000 });
        if (response.ok) {
          setIsConnected(true);
          setHasError(false);
        } else {
          setHasError(true);
          setIsConnected(false);
        }
      } catch (error) {
        console.error('Camera connection error:', error);
        setHasError(true);
        setIsConnected(false);
      }
    };
    
    checkCameraConnection();
    
    // Set up periodic connection check
    const connectionTimer = setInterval(checkCameraConnection, 10000);
    
    return () => clearInterval(connectionTimer);
  }, []);
  
  // HTML template to embed the camera stream
  const streamHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
        body, html { 
            margin: 0; 
            padding: 0; 
            height: 100%; 
            width: 100%; 
            overflow: hidden; 
            background-color: #000;
        }
        iframe {
            border: none;
            width: 100%;
            height: 100%;
        }
        </style>
    </head>
    <body>
        <iframe src="${CAMERA_URL}" allowfullscreen></iframe>
        <script>
        // Check if iframe loaded properly
        window.addEventListener('load', function() {
            setTimeout(() => {
            window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'connected' }));
            }, 2000);
        });
        
        // Report errors
        window.addEventListener('error', function(e) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ 
            event: 'error',
            message: e.message 
            }));
        });
        </script>
    </body>
    </html>
    `;
  
  // Handle messages from WebView
  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.event === 'error') {
        setHasError(true);
      } else if (data.event === 'connected') {
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };
  
  // Reload the WebView
  const handleReload = () => {
    setIsLoading(true);
    setHasError(false);
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };
  
  // Take a snapshot from the stream
  const handleTakeSnapshot = () => {
    // This function would typically capture a frame from the stream
    // For now, we'll just show an alert
    Alert.alert(
      "Snapshot",
      "This would capture the current frame for analysis",
      [{ text: "OK" }]
    );
    
    // In a real implementation, you would inject JavaScript to capture the image
    // and then process it, perhaps by sending it to your analysis endpoint
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        (function() {
          const canvas = document.createElement('canvas');
          const img = document.querySelector('img');
          const context = canvas.getContext('2d');
          
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          context.drawImage(img, 0, 0);
          
          const imageData = canvas.toDataURL('image/jpeg');
          window.ReactNativeWebView.postMessage(JSON.stringify({ 
            event: 'snapshot', 
            data: imageData 
          }));
          return true;
        })();
      `);
    }
  };
  
  // Handle back button action
  const handleBack = () => {
    navigation.goBack();
  };
  
  return (
    <BackgroundWrapper>
      <StatusBar style="light" />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.dark} />
          </TouchableOpacity>
          <Text style={styles.title}>Thermal Camera</Text>
          <TouchableOpacity onPress={handleReload} style={styles.reloadButton}>
            <Ionicons name="refresh" size={24} color={colors.text.dark} />
          </TouchableOpacity>
        </View>
        
        {/* Status indicator */}
        <View style={[
          styles.statusBar,
          isConnected ? styles.statusConnected : hasError ? styles.statusError : styles.statusLoading
        ]}>
          <Text style={styles.statusText}>
            {isConnected ? 'Connected to camera' : 
             hasError ? 'Connection error' : 'Connecting...'}
          </Text>
        </View>
        
        {/* Camera feed */}
        <View style={styles.cameraContainer}>
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading camera feed...</Text>
            </View>
          )}
          
          <WebView
            ref={webViewRef}
            source={{ html: streamHtml }}
            style={[styles.webview, isLoading && styles.hidden]}
            onLoadEnd={() => setIsLoading(false)}
            onError={() => {
              setHasError(true);
              setIsLoading(false);
            }}
            onMessage={handleWebViewMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderError={() => (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={40} color="#f44336" />
                <Text style={styles.errorText}>Failed to load camera feed</Text>
                <TouchableOpacity style={styles.retryButton} onPress={handleReload}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}
          />
          
          {hasError && !isLoading && (
            <View style={styles.errorOverlay}>
              <Ionicons name="alert-circle-outline" size={40} color="#f44336" />
              <Text style={styles.errorOverlayText}>
                Cannot connect to camera feed
              </Text>
              <Text style={styles.errorOverlaySubtext}>
                Make sure your device is on the same network as the Raspberry Pi
              </Text>
              <TouchableOpacity style={styles.retryButton} onPress={handleReload}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {/* Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={handleTakeSnapshot}
            disabled={!isConnected}
          >
            <Ionicons 
              name="camera" 
              size={24} 
              color={isConnected ? colors.text.white : colors.text.light} 
            />
            <Text style={[
              styles.controlButtonText, 
              !isConnected && styles.controlButtonTextDisabled
            ]}>
              Take Snapshot
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Info panel */}
        <View style={styles.infoPanel}>
          <Text style={styles.infoTitle}>Thermal Camera Info</Text>
          <Text style={styles.infoText}>
            • View live thermal imaging from your Raspberry Pi camera
          </Text>
          <Text style={styles.infoText}>
            • Take snapshots for defect analysis
          </Text>
          <Text style={styles.infoText}>
            • Camera feed updates in real-time
          </Text>
        </View>
        <ActionButtons navigation={navigation} currentScreen="Camera " />
      </SafeAreaView>
    </BackgroundWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    height: 50,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.dark,
  },
  reloadButton: {
    padding: 8,
  },
  statusBar: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  statusConnected: {
    backgroundColor: '#4CAF50',
  },
  statusError: {
    backgroundColor: '#f44336',
  },
  statusLoading: {
    backgroundColor: '#FF9800',
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cameraContainer: {
    height: Dimensions.get('window').height * 0.6,
    backgroundColor: '#000',
    borderRadius: 10,
    overflow: 'hidden',
    marginHorizontal: 15,
    marginBottom: 15,
    ...shadows.medium,
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
  hidden: {
    opacity: 0,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    zIndex: 10,
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorOverlayText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  errorOverlaySubtext: {
    color: '#ccc',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 15,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  controlButton: {
    backgroundColor: colors.background.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    ...shadows.light,
  },
  controlButtonText: {
    marginLeft: 8,
    fontWeight: 'bold',
    color: colors.text.dark,
  },
  controlButtonTextDisabled: {
    color: colors.text.light,
  },
  infoPanel: {
    backgroundColor: colors.background.card,
    borderRadius: 8,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    ...shadows.light,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.text.dark,
  },
  infoText: {
    fontSize: 14,
    color: colors.text.medium,
    marginBottom: 5,
  },
});

export default ThermalScreen;