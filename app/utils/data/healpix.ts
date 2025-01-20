import { corners_nest, vec2ang } from '@hscmap/healpix';
import {
  Field,
  FixedSizeList,
  Float32,
  List,
  makeData,
  RecordBatch,
  Schema,
  Struct,
  Table,
  Uint8
} from 'apache-arrow';

export type HealpixWorkerData = {
  coords: Float32Array;
  ringOffset: Uint32Array;
  polygonOffset: Uint32Array;
  colors: Uint8Array;
};

export type HealpixWorker = (
  url: string,
  nside: number
) => Promise<HealpixWorkerData>;

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
 * Creates an Apache Arrow table from the given columns.
 * @param columns - An object where keys are column names and values are Arrow
 * Data objects.
 * @returns An Apache Arrow Table.
 */
export function makeHealpixArrowTable(data: HealpixWorkerData) {
  // Arrow:: Create geometry
  const coords = makeData({
    type: new Float32(),
    data: data.coords
  });
  const vertices = makeData({
    type: new FixedSizeList(2, new Field('xy', coords.type, false)),
    child: coords
  });
  const rings = makeData({
    type: new List(new Field('vertices', vertices.type, false)),
    valueOffsets: data.ringOffset,
    child: vertices
  });
  const polygons = makeData({
    type: new List(new Field('rings', rings.type, false)),
    valueOffsets: data.polygonOffset,
    child: rings
  });

  // Arrow:: Create colors
  const colorChannels = makeData({
    type: new Uint8(),
    data: data.colors
  });

  const colors = makeData({
    type: new FixedSizeList(4, new Field('rgba', colorChannels.type, false)),
    child: colorChannels
  });

  const schema = new Schema([
    new Field('geometry', polygons.type),
    new Field('colors', colors.type)
  ]);

  const structData = makeData({
    type: new Struct(schema.fields),
    children: [polygons, colors]
  });

  const batch = new RecordBatch(schema, structData);

  return new Table<{
    geometry: List;
    colors: FixedSizeList<Uint8>;
  }>(batch);
}
