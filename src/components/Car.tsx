import type * as THREE from "three";
import { useRef } from "react";
import { tileSize } from "../constants";
import { Wheel } from "./Wheel";
import useVehicleAnimation from "../hooks/useVehicleAnimation";

type Props = {
  rowIndex: number;
  initialTileIndex: number;
  direction: boolean;
  speed: number;
  color: THREE.ColorRepresentation;
};

export function Tank({
  initialTileIndex,
  direction,
  speed,
  color,
}: Props) {
  const tank = useRef<THREE.Group>(null);
  useVehicleAnimation(tank, direction, speed);

  return (
    <group
      position-x={initialTileIndex * tileSize}
      rotation-z={direction ? 0 : Math.PI}
      ref={tank}
    >
      {/* Tank Hull */}
      <mesh position={[0, 0, 12]} castShadow receiveShadow>
        <boxGeometry args={[60, 30, 15]} />
        <meshLambertMaterial color={color} flatShading />
      </mesh>

      {/* Tank Turret */}
      <mesh position={[-5, 0, 30]} castShadow receiveShadow>
        <boxGeometry args={[30, 20, 10]} />
        <meshLambertMaterial color={color} flatShading />
      </mesh>

      {/* Turret Barrel */}
      <mesh position={[15, 0, 30]} castShadow receiveShadow>
        <boxGeometry args={[20, 4, 4]} />
        <meshLambertMaterial color='black' flatShading />
      </mesh>

      {/* Wheels on the left side */}
      <group position={[0, 0, 0]}>
        <Wheel x={-20} />
        <Wheel x={0} />
        <Wheel x={20} />
      </group>
    </group>
  );
}
