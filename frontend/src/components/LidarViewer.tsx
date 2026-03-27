import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Crosshair, AlertCircle } from "lucide-react";
import { useLidarPoints } from "@/hooks/useLidarPoints";
import { Badge } from "@/components/ui/badge";

function zColor(t: number): [number, number, number] {
  if (t < 0.5) {
    const s = t * 2;
    return [0, s, 1 - s];
  }
  const s = (t - 0.5) * 2;
  return [s, 1 - s, 0];
}

interface PointCloudProps {
  points: number[][];
}

function PointCloud({ points }: PointCloudProps) {
  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(points.length * 3);
    const col = new Float32Array(points.length * 3);

    for (let i = 0; i < points.length; i++) {
      const [x, y, z, , zNorm] = points[i];
      pos[i * 3] = x;
      pos[i * 3 + 1] = z;
      pos[i * 3 + 2] = -y;

      const [r, g, b] = zColor(zNorm);
      col[i * 3] = r;
      col[i * 3 + 1] = g;
      col[i * 3 + 2] = b;
    }

    return { positions: pos, colors: col };
  }, [points]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        vertexColors
        sizeAttenuation
        transparent
        opacity={0.8}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

interface LidarViewerProps {
  sampleToken: string | null;
}

export function LidarViewer({ sampleToken }: LidarViewerProps) {
  const { data, isLoading, error } = useLidarPoints(sampleToken);

  if (!sampleToken) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
        <Crosshair className="h-8 w-8 opacity-30" />
        <span className="text-sm">Select a frame to view LiDAR</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
        Loading LiDAR data…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-fail">
        <AlertCircle className="h-6 w-6" />
        <span className="text-sm">Failed to load LiDAR data</span>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="relative h-full w-full">
      <Canvas
        camera={{ position: [0, 40, 60], fov: 50, near: 0.1, far: 1000 }}
        className="bg-black rounded-lg"
      >
        <ambientLight intensity={0.5} />
        <PointCloud points={data.points} />
        <OrbitControls
          enableDamping
          dampingFactor={0.15}
          maxDistance={200}
          minDistance={5}
        />
        <gridHelper args={[100, 50, "#333333", "#222222"]} />
      </Canvas>

      <Badge
        variant="secondary"
        className="absolute bottom-2 left-2 bg-black/70 text-gray-300 border-0 text-xs"
      >
        {data.points_returned.toLocaleString()} / {data.total_points_raw.toLocaleString()} points
      </Badge>
    </div>
  );
}
