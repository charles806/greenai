import { useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item && item !== 'undefined' && item !== 'null') {
        const parsedItem = JSON.parse(item);
        // Ensure parsedItem is not null or undefined
        if (parsedItem === null || parsedItem === undefined) {
          return initialValue;
        }
        // If both initialValue and parsedItem are objects, merge them
        if (typeof initialValue === 'object' && initialValue !== null && 
            typeof parsedItem === 'object' && parsedItem !== null &&
            !Array.isArray(initialValue) && !Array.isArray(parsedItem)) {
          return { ...initialValue, ...parsedItem };
        }
        return parsedItem;
      }
      return initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}