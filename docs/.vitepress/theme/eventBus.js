import { ref } from 'vue';

export function createEventBus() {
  const preference = ref(
    typeof window !== 'undefined'
      ? window.localStorage?.getItem('modulePreference') || 'cjs'
      : 'cjs'
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
