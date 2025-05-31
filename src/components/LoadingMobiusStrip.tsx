// LoadingMobiusStrip.tsx
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import styles from './LoadingMobiusStrip.module.css'; // We'll create this CSS file next
import { ParametricGeometry } from 'three-stdlib';

const LoadingMobiusStrip: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const animationFrameIdRef = useRef<number | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const mobiusStripRef = useRef<THREE.Mesh | null>(null);

    useEffect(() => {
        if (!mountRef.current) return;

        const currentMount = mountRef.current;

        // Scene
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        // Camera
        const camera = new THREE.PerspectiveCamera(
            75, // Field of View
            currentMount.clientWidth / currentMount.clientHeight, // Aspect Ratio
            0.1, // Near clipping plane
            1000 // Far clipping plane
        );
        camera.position.set(0, 0, 3.2); // Position the camera
        cameraRef.current = camera;

        // Renderer
        const renderer = new THREE.WebGLRenderer({
            antialias: true, // Smooth edges
            alpha: true,     // Transparent background for the canvas
        });
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio); // Adjust for screen resolution
        currentMount.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.0); // Soft white light
        scene.add(ambientLight);
        
        const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.2); // Main light
        directionalLight1.position.set(5, 3, 5); // Positioned to cast highlights
        scene.add(directionalLight1);

        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.8); // Fill light
        directionalLight2.position.set(-5, -3, -2);
        scene.add(directionalLight2);

        // Mobius Strip Geometry
        const R = 1.3; // Major radius of the strip
        const stripWidth = 0.7; // Width of the strip material

        const mobiusFunction = (u: number, v: number, target: THREE.Vector3) => {
            // u and v are typically in the range [0, 1]
            u = u * stripWidth - stripWidth / 2; // Map u to [-stripWidth/2, stripWidth/2]
            v = v * 2 * Math.PI; // Map v to [0, 2*PI]

            const x = (R + u * Math.cos(v / 2)) * Math.cos(v);
            const y = (R + u * Math.cos(v / 2)) * Math.sin(v);
            const z = u * Math.sin(v / 2);
            target.set(x, y, z);
        };
        
        // ParametricGeometry(function, slices, stacks)
        // Slices: number of segments along the v-direction (length)
        // Stacks: number of segments along the u-direction (width)
        const geometry = new ParametricGeometry(mobiusFunction, 200, 40); // High segments for smoothness

        // Material
        const material = new THREE.MeshPhysicalMaterial({
            color: 0x00ff00, // Initial color (e.g., green, will be animated)
            metalness: 0.15,  // Low metalness for a plastic/glassy look
            roughness: 0.05, // Very smooth for sharp reflections and glossy appearance
            transmission: 0.85, // Controls transparency (0=opaque, 1=fully transparent glass)
            transparent: true, // Necessary for transmission to work
            side: THREE.DoubleSide, // Render both sides of the strip
            ior: 1.5,        // Index of Refraction (glass is ~1.5)
            thickness: 0.3,    // Simulates thickness for light transmission effects
        });

        const mobiusStrip = new THREE.Mesh(geometry, material);
        mobiusStripRef.current = mobiusStrip;
        scene.add(mobiusStrip);

        // Animation loop
        let hue = Math.random(); // Start with a random hue for variety
        const animate = () => {
            animationFrameIdRef.current = requestAnimationFrame(animate);

            if (mobiusStripRef.current) {
                // Spin the Mobius strip
                mobiusStripRef.current.rotation.x += 0.07;
                mobiusStripRef.current.rotation.y += 0.12;
                // mobiusStripRef.current.rotation.z += 0.001; // Optional subtle z-axis spin

                // Change color over time by cycling the hue
                hue = (hue + 0.04) % 1; // Adjust speed of color change here
                (mobiusStripRef.current.material as THREE.MeshPhysicalMaterial).color.setHSL(
                    hue, // Hue (0-1 cycles through rainbow)
                    0.75, // Saturation (0-1)
                    0.55  // Lightness (0-1)
                );
            }
            
            if (rendererRef.current && sceneRef.current && cameraRef.current) {
                 rendererRef.current.render(sceneRef.current, cameraRef.current);
            }
        };

        animate(); // Start the animation

        // Handle window resize
        const handleResize = () => {
            if (currentMount && rendererRef.current && cameraRef.current) {
                const width = currentMount.clientWidth;
                const height = currentMount.clientHeight;

                cameraRef.current.aspect = width / height;
                cameraRef.current.updateProjectionMatrix();
                rendererRef.current.setSize(width, height);
            }
        };
        window.addEventListener('resize', handleResize);

        // Cleanup on component unmount
        return () => {
            if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current);
            }
            window.removeEventListener('resize', handleResize);
            
            // Dispose of Three.js objects to free up resources
            if (mobiusStripRef.current) {
                mobiusStripRef.current.geometry.dispose();
                if (Array.isArray(mobiusStripRef.current.material)) {
                    mobiusStripRef.current.material.forEach(m => m.dispose());
                } else {
                    (mobiusStripRef.current.material as THREE.Material).dispose();
                }
                if(sceneRef.current) sceneRef.current.remove(mobiusStripRef.current); // Remove from scene
            }
            
            if (rendererRef.current) {
                if (currentMount && rendererRef.current.domElement) {
                    // Check if domElement still exists before trying to remove
                    if (currentMount.contains(rendererRef.current.domElement)) {
                         currentMount.removeChild(rendererRef.current.domElement);
                    }
                }
                rendererRef.current.dispose(); // Dispose renderer
            }
        };
    }, []); // Empty dependency array ensures this runs once on mount and cleans up on unmount

    return (
        <div className={styles.loadingContainer}>
            <div ref={mountRef} className={styles.mobiusCanvasContainer}></div>
            <div className={styles.loadingText}>Loading Financial Snapshot...</div>
        </div>
    );
};

export default LoadingMobiusStrip;