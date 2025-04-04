import { NotFound } from '$components/common/error/not-found';

export interface SpeciesListed {
  id: string;
  name: string;
  region: string;
  image: string;
  coords: [number, number];
}

export interface SpeciesGroup {
  id: string;
  name: string;
  file: string;
}

export interface Species {
  id: string;
  name: string;
  region: string;
  image: string;
  coords: [number, number];
  groups: SpeciesGroup[];
}

export interface IndividualListed {
  id: string;
  species: string;
}

export interface IndividualParquetItem {
  value: number;
  date: Date;
  longitude: number;
  latitude: number;
}

export function getJsonFn(url) {
  return async () => {
    const response = await fetch(`${process.env.DATA_API || ''}${url}`);

    if (response.status === 404) {
      throw new NotFound('Resource not found', { url });
    }

    try {
      const json = await response.json();
      return json;
    } catch (error) {
      throw new NotFound('Resource not found', { url });
    }
  };
}
