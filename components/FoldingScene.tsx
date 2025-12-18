import React, { useMemo } from 'react';
import { useSpring, animated } from '@react-spring/three';
import { GridPoint, CuboidDimensions } from '../types';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';

interface FoldingSceneProps {
  points: GridPoint[];
  progress: number; // 0 to 1
  cuboidDimensions: CuboidDimensions;
}

// Data structure for the tree of faces
interface FoldNode {
  x: number;
  y: number;
  id: string;
  directionFromParent: 'top' | 'bottom' | 'left' | 'right' | 'root';
  width: number;
  height: number; 
  children: FoldNode[];
  faceType: number; 
}

interface FoldFaceProps {
  node: FoldNode;
  progress: number;
  parentWidth?: number;
  parentHeight?: number;
  collidingIds: Set<string>;
}

const FoldFace: React.FC<FoldFaceProps> = ({ node, progress, parentWidth = 1, parentHeight = 1, collidingIds }) => {
  let rotationAxis: [number, number, number] = [0, 0, 0];
  let positionOffset: [number, number, number] = [0, 0, 0];
  let pivotOffset: [number, number, number] = [0, 0, 0];

  const halfPWidth = parentWidth / 2;
  const halfPHeight = parentHeight / 2;
  const halfWidth = node.width / 2;
  const halfHeight = node.height / 2;

  // Logic: Pivot is always at the shared edge.
  if (node.directionFromParent === 'right') {
    positionOffset = [halfPWidth, 0, 0]; 
    rotationAxis = [0, 0, 1]; // Fold around Z
    pivotOffset = [halfWidth, 0, 0]; // Shift center right
  } else if (node.directionFromParent === 'left') {
    positionOffset = [-halfPWidth, 0, 0];
    rotationAxis = [0, 0, -1]; 
    pivotOffset = [-halfWidth, 0, 0];
  } else if (node.directionFromParent === 'top') { 
    // Grid Y-1 (Visual Top) -> 3D Z-1
    positionOffset = [0, 0, -halfPHeight];
    rotationAxis = [1, 0, 0]; 
    pivotOffset = [0, 0, -halfHeight];
  } else if (node.directionFromParent === 'bottom') { 
    // Grid Y+1 -> 3D Z+1
    positionOffset = [0, 0, halfPHeight];
    rotationAxis = [-1, 0, 0]; 
    pivotOffset = [0, 0, halfHeight];
  }

  const { rot } = useSpring({
    rot: node.directionFromParent === 'root' ? 0 : progress * Math.PI / 2,
    config: { mass: 1, tension: 80, friction: 20 }
  });

  const isColliding = collidingIds.has(node.id);

  if (node.directionFromParent === 'root') {
    return (
      <group>
         <FaceContent id={node.id} width={node.width} height={node.height} isColliding={isColliding} />
         {node.children.map(child => (
           <FoldFace key={child.id} node={child} progress={progress} parentWidth={node.width} parentHeight={node.height} collidingIds={collidingIds} />
         ))}
      </group>
    );
  }

  return (
    <group position={positionOffset}>
      <animated.group rotation={rot.to(r => [rotationAxis[0] * r, rotationAxis[1] * r, rotationAxis[2] * r])}>
        <group position={pivotOffset}>
          <FaceContent id={node.id} width={node.width} height={node.height} isColliding={isColliding} />
          {node.children.map(child => (
            <FoldFace key={child.id} node={child} progress={progress} parentWidth={node.width} parentHeight={node.height} collidingIds={collidingIds} />
          ))}
        </group>
      </animated.group>
    </group>
  );
};

const FaceContent = ({ id, width, height, isColliding }: { id: string, width: number, height: number, isColliding: boolean }) => (
  <mesh>
    <boxGeometry args={[width * 0.95, 0.05, height * 0.95]} />
    <meshStandardMaterial color={isColliding ? "#ef4444" : "#02a568"} />
    <Edges color={isColliding ? "#7f1d1d" : "#004d30"} threshold={15} />
    {/* Inner face marker */}
    <mesh position={[0, 0.03, 0]} rotation={[-Math.PI/2, 0, 0]}>
       <planeGeometry args={[width * 0.8, height * 0.8]} />
       <meshBasicMaterial color={isColliding ? "#fca5a5" : "#6ee7b7"} />
    </mesh>
  </mesh>
);

const calculateCollisions = (root: FoldNode, cuboidDims: CuboidDimensions): Set<string> => {
    const collisions = new Set<string>();
    const rootObj = new THREE.Object3D();
    const map = new Map<string, THREE.Object3D>();
    map.set(root.id, rootObj);

    const buildObjTree = (n: FoldNode, parentObj: THREE.Object3D) => {
        const obj = new THREE.Object3D();
        
        if (n.directionFromParent !== 'root') {
             const parentW = (n as any)._parentW;
             const parentH = (n as any)._parentH;
             const angle = Math.PI / 2;
             const halfPWidth = parentW / 2;
             const halfPHeight = parentH / 2;
             const halfWidth = n.width / 2;
             const halfHeight = n.height / 2;

             if (n.directionFromParent === 'right') {
                obj.position.set(halfPWidth, 0, 0);
                obj.rotation.z = angle;
                obj.translateX(halfWidth);
             } else if (n.directionFromParent === 'left') {
                obj.position.set(-halfPWidth, 0, 0);
                obj.rotation.z = -angle;
                obj.translateX(-halfWidth);
             } else if (n.directionFromParent === 'top') {
                obj.position.set(0, 0, -halfPHeight);
                obj.rotation.x = angle; 
                obj.translateZ(-halfHeight); 
             } else if (n.directionFromParent === 'bottom') {
                obj.position.set(0, 0, halfPHeight);
                obj.rotation.x = -angle; 
                obj.translateZ(halfHeight);
             }
        }
        
        parentObj.add(obj);
        for (const child of n.children) {
            (child as any)._parentW = n.width;
            (child as any)._parentH = n.height;
            buildObjTree(child, obj);
        }
        map.set(n.id, obj);
    }
    
    buildObjTree(root, rootObj);
    rootObj.updateMatrixWorld(true);
    
    const positionsList: {id: string, vec: THREE.Vector3}[] = [];
    map.forEach((obj, id) => {
        const vec = new THREE.Vector3();
        obj.getWorldPosition(vec);
        positionsList.push({ id, vec });
    });
    
    for (let i = 0; i < positionsList.length; i++) {
        for (let j = i + 1; j < positionsList.length; j++) {
            const p1 = positionsList[i];
            const p2 = positionsList[j];
            if (p1.vec.distanceTo(p2.vec) < 0.1) {
                collisions.add(p1.id);
                collisions.add(p2.id);
            }
        }
    }
    return collisions;
}


const FoldingScene: React.FC<FoldingSceneProps> = ({ points, progress, cuboidDimensions }) => {
  const { width: W, height: H, depth: D } = cuboidDimensions;

  // Transform list of points into a Tree structure
  const foldTree = useMemo(() => {
    if (points.length === 0) return null;

    const pointMap = new Map<string, GridPoint>();
    points.forEach(p => pointMap.set(`${p.x},${p.y}`, p));

    const rootPoint = points[0];
    const visited = new Set<string>();
    
    const buildNode = (p: GridPoint, direction: FoldNode['directionFromParent']): FoldNode => {
      visited.add(`${p.x},${p.y}`);
      
      let myWidth = 1;
      let myHeight = 1;
      let myType = p.faceType ?? 0;

      if (p.faceType !== undefined) {
          if (myType === 0) { myWidth = W; myHeight = D; }
          else if (myType === 1) { myWidth = W; myHeight = H; }
          else if (myType === 2) { myWidth = D; myHeight = H; }
      } else {
          myWidth = W; myHeight = D; 
      }

      if (p.rotated) {
         const temp = myWidth;
         myWidth = myHeight;
         myHeight = temp;
      }

      const node: FoldNode = {
        x: p.x,
        y: p.y,
        id: p.id,
        directionFromParent: direction,
        width: myWidth,
        height: myHeight,
        faceType: myType,
        children: []
      };

      const neighbors = [
        { dx: 1, dy: 0, dir: 'right' as const },
        { dx: -1, dy: 0, dir: 'left' as const },
        { dx: 0, dy: -1, dir: 'top' as const }, 
        { dx: 0, dy: 1, dir: 'bottom' as const },
      ];

      for (const n of neighbors) {
        const key = `${p.x + n.dx},${p.y + n.dy}`;
        if (pointMap.has(key) && !visited.has(key)) {
          const neighborPoint = pointMap.get(key)!;
          node.children.push(buildNode(neighborPoint, n.dir));
        }
      }
      return node;
    };

    return buildNode(rootPoint, 'root');
  }, [points, W, H, D]);

  const collidingIds = useMemo(() => {
      if (!foldTree || progress < 0.9) return new Set<string>();
      return calculateCollisions(foldTree, cuboidDimensions);
  }, [foldTree, progress, cuboidDimensions]);

  if (!foldTree) return null;

  // Calculate alignment offset
  // We want the root block's center to align with its grid position on the floor
  // Mapping: Grid (0,0) -> World (-4, -4)
  // Each grid cell is 1 unit.
  // The center of grid cell x,y is at (x-3.5, y-3.5) if Grid is 8x8 centered at 0.
  // We also need to lift it by half its height to sit on floor.
  
  const rootX = foldTree.x;
  const rootY = foldTree.y;
  const worldX = (rootX - 4); // Align with floor grid lines
  const worldZ = (rootY - 4);
  const worldY = foldTree.height / 2; // Sit on floor

  return (
    <group position={[worldX, worldY, worldZ]}>
      <FoldFace node={foldTree} progress={progress} collidingIds={collidingIds} />
    </group>
  );
};

export default FoldingScene;