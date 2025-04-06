import * as mqtt from 'mqtt';

class MQTTService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.listeners = [];
  }

  // Connect to MQTT broker
  connect(brokerUrl, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        this.client = mqtt.connect(brokerUrl, options);

        this.client.on('connect', () => {
          console.log('Connected to MQTT broker');
          this.connected = true;
          resolve(true);
        });

        this.client.on('error', (err) => {
          console.error('MQTT connection error:', err);
          reject(err);
        });

        this.client.on('message', (topic, message) => {
          // Pass the message to all registered listeners
          this.listeners
            .filter(listener => listener.topic === topic)
            .forEach(listener => listener.callback(message));
        });
      } catch (error) {
        console.error('Failed to connect to MQTT broker:', error);
        reject(error);
      }
    });
  }

  // Subscribe to a topic
  subscribe(topic, callback) {
    if (!this.connected || !this.client) {
      return false;
    }

    this.client.subscribe(topic);
    
    // Add listener for this topic
    this.listeners.push({
      topic,
      callback
    });

    return true;
  }

  // Publish message to a topic
  publish(topic, message) {
    if (!this.connected || !this.client) {
      return false;
    }

    this.client.publish(topic, message);
    return true;
  }

  // Disconnect from broker
  disconnect() {
    if (this.client) {
      this.client.end();
      this.connected = false;
      this.listeners = [];
    }
  }
}

// Create singleton instance
const mqttService = new MQTTService();
export default mqttService;