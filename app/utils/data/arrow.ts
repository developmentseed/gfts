import {
  Data,
  Field,
  FixedSizeList,
  Float32,
  List,
  makeData,
  Schema,
  Struct,
  Table
} from 'apache-arrow';

/**
 * Creates a polygon representation using Arrow data structures.
 *
 * @param data - The input data as a flat array of coordinates.
 * @param ringOffset - A Uint32Array representing the offsets for the rings.
 * @returns An Arrow data structure representing the polygon.
 */
export function makeArrowPolygon(data, ringOffset: Uint32Array) {
  const count = ringOffset.length - 1;
  const coordsArray = new Float32Array(data);
  const polygonOffset = new Uint32Array(count + 1).map((_, i) => i);
  const coords = makeData({
    type: new Float32(),
    data: coordsArray
  });
  const vertices = makeData({
    type: new FixedSizeList(2, new Field('xy', coords.type, false)),
    child: coords
  });
  const rings = makeData({
    type: new List(new Field('vertices', vertices.type, false)),
    valueOffsets: ringOffset,
    child: vertices
  });

  return makeData({
    type: new List(new Field('rings', rings.type, false)),
    valueOffsets: polygonOffset,
    child: rings
  });
}

/**
 * Creates a struct from the provided data.
 *
 * @param data - An array of tuples where each tuple contains a string (name)
 * and a Data buffer.
 * @returns The created struct.
 */
export function makeStruct(data: [string, Data][]) {
  const schema = new Schema(
    data.map(([name, buffer]) => new Field(name, buffer.type))
  );

  const struct = makeData({
    type: new Struct(schema.fields),
    children: data.map(([, buffer]) => buffer)
  });

  return struct;
}


export function arrowReduce<R, F extends string>(
  table: Table,
  fields: F | F[],
  cb: (acc: R, row: Record<F, any>, index: number, table: Table) => R,
  initial: R
): R {
  const fieldArr = Array.isArray(fields) ? fields : [fields];
  let acc = initial;
  for (let index = 0; index < table.numRows; index++) {
    const row = {} as Record<F, any>;
    for (const field of fieldArr) {
      row[field] = table.getChild(field)!.get(index);
    }
    acc = cb(acc, row as Record<F, any>, index, table);
  }
  return acc;
}

export function arrowMap<R, F extends string>(
  table: Table,
  fields: F | F[],
  cb: (row: Record<F, any>, index: number, table: Table) => R
): R[] {
  return arrowReduce<R[], F>(
    table,
    fields,
    (acc, row, index, table) => {
      return [...acc, cb(row, index, table)];
    },
    []
  );
}

export function arrowFilter<F extends string>(
  table: Table,
  fields: F | F[],
  cb: (row: Record<F, any>, index: number, table: Table) => boolean
): Record<F, any>[] {
  return arrowReduce<Record<F, any>[], F>(
    table,
    fields,
    (acc, row, index, table) => {
      if (cb(row, index, table)) {
        return [...acc, row];
      }
      return acc;
    },
    []
  );
}
