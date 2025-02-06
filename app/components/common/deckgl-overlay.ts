import { MapboxOverlay } from '@deck.gl/mapbox';
import { useControl } from 'react-map-gl';

/**
 * Component to add deck GL overlay to the map.
 */
export function DeckGLOverlay(props) {
  // @ts-expect-error Type '(map: Map) => HTMLDivElement' is not assignable to type '(map: MapInstance) => HTMLElement'
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}
