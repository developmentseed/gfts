import { MapboxOverlay } from '@deck.gl/mapbox';
import { useControl } from 'react-map-gl';

/**
 * Component to add deck GL overlay to the map.
 */
export function DeckGLOverlay(props) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}
