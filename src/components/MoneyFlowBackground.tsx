import React, { useRef, useEffect, useCallback } from 'react';

interface Node {
  id: string;
  x: number;
  y: number;
  vx: number; // Velocity x
  vy: number; // Velocity y
  radius: number;
  color: string;
  isEmitter?: boolean;
  connections: string[];
}

interface Particle {
  id: string;
  x: number;
  y: number;
  targetNodeId: string;
  speed: number;
  color: string;
  size: number;
  trail: { x: number; y: number }[];
  hops: number;
}

// --- Configuration Constants ---
const NUM_NODES = 37; // Slightly fewer nodes might look better with motion
const MIN_NODE_RADIUS = 10;
const MAX_NODE_RADIUS = 15;
const NODE_COLORS = ['#607D8B', '#795548', '#4cef00', '#455A64', '#0019ef', '#ff5722', '#9c27b0', '#00bcd4', '#ffc107', '#8bc34a', '#e91e63', '#673ab7'];

const NODE_SPEED_MIN = 0.1; // Min speed for node drifting
const NODE_SPEED_MAX = 0.4; // Max speed for node drifting

const PARTICLE_COLOR = 'rgba(135, 206, 250, 0.7)';
const PARTICLE_SPEED_MIN = 0.9;
const PARTICLE_SPEED_MAX = 1.9;
const PARTICLE_SIZE = 3.5;
const MAX_PARTICLES = 120;
const SPAWN_INTERVAL_PER_EMITTER = 350;
const TRAIL_LENGTH = 6;
const MAX_HOPS = 7;

const MIN_CONNECTIONS_PER_NODE = 2;
const MAX_CONNECTIONS_PER_NODE = 3; // Fewer connections can look cleaner with moving nodes
const CHANCE_TO_BE_EMITTER = 0.35;

const BACKGROUND_CANVAS_COLOR = 'rgba(30, 30, 40, 1)';

// --- Helper Functions ---
const getRandom = (min: number, max: number) => Math.random() * (max - min) + min;
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomColor = (colors: string[]) => colors[Math.floor(Math.random() * colors.length)];

// --- Component ---
const ScatteredFlowBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const nodesRef = useRef<Node[]>([]);
  const lastSpawnTimesRef = useRef<Record<string, number>>({});
  const animationFrameIdRef = useRef<number | null>(null); // Store animation frame ID

  const initializeNodes = useCallback((width: number, height: number) => {
    const newNodes: Node[] = [];
    for (let i = 0; i < NUM_NODES; i++) {
      const speed = getRandom(NODE_SPEED_MIN, NODE_SPEED_MAX);
      const angle = Math.random() * Math.PI * 2;
      newNodes.push({
        id: `node-${i}`,
        x: getRandom(width * 0.15, width * 0.85), // Start away from edges
        y: getRandom(height * 0.15, height * 0.85),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: getRandom(MIN_NODE_RADIUS, MAX_NODE_RADIUS),
        color: getRandomColor(NODE_COLORS),
        isEmitter: Math.random() < CHANCE_TO_BE_EMITTER,
        connections: [],
      });
    }

    newNodes.forEach(node => {
      const numConnections = getRandomInt(MIN_CONNECTIONS_PER_NODE, MAX_CONNECTIONS_PER_NODE);
      const availableNodes = newNodes.filter(n => n.id !== node.id && node.connections.length < numConnections);
      
      // Shuffle available nodes to get more random connections
      for (let i = availableNodes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableNodes[i], availableNodes[j]] = [availableNodes[j], availableNodes[i]];
      }

      for (let i = 0; i < Math.min(numConnections, availableNodes.length); i++) {
        const targetNode = availableNodes[i];
        if (!node.connections.includes(targetNode.id) && !targetNode.connections.includes(node.id)) { // Avoid self and duplicate
          node.connections.push(targetNode.id);
          // Optionally, make connections two-way for a more connected graph feel
          // targetNode.connections.push(node.id);
        }
      }
       // Fallback for isolated nodes
      if (node.connections.length === 0 && newNodes.length > 1) {
        let attempts = 0;
        while(attempts < 5 && node.connections.length === 0) {
            let randomTarget = newNodes[Math.floor(Math.random() * newNodes.length)];
            if(randomTarget.id !== node.id) {
                node.connections.push(randomTarget.id);
            }
            attempts++;
        }
      }
    });
    nodesRef.current = newNodes;
    particlesRef.current = [];
    lastSpawnTimesRef.current = {};
  }, []);

  const updateNodes = useCallback((canvasWidth: number, canvasHeight: number) => {
    nodesRef.current.forEach(node => {
      node.x += node.vx;
      node.y += node.vy;

      // Boundary collision (bounce)
      if (node.x - node.radius < 0) {
        node.x = node.radius; // Prevent sticking
        node.vx *= -1;
      } else if (node.x + node.radius > canvasWidth) {
        node.x = canvasWidth - node.radius; // Prevent sticking
        node.vx *= -1;
      }

      if (node.y - node.radius < 0) {
        node.y = node.radius; // Prevent sticking
        node.vy *= -1;
      } else if (node.y + node.radius > canvasHeight) {
        node.y = canvasHeight - node.radius; // Prevent sticking
        node.vy *= -1;
      }
    });
  }, []);


  const spawnParticle = useCallback((emitterNode: Node) => {
    if (particlesRef.current.length >= MAX_PARTICLES || emitterNode.connections.length === 0) return;
    const targetNodeId = emitterNode.connections[Math.floor(Math.random() * emitterNode.connections.length)];
    particlesRef.current.push({
      id: `p-${Date.now()}-${Math.random()}`,
      x: emitterNode.x,
      y: emitterNode.y,
      targetNodeId: targetNodeId,
      speed: getRandom(PARTICLE_SPEED_MIN, PARTICLE_SPEED_MAX),
      color: PARTICLE_COLOR,
      size: PARTICLE_SIZE,
      trail: [],
      hops: 0,
    });
  }, []);


  const updateParticles = useCallback((canvasWidth: number, canvasHeight: number) => {
    const now = Date.now();
    nodesRef.current.forEach(node => {
      if (node.isEmitter) {
        if (!lastSpawnTimesRef.current[node.id] || now - lastSpawnTimesRef.current[node.id] > SPAWN_INTERVAL_PER_EMITTER) {
          spawnParticle(node);
          lastSpawnTimesRef.current[node.id] = now;
        }
      }
    });

    particlesRef.current = particlesRef.current.filter(particle => {
      const targetNode = nodesRef.current.find(n => n.id === particle.targetNodeId);
      if (!targetNode) return false;

      particle.trail.push({ x: particle.x, y: particle.y });
      if (particle.trail.length > TRAIL_LENGTH) particle.trail.shift();

      const dx = targetNode.x - particle.x;
      const dy = targetNode.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < targetNode.radius * 0.4 || distance < particle.speed) { // Increased arrival threshold slightly
        particle.hops++;
        if (particle.hops >= MAX_HOPS || targetNode.connections.length === 0) return false;
        
        const newTargetId = targetNode.connections[Math.floor(Math.random() * targetNode.connections.length)];
        particle.targetNodeId = newTargetId;
        particle.x = targetNode.x;
        particle.y = targetNode.y;
      } else {
        particle.x += (dx / distance) * particle.speed;
        particle.y += (dy / distance) * particle.speed;
      }

      const margin = 50;
      if (particle.x < -margin || particle.x > canvasWidth + margin ||
          particle.y < -margin || particle.y > canvasHeight + margin) {
        return false;
      }
      return true;
    });
  }, [spawnParticle]);

  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = BACKGROUND_CANVAS_COLOR;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(200, 200, 200, 0.03)'; // Even fainter connections
    ctx.lineWidth = 0.7;
    nodesRef.current.forEach(node => {
      node.connections.forEach(targetId => {
        const targetNode = nodesRef.current.find(n => n.id === targetId);
        if (targetNode) {
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(targetNode.x, targetNode.y);
          ctx.stroke();
        }
      });
    });
    
    nodesRef.current.forEach(node => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      // Slightly different color for emitters, more distinct
      ctx.fillStyle = node.isEmitter ? 'rgba(255, 193, 7, 0.9)' : node.color; 
      ctx.globalAlpha = node.isEmitter ? 1 : 0.8; // Emitters more solid
      ctx.fill();
      ctx.globalAlpha = 1; // Reset global alpha
    });

    particlesRef.current.forEach(particle => {
      particle.trail.forEach((trailDot, index) => {
        const opacity = (index / TRAIL_LENGTH) * 0.35;
        ctx.beginPath();
        ctx.arc(trailDot.x, trailDot.y, particle.size * (index / TRAIL_LENGTH) * 0.6, 0, Math.PI * 2);
        const trailColorMatch = particle.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (trailColorMatch) {
            ctx.fillStyle = `rgba(${trailColorMatch[1]}, ${trailColorMatch[2]}, ${trailColorMatch[3]}, ${opacity})`;
        } else {
            ctx.fillStyle = `rgba(135, 206, 250, ${opacity})`;
        }
        ctx.fill();
      });
      
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.fill();
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const logicalWidth = canvas.clientWidth;
      const logicalHeight = canvas.clientHeight;
      canvas.width = logicalWidth * dpr;
      canvas.height = logicalHeight * dpr;
      ctx.scale(dpr, dpr);
      // Re-initialize nodes on resize to fit new dimensions well
      initializeNodes(logicalWidth, logicalHeight);
    };

    const render = () => {
      if (!canvasRef.current || !ctx) return;
      const logicalWidth = canvasRef.current.clientWidth;
      const logicalHeight = canvasRef.current.clientHeight;
      
      updateNodes(logicalWidth, logicalHeight); // Update node positions
      updateParticles(logicalWidth, logicalHeight); // Update particle positions
      draw(ctx, logicalWidth, logicalHeight); 
      
      animationFrameIdRef.current = window.requestAnimationFrame(render);
    };

    resizeCanvas(); // Call once to set up initial size and nodes
    // Start animation only after initial setup
    if (animationFrameIdRef.current === null) { // Prevent multiple loops if effect re-runs
        animationFrameIdRef.current = window.requestAnimationFrame(render);
    }
    window.addEventListener('resize', resizeCanvas);

    return () => {
      if(animationFrameIdRef.current) {
        window.cancelAnimationFrame(animationFrameIdRef.current);
      }
      animationFrameIdRef.current = null; // Reset ref
      window.removeEventListener('resize', resizeCanvas);
    };
    // Add updateNodes to dependencies if it's not stable (it is due to useCallback with empty array)
  }, [initializeNodes, updateNodes, updateParticles, draw]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
      }}
    />
  );
};

export default ScatteredFlowBackground;