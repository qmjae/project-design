import paho.mqtt.publish as publish

mqtt_broker_address = "192.168.1.18"  # Replace with your MQTT broker address
mqtt_chanel = "adlaw"

message = "Hello Adlaw, this is a test message!"

# Publish the message to the specified channel
publish.single(mqtt_chanel, message, hostname=mqtt_broker_address, port=1883)