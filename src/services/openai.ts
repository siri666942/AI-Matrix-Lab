import type { Matrix2x2 } from '@/lib/matrix';
import { rotationMatrix, scaleMatrix, shearMatrix } from '@/lib/matrix';

/**
 * OpenAI API配置
 */
interface OpenAIConfig {
  apiKey: string;
  baseURL?: string;
  model?: string;
}

/**
 * Mock模式：本地规则解析自然语言（支持中英文）
 */
export function mockParseNaturalLanguage(text: string): Matrix2x2 | null {
  const lower = text.toLowerCase().trim();

  // 旋转 - 支持中英文
  if (lower.includes('rotate') || lower.includes('旋转') || lower.includes('转')) {
    const match = lower.match(/(\d+)/);
    if (match) {
      const degrees = Number.parseInt(match[1]);
      return rotationMatrix(degrees);
    }
    if (lower.includes('90')) return [[0, -1], [1, 0]];
    if (lower.includes('45')) return rotationMatrix(45);
    if (lower.includes('180')) return [[-1, 0], [0, -1]];
  }

  // 反射 - 支持中英文
  if (lower.includes('reflect') || lower.includes('反射') || lower.includes('镜像')) {
    if (lower.includes('x') || lower.includes('X') || lower.includes('x轴') || lower.includes('横轴')) {
      return [[1, 0], [0, -1]];
    }
    if (lower.includes('y') || lower.includes('Y') || lower.includes('y轴') || lower.includes('纵轴')) {
      return [[-1, 0], [0, 1]];
    }
  }

  // 缩放 - 支持中英文
  if (lower.includes('scale') || lower.includes('缩放') || lower.includes('放大') || lower.includes('缩小')) {
    const match = lower.match(/(\d+\.?\d*)/);
    if (match) {
      const factor = Number.parseFloat(match[1]);
      return scaleMatrix(factor, factor);
    }
  }

  // 剪切 - 支持中英文
  if (lower.includes('shear') || lower.includes('剪切') || lower.includes('错切')) {
    const match = lower.match(/(\d+\.?\d*)/);
    if (match) {
      const factor = Number.parseFloat(match[1]);
      return shearMatrix(factor, 0);
    }
  }

  // 挤压 - 支持中英文
  if (lower.includes('squeeze') || lower.includes('挤压')) {
    return [[2, 0], [0, 0.5]];
  }

  return null;
}

/**
 * 调用OpenAI API将自然语言转换为矩阵
 */
export async function parseNaturalLanguageWithAI(
  text: string,
  config: OpenAIConfig
): Promise<Matrix2x2> {
  const { apiKey, baseURL = 'https://api.openai.com/v1', model = 'gpt-3.5-turbo' } = config;

  const response = await fetch(`${baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a math engine. Convert user text into a 2x2 Python list representing the matrix. ONLY return the JSON list, no text. Example: [[0, -1], [1, 0]]'
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error('API返回内容为空');
  }

  // 解析JSON
  try {
    const matrix = JSON.parse(content);
    
    // 验证矩阵格式
    if (!Array.isArray(matrix) || matrix.length !== 2) {
      throw new Error('矩阵格式错误：必须是2x2矩阵');
    }
    
    for (const row of matrix) {
      if (!Array.isArray(row) || row.length !== 2) {
        throw new Error('矩阵格式错误：必须是2x2矩阵');
      }
      for (const val of row) {
        if (typeof val !== 'number') {
          throw new Error('矩阵元素必须是数字');
        }
      }
    }

    return matrix as Matrix2x2;
  } catch (error) {
    throw new Error(`解析矩阵失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}
