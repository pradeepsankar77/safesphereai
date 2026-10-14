import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// In-memory rate limiting map (IP -> timestamps array)
const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(ip: string, limit = 5, windowMs = 60000): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const validTimestamps = timestamps.filter((t) => now - t < windowMs);

  if (validTimestamps.length >= limit) {
    return false;
  }

  validTimestamps.push(now);
  rateLimitMap.set(ip, validTimestamps);
  return true;
}

export async function POST(request: NextRequest) {
  // 1. IP extraction & rate limiting check
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1';

  if (!checkRateLimit(ip, 6, 60000)) {
    return NextResponse.json(
      { success: false, error: 'Rate limit exceeded. Emergency dispatch already requested.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const {
      latitude,
      longitude,
      accuracyMeters,
      batteryLevel,
      senderName,
      senderPhone,
      emergencyType = 'general_emergency',
      message = 'Immediate rescue assistance requested.',
    } = body;

    // 2. Validate input coordinates
    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return NextResponse.json(
        { success: false, error: 'Valid geographic latitude and longitude are required.' },
        { status: 400 }
      );
    }

    const mapsUrl = `https://maps.google.com/?q=${latitude.toFixed(6)},${longitude.toFixed(6)}`;
    const dispatchId = `SOS-${Date.now().toString(36).toUpperCase()}`;

    // 3. Save to Supabase sos_alerts table using server client
    let savedToDb = false;
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.from('sos_alerts').insert([
        {
          sender_name: senderName ? String(senderName).slice(0, 100) : null,
          sender_phone: senderPhone ? String(senderPhone).slice(0, 30) : null,
          latitude,
          longitude,
          accuracy_meters: accuracyMeters ? Number(accuracyMeters) : null,
          battery_level: batteryLevel ? Number(batteryLevel) : null,
          emergency_type: String(emergencyType).slice(0, 50),
          message: String(message).slice(0, 500),
          status: 'active',
        },
      ]);

      if (!error) {
        savedToDb = true;
      } else {
        console.warn('Supabase SOS insert notice (table might need migration run):', error.message);
      }
    } catch (supabaseErr) {
      console.warn('Supabase SOS client execution notice:', supabaseErr);
    }

    // 4. Return rescue package with multi-channel links
    return NextResponse.json({
      success: true,
      dispatchId,
      timestamp: new Date().toISOString(),
      savedToDb,
      coordinates: { latitude, longitude, accuracyMeters },
      mapsUrl,
      channels: {
        smsText: `EMERGENCY SOS (${dispatchId}): Immediate rescue needed at coordinates ${latitude.toFixed(6)}, ${longitude.toFixed(6)}. Map: ${mapsUrl}`,
        whatsappUrl: `https://wa.me/?text=${encodeURIComponent(
          `EMERGENCY SOS: I need immediate rescue! Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}. View live location on map: ${mapsUrl}`
        )}`,
      },
    });
  } catch (err: any) {
    console.error('Error processing SOS dispatch:', err);
    return NextResponse.json(
      { success: false, error: 'Internal dispatch error. Please use direct emergency SMS/Hotline 112.' },
      { status: 500 }
    );
  }
}
