import {createMMKV} from 'react-native-mmkv';

/**
 * Single MMKV instance for the whole app. Wrapped so callers never touch
 * the raw string/JSON boundary directly — StorageService is the only
 * place that knows MMKV's API.
 */
export const storage = createMMKV({id: 'paintroll-storage'});

class StorageServiceImpl {
  getString(key: string, fallback = ''): string {
    return storage.getString(key) ?? fallback;
  }

  setString(key: string, value: string): void {
    storage.set(key, value);
  }

  getNumber(key: string, fallback = 0): number {
    return storage.getNumber(key) ?? fallback;
  }

  setNumber(key: string, value: number): void {
    storage.set(key, value);
  }

  getBoolean(key: string, fallback = false): boolean {
    const value = storage.getBoolean(key);
    return value === undefined ? fallback : value;
  }

  setBoolean(key: string, value: boolean): void {
    storage.set(key, value);
  }

  getObject<T>(key: string, fallback: T): T {
    const raw = storage.getString(key);
    if (!raw) {
      return fallback;
    }
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  setObject<T>(key: string, value: T): void {
    storage.set(key, JSON.stringify(value));
  }

  delete(key: string): void {
    storage.remove(key);
  }

  clearAll(): void {
    storage.clearAll();
  }
}

export const StorageService = new StorageServiceImpl();
