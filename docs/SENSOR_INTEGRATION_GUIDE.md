# 🚀 HydroScan Sensor Integration Guide

**Plug-and-Play Sensor Setup - No Code Changes Required**

## 📋 Prerequisites

1. ✅ HydroScan platform deployed and running
2. ✅ MQTT broker configured (or use managed broker)
3. ✅ Sensor device with WiFi/cellular connectivity
4. ✅ Basic understanding of MQTT protocol

## ⚡ Quick Setup (5 Minutes)

### Step 1: Configure MQTT Broker

Add these environment variables to your deployment:

```env
MQTT_BROKER_URL=mqtt://your-broker-url:1883
MQTT_USERNAME=your_mqtt_username
MQTT_PASSWORD=your_mqtt_password
```

**Recommended MQTT Brokers:**
- **HiveMQ Cloud**: Free tier with 100 connections
- **AWS IoT Core**: Fully managed, auto-scaling
- **Mosquitto**: Self-hosted option

### Step 2: Add Device in HydroScan

1. Open HydroScan dashboard
2. Go to **Device Management** → **Add Device**
3. Fill device details:
   ```
   Name: Water Station 1
   Location: Lab Tank A
   Device ID: WS001 (must match sensor config)
   Device Type: Water Quality Monitor
   ```
4. Click **Save** - Device is ready for connection!

### Step 3: Configure Your Sensor

Program your sensor to connect to WiFi and publish to these MQTT topics:

#### 📡 Data Topic (Sensor Readings)
```
Topic: hydroscan/devices/{DEVICE_ID}/data
Payload: {
  "device_id": "WS001",
  "timestamp": "2024-08-14T13:00:00Z",
  "ph": 7.2,
  "turbidity": 1.5,
  "tds": 320,
  "temperature": 22.5,
  "battery_level": 85,
  "signal_strength": -45
}
```

#### 💓 Heartbeat Topic (Device Health)
```
Topic: hydroscan/devices/{DEVICE_ID}/heartbeat
Payload: {
  "device_id": "WS001",
  "status": "online",
  "uptime": 86400,
  "memory_usage": 45.2,
  "cpu_usage": 23.1,
  "firmware_version": "2.1.0",
  "sensor_status": {
    "ph": "ok",
    "turbidity": "ok",
    "tds": "warning",
    "temperature": "ok"
  }
}
```

### Step 4: Test Connection

Use the built-in MQTT tester:

```bash
# Test sensor data
curl -X POST "https://your-project.supabase.co/functions/v1/mqtt-handler" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "hydroscan/devices/WS001/data",
    "device_id": "WS001",
    "message_type": "data",
    "payload": {
      "device_id": "WS001",
      "ph": 7.2,
      "turbidity": 1.5,
      "tds": 320,
      "temperature": 22.5
    }
  }'
```

**✅ Success Response:**
```json
{
  "success": true,
  "reading_id": "uuid-here",
  "message": "Sensor data processed successfully"
}
```

## 🔧 Sensor Hardware Requirements

### Minimum Requirements
- **MCU**: ESP32, Arduino with WiFi shield, or similar
- **Sensors**: pH, Turbidity, TDS, Temperature
- **Power**: 5V/3.3V with backup battery (optional)
- **Connectivity**: WiFi or cellular

### Recommended Sensors
- **pH Sensor**: Analog pH meter or digital pH probe
- **Turbidity**: Optical turbidity sensor (0-4000 NTU)
- **TDS**: Conductivity probe (0-2000 ppm)
- **Temperature**: DS18B20, DHT22, or similar

## 📊 Data Validation

HydroScan automatically validates incoming data:

- **pH**: 0-14 range, 2 decimal precision
- **Turbidity**: 0-4000 NTU, 2 decimal precision  
- **TDS**: 0-2000 ppm, 2 decimal precision
- **Temperature**: -10°C to 60°C, 2 decimal precision

Invalid readings are filtered but logged for debugging.

## 🎯 Arduino/ESP32 Example Code

```cpp
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

const char* ssid = "your-wifi-ssid";
const char* password = "your-wifi-password";
const char* mqtt_server = "your-mqtt-broker.com";
const char* mqtt_user = "your-mqtt-username";
const char* mqtt_pass = "your-mqtt-password";
const char* device_id = "WS001";

WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(115200);
  setup_wifi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  
  // Read sensors every 5 minutes
  if (millis() % 300000 == 0) {
    sendSensorData();
    sendHeartbeat();
  }
}

void sendSensorData() {
  DynamicJsonDocument doc(1024);
  doc["device_id"] = device_id;
  doc["timestamp"] = getTimestamp();
  doc["ph"] = readPH();
  doc["turbidity"] = readTurbidity();
  doc["tds"] = readTDS();
  doc["temperature"] = readTemperature();
  doc["battery_level"] = getBatteryLevel();
  doc["signal_strength"] = WiFi.RSSI();
  
  String payload;
  serializeJson(doc, payload);
  
  String topic = "hydroscan/devices/" + String(device_id) + "/data";
  client.publish(topic.c_str(), payload.c_str());
}

void callback(char* topic, byte* payload, unsigned int length) {
  // Handle incoming commands
  String topicStr = String(topic);
  if (topicStr.indexOf("/commands") != -1) {
    processCommand(payload, length);
  }
}

void processCommand(byte* payload, unsigned int length) {
  DynamicJsonDocument doc(1024);
  deserializeJson(doc, payload, length);
  
  String command_type = doc["command_type"];
  String command_id = doc["command_id"];
  
  if (command_type == "restart") {
    // Send acknowledgment
    sendCommandResponse(command_id, "completed", "Device restarting");
    ESP.restart();
  } else if (command_type == "calibrate") {
    String sensor = doc["payload"]["sensor_type"];
    calibrateSensor(sensor);
    sendCommandResponse(command_id, "completed", "Calibration complete");
  }
  // Add more command handlers as needed
}
```

## 🎮 Remote Commands

Your sensors can receive commands from HydroScan:

### Available Commands
- `restart`: Restart device
- `calibrate`: Calibrate specific sensor
- `update_config`: Update device settings
- `set_polling_interval`: Change data frequency
- `enable_sensors`/`disable_sensors`: Control sensors
- `diagnostics`: Run diagnostic tests

### Command Response Format
```json
{
  "command_id": "uuid-from-command",
  "status": "completed|failed|in_progress",
  "response": "Optional response message",
  "error_message": "Error details if failed"
}
```

## 🚨 Alert Configuration

Set up automatic alerts in HydroScan:

1. Go to **Alert Rules** → **Add Rule**
2. Configure thresholds:
   ```
   Parameter: pH
   Condition: Outside Range
   Min: 6.5, Max: 8.5
   Severity: High
   ```
3. Choose notification methods (Email, SMS, Webhook)
4. Save - Alerts are active immediately!

## 🔄 Real-time Updates

Once connected, your dashboard shows:
- ✅ Live sensor readings (updates every 5 minutes)
- ✅ Device status and health metrics
- ✅ Historical charts and trends
- ✅ AI-powered contamination scoring
- ✅ Automatic alert notifications

## 🛠️ Troubleshooting

### Device Not Appearing
- ✅ Check device ID matches exactly
- ✅ Verify MQTT broker connectivity
- ✅ Confirm topic format: `hydroscan/devices/{DEVICE_ID}/data`

### No Data Received
- ✅ Check JSON payload format
- ✅ Verify data validation ranges
- ✅ Check MQTT message logs in HydroScan

### Commands Not Working
- ✅ Subscribe to: `hydroscan/devices/{DEVICE_ID}/commands`
- ✅ Send responses to: `hydroscan/devices/{DEVICE_ID}/command/response`

## 📞 Support

- **Documentation**: Check the main README.md
- **Issues**: Create GitHub issue with sensor logs
- **Community**: Join discussions for sensor integration tips

---

**🎉 That's it! Your sensors are now fully integrated with HydroScan's enterprise-grade monitoring platform.**
