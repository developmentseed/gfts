import { Table } from 'apache-arrow';

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
