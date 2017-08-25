export default function(record) {
  var
    i = 40,
    j,
    n = record.getInt32(36, true),
    z = i + n*16 + 16,
    coordinates = new Array(n);

  for (j = 0; j<n; ++j, i += 16, z += 8) {
    coordinates[j] = [
      record.getFloat64(i, true),
      record.getFloat64(i + 8, true),
      record.getFloat64(z, true)
    ];
  }

  return { type: "MultiPoint", coordinates: coordinates };
};
