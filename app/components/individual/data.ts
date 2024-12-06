import parquet from '@dsnp/parquetjs/dist/browser/parquet.cjs.js';

export function requestIndividualParquetFn(id: string) {
  return async () => {
    const reader = await parquet.ParquetReader.openUrl(
      `${process.env.DATA_API}/data/${id}/${id}.parquet`
    );

    // create a new cursor
    const cursor = reader.getCursor();

    // read all records from the file.
    const data: Record<string, any> = {};
    let record;
    while ((record = await cursor.next())) {
      const ts = Number(record.time) / 1e6;

      data[ts] = data[ts] || [];

      // eslint-disable-next-line
      data[ts].push({
        value: Number(record.states),
        date: new Date(ts),
        longitude: record.longitude / 1e6,
        latitude: record.latitude / 1e6
      });
    }
    return data;
  };
}
