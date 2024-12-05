export interface SpeciesListed {
  id: string;
  name: string;
  region: string;
  image: string;
  coords: [number, number];
}

export interface Species {
  id: string;
  name: string;
  region: string;
  image: string;
  coords: [number, number];
}

export function getJsonFn(url) {
  return async () => {
    const response = await fetch(`${process.env.DATA_API || ''}${url}`);
    return response.json();
  };
}
