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
  descriptionMdSrc: string;
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

export function getJsonFn(url: string) {
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

export function getMdFn(url: string) {
  return async () => {
    const response = await fetch(`${process.env.DATA_API || ''}${url}`);

    if (response.status === 404) {
      throw new NotFound('Resource not found', { url });
    }

    try {
      if (!response.ok) {
        throw new Error();
      }
      const text = await response.text();
      return text;
    } catch (error) {
      throw new Error(`Failed to load the md file for "${url}".`);
    }
  };
}

export function getCsvFn(url: string) {
  return async () => {
    const response = await fetch(`${process.env.DATA_API || ''}${url}`);

    if (response.status === 404) {
      throw new NotFound('Resource not found', { url });
    }

    try {
      if (!response.ok) {
        throw new Error();
      }

      const text = await response.text();

      const rows = text.split('\n').filter(Boolean).map((row) => row.split(','));
      const headers = rows[0];
      const data = rows.slice(1).map((row) => {
        return row.reduce(
          (acc, value, index) => {
            acc[headers[index]] = Number(value);
            return acc;
          },
          {} as Record<string, number>
        );
      }).filter(Boolean);

      return data;
    } catch (error) {
      throw new Error(`Failed to load the csv file for "${url}".`);
    }
  };
}
