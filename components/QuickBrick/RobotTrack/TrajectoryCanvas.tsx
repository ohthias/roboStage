import React, { useRef, useEffect, useState } from 'react';
import type { RobotState, Point, MousePosition } from '@/types/RobotTrackType';
import { MAP_IMAGE_URL, MAP_IMAGE_BASE_WIDTH, MAP_IMAGE_BASE_HEIGHT, ROBOT_WIDTH_PX, ROBOT_HEIGHT_PX } from '@/app/(public)/quickbrick/robot-track/constants';
import { cmToPixel, pixelToCm } from '@/utils/conversion';

interface TrajectoryCanvasProps {
    robotState: RobotState;
    path: Point[];
    zoom: number;
    onMouseMove: (pos: MousePosition) => void;
    isCreating: boolean;
    creatorPath: Point[];
    onAddPoint: (pos: { x_cm: number, y_cm: number }) => void;
}

export const TrajectoryCanvas: React.FC<TrajectoryCanvasProps> = ({ 
    robotState, 
    path, 
    zoom, 
    onMouseMove,
    isCreating,
    creatorPath,
    onAddPoint
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [mapImage, setMapImage] = useState<HTMLImageElement | null>(null);
    const visualAngleRef = useRef<number>(robotState.angle);

    useEffect(() => {
        const img = new Image();
        img.src = MAP_IMAGE_URL;
        img.onload = () => setMapImage(img);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas || !mapImage) return;

        const width = MAP_IMAGE_BASE_WIDTH * zoom;
        const height = MAP_IMAGE_BASE_HEIGHT * zoom;
        canvas.width = width;
        canvas.height = height;

        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(mapImage, 0, 0, width, height);

        // 1. Draw full trajectory guide (unless creating)
        if (!isCreating && path.length > 1) {
            ctx.beginPath();
            const startPoint = cmToPixel(path[0].x_cm, path[0].y_cm, width, height);
            ctx.moveTo(startPoint.x_px, startPoint.y_px);
            for (const point of path.slice(1)) {
                const pixelPoint = cmToPixel(point.x_cm, point.y_cm, width, height);
                ctx.lineTo(pixelPoint.x_px, pixelPoint.y_px);
            }
            ctx.strokeStyle = "rgba(107, 114, 128, 0.5)"; // gray-500
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        
        // 2. Draw animated robot track
        if (!isCreating) {
            const { segmentIndex, progress } = robotState;
            if (segmentIndex > 0 || progress > 0) {
                ctx.beginPath();
                const startPixel = cmToPixel(path[0].x_cm, path[0].y_cm, width, height);
                ctx.moveTo(startPixel.x_px, startPixel.y_px);

                for (let i = 1; i <= segmentIndex; i++) {
                    const p = cmToPixel(path[i].x_cm, path[i].y_cm, width, height);
                    ctx.lineTo(p.x_px, p.y_px);
                }

                if (segmentIndex < path.length - 1) {
                    const robotPixel = cmToPixel(robotState.x_cm, robotState.y_cm, width, height);
                    ctx.lineTo(robotPixel.x_px, robotPixel.y_px);
                }
                
                ctx.strokeStyle = "rgba(250, 204, 21, 0.9)"; // amber-400
                ctx.lineWidth = 5;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.stroke();
            }
        }

        // 3. Draw creator path OR final waypoints
        const pathToDraw = isCreating ? creatorPath : path;
        pathToDraw.forEach((point, i) => {
            const { x_px, y_px } = cmToPixel(point.x_cm, point.y_cm, width, height);
            ctx.lineWidth = 3;
            ctx.fillStyle = '#111827'; // gray-900

            if (i === 0) { // START POINT
                ctx.strokeStyle = isCreating ? '#f9a8d4' : '#10b981'; // pink-300 or green-500
                ctx.beginPath();
                ctx.arc(x_px, y_px, 8, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
            } else if (isCreating) { // Intermediate points in creator mode
                ctx.strokeStyle = '#f472b6'; // pink-400
                ctx.beginPath();
                ctx.arc(x_px, y_px, 6, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
            } else if (i === pathToDraw.length - 1) { // END POINT
                ctx.strokeStyle = '#ef4444'; // red-500
                const size = 16;
                ctx.beginPath();
                ctx.rect(x_px - size / 2, y_px - size / 2, size, size);
                ctx.fill();
                ctx.stroke();
            } else { // Intermediate waypoints in simulation mode
                 ctx.strokeStyle = '#60a5fa'; // blue-400
                 ctx.beginPath();
                 ctx.arc(x_px, y_px, 7, 0, 2 * Math.PI);
                 ctx.fill();
                 ctx.stroke();
            }
        });
        if (isCreating && creatorPath.length > 1) {
            ctx.beginPath();
            const start = cmToPixel(creatorPath[0].x_cm, creatorPath[0].y_cm, width, height);
            ctx.moveTo(start.x_px, start.y_px);
            creatorPath.slice(1).forEach(p => {
                const px = cmToPixel(p.x_cm, p.y_cm, width, height);
                ctx.lineTo(px.x_px, px.y_px);
            });
            ctx.strokeStyle = "rgba(236, 72, 153, 0.8)";
            ctx.lineWidth = 2;
            ctx.stroke();
        }


        // 4. Draw Robot (only if not creating)
        if (!isCreating) {
            let smoothedAngle;
            if (!robotState.isRunning) {
                smoothedAngle = robotState.angle;
            } else {
                const currentAngle = visualAngleRef.current;
                const targetAngle = robotState.angle;
                let angleDiff = targetAngle - currentAngle;
                if (angleDiff > 180) angleDiff -= 360;
                if (angleDiff < -180) angleDiff += 360;
                const smoothingFactor = 0.25;
                smoothedAngle = currentAngle + angleDiff * smoothingFactor;
            }
            visualAngleRef.current = smoothedAngle;

            const robotPos = cmToPixel(robotState.x_cm, robotState.y_cm, width, height);
            const rad = (smoothedAngle * Math.PI) / 180;
            ctx.save();
            ctx.translate(robotPos.x_px, robotPos.y_px);
            ctx.rotate(rad);
            
            ctx.fillStyle = '#0f1724';
            ctx.strokeStyle = '#06b6d4';
            ctx.lineWidth = 2;
            
            ctx.beginPath();
            ctx.rect(-ROBOT_WIDTH_PX / 2, -ROBOT_HEIGHT_PX / 2, ROBOT_WIDTH_PX, ROBOT_HEIGHT_PX);
            ctx.fill();
            ctx.stroke();
            
            ctx.fillStyle = '#a5f3fc';
            ctx.beginPath();
            ctx.moveTo(0, -ROBOT_HEIGHT_PX/2 + 2);
            ctx.lineTo(-ROBOT_WIDTH_PX/2 + 2, -ROBOT_HEIGHT_PX/2 + 6);
            ctx.lineTo(ROBOT_WIDTH_PX/2 - 2, -ROBOT_HEIGHT_PX/2 + 6);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        }

    }, [robotState, path, zoom, mapImage, isCreating, creatorPath]);

    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x_px = event.clientX - rect.left;
        const y_px = event.clientY - rect.top;
        const { x_cm, y_cm } = pixelToCm(x_px, y_px, canvas.width, canvas.height);
        onMouseMove({
            pixel: { x_px: Math.round(x_px), y_px: Math.round(y_px) },
            cm: { x_cm, y_cm }
        });
    };

    const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isCreating) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x_px = event.clientX - rect.left;
        const y_px = event.clientY - rect.top;
        const { x_cm, y_cm } = pixelToCm(x_px, y_px, canvas.width, canvas.height);
        onAddPoint({ x_cm, y_cm });
    };

    return <canvas 
        ref={canvasRef} 
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        className={isCreating ? 'cursor-crosshair' : ''}
    />;
};