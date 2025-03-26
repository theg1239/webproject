import * as THREE from "three";
import { create } from "zustand";
import { minTileIndex, maxTileIndex, tileSize } from "../constants";

// Type for a single vehicle
export type Vehicle = {
  id: string;
  rowIndex: number;
  initialTileIndex: number;
  direction: boolean;
  speed: number;
  color: THREE.ColorRepresentation;
  // For collision detection
  boundingBox: THREE.Box3;
  currentPosition: THREE.Vector3;
  size: THREE.Vector3;
};

type VehicleStore = {
  vehicles: Map<string, Vehicle>;
  gameStartTime: number;
  
  // Add a vehicle to the store
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'boundingBox' | 'currentPosition' | 'size'>) => string;
  
  // Remove a vehicle from the store
  removeVehicle: (id: string) => void;
  
  // Update a vehicle's position based on time
  updateVehiclePosition: (id: string, time: number) => void;
  
  // Update all vehicle positions
  updateAllVehiclePositions: (time: number) => void;
  
  // Get a vehicle by id
  getVehicle: (id: string) => Vehicle | undefined;
  
  // Get vehicles by row
  getVehiclesByRow: (rowIndex: number) => Vehicle[];
  
  // Reset the store
  reset: () => void;

  // Debug mode for rendering bounding boxes
  debugMode: boolean;
  toggleDebugMode: () => void;
};

// Calculate position based on time and initial position
function calculateVehiclePosition(
  initialTileIndex: number,
  direction: boolean,
  speed: number,
  elapsedTime: number
): number {
  const beginningOfRow = (minTileIndex - 2) * tileSize;
  const endOfRow = (maxTileIndex + 2) * tileSize;
  const distanceRange = endOfRow - beginningOfRow;
  
  const baseX = initialTileIndex * tileSize;
  const baseOffset = baseX - beginningOfRow;
  
  // Calculate motion based on direction
  if (direction) {
    // Vehicle moves to the right
    return beginningOfRow + ((baseOffset + elapsedTime * speed / 1000) % distanceRange);
  } else {
    // Vehicle moves to the left 
    return beginningOfRow + ((baseOffset - elapsedTime * speed / 1000) % distanceRange + distanceRange) % distanceRange;
  }
}

// Create the store
const useVehicleStore = create<VehicleStore>((set, get) => ({
  vehicles: new Map<string, Vehicle>(),
  gameStartTime: Date.now(),
  debugMode: false,
  
  addVehicle: (vehicle) => {
    const id = `vehicle-${vehicle.rowIndex}-${vehicle.initialTileIndex}-${Date.now()}`;
    
    // Calculate initial position
    const x = vehicle.initialTileIndex * tileSize;
    const y = vehicle.rowIndex * tileSize;
    
    // Define vehicle size based on Car.tsx - main body is [60, 30, 15]
    const size = new THREE.Vector3(60, 30, 15);
    
    // Create initial position
    const position = new THREE.Vector3(x, y, 0);
    
    // Create bounding box
    const boundingBox = new THREE.Box3(
      new THREE.Vector3(
        position.x - size.x / 2,
        position.y - size.y / 2,
        position.z
      ),
      new THREE.Vector3(
        position.x + size.x / 2,
        position.y + size.y / 2,
        position.z + size.z
      )
    );
    
    // Add vehicle to store
    set((state) => {
      const newVehicles = new Map(state.vehicles);
      newVehicles.set(id, {
        ...vehicle,
        id,
        boundingBox,
        currentPosition: position,
        size
      });
      
      return { vehicles: newVehicles };
    });
    
    return id;
  },
  
  removeVehicle: (id) => {
    set((state) => {
      const newVehicles = new Map(state.vehicles);
      newVehicles.delete(id);
      return { vehicles: newVehicles };
    });
  },
  
  updateVehiclePosition: (id, time) => {
    const vehicle = get().vehicles.get(id);
    if (!vehicle) return;
    
    // Calculate new X position based on time
    const newX = calculateVehiclePosition(
      vehicle.initialTileIndex,
      vehicle.direction,
      vehicle.speed,
      time - get().gameStartTime
    );
    
    // Update position and bounding box
    set((state) => {
      const newVehicles = new Map(state.vehicles);
      const updatedVehicle = { ...vehicle };
      
      // Update position
      updatedVehicle.currentPosition.x = newX;
      
      // Update bounding box
      updatedVehicle.boundingBox = new THREE.Box3(
        new THREE.Vector3(
          newX - vehicle.size.x / 2,
          vehicle.currentPosition.y - vehicle.size.y / 2,
          vehicle.currentPosition.z
        ),
        new THREE.Vector3(
          newX + vehicle.size.x / 2,
          vehicle.currentPosition.y + vehicle.size.y / 2,
          vehicle.currentPosition.z + vehicle.size.z
        )
      );
      
      newVehicles.set(id, updatedVehicle);
      return { vehicles: newVehicles };
    });
  },
  
  updateAllVehiclePositions: (time) => {
    get().vehicles.forEach((_, id) => {
      get().updateVehiclePosition(id, time);
    });
  },
  
  getVehicle: (id) => {
    return get().vehicles.get(id);
  },
  
  getVehiclesByRow: (rowIndex) => {
    return Array.from(get().vehicles.values()).filter(
      (vehicle) => vehicle.rowIndex === rowIndex
    );
  },
  
  reset: () => {
    set({
      vehicles: new Map<string, Vehicle>(),
      gameStartTime: Date.now()
    });
  },
  
  toggleDebugMode: () => {
    set((state) => ({ debugMode: !state.debugMode }));
  }
}));

export default useVehicleStore; 