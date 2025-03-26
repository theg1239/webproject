import { Canvas } from "@react-three/fiber";

type Props = {
  children: React.ReactNode;
};

export const Scene = ({ children }: Props) => {
  return (
    <Canvas
      orthographic={true}
      shadows={true}
      camera={{
        position: [300, -300, 300],
        up: [0, 0, 1],
        zoom: 1,
      }}
    >
      <ambientLight />
      <directionalLight position={[-100, -100, 200]} />
      {children}
    </Canvas>
  );
};