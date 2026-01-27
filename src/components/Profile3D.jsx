import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';

function Model(props) {
    // Load the GLTF model including nodes to find the camera
    const { nodes, scene } = useGLTF('public/matheus_3d.glb');
    const meshRef = useRef();

    // Find the camera node (trying common names or fallback to first camera found)
    const cameraNode = nodes['Câmera'] || nodes['Camera'] || Object.values(nodes).find(n => n.isCamera);

    return (
        <group>
            {/* If a camera exists in the file, use it as default */}
            {cameraNode && <primitive object={cameraNode} makeDefault />}

            {/* Render the scene (which contains the mesh) */}
            <primitive object={scene} ref={meshRef} {...props} />
        </group>
    );
}

const Profile3D = () => {
    return (
        <div style={{ width: '100%', height: '400px' }}>
            <Canvas>
                {/* No manual PerspectiveCamera here, we rely on the GLB's camera */}

                {/* Render the loaded model with finalized values */}
                <Model
                    position={[0, -0.4, 0.1]}
                    rotation={[0.5, -2.8, 0]}
                    scale={9.6}
                />

                <OrbitControls
                    enableZoom={true}
                    enablePan={false}
                    rotateSpeed={0.5}
                />
            </Canvas>
        </div>
    );
};

export default Profile3D;
