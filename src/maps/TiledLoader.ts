export interface CollisionRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface EntitySpawn {
  name: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  properties: Record<string, string>;
}

export interface TiledRoom {
  id: string;
  widthPx: number;
  heightPx: number;
  collisions: CollisionRect[];
  entities: EntitySpawn[];
  properties: Record<string, string>;
}

export function parseTmx(xml: string): TiledRoom {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "text/xml");
  const map = doc.querySelector("map")!;

  const tileWidth = parseInt(map.getAttribute("tilewidth") ?? "32");
  const tileHeight = parseInt(map.getAttribute("tileheight") ?? "32");
  const cols = parseInt(map.getAttribute("width") ?? "0");
  const rows = parseInt(map.getAttribute("height") ?? "0");

  const widthPx = cols * tileWidth;
  const heightPx = rows * tileHeight;

  const mapProperties = parseProperties(map);
  const id = mapProperties["id"] ?? "";

  const collisions: CollisionRect[] = [];
  const entities: EntitySpawn[] = [];

  for (const group of doc.querySelectorAll("objectgroup")) {
    const groupName = group.getAttribute("name") ?? "";

    for (const obj of group.querySelectorAll("object")) {
      const x = parseFloat(obj.getAttribute("x") ?? "0");
      const y = parseFloat(obj.getAttribute("y") ?? "0");

      if (groupName === "Collisions") {
        const width = parseFloat(
          obj.getAttribute("width") ?? String(tileWidth),
        );
        const height = parseFloat(
          obj.getAttribute("height") ?? String(tileHeight),
        );
        collisions.push({ x, y, width, height });
      } else if (groupName === "Entities") {
        const name = obj.getAttribute("name") ?? "";
        const width = parseFloat(obj.getAttribute("width") ?? "32");
        const height = parseFloat(obj.getAttribute("height") ?? "32");
        const props = parseProperties(obj);
        const type = props["type"] ?? "";
        entities.push({ name, type, x, y, width, height, properties: props });
      }
    }
  }

  return {
    id,
    widthPx,
    heightPx,
    collisions,
    entities,
    properties: mapProperties,
  };
}

function parseProperties(el: Element): Record<string, string> {
  const result: Record<string, string> = {};
  const propsEl = el.querySelector("properties");
  if (!propsEl) return result;
  for (const prop of propsEl.querySelectorAll("property")) {
    const name = prop.getAttribute("name") ?? "";
    const value = prop.getAttribute("value") ?? "";
    if (name) result[name] = value;
  }
  return result;
}
