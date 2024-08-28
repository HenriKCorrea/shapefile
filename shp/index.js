import slice from "slice-source";
import view from "../view";
import shp_cancel from "./cancel";
import parseNull from "./null";
import parsePoint from "./point";
import parsePolyLine from "./polyline";
import parsePolygon from "./polygon";
import parseMultiPoint from "./multipoint";
import parsePointZ from "./pointz";
import parsePolyLineZ from "./polylinez";
import parsePolygonZ from "./polygonz";
import parseMultiPointZ from "./multipointz";
import parseMultiPatch from "./multipatch";
import shp_read from "./read";

var parsers = {
  0: parseNull,
  1: parsePoint,
  3: parsePolyLine,
  5: parsePolygon,
  8: parseMultiPoint,
  11: parsePointZ,
  13: parsePolyLineZ,
  15: parsePolygonZ,
  18: parseMultiPointZ,
  21: parsePoint, // PointM
  23: parsePolyLine, // PolyLineM
  25: parsePolygon, // PolygonM
  28: parseMultiPoint, // MultiPointM
  31: parseMultiPatch
};

export default function(source) {
  source = slice(source);
  return source.slice(100).then(function(array) {
    return new Shp(source, view(array));
  });
};

function Shp(source, header) {
  var type = header.getInt32(32, true);
  if (!(type in parsers)) throw new Error("unsupported shape type: " + type);
  this._source = source;
  this._type = type;
  this._index = 0;
  this._parse = parsers[type];
  this.bbox = [header.getFloat64(36, true), header.getFloat64(44, true), header.getFloat64(52, true), header.getFloat64(60, true)];
}

var prototype = Shp.prototype;
prototype.read = shp_read;
prototype.cancel = shp_cancel;
