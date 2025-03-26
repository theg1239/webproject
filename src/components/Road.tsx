import { tilesPerRow, tileSize } from "../constants";

type Props = {
  rowIndex: number;
  children?: React.ReactNode;
};

export function Road({ rowIndex, children }: Props) {
  return (
    <group position-y={rowIndex * tileSize}>
      <mesh receiveShadow>
        <planeGeometry args={[tilesPerRow * tileSize, tileSize]} />
        <meshLambertMaterial color={0x454a59} flatShading />
      </mesh>
      {children}
    </group>
  );
}