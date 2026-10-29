import { ref } from 'vue';

export function createEventBus() {
  // ESM is the default; CJS is shown only when a reader picks it
  const preference = ref(
    typeof window !== 'undefined'
      ? window.localStorage?.getItem('modulePreference') || 'esm'
      : 'esm'
  );
  const subscribers = new Set();

  return {
    preference,
    subscribe(callback) {
      subscribers.add(callback);
      return () => subscribers.delete(callback);
    },
    setPreference(value) {
      preference.value = value;
      if (typeof window !== 'undefined') {
        window.localStorage?.setItem('modulePreference', value);
      }
      subscribers.forEach(callback => callback(value));
    }
  };
};
