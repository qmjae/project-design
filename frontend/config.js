// Configuration file for backend API endpoints and other constants
import AsyncStorage from '@react-native-async-storage/async-storage';

// Default configuration values
const defaultConfig = {
  BACKEND_API_URL: "http://192.168.191.111:8000/detect/",
  CAMERA_URL: "http://192.168.191.111:5000/camera",
  SNAPSHOT_API_URL: "http://192.168.191.111:5000/snapshot"
};

// Storage keys
export const CONFIG_STORAGE_KEY = 'appConfig';

// Load config from AsyncStorage
export const loadConfig = async () => {
  try {
    const savedConfig = await AsyncStorage.getItem(CONFIG_STORAGE_KEY);
    if (savedConfig) {
      return { ...defaultConfig, ...JSON.parse(savedConfig) };
    }
    // If no saved config, save default values
    await AsyncStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(defaultConfig));
    return defaultConfig;
  } catch (error) {
    console.error('Failed to load configuration:', error);
    return defaultConfig;
  }
};

// Save config to AsyncStorage
export const saveConfig = async (newConfig) => {
  try {
    // Only save values that are different from default
    const configToSave = {};
    Object.keys(newConfig).forEach(key => {
      if (newConfig[key] !== defaultConfig[key]) {
        configToSave[key] = newConfig[key];
      }
    });
    
    await AsyncStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(configToSave));
    return true;
  } catch (error) {
    console.error('Failed to save configuration:', error);
    return false;
  }
};

// Export values from default config initially
// These will be updated at runtime by the ConfigProvider
export let BACKEND_API_URL = defaultConfig.BACKEND_API_URL;
export let CAMERA_URL = defaultConfig.CAMERA_URL;
export let SNAPSHOT_API_URL = defaultConfig.SNAPSHOT_API_URL;

// Helper to update config values at runtime
export const updateConfigValues = (config) => {
  BACKEND_API_URL = config.BACKEND_API_URL;
  CAMERA_URL = config.CAMERA_URL;
  SNAPSHOT_API_URL = config.SNAPSHOT_API_URL;
};