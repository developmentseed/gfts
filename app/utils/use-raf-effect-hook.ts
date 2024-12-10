import { DependencyList, useEffect } from "react";

/**
 * Hook to handle requestAnimationFrame with a specified FPS.
 *
 * @param callback - The function to be called on each frame.
 * @param fps - Frames per second to control the frequency of the callback.
 * @param running - Boolean indicating whether the animation is running.
 * @param deps - Dependency array for the useEffect hook.
 */
export function useRafEffect(
  callback: (timestamp: number) => void,
  fps: number,
  running: boolean,
  deps: DependencyList
) {
  useEffect(() => {
    if (!running) return;

    let rafId: number;
    let prev: number | null = null;
    function loop(ts: number) {
      if (prev !== null) {
        if (ts - prev > 1000 / fps) {
          callback(ts);
          prev = ts;
        }
      } else {
        prev = ts;
      }
      rafId = requestAnimationFrame(loop);
    }
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [running, ...deps]);
}
