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
}

export interface TiledRoom {
  widthPx: number;
  heightPx: number;
  collisions: CollisionRect[];
  entities: EntitySpawn[];
}

export function parseTmx(xml: string): TiledRoom {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  const map = doc.querySelector('map')!;

  const tileWidth = parseInt(map.getAttribute('tilewidth') ?? '32');
  const tileHeight = parseInt(map.getAttribute('tileheight') ?? '32');
  const cols = parseInt(map.getAttribute('width') ?? '0');
  const rows = parseInt(map.getAttribute('height') ?? '0');

  const widthPx = cols * tileWidth;
  const heightPx = rows * tileHeight;

  const collisions: CollisionRect[] = [];
  const entities: EntitySpawn[] = [];

  for (const group of doc.querySelectorAll('objectgroup')) {
    const groupName = group.getAttribute('name') ?? '';

    for (const obj of group.querySelectorAll('object')) {
      const x = parseFloat(obj.getAttribute('x') ?? '0');
      const y = parseFloat(obj.getAttribute('y') ?? '0');

      if (groupName === 'Collisions') {
        const width = parseFloat(
          obj.getAttribute('width') ?? String(tileWidth),
        );
        const height = parseFloat(
          obj.getAttribute('height') ?? String(tileHeight),
        );
        collisions.push({ x, y, width, height });
      } else if (groupName === 'Entities') {
        const name = obj.getAttribute('name') ?? '';
        const typeProp = obj.querySelector('property[name="type"]');
        const type = typeProp?.getAttribute('value') ?? '';
        entities.push({ name, type, x, y });
      }
    }
  }

  return { widthPx, heightPx, collisions, entities };
}
