import type { MalayAsset, MalayRecord } from './malay-search';
/** Decode only in the worker. Repeated provenance strings share one instance. */
export function decodeMalayAsset(value: unknown): MalayAsset {
  const asset = value as MalayAsset & { fields?: string[]; strings?: string[] };
  if (!asset || !Array.isArray(asset.records)) throw new Error('Invalid Malay dictionary');
  if (asset.schema === 1) return asset;
  if ((asset.schema as number) !== 2 || !Array.isArray(asset.fields) || !Array.isArray(asset.strings)) throw new Error('Invalid Malay dictionary');
  const fields = asset.fields, strings = asset.strings;
  const records = (asset.records as unknown as unknown[][]).map(row => {
    if (!Array.isArray(row) || row.length !== fields.length) throw new Error('Invalid Malay record');
    const record: Record<string, unknown> = {};
    row.forEach((value, i) => {
      if (value === null) return;
      if (typeof value === 'number' && value < 0) {
        if (!Number.isInteger(value) || strings[-value - 1] === undefined) throw new Error('Invalid Malay string');
        value = strings[-value - 1];
      }
      record[fields[i]] = value;
    });
    return record as unknown as MalayRecord;
  });
  return { schema: 1, version: asset.version, corpusSha256: asset.corpusSha256, records };
}
