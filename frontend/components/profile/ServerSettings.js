import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { loadConfig, saveConfig, updateConfigValues } from '../../config';
import { globalStyles, colors, shadows, spacing, fontSizes, borderRadius } from '../../styles/globalStyles';

const ServerSettings = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [config, setConfig] = useState({
    BACKEND_API_URL: '',
    CAMERA_URL: '',
    SNAPSHOT_API_URL: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const loadedConfig = await loadConfig();
      setConfig(loadedConfig);
    } catch (error) {
      Alert.alert('Error', 'Failed to load settings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      // Validate URLs
      if (!isValidUrl(config.BACKEND_API_URL) || 
          !isValidUrl(config.CAMERA_URL) || 
          !isValidUrl(config.SNAPSHOT_API_URL)) {
        Alert.alert('Error', 'Please enter valid URLs');
        return;
      }

      await saveConfig(config);
      updateConfigValues(config);
      Alert.alert('Success', 'Settings saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
      console.error(error);
    }
  };

  const handleReset = async () => {
    try {
      // Pass an empty object to reset to defaults
      await saveConfig({});
      const defaultConfig = await loadConfig();
      setConfig(defaultConfig);
      updateConfigValues(defaultConfig);
      Alert.alert('Success', 'Settings reset to defaults');
    } catch (error) {
      Alert.alert('Error', 'Failed to reset settings');
      console.error(error);
    }
  };

  const isValidUrl = (urlString) => {
    try {
      new URL(urlString);
      return true;
    } catch (e) {
      return false;
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Text style={styles.title}>Server Settings</Text>
        <Ionicons 
          name={isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'} 
          size={24} 
          color={colors.text.dark}
        />
      </TouchableOpacity>

      {isExpanded && (
        <ScrollView style={styles.content}>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Backend API URL</Text>
            <TextInput
              style={[globalStyles.input, styles.input]}
              value={config.BACKEND_API_URL}
              onChangeText={(text) => setConfig({...config, BACKEND_API_URL: text})}
              placeholder="Backend API URL"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Camera URL</Text>
            <TextInput
              style={[globalStyles.input, styles.input]}
              value={config.CAMERA_URL}
              onChangeText={(text) => setConfig({...config, CAMERA_URL: text})}
              placeholder="Camera URL"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Snapshot API URL</Text>
            <TextInput
              style={[globalStyles.input, styles.input]}
              value={config.SNAPSHOT_API_URL}
              onChangeText={(text) => setConfig({...config, SNAPSHOT_API_URL: text})}
              placeholder="Snapshot API URL"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[globalStyles.buttonPrimary, styles.saveButton]} 
              onPress={handleSaveSettings}
            >
              <Text style={globalStyles.buttonText}>Save Settings</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[globalStyles.buttonSecondary, styles.resetButton]} 
              onPress={handleReset}
            >
              <Text style={globalStyles.buttonTextSecondary}>Reset to Default</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 20,
    borderRadius: borderRadius.m,
    backgroundColor: colors.background.white,
    ...shadows.light,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.m,
    // borderBottomWidth: isExpanded => isExpanded ? 1 : 0,
    // borderBottomColor: colors.border,
  },
  title: {
    fontSize: fontSizes.l,
    fontWeight: '600',
    color: colors.text.dark,
  },
  content: {
    padding: spacing.m,
    maxHeight: 400,
  },
  settingItem: {
    marginBottom: spacing.m,
  },
  settingLabel: {
    fontSize: fontSizes.m,
    fontWeight: '500',
    color: colors.text.medium,
    marginBottom: spacing.xs,
  },
  input: {
    marginBottom: spacing.s,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.m,
  },
  saveButton: {
    flex: 1,
    marginRight: spacing.xs,
  },
  resetButton: {
    flex: 1,
    marginLeft: spacing.xs,
  }
});

export default ServerSettings;