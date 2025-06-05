import { useMemo, useState } from 'react';
import useDimensions from 'react-cool-dimensions';

export const PADDING = {
  top: 0,
  right: 8,
  bottom: 48,
  left: 40
};

export function useSizes() {
  const [chartSize, setChartSize] = useState({ width: 0, height: 0 });

  const { observe } = useDimensions({
    onResize: ({ width, height }) => {
      setChartSize({ width, height });
    }
  });

  const dataArea = useMemo(() => {
    const width = chartSize.width - PADDING.left - PADDING.right;
    const height = chartSize.height - PADDING.top - PADDING.bottom;
    return {
      x: PADDING.left,
      y: PADDING.top,
      x2: PADDING.left + width,
      y2: PADDING.top + height,
      width,
      height
    };
  }, [chartSize]);

  return {
    dataArea,
    chart: chartSize,
    observe
  };
}
