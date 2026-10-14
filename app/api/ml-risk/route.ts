import { NextRequest, NextResponse } from 'next/server';

const ML_BACKEND_URL = process.env.ML_BACKEND_URL || 'http://127.0.0.1:8000';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'status';

  let targetPath = '/model/status';
  if (action === 'metrics') {
    targetPath = '/model/metrics';
  } else if (action === 'health') {
    targetPath = '/health';
  }

  try {
    const res = await fetch(`${ML_BACKEND_URL}${targetPath}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        {
          success: false,
          status: 'unavailable',
          message: `ML Backend error (${res.status}): ${errText}`,
        },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        status: 'offline',
        message: 'Prediction unavailable: Machine learning backend is currently unreachable. Start FastAPI on port 8000 (uvicorn ml_backend.api.main:app --port 8000).',
        details: err.message,
      },
      { status: 503 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let {
      precipitation,
      temperature,
      humidity,
      wind_speed,
      wind_gusts,
      surface_pressure,
      latitude,
      longitude,
      model_type,
    } = body;

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        { success: false, message: 'Valid latitude (-90 to 90) and longitude (-180 to 180) coordinates are required.' },
        { status: 400 }
      );
    }

    // If explicit weather features are not provided, query live Open-Meteo weather for coordinates
    if (precipitation === undefined || temperature === undefined || wind_speed === undefined) {
      try {
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,wind_gusts_10m,surface_pressure`;
        const weatherRes = await fetch(weatherUrl, { cache: 'no-store' });
        if (weatherRes.ok) {
          const wData = await weatherRes.json();
          const curr = wData.current || {};
          precipitation = curr.precipitation ?? 0.0;
          temperature = curr.temperature_2m ?? 28.0;
          humidity = curr.relative_humidity_2m ?? 70.0;
          wind_speed = curr.wind_speed_10m ?? 12.0;
          wind_gusts = curr.wind_gusts_10m ?? (wind_speed * 1.3);
          surface_pressure = curr.surface_pressure ?? 1010.0;
        } else {
          return NextResponse.json(
            {
              success: false,
              status: 'unavailable',
              message: 'Prediction unavailable: Live meteorological telemetry could not be retrieved from provider.',
            },
            { status: 502 }
          );
        }
      } catch (weatherErr: any) {
        return NextResponse.json(
          {
            success: false,
            status: 'unavailable',
            message: `Prediction unavailable: Failed to fetch atmospheric measurements (${weatherErr.message}).`,
          },
          { status: 502 }
        );
      }
    }

    // Forward validated payload to FastAPI ML Service
    const mlPayload = {
      precipitation: parseFloat(precipitation),
      temperature: parseFloat(temperature),
      humidity: humidity !== undefined ? parseFloat(humidity) : 70.0,
      wind_speed: parseFloat(wind_speed),
      wind_gusts: wind_gusts !== undefined ? parseFloat(wind_gusts) : undefined,
      surface_pressure: surface_pressure !== undefined ? parseFloat(surface_pressure) : 1010.0,
      latitude: lat,
      longitude: lng,
      model_type: model_type || 'preferred',
    };

    const mlRes = await fetch(`${ML_BACKEND_URL}/predict-risk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mlPayload),
      cache: 'no-store',
    });

    if (!mlRes.ok) {
      const errorJson = await mlRes.json().catch(() => ({ detail: 'Unknown ML error' }));
      return NextResponse.json(
        {
          success: false,
          status: 'error',
          message: errorJson.detail || 'Prediction failed in ML backend.',
        },
        { status: mlRes.status }
      );
    }

    const predictionData = await mlRes.json();
    return NextResponse.json({
      success: true,
      data: predictionData,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        status: 'offline',
        message: 'Prediction unavailable: Machine learning backend is currently unreachable. Start FastAPI on port 8000.',
        details: err.message,
      },
      { status: 503 }
    );
  }
}
