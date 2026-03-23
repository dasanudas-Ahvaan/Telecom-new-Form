// components/ui/multi-select/use-click-outside.js
import { useEffect } from 'react';

/**
 * Hook to detect clicks outside of a specified element.
 * @param {import('react').RefObject} ref - The ref of the element to monitor.
 * @param {(event: MouseEvent | TouchEvent) => void} handler - The function to call when clicked outside.
 */
export function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      const el = ref?.current;
      // Do nothing if clicking ref's element or descendent elements
      if (!el || el.contains(event.target)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}