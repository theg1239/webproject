import { GameRow } from "./GameRow";
import { Grass } from "./Grass";
import useStore from "../stores/map";

export function GameMap() {
  const rows = useStore((state) => state.rows);

  return (
    <>
      <Grass rowIndex={0} />
      <Grass rowIndex={-1} />
      <Grass rowIndex={-2} />
      <Grass rowIndex={-3} />
      <Grass rowIndex={-4} />
      <Grass rowIndex={-5} />
      <Grass rowIndex={-6} />
      <Grass rowIndex={-7} />
      <Grass rowIndex={-8} />
      <Grass rowIndex={-9} />
      <Grass rowIndex={-10} />

      {rows.map((rowData, index) => (
        <GameRow key={`row-${index + 1}`} rowIndex={index + 1} rowData={rowData} />
      ))}
    </>
  );
}