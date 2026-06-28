import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Float, Line, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Data nodes for the architecture
const ARCH_NODES = [
  {
    id: 'ingestion',
    position: [-4, 2, 0],
    color: '#E07A5F',
    title: '1. Data Ingestion',
    desc: 'Ingests live Astram logs & standardizes vectors.',
  },
  {
    id: 'spatial',
    position: [0, 4, -2],
    color: '#F2CC8F',
    title: '2. Spatial Intelligence',
    desc: 'DBSCAN dynamically identifies congestion anomalies.',
  },
  {
    id: 'prediction',
    position: [4, 2, 0],
    color: '#81B29A',
    title: '3. Predictive Ensemble',
    desc: 'LightGBM, XGBoost, and PyTorch calculate surge index.',
  },
  {
    id: 'dispatch',
    position: [0, -2, 2],
    color: '#E8A598',
    title: '4. Dispatch Solver',
    desc: 'Outputs actionable resource & barricade blueprints.',
  }
];

const ArchitectureNode = ({ position, color, title, desc }) => {
  const meshRef = useRef();
  const [hovered, setHover] = useState(false);

  useFrame((state, delta) => {
    meshRef.current.rotation.x += delta * 0.5;
    meshRef.current.rotation.y += delta * 0.5;
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh
        ref={meshRef}
        position={position}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
        scale={hovered ? 1.2 : 1}
      >
        <icosahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial color={color} wireframe={!hovered} emissive={color} emissiveIntensity={hovered ? 0.5 : 0.1} />
      </mesh>
      
      {/* HTML Overlay anchored to the 3D node */}
      <Html position={position} center distanceFactor={15} zIndexRange={[100, 0]}>
        <div style={{
          background: 'rgba(245, 235, 224, 0.85)',
          padding: '12px 16px',
          borderRadius: '12px',
          border: `2px solid ${color}`,
          width: '220px',
          textAlign: 'center',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 8px 32px rgba(74, 63, 53, 0.2)',
          transform: hovered ? 'scale(1.05)' : 'scale(1)',
          transition: 'transform 0.2s',
          pointerEvents: 'none'
        }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#3E2C20', fontSize: '1.1rem' }}>{title}</h4>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#7D6B5D', lineHeight: '1.4' }}>{desc}</p>
        </div>
      </Html>
    </Float>
  );
};

// Lines connecting the nodes
const ConnectionLines = () => {
  const points1 = [ARCH_NODES[0].position, ARCH_NODES[1].position];
  const points2 = [ARCH_NODES[1].position, ARCH_NODES[2].position];
  const points3 = [ARCH_NODES[2].position, ARCH_NODES[3].position];
  const points4 = [ARCH_NODES[0].position, ARCH_NODES[3].position];

  return (
    <group>
      <Line points={points1} color="#D5BDAF" lineWidth={2} dashed dashScale={10} />
      <Line points={points2} color="#D5BDAF" lineWidth={2} dashed dashScale={10} />
      <Line points={points3} color="#D5BDAF" lineWidth={2} dashed dashScale={10} />
      <Line points={points4} color="#D5BDAF" lineWidth={2} dashed dashScale={10} />
    </group>
  );
};

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#4A3F35' }}>
      
      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <color attach="background" args={['#2A241F']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
        
        {ARCH_NODES.map((node) => (
          <ArchitectureNode key={node.id} {...node} />
        ))}
        
        <ConnectionLines />
        
        <OrbitControls enableZoom={true} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>

      {/* UI Overlay */}
      <div style={{
        position: 'absolute',
        top: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        color: '#F5EBE0',
        pointerEvents: 'none',
        textShadow: '0 2px 10px rgba(0,0,0,0.5)'
      }}>
        <h1 style={{ fontSize: '4rem', margin: '0 0 10px 0', color: '#F2CC8F', letterSpacing: '2px' }}>TrafficPulse</h1>
        <p style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto', opacity: 0.9 }}>
          Event-driven predictive dispatch engine.
        </p>
      </div>

      <button 
        className="btn btn-primary"
        onClick={() => navigate('/dashboard')}
        style={{
          position: 'absolute',
          bottom: '3rem',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '1rem 3rem',
          fontSize: '1.2rem',
          borderRadius: '50px',
          boxShadow: '0 8px 32px rgba(224, 122, 95, 0.4)',
          zIndex: 10
        }}
      >
        Enter Dashboard
      </button>

    </div>
  );
};

export default Landing;
