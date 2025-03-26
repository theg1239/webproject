import type * as THREE from "three";

export type RowType = "forest" | "car";
export type Row =
  | {
      type: "forest";
      trees: { tileIndex: number; height: number }[];
    }
  | {
      type: "car";
      direction: boolean;
      speed: number;
      vehicles: {
        initialTileIndex: number;
        color: THREE.ColorRepresentation;
      }[];
    };

export type MoveDirection = "forward" | "backward" | "left" | "right";