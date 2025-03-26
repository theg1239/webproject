import type { Row } from "../types";
import { Forest } from "./Forest";
import { CarLane } from "./CarLane";

type Props = {
  rowIndex: number;
  rowData: Row;
};

export function GameRow({ rowIndex, rowData }: Props) {
  switch (rowData.type) {
    case "forest": {
      return <Forest rowIndex={rowIndex} rowData={rowData} />;
    }
    case "car": {
        return <CarLane rowIndex={rowIndex} rowData={rowData} />;
    }
  }
}