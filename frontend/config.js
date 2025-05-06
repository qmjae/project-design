// Configuration file for backend API endpoints and other constants
import AsyncStorage from '@react-native-async-storage/async-storage';

// Default IP and ports
const defaultIP = "192.168.1.10";
const defaultPorts = {
  backend: "8000",
  camera: "5000"
};

// Constructed URLs based on IP and ports
const defaultConfig = {
  SERVER_IP: defaultIP,
  BACKEND_PORT: defaultPorts.backend,
  CAMERA_PORT: defaultPorts.camera,

  BACKEND_API_URL: buildURL(defaultIP, defaultPorts.backend),
  CAMERA_URL: buildURL(defaultIP, defaultPorts.camera, '/camera'),
  SNAPSHOT_API_URL: buildURL(defaultIP, defaultPorts.camera, '/snapshot')
};

// Key for AsyncStorage
export const CONFIG_STORAGE_KEY = 'appConfig';

// Build URL using IP, port, and optional path
function buildURL(ip, port, path = '') {
  return `http://${ip}:${port}${path}`;
}

// Load config from AsyncStorage
export const loadConfig = async () => {
  try {
    const savedConfig = await AsyncStorage.getItem(CONFIG_STORAGE_KEY);
    const parsed = savedConfig ? JSON.parse(savedConfig) : {};

    const ip = parsed.SERVER_IP || defaultIP;
    const backendPort = parsed.BACKEND_PORT || defaultPorts.backend;
    const cameraPort = parsed.CAMERA_PORT || defaultPorts.camera;

    return {
      SERVER_IP: ip,
      BACKEND_PORT: backendPort,
      CAMERA_PORT: cameraPort,

      BACKEND_API_URL: buildURL(ip, backendPort),
      CAMERA_URL: buildURL(ip, cameraPort, '/camera'),
      SNAPSHOT_API_URL: buildURL(ip, cameraPort, '/snapshot')
    };
  } catch (error) {
    console.error('Failed to load configuration:', error);
    return defaultConfig;
  }
};

// Save relevant parts of config
export const saveConfig = async (config) => {
  try {
    const toSave = {
      SERVER_IP: config.SERVER_IP,
      BACKEND_PORT: config.BACKEND_PORT,
      CAMERA_PORT: config.CAMERA_PORT,
    };
    await AsyncStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(toSave));
    return true;
  } catch (error) {
    console.error('Failed to save configuration:', error);
    return false;
  }
};

// Exported runtime values (will be updated on load)
export let BACKEND_API_URL = defaultConfig.BACKEND_API_URL;
export let CAMERA_URL = defaultConfig.CAMERA_URL;
export let SNAPSHOT_API_URL = defaultConfig.SNAPSHOT_API_URL;

// Update runtime values
export const updateConfigValues = (config) => {
  const ip = config.SERVER_IP;
  const backendPort = config.BACKEND_PORT;
  const cameraPort = config.CAMERA_PORT;

  BACKEND_API_URL = buildURL(ip, backendPort);
  CAMERA_URL = buildURL(ip, cameraPort, '/camera');
  SNAPSHOT_API_URL = buildURL(ip, cameraPort, '/snapshot');
};