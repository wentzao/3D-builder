import React, { useState } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import { BlockData, ToolMode, Vector3Array } from '../types';

interface BlockProps {
  data: BlockData;
  mode: ToolMode;
  selectedColor: string;
  onAdd: (position: Vector3Array) => void;
  onRemove: (id: string) => void;
}

const Block: React.FC<BlockProps> = ({ data, mode, selectedColor, onAdd, onRemove }) => {
  const [hovered, setHover] = useState(false);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation(); // Prevent clicking through to the grid/plane

    if (mode === ToolMode.REMOVE) {
      onRemove(data.id);
    } else if (mode === ToolMode.ADD) {
      // Logic to add a block adjacent to the clicked face
      if (!e.face) return;
      
      const normal = e.face.normal;
      const newPos: Vector3Array = [
        data.position[0] + normal.x,
        data.position[1] + normal.y,
        data.position[2] + normal.z
      ];
      onAdd(newPos);
    } 
    // Paint mode could be implemented here if needed, currently reusing logic or creating new blocks
  };

  return (
    <mesh
      position={data.position}
      onClick={handleClick}
      onPointerOver={(e) => { e.stopPropagation(); setHover(true); }}
      onPointerOut={(e) => setHover(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial 
        color={hovered && mode === ToolMode.REMOVE ? '#ff4d4d' : data.color} 
        transparent={mode === ToolMode.REMOVE && hovered}
        opacity={mode === ToolMode.REMOVE && hovered ? 0.5 : 1}
      />
      <Edges 
        scale={1} 
        threshold={15} // Display edges only when angle > 15 degrees
        color="black" 
      />
    </mesh>
  );
};

export default Block;