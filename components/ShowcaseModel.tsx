import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Text, Edges, Billboard } from '@react-three/drei';
import { ShowcaseConfig, CuboidDimensions, LabelType } from '../types';
import * as THREE from 'three';

interface ShowcaseModelProps {
  dimensions: CuboidDimensions;
  config: ShowcaseConfig;
}

const LABELS = {
  [LabelType.BOPOMOFO]: ['ㄅ', 'ㄆ', 'ㄇ', 'ㄈ', 'ㄉ', 'ㄊ', 'ㄋ', 'ㄌ'],
  [LabelType.LATIN]: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
  [LabelType.NONE]: []
};

const FACE_TO_VERTS = [
  [1, 2, 6, 5], // Right
  [0, 3, 7, 4], // Left
  [0, 1, 2, 3], // Top
  [4, 5, 6, 7], // Bottom
  [3, 2, 6, 7], // Front
  [0, 1, 5, 4], // Back
];

const ShowcaseModel: React.FC<ShowcaseModelProps> = ({ dimensions, config }) => {
  const { width, height, depth } = dimensions;
  const [selectedFace, setSelectedFace] = useState<number | null>(null);
  const dashedLinesRef = useRef<THREE.LineSegments>(null);

  const hw = width / 2;
  const hh = height / 2;
  const hd = depth / 2;

  // 使用 useMemo 管理幾何體，防止產生 WebGL 殘留
  const boxGeom = useMemo(() => new THREE.BoxGeometry(width, height, depth), [width, height, depth]);
  const edgesGeom = useMemo(() => new THREE.EdgesGeometry(boxGeom), [boxGeom]);

  const vertices = useMemo(() => [
    [-hw, hh, -hd], [hw, hh, -hd], [hw, hh, hd], [-hw, hh, hd], 
    [-hw, -hh, -hd], [hw, -hh, -hd], [hw, -hh, hd], [-hw, -hh, hd] 
  ], [hw, hh, hd]);

  // 重算虛線距離
  useEffect(() => {
    if (dashedLinesRef.current) {
      dashedLinesRef.current.computeLineDistances();
    }
  }, [width, height, depth, config.showXRay, config.showEdges]);

  const handleMeshClick = (e: any) => {
    e.stopPropagation();
    if (e.faceIndex !== undefined) {
      const faceIdx = Math.floor(e.faceIndex / 2);
      setSelectedFace(prev => prev === faceIdx ? null : faceIdx);
    }
  };

  const getFaceName = (idx: number) => {
    const labelSet = LABELS[config.labelType];
    if (!labelSet || labelSet.length === 0) return `第 ${idx + 1} 個面`;
    const vertIndices = FACE_TO_VERTS[idx];
    return "面 " + vertIndices.map(vIdx => labelSet[vIdx]).join("");
  };

  return (
    <group position={[0, hh, 0]}>
      {/* 主體模型 */}
      <mesh key={`cube-mesh-${width}-${height}-${depth}`} geometry={boxGeom} onClick={handleMeshClick}>
        {Array.from({ length: 6 }).map((_, i) => (
          <meshStandardMaterial
            key={`${i}-${selectedFace === i}-${config.showXRay}`}
            attach={`material-${i}`}
            color={selectedFace === i ? '#fbbf24' : '#02a568'}
            transparent={config.showXRay}
            opacity={config.showXRay ? 0.35 : 1.0}
            side={THREE.DoubleSide}
            depthWrite={!config.showXRay}
            renderOrder={config.showXRay ? 1 : 2}
          />
        ))}
      </mesh>

      {/* 邊框系統 */}
      {config.showEdges && (
        <group>
          <Edges
            geometry={boxGeom}
            threshold={15}
            color="#0f172a"
            lineWidth={config.showXRay ? 1.5 : 2.5}
            renderOrder={3}
          />
          
          <lineSegments ref={dashedLinesRef} geometry={edgesGeom} renderOrder={4}>
            <lineDashedMaterial 
              color="#475569" 
              dashSize={0.2} 
              gapSize={0.1} 
              transparent 
              opacity={0.8}
              depthTest={false}
            />
          </lineSegments>
        </group>
      )}

      {/* 頂點標記系統 */}
      {config.labelType !== LabelType.NONE && vertices.map((v, i) => {
          const vec = new THREE.Vector3(v[0], v[1], v[2]);
          const direction = vec.clone().normalize();
          // 文字位置向外推 0.8，紅點（球體）留在頂點原位
          const textPos = direction.clone().multiplyScalar(0.8);

          return (
            <group key={`${config.labelType}-${i}`} position={[v[0], v[1], v[2]]}>
              {/* 紅點：精確定位在頂點角上 */}
              <mesh renderOrder={100}>
                <sphereGeometry args={[0.08]} />
                <meshBasicMaterial color="#ef4444" depthTest={false} transparent opacity={1} />
              </mesh>
              
              {/* 文字：懸浮在頂點外側，確保不被面遮擋 */}
              <Billboard position={[textPos.x, textPos.y, textPos.z]}>
                <Text
                  fontSize={0.5}
                  color="#1e293b"
                  outlineWidth={0.08}
                  outlineColor="#ffffff"
                  anchorX="center"
                  anchorY="middle"
                  depthTest={false}
                  renderOrder={101}
                >
                  {LABELS[config.labelType][i]}
                </Text>
              </Billboard>
            </group>
          );
      })}

      {/* 面標籤 */}
      {selectedFace !== null && (
        <Billboard position={[0, hh + 1.8, 0]}>
          <group renderOrder={110}>
            <mesh position={[0, 0, -0.05]}>
              <planeGeometry args={[4.2, 1.1]} />
              <meshBasicMaterial color="white" transparent opacity={0.9} depthTest={false} />
            </mesh>
            <Text
              fontSize={0.5}
              color="#b45309"
              outlineWidth={0.05}
              outlineColor="white"
              depthTest={false}
            >
              {getFaceName(selectedFace)}
            </Text>
          </group>
        </Billboard>
      )}
    </group>
  );
};

export default ShowcaseModel;