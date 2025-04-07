import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../../styles/globalStyles';

const handleTakeSnapshot = () => {
  console.log('Snapshot taken!');
  //   if (webViewRef.current) {
  //     webViewRef.current.injectJavaScript(`
  //       (function() {
  //         window.showMessage('Taking snapshot...');
  //         return true;
  //       })();
  //     `);
  //   }

  //   setTimeout(() => {
  //     cleanupWebView(webViewRef, false);
  //     navigation.navigate('Analysis');
  //   }, 500);
  //
};

export default SnapshotButton => (
  <View style={styles.wrapper}>
    <TouchableOpacity style={styles.button} onPress={handleTakeSnapshot}>
      <Ionicons name="camera" size={24} color='#fff' />
      <Text style={styles.text}>Take Snapshot</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  button: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: 15,
    ...shadows.light,
  },
  text: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});