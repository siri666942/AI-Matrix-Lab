import { useEffect, useRef } from 'react';
import type { Matrix2x2, Vector2D } from '@/lib/matrix';
import { transformPoints, eigenvectors, normalize } from '@/lib/matrix';

interface MatrixVisualizerProps {
  matrix: Matrix2x2;
  shape?: 'square' | 'F' | 'grid';
}

export function MatrixVisualizer({ matrix, shape = 'square' }: MatrixVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布大小
    const size = 600;
    canvas.width = size;
    canvas.height = size;

    // 清空画布
    ctx.clearRect(0, 0, size, size);

    // 坐标系参数
    const scale = size / 10; // 10个单位映射到画布大小
    const centerX = size / 2;
    const centerY = size / 2;

    // 转换坐标：数学坐标 -> 画布坐标
    const toCanvas = (x: number, y: number): [number, number] => {
      return [centerX + x * scale, centerY - y * scale];
    };

    // 绘制网格
    ctx.strokeStyle = 'hsl(210 20% 88%)';
    ctx.lineWidth = 1;
    for (let i = -5; i <= 5; i++) {
      // 垂直线
      ctx.beginPath();
      const [x1, y1] = toCanvas(i, -5);
      const [x2, y2] = toCanvas(i, 5);
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // 水平线
      ctx.beginPath();
      const [x3, y3] = toCanvas(-5, i);
      const [x4, y4] = toCanvas(5, i);
      ctx.moveTo(x3, y3);
      ctx.lineTo(x4, y4);
      ctx.stroke();
    }

    // 绘制坐标轴
    ctx.strokeStyle = 'hsl(210 15% 20%)';
    ctx.lineWidth = 2;
    
    // X轴
    ctx.beginPath();
    const [xStart, yStart] = toCanvas(-5, 0);
    const [xEnd, yEnd] = toCanvas(5, 0);
    ctx.moveTo(xStart, yStart);
    ctx.lineTo(xEnd, yEnd);
    ctx.stroke();

    // Y轴
    ctx.beginPath();
    const [yxStart, yyStart] = toCanvas(0, -5);
    const [yxEnd, yyEnd] = toCanvas(0, 5);
    ctx.moveTo(yxStart, yyStart);
    ctx.lineTo(yxEnd, yyEnd);
    ctx.stroke();

    // 获取原始图形的点
    const originalPoints = getShapePoints(shape);
    const transformedPoints = transformPoints(matrix, originalPoints);

    // 绘制原始图形（蓝色虚线）
    drawShape(ctx, originalPoints, toCanvas, 'hsl(200 63% 47%)', true);

    // 绘制变换后的图形（红色实线）
    drawShape(ctx, transformedPoints, toCanvas, 'hsl(6 78% 57%)', false);

    // 绘制特征向量（绿色箭头）
    const evecs = eigenvectors(matrix);
    if (evecs) {
      for (const vec of evecs) {
        const normalized = normalize(vec);
        const scaled: Vector2D = [normalized[0] * 2, normalized[1] * 2];
        drawArrow(ctx, [0, 0], scaled, toCanvas, 'hsl(145 63% 43%)');
      }
    }

  }, [matrix, shape]);

  return (
    <div className="flex items-center justify-center w-full h-full bg-card rounded-lg border border-border p-4">
      <canvas
        ref={canvasRef}
        className="max-w-full max-h-full"
        style={{ imageRendering: 'crisp-edges' }}
      />
    </div>
  );
}

// 获取不同图形的点集
function getShapePoints(shape: string): Vector2D[] {
  switch (shape) {
    case 'square':
      return [
        [0, 0], [1, 0], [1, 1], [0, 1], [0, 0]
      ];
    case 'F':
      return [
        [0, 0], [0, 2], [1.5, 2], [1.5, 1.5], [0.5, 1.5],
        [0.5, 1.2], [1.2, 1.2], [1.2, 0.9], [0.5, 0.9],
        [0.5, 0], [0, 0]
      ];
    case 'grid':
      // 简单的网格点
      const points: Vector2D[] = [];
      for (let x = 0; x <= 2; x += 0.5) {
        for (let y = 0; y <= 2; y += 0.5) {
          points.push([x, y]);
        }
      }
      return points;
    default:
      return [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]];
  }
}

// 绘制图形
function drawShape(
  ctx: CanvasRenderingContext2D,
  points: Vector2D[],
  toCanvas: (x: number, y: number) => [number, number],
  color: string,
  dashed: boolean
) {
  if (points.length === 0) return;

  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  
  if (dashed) {
    ctx.setLineDash([5, 5]);
    ctx.globalAlpha = 0.5;
  } else {
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }

  ctx.beginPath();
  const [startX, startY] = toCanvas(points[0][0], points[0][1]);
  ctx.moveTo(startX, startY);

  for (let i = 1; i < points.length; i++) {
    const [x, y] = toCanvas(points[i][0], points[i][1]);
    ctx.lineTo(x, y);
  }

  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.setLineDash([]);
}

// 绘制箭头
function drawArrow(
  ctx: CanvasRenderingContext2D,
  from: Vector2D,
  to: Vector2D,
  toCanvas: (x: number, y: number) => [number, number],
  color: string
) {
  const [x1, y1] = toCanvas(from[0], from[1]);
  const [x2, y2] = toCanvas(to[0], to[1]);

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;

  // 绘制线段
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  // 绘制箭头头部
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const headLength = 15;

  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(
    x2 - headLength * Math.cos(angle - Math.PI / 6),
    y2 - headLength * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    x2 - headLength * Math.cos(angle + Math.PI / 6),
    y2 - headLength * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fill();
}
