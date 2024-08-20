export function debounce(func: (...args: any[]) => void, wait: number) {
  let timeout: NodeJS.Timeout | null = null;

  function debounced(...args: any[]) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);
  }

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
}
