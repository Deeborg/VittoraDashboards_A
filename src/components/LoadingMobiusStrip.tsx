import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import styles from './LoadingMobiusStrip.module.css';
import { ParametricGeometry } from 'three-stdlib';

const LoadingMobiusStrip: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const animationFrameIdRef = useRef<number | null>(null);
    const [webGlError, setWebGlError] = useState(false); // Track if WebGL fails

    useEffect(() => {
        if (!mountRef.current) return;

        let scene: THREE.Scene;
        let camera: THREE.PerspectiveCamera;
        let renderer: THREE.WebGLRenderer;
        let mobiusStrip: THREE.Mesh;
        const clock = new THREE.Clock();

        try {
            // 1. Initialize Scene
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
            camera.position.z = 3.2;

            // 2. Initialize Renderer with Error Checking
            renderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: true,
                powerPreference: "high-performance"
            });

            renderer.setSize(300, 300); // Fixed size for loader
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            mountRef.current.appendChild(renderer.domElement);
            rendererRef.current = renderer;

            // 3. Mobius Geometry
            const mobiusFunction = (u: number, v: number, target: THREE.Vector3) => {
                const R = 1.3;
                const stripWidth = 0.7;
                u = u * stripWidth - stripWidth / 2;
                v = v * 2 * Math.PI;
                const x = (R + u * Math.cos(v / 2)) * Math.cos(v);
                const y = (R + u * Math.cos(v / 2)) * Math.sin(v);
                const z = u * Math.sin(v / 2);
                target.set(x, y, z);
            };
            
            const geometry = new ParametricGeometry(mobiusFunction, 80, 20);
            const material = new THREE.MeshPhysicalMaterial({
                color: 0x00aaff,
                transmission: 0.8,
                thickness: 0.5,
                side: THREE.DoubleSide,
            });

            mobiusStrip = new THREE.Mesh(geometry, material);
            scene.add(mobiusStrip);
            scene.add(new THREE.AmbientLight(0xffffff, 0.8));
            
            const light = new THREE.DirectionalLight(0xffffff, 1);
            light.position.set(5, 5, 5);
            scene.add(light);

            const animate = () => {
                animationFrameIdRef.current = requestAnimationFrame(animate);
                const delta = clock.getDelta();
                if (mobiusStrip) {
                    mobiusStrip.rotation.x += 1.5 * delta;
                    mobiusStrip.rotation.y += 1.8 * delta;
                }
                renderer.render(scene, camera);
            };

            animate();
        } catch (e) {
            console.error("WebGL initialization failed, falling back to CSS:", e);
            setWebGlError(true);
        }

        return () => {
            if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
            if (rendererRef.current) {
                rendererRef.current.dispose();
                rendererRef.current.forceContextLoss();
                if (mountRef.current && rendererRef.current.domElement) {
                    mountRef.current.removeChild(rendererRef.current.domElement);
                }
            }
        };
    }, []);

    // FALLBACK UI if WebGL fails
    if (webGlError) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.cssLoader}></div> {/* Add a CSS spinner in your module.css */}
                <div className={styles.loadingText}>Vittora is Loading...</div>
            </div>
        );
    }

    return (
        <div className={styles.loadingContainer}>
            <div ref={mountRef} className={styles.mobiusCanvasContainer}></div>
            <div className={styles.loadingText}>Initializing Vittora Engine...</div>
        </div>
    );
};

export default LoadingMobiusStrip;