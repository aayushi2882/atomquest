import { useEffect, useRef } from "react";
import * as THREE from "three";

function HeroScene() {
    const mountRef = useRef(null);

    useEffect(() => {
        const currentMount = mountRef.current;

        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(
            75,
            currentMount.clientWidth / currentMount.clientHeight,
            0.1,
            1000
        );

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
        });

        renderer.setSize(
            currentMount.clientWidth,
            currentMount.clientHeight
        );

        renderer.setPixelRatio(window.devicePixelRatio);

        currentMount.appendChild(renderer.domElement);

        // LIGHTS
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0x5dcaa5, 2);
        pointLight.position.set(5, 5, 5);

        scene.add(pointLight);

        // GEOMETRY
        const geometry = new THREE.IcosahedronGeometry(2.4, 1);

        const material = new THREE.MeshPhongMaterial({
            color: 0x7f77dd,
            wireframe: true,
            emissive: 0x4422aa,
            emissiveIntensity: 0.4,
            transparent: true,
            opacity: 0.8,
        });

        const mesh = new THREE.Mesh(geometry, material);

        scene.add(mesh);

        // PARTICLES
        const particlesGeometry = new THREE.BufferGeometry();

        const particlesCount = 300;

        const posArray = new Float32Array(particlesCount * 3);

        for (let i = 0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 16;
        }

        particlesGeometry.setAttribute(
            "position",
            new THREE.BufferAttribute(posArray, 3)
        );

        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.02,
            color: 0x5dcaa5,
        });

        const particlesMesh = new THREE.Points(
            particlesGeometry,
            particlesMaterial
        );

        scene.add(particlesMesh);

        camera.position.z = 5;

        // ANIMATION
        const animate = () => {
            requestAnimationFrame(animate);

            mesh.rotation.x += 0.0015;
            mesh.rotation.y += 0.0025;

            particlesMesh.rotation.y -= 0.001;

            renderer.render(scene, camera);
        };

        animate();

        // RESIZE
        const handleResize = () => {
            camera.aspect =
                currentMount.clientWidth /
                currentMount.clientHeight;

            camera.updateProjectionMatrix();

            renderer.setSize(
                currentMount.clientWidth,
                currentMount.clientHeight
            );
        };

        window.addEventListener("resize", handleResize);

        // CLEANUP
        return () => {
            window.removeEventListener("resize", handleResize);

            currentMount.removeChild(renderer.domElement);

            renderer.dispose();
        };
    }, []);

    return (
        <div
            ref={mountRef}
            className="absolute inset-0"
        />
    );
}

export default HeroScene;