import type { Row } from "../types";
import { Grass } from "./Grass";
import { Tree } from "./Tree";

type Props = {
  rowIndex: number;
  rowData: Extract<Row, { type: "forest" }>;
};

export function Forest({ rowIndex, rowData }: Props) {
  return (
    <Grass rowIndex={rowIndex}>
      {rowData.trees.map((tree) => (
        <Tree
          key={`${tree.tileIndex}-${tree.height}`}
          tileIndex={tree.tileIndex}
          height={tree.height}
        />
      ))}
    </Grass>
  );
}