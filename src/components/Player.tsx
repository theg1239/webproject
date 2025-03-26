import type * as THREE from "three";
import { Bounds } from "@react-three/drei";
import { useRef, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import usePlayerAnimation from "../hooks/usePlayerAnimation";
import { DirectionalLight } from "./DirectionalLight";
import { updateCameraPosition } from "../stores/camera";

export function Player() {
  const player = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const { camera } = useThree();

  // Use the player animation hook
  usePlayerAnimation(player, camera);

  useEffect(() => {
    if (!player.current) return;
    if (!lightRef.current) return;

    // Only set light target
    lightRef.current.target = player.current;
    
    // Initialize camera position
    updateCameraPosition(camera, player.current.position);
  }, [camera]);

  return (
    <Bounds fit clip observe margin={10}>
      <group ref={player}>
        <group>
          <mesh position={[0, 0, 10]} castShadow receiveShadow>
            <boxGeometry args={[15, 15, 20]} />
            <meshLambertMaterial color={0xffffff} flatShading />
          </mesh>
          <mesh position={[0, 0, 21]} castShadow receiveShadow>
            <boxGeometry args={[2, 4, 2]} />
            <meshLambertMaterial color={0xf0619a} flatShading />
          </mesh>
        </group>
        <DirectionalLight ref={lightRef} />
      </group>
    </Bounds>
  );
}