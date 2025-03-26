import type { Row } from "../types";
import { Road } from "./Road";
import { Tank } from "./Car";

type Props = {
  rowIndex: number;
  rowData: Extract<Row, { type: "car" }>;
};

export function CarLane({ rowIndex, rowData }: Props) {
  return (
    <Road rowIndex={rowIndex}>
      {rowData.vehicles.map((vehicle, index) => (
        <Tank
          key={`vehicle-${rowIndex}-${vehicle.initialTileIndex}-${index}`}
          rowIndex={rowIndex}
          initialTileIndex={vehicle.initialTileIndex}
          direction={rowData.direction}
          speed={rowData.speed}
          color={vehicle.color}
        />
      ))}
    </Road>
  );
}