import { useCallback, useEffect, useState } from 'react';
import usePanZoom from 'use-pan-and-zoom';

type PanZoomParams = Omit<
  Parameters<typeof usePanZoom>[0] & {
    value: { x: number; y: number; zoom: number };
    onChange: (event: {
      value: { x: number; y: number; zoom: number };
      userInitiated: boolean;
    }) => void;
  },
  'onPan'
>;

interface PanZoomControls
  extends Omit<ReturnType<typeof usePanZoom>, 'setPan' | 'setZoom'> {}

export function usePanZoomControlled(params: PanZoomParams): PanZoomControls {
  const {
    value: { x, y, zoom },
    onChange,
    ...options
  } = params;

  const [, forceUpdate] = useState(false);

  const onPan = useCallback(
    (touches, transform) => {
      onChange({ value: transform, userInitiated: true });
    },
    [onChange]
  );

  const { setPan, setZoom, ...controls } = usePanZoom({
    ...options,
    onPan
  });

  useEffect(() => {
    setPan({ x, y });
    setZoom(zoom);
    onChange({ value: { x, y, zoom }, userInitiated: false });
    // Not sure why this is needed, especially because setPan has a forceUpdate
    // internally... oh well.
    forceUpdate((v) => !v);
  }, [x, y, zoom, setPan, setZoom]);

  return controls;
}
