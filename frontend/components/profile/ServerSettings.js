import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { loadConfig, saveConfig, updateConfigValues } from '../../config';
import { globalStyles, colors, shadows, spacing, fontSizes, borderRadius } from '../../styles/globalStyles';

const ServerSettings = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [ipAddress, setIpAddress] = useState('');
  const [backendPort, setBackendPort] = useState('');
  const [cameraPort, setCameraPort] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const config = await loadConfig();
      setIpAddress(config.SERVER_IP || '');
      setBackendPort(config.BACKEND_PORT?.toString() || '');
      setCameraPort(config.CAMERA_PORT?.toString() || '');
    } catch (error) {
      Alert.alert('Error', 'Failed to load settings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!isValidIP(ipAddress)) {
      Alert.alert('Invalid IP', 'Please enter a valid IP address');
      return;
    }

    if (!backendPort || isNaN(backendPort)) {
      Alert.alert('Invalid Port', 'Please enter a valid Backend Port');
      return;
    }

    if (!cameraPort || isNaN(cameraPort)) {
      Alert.alert('Invalid Port', 'Please enter a valid Camera Port');
      return;
    }

    const newConfig = {
      SERVER_IP: ipAddress,
      BACKEND_PORT: Number(backendPort),
      CAMERA_PORT: Number(cameraPort),
    };

    try {
      await saveConfig(newConfig);
      updateConfigValues({ ...newConfig }); // updateConfigValues will rebuild URLs from these
      Alert.alert('Success', 'Settings saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
      console.error(error);
    }
  };

  const handleReset = async () => {
    try {
      await saveConfig({});
      const defaultConfig = await loadConfig();
      setIpAddress(defaultConfig.SERVER_IP || '');
      setBackendPort(defaultConfig.BACKEND_PORT?.toString() || '');
      setCameraPort(defaultConfig.CAMERA_PORT?.toString() || '');
      updateConfigValues(defaultConfig);
      Alert.alert('Success', 'Settings reset to defaults');
    } catch (error) {
      Alert.alert('Error', 'Failed to reset settings');
      console.error(error);
    }
  };

  const isValidIP = (ip) => {
    try {
      const url = new URL(ip);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
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
            <Text style={styles.settingLabel}>Server URL</Text>
            <TextInput
              style={[globalStyles.input, styles.input]}
              value={ipAddress}
              onChangeText={setIpAddress}
              placeholder="e.g. http://192.168.1.10"
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Backend Port</Text>
            <TextInput
              style={[globalStyles.input, styles.input]}
              value={backendPort}
              onChangeText={setBackendPort}
              placeholder="e.g. 8000"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Camera Port</Text>
            <TextInput
              style={[globalStyles.input, styles.input]}
              value={cameraPort}
              onChangeText={setCameraPort}
              placeholder="e.g. 5000"
              keyboardType="numeric"
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
  },
});

export default ServerSettings;