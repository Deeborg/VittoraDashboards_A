import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import styles from './LoadingMobiusStrip.module.css';
import { ParametricGeometry } from 'three-stdlib';

const LoadingMobiusStrip: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const animationFrameIdRef = useRef<number | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const mobiusStripRef = useRef<THREE.Mesh | null>(null);
    const clockRef = useRef<THREE.Clock>(new THREE.Clock());
    const animationStateRef = useRef({
        rotationSpeed: { x: 100, y: 130 }, // degrees per second
        colorChangeSpeed: 0.5, // hue cycles per minute
        lastUpdateTime: 0
    });

    useEffect(() => {
        if (!mountRef.current) return;

        const currentMount = mountRef.current;

        // Initialize Three.js components
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(
            75,
            currentMount.clientWidth / currentMount.clientHeight,
            0.1,
            1000
        );
        camera.position.set(0, 0, 3.2);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        currentMount.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Lighting - simplified for better performance
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.position.set(5, 3, 5);
        scene.add(directionalLight);

        // Mobius Strip
        const R = 1.3;
        const stripWidth = 0.7;

        const mobiusFunction = (u: number, v: number, target: THREE.Vector3) => {
            u = u * stripWidth - stripWidth / 2;
            v = v * 2 * Math.PI;
            const x = (R + u * Math.cos(v / 2)) * Math.cos(v);
            const y = (R + u * Math.cos(v / 2)) * Math.sin(v);
            const z = u * Math.sin(v / 2);
            target.set(x, y, z);
        };
        
        // Optimized geometry resolution
        const geometry = new ParametricGeometry(mobiusFunction, 120, 24);

        const material = new THREE.MeshPhysicalMaterial({
            color: 0x00aaff,
            metalness: 0.1,
            roughness: 0.1,
            transmission: 0.8,
            transparent: true,
            side: THREE.DoubleSide,
            ior: 1.5,
            thickness: 0.3,
            clearcoat: 0.5,
            clearcoatRoughness: 0.1
        });

        const mobiusStrip = new THREE.Mesh(geometry, material);
        mobiusStripRef.current = mobiusStrip;
        scene.add(mobiusStrip);

        // Animation system that works even when tab is inactive
        const animate = () => {
            animationFrameIdRef.current = requestAnimationFrame(animate);
            
            const delta = clockRef.current.getDelta(); // Time since last frame in seconds
            const state = animationStateRef.current;

            if (mobiusStripRef.current) {
                // Convert rotation speeds from degrees to radians
                const radPerSecX = THREE.MathUtils.degToRad(state.rotationSpeed.x);
                const radPerSecY = THREE.MathUtils.degToRad(state.rotationSpeed.y);
                
                // Apply rotation
                mobiusStripRef.current.rotation.x += radPerSecX * delta;
                mobiusStripRef.current.rotation.y += radPerSecY * delta;

                // Time-based color animation (independent of frame rate)
                const now = Date.now();
                const timeDiff = now - state.lastUpdateTime;
                const hue = ((now * 0.001 * state.colorChangeSpeed / 60) % 1);
                
                (mobiusStripRef.current.material as THREE.MeshPhysicalMaterial).color.setHSL(
                    hue,
                    0.8,
                    0.6
                );
                
                state.lastUpdateTime = now;
            }
            
            rendererRef.current?.render(sceneRef.current!, cameraRef.current!);
        };

        // Start animation systems
        clockRef.current.start();
        animationStateRef.current.lastUpdateTime = Date.now();
        animate();

        // Handle window resize
        const handleResize = () => {
            if (!currentMount || !rendererRef.current || !cameraRef.current) return;
            
            const width = currentMount.clientWidth;
            const height = currentMount.clientHeight;

            cameraRef.current.aspect = width / height;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(width, height);
        };
        
        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(currentMount);

        // Cleanup
        return () => {
            if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current);
            }
            resizeObserver.disconnect();
            
            // Dispose of Three.js resources
            if (mobiusStripRef.current) {
                mobiusStripRef.current.geometry.dispose();
                const material = mobiusStripRef.current.material;
                if (Array.isArray(material)) {
                    material.forEach(m => m.dispose());
                } else {
                    material.dispose();
                }
                scene.remove(mobiusStripRef.current);
            }
            
            if (rendererRef.current) {
                rendererRef.current.dispose();
                if (currentMount.contains(rendererRef.current.domElement)) {
                    currentMount.removeChild(rendererRef.current.domElement);
                }
            }
        };
    }, []);

    return (
        <div className={styles.loadingContainer}>
            <div ref={mountRef} className={styles.mobiusCanvasContainer}></div>
            <div className={styles.loadingText}>Loading Financial Snapshot...</div>
        </div>
    );
};

export default LoadingMobiusStrip;