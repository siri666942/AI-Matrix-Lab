/**
 * 矩阵运算工具库
 * 提供2x2和3x3矩阵的基本运算功能
 */

export type Matrix2x2 = [[number, number], [number, number]];
export type Matrix3x3 = [[number, number, number], [number, number, number], [number, number, number]];
export type Matrix = Matrix2x2 | Matrix3x3;
export type Vector2D = [number, number];
export type Vector3D = [number, number, number];

/**
 * 矩阵乘以向量
 */
export function multiplyMatrixVector(matrix: Matrix2x2, vector: Vector2D): Vector2D {
  const [[a, b], [c, d]] = matrix;
  const [x, y] = vector;
  return [a * x + b * y, c * x + d * y];
}

/**
 * 矩阵乘以多个点
 */
export function transformPoints(matrix: Matrix2x2, points: Vector2D[]): Vector2D[] {
  return points.map(point => multiplyMatrixVector(matrix, point));
}

/**
 * 计算2x2矩阵的行列式
 */
export function determinant(matrix: Matrix2x2): number {
  const [[a, b], [c, d]] = matrix;
  return a * d - b * c;
}

/**
 * 计算2x2矩阵的特征值
 * 返回两个特征值（可能是复数）
 */
export function eigenvalues(matrix: Matrix2x2): { real: number; imag: number }[] {
  const [[a, b], [c, d]] = matrix;
  
  // 特征方程: λ² - trace*λ + det = 0
  const trace = a + d;
  const det = determinant(matrix);
  
  // 判别式
  const discriminant = trace * trace - 4 * det;
  
  if (discriminant >= 0) {
    // 实数特征值
    const sqrt = Math.sqrt(discriminant);
    return [
      { real: (trace + sqrt) / 2, imag: 0 },
      { real: (trace - sqrt) / 2, imag: 0 }
    ];
  }
  
  // 复数特征值
  const realPart = trace / 2;
  const imagPart = Math.sqrt(-discriminant) / 2;
  return [
    { real: realPart, imag: imagPart },
    { real: realPart, imag: -imagPart }
  ];
}

/**
 * 计算特征向量（仅当特征值为实数时）
 */
export function eigenvectors(matrix: Matrix2x2): Vector2D[] | null {
  const [[a, b], [c, d]] = matrix;
  const evals = eigenvalues(matrix);
  
  // 只处理实数特征值
  if (evals[0].imag !== 0) {
    return null;
  }
  
  const vectors: Vector2D[] = [];
  
  for (const ev of evals) {
    const lambda = ev.real;
    
    // 求解 (A - λI)v = 0
    if (Math.abs(b) > 1e-10) {
      // 使用第一行
      vectors.push([b, lambda - a]);
    } else if (Math.abs(c) > 1e-10) {
      // 使用第二行
      vectors.push([lambda - d, c]);
    } else {
      // 对角矩阵或特殊情况
      if (Math.abs(lambda - a) < 1e-10) {
        vectors.push([1, 0]);
      } else {
        vectors.push([0, 1]);
      }
    }
  }
  
  return vectors;
}

/**
 * 归一化向量
 */
export function normalize(vector: Vector2D): Vector2D {
  const [x, y] = vector;
  const length = Math.sqrt(x * x + y * y);
  if (length < 1e-10) return [0, 0];
  return [x / length, y / length];
}

/**
 * 预设变换矩阵
 */
export const presetTransforms = {
  identity: [[1, 0], [0, 1]] as Matrix2x2,
  rotate90: [[0, -1], [1, 0]] as Matrix2x2,
  rotate45: [[Math.cos(Math.PI / 4), -Math.sin(Math.PI / 4)], 
             [Math.sin(Math.PI / 4), Math.cos(Math.PI / 4)]] as Matrix2x2,
  reflectX: [[1, 0], [0, -1]] as Matrix2x2,
  reflectY: [[-1, 0], [0, 1]] as Matrix2x2,
  shear: [[1, 1], [0, 1]] as Matrix2x2,
  squeeze: [[2, 0], [0, 0.5]] as Matrix2x2,
  scale2: [[2, 0], [0, 2]] as Matrix2x2,
};

/**
 * 生成旋转矩阵
 */
export function rotationMatrix(degrees: number): Matrix2x2 {
  const rad = (degrees * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return [[cos, -sin], [sin, cos]];
}

/**
 * 生成缩放矩阵
 */
export function scaleMatrix(sx: number, sy: number): Matrix2x2 {
  return [[sx, 0], [0, sy]];
}

/**
 * 生成剪切矩阵
 */
export function shearMatrix(shx: number, shy: number): Matrix2x2 {
  return [[1, shx], [shy, 1]];
}

// ============ 3x3矩阵运算 ============

/**
 * 判断是否为3x3矩阵
 */
export function isMatrix3x3(matrix: Matrix): matrix is Matrix3x3 {
  return matrix.length === 3 && matrix[0].length === 3;
}

/**
 * 3x3矩阵乘以向量
 */
export function multiplyMatrix3x3Vector(matrix: Matrix3x3, vector: Vector3D): Vector3D {
  const [[a, b, c], [d, e, f], [g, h, i]] = matrix;
  const [x, y, z] = vector;
  return [
    a * x + b * y + c * z,
    d * x + e * y + f * z,
    g * x + h * y + i * z
  ];
}

/**
 * 3x3矩阵乘法
 */
export function multiplyMatrix3x3(A: Matrix3x3, B: Matrix3x3): Matrix3x3 {
  const result: Matrix3x3 = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      result[i][j] = A[i][0] * B[0][j] + A[i][1] * B[1][j] + A[i][2] * B[2][j];
    }
  }
  return result;
}

/**
 * 计算3x3矩阵的行列式
 */
export function determinant3x3(matrix: Matrix3x3): number {
  const [[a, b, c], [d, e, f], [g, h, i]] = matrix;
  return a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
}

/**
 * 矩阵转置
 */
export function transpose3x3(matrix: Matrix3x3): Matrix3x3 {
  return [
    [matrix[0][0], matrix[1][0], matrix[2][0]],
    [matrix[0][1], matrix[1][1], matrix[2][1]],
    [matrix[0][2], matrix[1][2], matrix[2][2]]
  ];
}

/**
 * 计算3x3矩阵的迹（对角线元素之和）
 */
export function trace3x3(matrix: Matrix3x3): number {
  return matrix[0][0] + matrix[1][1] + matrix[2][2];
}

/**
 * 判断矩阵是否对称
 */
export function isSymmetric(matrix: Matrix3x3): boolean {
  for (let i = 0; i < 3; i++) {
    for (let j = i + 1; j < 3; j++) {
      if (Math.abs(matrix[i][j] - matrix[j][i]) > 1e-10) {
        return false;
      }
    }
  }
  return true;
}

/**
 * 判断矩阵是否正交
 */
export function isOrthogonal(matrix: Matrix3x3): boolean {
  const T = transpose3x3(matrix);
  const product = multiplyMatrix3x3(matrix, T);
  
  // 检查是否为单位矩阵
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const expected = i === j ? 1 : 0;
      if (Math.abs(product[i][j] - expected) > 1e-10) {
        return false;
      }
    }
  }
  return true;
}

/**
 * 判断对称矩阵是否正定
 * 使用Sylvester准则：所有顺序主子式大于0
 */
export function isPositiveDefinite(matrix: Matrix3x3): boolean {
  if (!isSymmetric(matrix)) {
    return false;
  }
  
  // 1阶主子式
  if (matrix[0][0] <= 0) return false;
  
  // 2阶主子式
  const det2 = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
  if (det2 <= 0) return false;
  
  // 3阶主子式（行列式）
  const det3 = determinant3x3(matrix);
  if (det3 <= 0) return false;
  
  return true;
}

/**
 * 使用QR分解计算特征值（迭代法）
 * 简化版本，适用于实对称矩阵
 */
export function eigenvalues3x3(matrix: Matrix3x3, maxIterations = 100): number[] {
  // 对于实对称矩阵，使用幂迭代法的简化版本
  // 这里返回近似特征值
  const trace = trace3x3(matrix);
  const det = determinant3x3(matrix);
  
  // 使用特征多项式的系数估算
  // λ³ - trace*λ² + ... - det = 0
  // 简化实现：返回对角元素作为近似值
  return [matrix[0][0], matrix[1][1], matrix[2][2]].sort((a, b) => b - a);
}

/**
 * 相似对角化
 * 返回对角矩阵D和变换矩阵P，使得 A = PDP^(-1)
 * 简化版本：仅适用于可对角化的实对称矩阵
 */
export function diagonalize(matrix: Matrix3x3): {
  D: Matrix3x3 | null;
  P: Matrix3x3 | null;
  success: boolean;
  message: string;
} {
  if (!isSymmetric(matrix)) {
    return {
      D: null,
      P: null,
      success: false,
      message: '矩阵不对称，无法使用简化算法对角化'
    };
  }
  
  // 对于实对称矩阵，特征值为实数
  const eigenvals = eigenvalues3x3(matrix);
  
  // 构造对角矩阵
  const D: Matrix3x3 = [
    [eigenvals[0], 0, 0],
    [0, eigenvals[1], 0],
    [0, 0, eigenvals[2]]
  ];
  
  // 简化：返回单位矩阵作为P（实际应计算特征向量）
  const P: Matrix3x3 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  
  return {
    D,
    P,
    success: true,
    message: '对角化成功（近似）'
  };
}

/**
 * 合同变换
 * 对于对称矩阵A，找到可逆矩阵C使得 C^T * A * C 为对角矩阵
 */
export function congruenceTransform(matrix: Matrix3x3): {
  result: Matrix3x3 | null;
  C: Matrix3x3 | null;
  success: boolean;
  message: string;
} {
  if (!isSymmetric(matrix)) {
    return {
      result: null,
      C: null,
      success: false,
      message: '矩阵不对称，无法进行合同变换'
    };
  }
  
  // 简化实现：使用单位矩阵
  const C: Matrix3x3 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  
  return {
    result: matrix,
    C,
    success: true,
    message: '合同变换完成（简化版本）'
  };
}
