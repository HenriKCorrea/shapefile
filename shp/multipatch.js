export default function(record) {
  var
    i = 44,
    j,
    n = record.getInt32(36, true),
    m = record.getInt32(40, true),
    z = i + n*4 + n*4 + m*16 + 16,
    parts = new Array(n),
    partTypes = new Array(n),
    points = new Array(m),
    triangles = [],
    polygons = [],
    holes = [];

  for (j = 0; j<n; ++j, i += 4) {
    parts[j] = record.getInt32(i, true);
  }

  for (j = 0; j<n; ++j, i += 4) {
    partTypes[j] = record.getInt32(i, true);
  }

  for (j = 0; j<m; ++j, i += 16, z += 8) {
    points[j] = [
      record.getFloat64(i, true),
      record.getFloat64(i + 8, true),
      record.getFloat64(z, true)
    ];
  }

  parts.forEach(function(v, i) {
    var ring = points.slice(v, parts[i + 1]);
    var a, b, n;

    switch (partTypes[i]) {
      case 0: // Triangle Strip
        a = ring[0];
        b = ring[1];
        for (n = 2; n < ring.length; n++) {
          triangles.push([a, b, ring[n]]);
          a = b;
          b = ring[n];
        }
        break;

      case 1: // Triangle Fan
        a = ring[0];
        b = ring[1];
        for (n = 2; n < ring.length; n++) {
          triangles.push([a, b, ring[n]]);
          b = ring[n];
        }
        break;

      case 2: // Outer Ring
        polygons.push([ring]);
        break;

      case 3: // Inner Ring
        holes.push(ring);
        break;

      case 4: // First Ring
        holes.push(ring);
        break;

      case 5: // Ring
        polygons.push([ring]);
        break;
    }
  });
  
  holes.forEach(function(hole) {
    polygons.some(function(polygon) {
      if (ringContainsSome(polygon[0], hole)) {
        polygon.push(hole);
        return true;
      }
    }) || polygons.push([hole]);
  });

  triangles.forEach(function(triangle) {
    polygons.push([triangle])
  });

  return polygons.length === 1
    ? { type: "Polygon", coordinates: polygons[0] }
    : { type: "MultiPolygon", coordinates: polygons };
};

function ringContainsSome(ring, hole) {
  var i = -1, n = hole.length, c;
  while (++i<n) {
    if (c = ringContains(ring, hole[i])) {
      return c>0;
    }
  }
  return false;
}

function ringContains(ring, point) {
  var x = point[0], y = point[1], contains = -1;
  for (var i = 0, n = ring.length, j = n - 1; i<n; j = i++) {
    var pi = ring[i], xi = pi[0], yi = pi[1],
      pj = ring[j], xj = pj[0], yj = pj[1];
    if (segmentContains(pi, pj, point)) {
      return 0;
    }
    if (((yi>y) !== (yj>y)) && ((x<(xj - xi)*(y - yi)/(yj - yi) + xi))) {
      contains = -contains;
    }
  }
  return contains;
}

function segmentContains(p0, p1, p2) {
  var x20 = p2[0] - p0[0], y20 = p2[1] - p0[1];
  if (x20 === 0 && y20 === 0) return true;
  var x10 = p1[0] - p0[0], y10 = p1[1] - p0[1];
  if (x10 === 0 && y10 === 0) return false;
  var t = (x20*x10 + y20*y10)/(x10*x10 + y10*y10);
  return t<0 || t>1 ? false : t === 0 || t === 1 ? true : t*x10 === x20 && t*y10 === y20;
}
