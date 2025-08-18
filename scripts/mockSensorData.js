import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

// Supports both Vite-style vars and generic ones
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase env vars. Add them to .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Get device id from CLI arg or auto-detect
const argvDeviceId = process.argv[2];

async function getDeviceId() {
  if (argvDeviceId) return argvDeviceId;
  const { data, error } = await supabase.from('devices').select('id').limit(1).maybeSingle();
  if (error) {
    console.error('Error fetching device:', error.message);
    process.exit(1);
  }
  if (data) return data.id;
  // If no device, create a mock one (requires open RLS for insert) – otherwise exit
  const newDevice = {
    id: randomUUID(),
    name: 'Mock Device',
    serial_number: 'MOCK-' + Math.floor(Math.random() * 10000),
    organization_id: null, // set if necessary
    status: 'online',
    is_active: true,
  };
  const ins = await supabase.from('devices').insert(newDevice).select().single();
  if (ins.error) {
    console.error('No device found and failed to create mock one. Pass a device id as arg.');
    process.exit(1);
  }
  console.log('Created mock device');
  return ins.data.id;
}

function randomInRange(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

async function insertReading(deviceId) {
  const reading = {
    device_id: deviceId,
    timestamp: new Date().toISOString(),
    ph: randomInRange(6.5, 8.5, 2),
    temperature: randomInRange(18, 30, 1),
    turbidity: randomInRange(0.5, 5, 2),
    tds: Math.round(randomInRange(50, 500, 0)),
    contamination_score: randomInRange(0, 100, 1),
  };
  const { error } = await supabase.from('sensor_readings').insert(reading);
  if (error) console.error('Insert error:', error.message);
  else console.log('[✓] Sent reading at', reading.timestamp);
}

(async () => {
  const deviceId = await getDeviceId();
  console.log('Streaming mock data for device', deviceId);
  setInterval(() => insertReading(deviceId), 5000);
})();
