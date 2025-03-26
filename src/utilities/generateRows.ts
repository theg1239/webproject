import * as THREE from "three";
import type { Row, RowType } from "../types";
import { minTileIndex, maxTileIndex } from "../constants";

function randomElement<T>(array: T[]): T {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
}

export function generateRows(count: number): Row[] {
  return Array.from({ length: count }, () => {
    const occupiedTiles = new Set<number>();

    // Randomly pick a row type
    const type: RowType = randomElement(["car", "forest"]);
    if (type === "car") return generateCarLaneMetadata();
    if (type === "forest") return generateForestMetadata(occupiedTiles);

    // Default case (should never happen with TypeScript)
    return generateForestMetadata(occupiedTiles);
  });
}

function generateForestMetadata(occupiedTiles: Set<number>): Row {
  const treeCount = THREE.MathUtils.randInt(3, 5);
  const trees = [];

  for (let i = 0; i < treeCount; i++) {
    let tileIndex: number;
    do {
      tileIndex = THREE.MathUtils.randInt(minTileIndex, maxTileIndex);
    } while (occupiedTiles.has(tileIndex));
    occupiedTiles.add(tileIndex);

    trees.push({
      tileIndex,
      height: randomElement([20, 30, 50]),
    });
  }

  return { type: "forest", trees };
}

function generateCarLaneMetadata(): Row {
  const direction = randomElement([true, false]);
  const speed = randomElement([125, 156, 188]);

  const occupiedTiles = new Set<number>();

  const vehicles = Array.from({ length: 3 }, () => {
    let initialTileIndex: number;
    do {
      initialTileIndex = THREE.MathUtils.randInt(minTileIndex, maxTileIndex);
    } while (occupiedTiles.has(initialTileIndex));
    occupiedTiles.add(initialTileIndex - 1);
    occupiedTiles.add(initialTileIndex);
    occupiedTiles.add(initialTileIndex + 1);

    const color: THREE.ColorRepresentation = randomElement([
      0xa52523, 0xbdb638, 0x78b14b,
    ]);

    return { initialTileIndex, color };
  });

  return { type: "car", direction, speed, vehicles };
}
