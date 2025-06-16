import type { Signal } from "@preact/signals";
import { effect, signal } from "@preact/signals";

export const STORAGE_PREFIX = "site-annotations-";

export interface Storage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/**
 * Creates a signal that is persisted in the given storage.
 *
 * @template T - The type of the signal value.
 * @param key - The key used to store and retrieve the persisted value.
 * @param initialValue - The initial value of the signal if no persisted value is found.
 * @param storage - An object implementing the Storage interface for persisting the signal.
 * @returns A signal with a persisted value that updates storage on changes.
 */
export const persistSignal = <T>(
  key: string,
  initialValue: T,
  storage: Storage
): Signal<T> => {
  const persistedValue = storage.getItem(STORAGE_PREFIX + key);

  const data = persistedValue
    ? signal(JSON.parse(persistedValue) as T)
    : signal(initialValue);

  effect(() => {
    storage.setItem(STORAGE_PREFIX + key, JSON.stringify(data.value));
  });

  return data;
};

interface AsyncStorage<T> {
  get(key: string): Promise<{ [key: string]: T }>;
  set(items: { [key: string]: T }): Promise<void>;
}

/**
 * Creates a signal that is persisted in browser storage (local or sync).
 * 
 * @template T - The type of the signal value.
 * @param key - The key used to store and retrieve the persisted value.
 * @param initialValue - The initial value of the signal if no persisted value is found.
 * @param storage - The browser storage to use (browser.storage.local or browser.storage.sync)
 * @returns A signal with a persisted value that updates storage on changes.
 */
export const persistBrowserSignal = <T>(
  key: string,
  initialValue: T,
  storage: AsyncStorage<T>
): Signal<T> => {
  // Create signal with initial value first
  const data = signal<T>(initialValue);
  
  // Load persisted value asynchronously
  storage.get(key).then((result) => {
    const persistedValue = result[key];
    if (persistedValue !== undefined) {
      data.value = persistedValue;
    }
  });

  // Set up effect to persist changes
  effect(() => {
    try {
      storage.set({ [key]: data.value });
    } catch (error) {
      console.error("Error persisting browser signal:", error);
    }
  });

  return data;
};

export const signalBrowserLocal = <T>(key: string, initialValue: T): Signal<T> => {
  if (typeof browser !== 'undefined' && browser.storage?.local) {
    // Use browser.storage.local if available (extension context)
    return persistBrowserSignal(key, initialValue, browser.storage.local);
  }
  // Fallback to localStorage if browser.storage.local is not available (web context)
  // console.warn(`browser.storage.local not available for key '${key}'. Falling back to localStorage.`);
  return persistSignal(key, initialValue, window.localStorage);
};

export const signalBrowserSync = <T>(key: string, initialValue: T): Signal<T> => {
  if (typeof browser !== 'undefined' && browser.storage?.sync) {
    // Use browser.storage.sync if available (extension context)
    return persistBrowserSignal(key, initialValue, browser.storage.sync);
  }
  // Fallback to localStorage if browser.storage.sync is not available (web context)
  // console.warn(`browser.storage.sync not available for key '${key}'. Falling back to localStorage (syncing disabled).`);
  return persistSignal(key, initialValue, window.localStorage);
};
