export const attachReturnToAppLoadingReset = (reset: () => void): (() => void) => {
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      reset();
    }
  };

  reset();
  window.addEventListener('pageshow', reset);
  document.addEventListener('visibilitychange', handleVisibilityChange);

  return () => {
    window.removeEventListener('pageshow', reset);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
};
