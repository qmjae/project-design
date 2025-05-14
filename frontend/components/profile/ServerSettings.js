import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { loadConfig, saveConfig, updateConfigValues, BACKEND_API_URL } from '../../config';
import { globalStyles, colors, shadows, spacing, fontSizes, borderRadius } from '../../styles/globalStyles';

const ServerSettings = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [ipAddress, setIpAddress] = useState('');
  const [backendPort, setBackendPort] = useState('');
  const [cameraPort, setCameraPort] = useState('');
  const [loading, setLoading] = useState(false);

  const [connectionStatus, setConnectionStatus] = useState('Idle');
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  const checkConnectionStatus = useCallback(async () => {
    setIsCheckingStatus(true);
    setConnectionStatus('Checking...');
    try {
      if (!BACKEND_API_URL || !BACKEND_API_URL.startsWith('http')) {
        setConnectionStatus('Error: Invalid Server URL');
        setIsCheckingStatus(false);
        return;
      }
      const healthUrl = `${BACKEND_API_URL}/health`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      const response = await fetch(healthUrl, { method: 'GET', signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'healthy') {
          if (data.model_loaded === true) {
            setConnectionStatus('Connected');
          } else {
            setConnectionStatus('Connected (Model Issue)');
          }
        } else {
          setConnectionStatus('Disconnected (Server Unhealthy)');
        }
      } else {
        setConnectionStatus(`Disconnected (HTTP ${response.status})`);
      }
    } catch (error) {
      console.error('Connection check error:', error);
      if (error.name === 'AbortError') {
        setConnectionStatus('Error: Connection timed out');
      } else if (error.message.includes('Network request failed')) {
        setConnectionStatus('Error: Network request failed');
      } else {
        setConnectionStatus('Error: Failed to connect');
      }
    } finally {
      setIsCheckingStatus(false);
    }
  }, []);

  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true);
      try {
        const loaded = await loadConfig();
        setIpAddress(loaded.SERVER_IP || '');
        setBackendPort(loaded.BACKEND_PORT?.toString() || '');
        setCameraPort(loaded.CAMERA_PORT?.toString() || '');
        updateConfigValues({
          SERVER_IP: loaded.SERVER_IP,
          BACKEND_PORT: loaded.BACKEND_PORT,
          CAMERA_PORT: loaded.CAMERA_PORT,
        });
        await checkConnectionStatus();
      } catch (error) {
        Alert.alert('Error', 'Failed to load settings');
        console.error(error);
        setConnectionStatus('Error loading settings');
      } finally {
        setLoading(false);
      }
    };
    initialLoad();
  }, [checkConnectionStatus]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const loaded = await loadConfig();
      setIpAddress(loaded.SERVER_IP || '');
      setBackendPort(loaded.BACKEND_PORT?.toString() || '');
      setCameraPort(loaded.CAMERA_PORT?.toString() || '');
      updateConfigValues({
        SERVER_IP: loaded.SERVER_IP,
        BACKEND_PORT: loaded.BACKEND_PORT,
        CAMERA_PORT: loaded.CAMERA_PORT,
      });
      await checkConnectionStatus();
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
      setLoading(true);
      await saveConfig(newConfig);
      updateConfigValues({ ...newConfig });
      Alert.alert('Success', 'Settings saved successfully');
      await checkConnectionStatus();
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      setLoading(true);
      await saveConfig({});
      const defaultConfig = await loadConfig();
      setIpAddress(defaultConfig.SERVER_IP || '');
      setBackendPort(defaultConfig.BACKEND_PORT?.toString() || '');
      setCameraPort(defaultConfig.CAMERA_PORT?.toString() || '');
      updateConfigValues(defaultConfig);
      Alert.alert('Success', 'Settings reset to defaults');
      await checkConnectionStatus();
    } catch (error) {
      Alert.alert('Error', 'Failed to reset settings');
      console.error(error);
    } finally {
      setLoading(false);
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

  const getStatusStyle = (status) => {
    const s = status.toLowerCase();
    if (s.includes('connected')) return styles.connectedStatus;
    if (s.includes('model issue')) return styles.warningStatus;
    if (s.includes('disconnected')) return styles.errorStatus;
    if (s.includes('error')) return styles.errorStatus;
    if (s.includes('checking')) return styles.checkingStatus;
    return styles.idleStatus;
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

          <View style={styles.statusContainer}>
            <Text style={styles.settingLabel}>Status:</Text>
            <View style={styles.statusValueContainer}>
              {isCheckingStatus ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <View style={styles.statusTextContainer}>
                  {connectionStatus === 'Connected' && (
                    <Ionicons name="checkmark-circle-outline" size={18} color="green" style={styles.statusIcon} />
                  )}
                  <Text style={[styles.statusText, getStatusStyle(connectionStatus)]}>
                    {connectionStatus}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={checkConnectionStatus} style={styles.refreshButton} disabled={isCheckingStatus}>
              <Ionicons name="refresh-outline" size={22} color={isCheckingStatus ? "gray" : "#007AFF"} />
            </TouchableOpacity>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[globalStyles.buttonPrimary, styles.saveButton]}
              onPress={handleSaveSettings}
              disabled={loading || isCheckingStatus}
            >
              <Text style={globalStyles.buttonText}>Save Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[globalStyles.buttonSecondary, styles.resetButton]}
              onPress={handleReset}
              disabled={loading || isCheckingStatus}
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  statusValueContainer: {
    flex: 1,
    marginLeft: 10,
    alignItems: 'flex-start',
  },
  statusTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginRight: 5,
  },
  statusText: {
    fontSize: 15,
  },
  refreshButton: {
    padding: 8,
  },
  connectedStatus: { color: 'green' },
  warningStatus: { color: 'orange' },
  errorStatus: { color: 'red' },
  checkingStatus: { color: 'gray' },
  idleStatus: { color: 'gray' },
});

export default ServerSettings;