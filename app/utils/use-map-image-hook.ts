import { useEffect } from 'react';
import { useMap } from 'react-map-gl';

type UseMapImageOptions = {
  url: string;
  name: string;
};

export function useMapImage({ url, name }: UseMapImageOptions) {
  const mapRef = useMap();

  useEffect(() => {
    const map = mapRef.current;

    if (map) {
      map.loadImage(url, (error, image) => {
        if (error) throw error;
        if (!map.hasImage(name)) {
          map.addImage(name, image!, { sdf: true });
        }
      });

      return () => {
        if (map.hasImage(name)) map.removeImage(name);
      };
    }
  }, [mapRef, name, url]);
}
