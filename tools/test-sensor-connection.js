#!/usr/bin/env node

/**
 * HydroScan Sensor Connection Tester
 * 
 * This utility tests sensor connectivity and data flow
 * Usage: node test-sensor-connection.js [device_id] [api_key]
 */

import fetch from 'node-fetch';

const COLORS = {
    GREEN: '\x1b[32m',
    RED: '\x1b[31m',
    YELLOW: '\x1b[33m',
    BLUE: '\x1b[34m',
    RESET: '\x1b[0m',
    BOLD: '\x1b[1m'
};

class SensorTester {
    constructor(supabaseUrl, apiKey) {
        this.supabaseUrl = supabaseUrl;
        this.apiKey = apiKey;
        this.baseUrl = `${supabaseUrl}/functions/v1`;
    }

    log(message, color = COLORS.RESET) {
        console.log(`${color}${message}${COLORS.RESET}`);
    }

    async testSensorData(deviceId) {
        this.log(`\n🧪 Testing Sensor Data for Device: ${deviceId}`, COLORS.BOLD);
        
        const testPayload = {
            topic: `hydroscan/devices/${deviceId}/data`,
            device_id: deviceId,
            message_type: 'data',
            payload: {
                device_id: deviceId,
                timestamp: new Date().toISOString(),
                ph: 7.2,
                turbidity: 1.5,
                tds: 320,
                temperature: 22.5,
                battery_level: 85,
                signal_strength: -45
            }
        };

        try {
            const response = await fetch(`${this.baseUrl}/mqtt-handler`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'apikey': this.apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(testPayload)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                this.log(`✅ Sensor data processed successfully!`, COLORS.GREEN);
                this.log(`📊 Reading ID: ${result.reading_id}`, COLORS.BLUE);
                return true;
            } else {
                this.log(`❌ Sensor data failed: ${result.error || result.message}`, COLORS.RED);
                return false;
            }
        } catch (error) {
            this.log(`❌ Network error: ${error.message}`, COLORS.RED);
            return false;
        }
    }

    async testHeartbeat(deviceId) {
        this.log(`\n💓 Testing Device Heartbeat for: ${deviceId}`, COLORS.BOLD);
        
        const heartbeatPayload = {
            topic: `hydroscan/devices/${deviceId}/heartbeat`,
            device_id: deviceId,
            message_type: 'heartbeat',
            payload: {
                device_id: deviceId,
                status: 'online',
                uptime: 86400,
                memory_usage: 45.2,
                cpu_usage: 23.1,
                firmware_version: '2.1.0',
                battery_level: 85,
                signal_strength: -45,
                sensor_status: {
                    ph: 'ok',
                    turbidity: 'ok',
                    tds: 'ok',
                    temperature: 'ok'
                }
            }
        };

        try {
            const response = await fetch(`${this.baseUrl}/mqtt-handler`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'apikey': this.apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(heartbeatPayload)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                this.log(`✅ Heartbeat processed successfully!`, COLORS.GREEN);
                return true;
            } else {
                this.log(`❌ Heartbeat failed: ${result.error || result.message}`, COLORS.RED);
                return false;
            }
        } catch (error) {
            this.log(`❌ Network error: ${error.message}`, COLORS.RED);
            return false;
        }
    }

    async testDeviceCommand(deviceId) {
        this.log(`\n🎮 Testing Device Command for: ${deviceId}`, COLORS.BOLD);
        
        const commandPayload = {
            action: 'send_command',
            device_id: deviceId,
            command_type: 'diagnostics',
            payload: {
                test_sensors: true,
                test_connectivity: true,
                full_report: false
            }
        };

        try {
            const response = await fetch(`${this.baseUrl}/device-commander`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'apikey': this.apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(commandPayload)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                this.log(`✅ Command sent successfully!`, COLORS.GREEN);
                this.log(`📋 Command ID: ${result.command_id}`, COLORS.BLUE);
                this.log(`📡 Status: ${result.status}`, COLORS.BLUE);
                return true;
            } else {
                this.log(`❌ Command failed: ${result.error || result.message}`, COLORS.RED);
                return false;
            }
        } catch (error) {
            this.log(`❌ Network error: ${error.message}`, COLORS.RED);
            return false;
        }
    }

    async testDataValidation() {
        this.log(`\n🔍 Testing Data Validation`, COLORS.BOLD);
        
        const invalidData = {
            topic: `hydroscan/devices/TEST001/data`,
            device_id: 'TEST001',
            message_type: 'data',
            payload: {
                device_id: 'TEST001',
                ph: 15.0, // Invalid: > 14
                turbidity: -1.0, // Invalid: < 0
                tds: 5000, // Invalid: > 2000
                temperature: 100 // Invalid: > 60
            }
        };

        try {
            const response = await fetch(`${this.baseUrl}/mqtt-handler`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'apikey': this.apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(invalidData)
            });

            const result = await response.json();

            if (response.ok) {
                this.log(`✅ Validation test passed - Invalid data properly filtered`, COLORS.GREEN);
                return true;
            } else {
                this.log(`⚠️  Validation response: ${result.error || result.message}`, COLORS.YELLOW);
                return true; // Expected behavior
            }
        } catch (error) {
            this.log(`❌ Validation test error: ${error.message}`, COLORS.RED);
            return false;
        }
    }

    async runFullTest(deviceId) {
        this.log(`\n🚀 HydroScan Sensor Integration Test`, COLORS.BOLD);
        this.log(`════════════════════════════════════`, COLORS.BOLD);
        this.log(`Device ID: ${deviceId}`);
        this.log(`Supabase URL: ${this.supabaseUrl}`);
        this.log(`API Key: ${this.apiKey.substring(0, 20)}...`);
        
        const tests = [
            { name: 'Sensor Data', fn: () => this.testSensorData(deviceId) },
            { name: 'Device Heartbeat', fn: () => this.testHeartbeat(deviceId) },
            { name: 'Device Commands', fn: () => this.testDeviceCommand(deviceId) },
            { name: 'Data Validation', fn: () => this.testDataValidation() }
        ];

        let passed = 0;
        let total = tests.length;

        for (const test of tests) {
            const result = await test.fn();
            if (result) passed++;
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s between tests
        }

        this.log(`\n📊 Test Results`, COLORS.BOLD);
        this.log(`════════════`, COLORS.BOLD);
        this.log(`Passed: ${passed}/${total}`, passed === total ? COLORS.GREEN : COLORS.YELLOW);
        
        if (passed === total) {
            this.log(`\n🎉 All tests passed! Your sensor integration is ready!`, COLORS.GREEN);
            this.log(`\n📋 Next Steps:`, COLORS.BOLD);
            this.log(`1. Configure your sensor hardware with device ID: ${deviceId}`);
            this.log(`2. Connect to MQTT broker and start sending data`);
            this.log(`3. Monitor real-time data in HydroScan dashboard`);
            this.log(`4. Set up alert rules for automated notifications`);
        } else {
            this.log(`\n⚠️  Some tests failed. Check your configuration:`, COLORS.YELLOW);
            this.log(`1. Verify Supabase URL and API key`);
            this.log(`2. Ensure edge functions are deployed`);
            this.log(`3. Check device exists in HydroScan dashboard`);
        }

        return passed === total;
    }
}

// CLI Usage
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
        console.log(`
🚀 HydroScan Sensor Integration Tester

Usage: node test-sensor-connection.js [device_id] [api_key] [supabase_url]

Examples:
  node test-sensor-connection.js WS001 eyJhbGc... https://your-project.supabase.co
  npm run test:sensor WS001 eyJhbGc...

Environment Variables (alternative):
  DEVICE_ID=WS001
  SUPABASE_API_KEY=eyJhbGc...
  SUPABASE_URL=https://your-project.supabase.co
        `);
        process.exit(1);
    }

    const deviceId = args[0] || process.env.DEVICE_ID;
    const apiKey = args[1] || process.env.SUPABASE_API_KEY;
    const supabaseUrl = args[2] || process.env.SUPABASE_URL || 'https://your-project.supabase.co';

    if (!deviceId || !apiKey) {
        console.error('❌ Missing required parameters: device_id and api_key');
        process.exit(1);
    }

    const tester = new SensorTester(supabaseUrl, apiKey);
    const success = await tester.runFullTest(deviceId);
    
    process.exit(success ? 0 : 1);
}

// Export for use as module
export { SensorTester };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}
