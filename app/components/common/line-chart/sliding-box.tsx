import React, {
  useLayoutEffect, useRef,
  useState
} from 'react';
import { clamp } from '$utils/format';

interface SlidingBoxProps {
  minX?: number;
  startX: number;
  endX: number;
  children: React.ReactNode;
}

// Ensure the box stays within the values of startX and endX.
// Used for the sliding months.

export function SlidingBox(props: SlidingBoxProps) {
  const { children, startX, endX, minX = 0 } = props;

  const ref = useRef<SVGGElement>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    if (!ref.current) return;

    const { width } = ref.current.getBoundingClientRect();
    setWidth(width);
  }, []);

  const x = clamp(startX, minX, endX - width);

  return (
    <g ref={ref} style={{ transform: `translate(${x}px, 0)` }}>
      {children}
    </g>
  );
}
