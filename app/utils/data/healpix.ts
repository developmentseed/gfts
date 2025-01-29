import { worker } from '@geoarrow/geoarrow-js';
import { corners_nest, vec2ang, pix2ang_nest } from '@hscmap/healpix';
import {
  Data,
  DateMillisecond,
  FixedSizeList,
  Float32,
  Float64,
  List,
  RecordBatch,
  Schema,
  Struct,
  Table,
  TypeMap,
  Uint8
} from 'apache-arrow';

export type HealpixWorkerData = {
  data: object;
  mostProbData: object;
};

export type HealpixWorker = (
  url: string,
  nside: number
) => Promise<HealpixWorkerData>;

export type HealpixArrowData = {
  date: DateMillisecond;
  geometry: List<List<FixedSizeList<Float32>>>;
  value: Float32;
  color: FixedSizeList<Uint8>;
};

export type HealpixArrowMostProbData = Omit<HealpixArrowData, 'geometry'> & {
  geometry: FixedSizeList<Float32>;
  pressure: Float64;
  temperature: Float64;
};

/**
 * Converts radians to degrees.
 * @param radians - The angle in radians.
 * @returns The angle in degrees.
 */
function rad2Deg(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Converts spherical coordinates (theta, phi) to geographic coordinates
 * (latitude, longitude).
 *
 * @param param - An object containing:
 *   @param param.theta - The polar angle in radians.
 *   @param param.phi - The azimuthal angle in radians.
 * @returns A tuple where the first element is the longitude in degrees and the
 * second element is the latitude in degrees.
 */
function sphericalToLatLon({ theta, phi }: { theta: number; phi: number }) {
  // Convert theta (polar angle) to latitude.
  const lat = rad2Deg(Math.PI / 2 - theta);
  // Convert phi (azimuthal angle) to longitude.
  let lon = rad2Deg(phi);
  // Adjust longitude to be in range [-180, 180]
  if (lon > 180) lon -= 360;
  return [lon, lat];
}

/**
 * Converts a HEALPix ID to a polygon's coordinates in latitude and longitude.
 * @param id - The HEALPix ID.
 * @param nside - The nside parameter of the HEALPix grid.
 * @returns An array of coordinates representing the polygon.
 */
export function healpixId2PolygonCoordinates(
  id: number | string,
  nside: number
): number[][] {
  const ipix = Number(id);

  // corners_nest returns the corners of the healpix cell which is an array of
  // vectors (3D Cartesian coordinates).
  // We then use vec2ang to convert these vectors to spherical coordinates
  // comprised of theta and phi.
  //   theta is the polar angle (angle from the z-axis) in the range [0, pi].
  //   phi is the azimuthal angle (angle from the x-axis) in the range [-pi, pi].
  // Finally, we convert these spherical coordinates to latitude and longitude.
  const coords = corners_nest(nside, ipix).map((vector) =>
    sphericalToLatLon(vec2ang(vector))
  );

  return coords.concat([coords[0]]);
}

/**
 * Converts a HEALPix ID to a points's coordinates in latitude and longitude.
 * @param id - The HEALPix ID.
 * @param nside - The nside parameter of the HEALPix grid.
 * @returns An array of coordinates representing the point.
 */
export function healpixId2CenterPoint(
  id: number | string,
  nside: number
): number[] {
  const ipix = Number(id);

  // pix2ang_nest returns the theta and phi angles for the point.
  //   theta is the polar angle (angle from the z-axis) in the range [0, pi].
  //   phi is the azimuthal angle (angle from the x-axis) in the range [-pi, pi].
  // Finally, we convert these spherical coordinates to latitude and longitude.
  return sphericalToLatLon(pix2ang_nest(nside, ipix));
}

/**
 * Creates an Apache Arrow table from the given columns.
 * @param columns - An object where keys are column names and values are Arrow
 * Data objects.
 * @returns An Apache Arrow Table.
 */
export function makeHealpixArrowTable<T extends TypeMap>(data) {
  const struct = worker.rehydrateData(data) as unknown as Data<Struct<any>>;
  const batch = new RecordBatch(new Schema(struct.type.children), struct);
  return new Table<T>(batch);
}
