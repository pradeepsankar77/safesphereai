// SafeSphere AI: Client-Side Offline Emergency Storage Cache

const STORAGE_KEYS = {
  ALERTS: 'safesphere_cached_alerts',
  SHELTERS: 'safesphere_cached_shelters',
  LOCATION: 'safesphere_cached_location',
  LAST_SYNC: 'safesphere_last_sync_time',
};

export interface CachedDataSummary {
  alertsCount: number;
  sheltersCount: number;
  lastLocation: { lat: number; lng: number } | null;
  lastSynced: string;
}

export const offlineCacheService = {
  saveAlerts(alerts: any[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
    } catch (e) {
      console.warn('Offline cache storage quota notice:', e);
    }
  },

  getAlerts(): any[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ALERTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveShelters(shelters: any[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.SHELTERS, JSON.stringify(shelters));
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
    } catch (e) {
      console.warn('Offline shelter cache notice:', e);
    }
  },

  getShelters(): any[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SHELTERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveLocation(coords: { lat: number; lng: number }) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.LOCATION, JSON.stringify(coords));
    } catch {}
  },

  getLocation(): { lat: number; lng: number } | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOCATION);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  getCacheSummary(): CachedDataSummary {
    const alerts = this.getAlerts();
    const shelters = this.getShelters();
    const location = this.getLocation();
    const sync = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.LAST_SYNC) : null;

    return {
      alertsCount: alerts.length,
      sheltersCount: shelters.length,
      lastLocation: location,
      lastSynced: sync ? new Date(sync).toLocaleTimeString() : 'Just now',
    };
  },
};
