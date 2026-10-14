"""
fetch_historical_dataset.py
--------------------------
Downloads documented historical meteorological and disaster weather telemetry
from the Open-Meteo Historical Archive API (ERA5 Reanalysis / Global Meteorological Stations).

Features captured:
- date: YYYY-MM-DD
- latitude: Latitude of monitoring station
- longitude: Longitude of monitoring station
- elevation: Elevation in meters
- temperature_2m_max: Maximum daily 2m temperature (°C)
- temperature_2m_min: Minimum daily 2m temperature (°C)
- precipitation_sum: Daily cumulative precipitation (mm)
- rain_sum: Daily liquid rainfall sum (mm)
- wind_speed_10m_max: Peak daily 10m wind speed (km/h)
- wind_gusts_10m_max: Peak daily wind gusts (km/h)
- surface_pressure_mean: Mean surface barometric pressure (hPa)
- relative_humidity_2m_mean: Mean relative humidity (%)
- event_name: Documented historical disaster or seasonal baseline
- risk_level: Validated target label derived from standard WMO/IMD emergency alert criteria:
    0 = Low Risk (Normal calm conditions)
    1 = Medium Risk / Watch (Elevated precipitation/wind/barometric pressure drop)
    2 = High Risk / Warning (Severe hazard: heavy rainfall/destructive gusts/cyclonic depression)
"""

import json
import os
import sys
import time
import urllib.request
import pandas as pd

# Historical extreme disaster periods and baseline calm periods across documented coordinates
DOCUMENTED_HISTORICAL_EVENTS = [
    # Cyclone Michaung (Dec 2023 - Tamil Nadu / AP coast)
    {
        "name": "Cyclone Michaung",
        "lat": 13.0827,
        "lon": 80.2707,
        "start": "2023-11-20",
        "end": "2023-12-10",
        "category": "Historical Tropical Cyclone"
    },
    # Cyclone Biparjoy (June 2023 - Arabian Sea / Gujarat)
    {
        "name": "Cyclone Biparjoy",
        "lat": 22.8000,
        "lon": 69.7000,
        "start": "2023-06-05",
        "end": "2023-06-25",
        "category": "Historical Extremely Severe Cyclonic Storm"
    },
    # Cyclone Mandous (Dec 2022 - Tamil Nadu / Chennai)
    {
        "name": "Cyclone Mandous",
        "lat": 12.5000,
        "lon": 80.1000,
        "start": "2022-12-01",
        "end": "2022-12-15",
        "category": "Historical Cyclonic Storm"
    },
    # Cyclone Yaas (May 2021 - Odisha / West Bengal)
    {
        "name": "Cyclone Yaas",
        "lat": 21.4000,
        "lon": 86.9000,
        "start": "2021-05-18",
        "end": "2021-06-02",
        "category": "Historical Very Severe Cyclonic Storm"
    },
    # Cyclone Tauktae (May 2021 - Arabian Sea / Gujarat Coast)
    {
        "name": "Cyclone Tauktae",
        "lat": 20.9000,
        "lon": 71.3000,
        "start": "2021-05-10",
        "end": "2021-05-24",
        "category": "Historical Extremely Severe Cyclonic Storm"
    },
    # Cyclone Amphan (May 2020 - Bay of Bengal / Kolkata / Sundarbans)
    {
        "name": "Cyclone Amphan",
        "lat": 22.5726,
        "lon": 88.3639,
        "start": "2020-05-14",
        "end": "2020-05-25",
        "category": "Historical Super Cyclonic Storm"
    },
    # Cyclone Fani (May 2019 - Puri, Odisha)
    {
        "name": "Cyclone Fani",
        "lat": 19.8135,
        "lon": 85.8312,
        "start": "2019-04-26",
        "end": "2019-05-08",
        "category": "Historical Extremely Severe Cyclonic Storm"
    },
    # Kerala Extreme Floods (Aug 2018 - Kochi / Idukki)
    {
        "name": "Kerala Extreme Monsoon Floods",
        "lat": 9.9312,
        "lon": 76.2673,
        "start": "2018-08-01",
        "end": "2018-08-25",
        "category": "Historical Catastrophic Monsoon Floods"
    },
    # Chennai Historic Floods (Nov-Dec 2015)
    {
        "name": "Chennai Historic Floods",
        "lat": 13.0827,
        "lon": 80.2707,
        "start": "2015-11-15",
        "end": "2015-12-10",
        "category": "Historical Extreme Precipitation Disaster"
    },
    # Cyclone Vardah (Dec 2016 - Chennai)
    {
        "name": "Cyclone Vardah",
        "lat": 13.0827,
        "lon": 80.2707,
        "start": "2016-12-05",
        "end": "2016-12-16",
        "category": "Historical Very Severe Cyclonic Storm"
    },
    # Baseline Dry / Normal Winter Period (Jan-Feb 2023 - Chennai)
    {
        "name": "Normal Seasonal Baseline (Chennai)",
        "lat": 13.0827,
        "lon": 80.2707,
        "start": "2023-01-10",
        "end": "2023-02-15",
        "category": "Normal Calm Seasonal Observation"
    },
    # Baseline Dry / Normal Spring Period (Mar-Apr 2023 - Gujarat)
    {
        "name": "Normal Seasonal Baseline (Gujarat)",
        "lat": 22.8000,
        "lon": 69.7000,
        "start": "2023-03-01",
        "end": "2023-04-10",
        "category": "Normal Calm Seasonal Observation"
    },
    # Baseline Calm Period (Jan-Feb 2022 - Kolkata)
    {
        "name": "Normal Seasonal Baseline (Kolkata)",
        "lat": 22.5726,
        "lon": 88.3639,
        "start": "2022-01-05",
        "end": "2022-02-10",
        "category": "Normal Calm Seasonal Observation"
    },
    # Baseline Calm Period (Jan-Feb 2022 - Kerala)
    {
        "name": "Normal Seasonal Baseline (Kerala)",
        "lat": 9.9312,
        "lon": 76.2673,
        "start": "2022-01-05",
        "end": "2022-02-10",
        "category": "Normal Calm Seasonal Observation"
    },
    # Baseline Calm Period (Jan-Feb 2021 - Odisha)
    {
        "name": "Normal Seasonal Baseline (Odisha)",
        "lat": 19.8135,
        "lon": 85.8312,
        "start": "2021-01-05",
        "end": "2021-02-10",
        "category": "Normal Calm Seasonal Observation"
    }
]


def classify_risk_wmo_criteria(precip: float, wind_gusts: float, pressure: float) -> int:
    """
    Standard World Meteorological Organization (WMO) / IMD Severe Weather Alert Thresholds:
    - 2 (High Risk / Warning):
        * Daily precipitation >= 65.0 mm (WMO 'Heavy to Very Heavy Rain' warning) OR
        * Peak wind gusts >= 70.0 km/h (Gale force / Storm warning) OR
        * Significant cyclonic depression with surface pressure < 995.0 hPa
    - 1 (Medium Risk / Watch):
        * Daily precipitation between 20.0 mm and 65.0 mm (WMO 'Moderate/Heavy Rain' alert) OR
        * Peak wind gusts between 45.0 km/h and 70.0 km/h (Near Gale / Strong breeze) OR
        * Moderate barometric depression (995.0 hPa <= pressure < 1005.0 hPa)
    - 0 (Low Risk / Normal):
        * Calm to light weather with precipitation < 20.0 mm, wind gusts < 45.0 km/h, pressure >= 1005.0 hPa
    """
    if (precip >= 65.0) or (wind_gusts >= 70.0) or (pressure < 995.0):
        return 2  # High Risk
    elif (precip >= 20.0) or (wind_gusts >= 45.0) or (pressure < 1005.0):
        return 1  # Medium Risk
    else:
        return 0  # Low Risk


def fetch_historical_dataset(output_path: str = "ml_backend/data/historical_disaster_weather.csv") -> pd.DataFrame:
    records = []
    headers = {"User-Agent": "SafeSphereAI-DisasterRiskAssessment/1.0 (Research)"}

    print(f"Fetching documented historical observations from Open-Meteo Historical Archive...")

    for event in DOCUMENTED_HISTORICAL_EVENTS:
        url = (
            f"https://archive-api.open-meteo.com/v1/archive?"
            f"latitude={event['lat']}&longitude={event['lon']}"
            f"&start_date={event['start']}&end_date={event['end']}"
            f"&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,rain_sum,wind_speed_10m_max,wind_gusts_10m_max,surface_pressure_mean,relative_humidity_2m_mean"
            f"&timezone=auto"
        )
        print(f" -> Querying {event['name']} ({event['start']} to {event['end']})...")
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = json.loads(resp.read().decode("utf-8"))

            elevation = data.get("elevation", 10.0)
            daily = data.get("daily", {})
            dates = daily.get("time", [])

            t_max = daily.get("temperature_2m_max", [])
            t_min = daily.get("temperature_2m_min", [])
            precip = daily.get("precipitation_sum", [])
            rain = daily.get("rain_sum", [])
            wind_speed = daily.get("wind_speed_10m_max", [])
            wind_gusts = daily.get("wind_gusts_10m_max", [])
            pressure = daily.get("surface_pressure_mean", [])
            humidity = daily.get("relative_humidity_2m_mean", [])

            for i, d in enumerate(dates):
                p = precip[i] if i < len(precip) and precip[i] is not None else 0.0
                r = rain[i] if i < len(rain) and rain[i] is not None else 0.0
                ws = wind_speed[i] if i < len(wind_speed) and wind_speed[i] is not None else 10.0
                wg = wind_gusts[i] if i < len(wind_gusts) and wind_gusts[i] is not None else ws * 1.3
                press = pressure[i] if i < len(pressure) and pressure[i] is not None else 1010.0
                humid = humidity[i] if i < len(humidity) and humidity[i] is not None else 70.0
                tmx = t_max[i] if i < len(t_max) and t_max[i] is not None else 30.0
                tmn = t_min[i] if i < len(t_min) and t_min[i] is not None else 22.0

                risk = classify_risk_wmo_criteria(p, wg, press)

                records.append({
                    "date": d,
                    "latitude": event["lat"],
                    "longitude": event["lon"],
                    "elevation": elevation,
                    "temperature_2m_max": round(tmx, 2),
                    "temperature_2m_min": round(tmn, 2),
                    "temperature_mean": round((tmx + tmn) / 2.0, 2),
                    "precipitation_sum": round(p, 2),
                    "rain_sum": round(r, 2),
                    "wind_speed_10m_max": round(ws, 2),
                    "wind_gusts_10m_max": round(wg, 2),
                    "surface_pressure_mean": round(press, 2),
                    "relative_humidity_2m_mean": round(humid, 2),
                    "event_name": event["name"],
                    "event_category": event["category"],
                    "source": "ECMWF ERA5 Reanalysis via Open-Meteo Historical Archive",
                    "risk_level": risk
                })

            time.sleep(0.3)  # Respect rate limit
        except Exception as e:
            print(f"Error fetching {event['name']}: {e}")

    df = pd.DataFrame(records)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"Successfully saved {len(df)} documented historical records to {output_path}")
    print(f"Class distribution: {dict(df['risk_level'].value_counts())}")
    return df


if __name__ == "__main__":
    fetch_historical_dataset()
