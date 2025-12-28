import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MatrixVisualizer } from '@/components/MatrixVisualizer';
import type { Matrix2x2, Matrix3x3 } from '@/lib/matrix';
import { 
  determinant, 
  eigenvalues, 
  presetTransforms,
  determinant3x3,
  eigenvalues3x3,
  isSymmetric,
  isOrthogonal,
  isPositiveDefinite,
  diagonalize,
  congruenceTransform,
  trace3x3,
  multiplyMatrix3x3
} from '@/lib/matrix';
import { mockParseNaturalLanguage, parseNaturalLanguageWithAI } from '@/services/openai';
import { Loader2, Sparkles, Calculator } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type MatrixDimension = '2x2' | '3x3';

export default function MatrixLabEnhanced() {
  const { toast } = useToast();
  
  // 矩阵维度
  const [dimension, setDimension] = useState<MatrixDimension>('2x2');
  
  // 矩阵状态
  const [matrix2x2, setMatrix2x2] = useState<Matrix2x2>([[1, 0], [0, 1]]);
  const [matrix3x3, setMatrix3x3] = useState<Matrix3x3>([
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1]
  ]);
  
  // 自然语言输入
  const [naturalLanguage, setNaturalLanguage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Mock模式
  const [useMockAI, setUseMockAI] = useState(true);
  
  // API配置
  const [apiKey, setApiKey] = useState('');
  const [baseURL, setBaseURL] = useState('https://api.openai.com/v1');
  
  // 图形类型
  const [shapeType, setShapeType] = useState<'square' | 'F' | 'grid'>('square');

  // 获取当前矩阵
  const currentMatrix = dimension === '2x2' ? matrix2x2 : matrix3x3;

  // 更新2x2矩阵元素
  const updateMatrix2x2Element = (row: number, col: number, value: string) => {
    const num = Number.parseFloat(value) || 0;
    const newMatrix: Matrix2x2 = [
      [...matrix2x2[0]],
      [...matrix2x2[1]]
    ] as Matrix2x2;
    newMatrix[row][col] = num;
    setMatrix2x2(newMatrix);
  };

  // 更新3x3矩阵元素
  const updateMatrix3x3Element = (row: number, col: number, value: string) => {
    const num = Number.parseFloat(value) || 0;
    const newMatrix: Matrix3x3 = [
      [...matrix3x3[0]],
      [...matrix3x3[1]],
      [...matrix3x3[2]]
    ] as Matrix3x3;
    newMatrix[row][col] = num;
    setMatrix3x3(newMatrix);
  };

  // 处理自然语言输入
  const handleNaturalLanguageSubmit = async () => {
    if (!naturalLanguage.trim()) {
      toast({
        title: '输入为空',
        description: '请输入变换描述',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      if (useMockAI) {
        // Mock模式（仅支持2x2）
        const result = mockParseNaturalLanguage(naturalLanguage);
        if (result) {
          setMatrix2x2(result);
          setDimension('2x2');
          toast({
            title: '✓ 转换成功',
            description: '已使用本地规则解析',
          });
        } else {
          toast({
            title: '无法识别',
            description: '请尝试: 旋转45度、沿X轴反射、缩放2倍、剪切1.5',
            variant: 'destructive',
          });
        }
      } else {
        // 真实API模式
        if (!apiKey) {
          toast({
            title: 'API密钥未设置',
            description: '请先输入OpenAI API密钥',
            variant: 'destructive',
          });
          return;
        }

        const result = await parseNaturalLanguageWithAI(naturalLanguage, {
          apiKey,
          baseURL,
        });
        setMatrix2x2(result);
        setDimension('2x2');
        toast({
          title: '✓ AI转换成功',
          description: '矩阵已更新',
        });
      }
    } catch (error) {
      toast({
        title: '转换失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 应用预设变换（修复：对当前矩阵进行变换）
  const applyPreset = (name: keyof typeof presetTransforms) => {
    if (dimension === '2x2') {
      // 对当前2x2矩阵应用变换（矩阵乘法）
      const preset = presetTransforms[name];
      const [[a, b], [c, d]] = matrix2x2;
      const [[p, q], [r, s]] = preset;
      
      const result: Matrix2x2 = [
        [p * a + q * c, p * b + q * d],
        [r * a + s * c, r * b + s * d]
      ];
      
      setMatrix2x2(result);
      toast({
        title: '✓ 已应用预设变换',
        description: `${name} 已应用到当前矩阵`,
      });
    } else {
      toast({
        title: '提示',
        description: '预设变换仅支持2x2矩阵',
        variant: 'destructive',
      });
    }
  };

  // 计算高级属性（3x3矩阵）
  const calculate3x3Properties = () => {
    if (dimension !== '3x3') return;

    const results = [];
    
    // 对称性
    const symmetric = isSymmetric(matrix3x3);
    results.push(`对称性: ${symmetric ? '是' : '否'}`);
    
    // 正交性
    const orthogonal = isOrthogonal(matrix3x3);
    results.push(`正交性: ${orthogonal ? '是' : '否'}`);
    
    // 正定性
    if (symmetric) {
      const positive = isPositiveDefinite(matrix3x3);
      results.push(`正定性: ${positive ? '正定' : '非正定'}`);
    }
    
    toast({
      title: '✓ 矩阵属性',
      description: results.join('\n'),
    });
  };

  // 相似对角化
  const performDiagonalization = () => {
    if (dimension !== '3x3') {
      toast({
        title: '提示',
        description: '相似对角化仅支持3x3矩阵',
        variant: 'destructive',
      });
      return;
    }

    const result = diagonalize(matrix3x3);
    
    if (result.success && result.D) {
      toast({
        title: '✓ 对角化成功',
        description: `对角矩阵D的对角元素: [${result.D[0][0].toFixed(2)}, ${result.D[1][1].toFixed(2)}, ${result.D[2][2].toFixed(2)}]`,
      });
    } else {
      toast({
        title: '对角化失败',
        description: result.message,
        variant: 'destructive',
      });
    }
  };

  // 合同变换
  const performCongruence = () => {
    if (dimension !== '3x3') {
      toast({
        title: '提示',
        description: '合同变换仅支持3x3矩阵',
        variant: 'destructive',
      });
      return;
    }

    const result = congruenceTransform(matrix3x3);
    
    if (result.success) {
      toast({
        title: '✓ 合同变换完成',
        description: result.message,
      });
    } else {
      toast({
        title: '合同变换失败',
        description: result.message,
        variant: 'destructive',
      });
    }
  };

  // 计算数学属性
  const det = dimension === '2x2' ? determinant(matrix2x2) : determinant3x3(matrix3x3);
  const evals = dimension === '2x2' ? eigenvalues(matrix2x2) : eigenvalues3x3(matrix3x3).map(v => ({ real: v, imag: 0 }));
  const trace = dimension === '3x3' ? trace3x3(matrix3x3) : matrix2x2[0][0] + matrix2x2[1][1];

  return (
    <div className="min-h-screen w-full bg-background p-4 xl:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* 标题 */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl xl:text-4xl font-bold text-primary">
            AI Matrix Lab
          </h1>
          <p className="text-muted-foreground">
            线性代数可视化实验室 - 探索矩阵变换的奥秘
          </p>
        </div>

        {/* 维度选择 */}
        <Card>
          <CardHeader>
            <CardTitle>矩阵维度</CardTitle>
            <CardDescription>选择2x2矩阵（可视化）或3x3矩阵（高级计算）</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={dimension} onValueChange={(v) => setDimension(v as MatrixDimension)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="2x2">2×2 矩阵</TabsTrigger>
                <TabsTrigger value="3x3">3×3 矩阵</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* 主内容区 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* 左侧控制区 */}
          <div className="space-y-4">
            {/* 自然语言输入 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  自然语言输入
                </CardTitle>
                <CardDescription>
                  支持中英文：旋转45度、沿X轴反射、缩放2倍等
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="输入变换描述..."
                    value={naturalLanguage}
                    onChange={(e) => setNaturalLanguage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleNaturalLanguageSubmit();
                      }
                    }}
                  />
                  <Button
                    onClick={handleNaturalLanguageSubmit}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      '转换'
                    )}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="mock-mode" className="text-sm">
                    Mock AI模式（本地规则）
                  </Label>
                  <Switch
                    id="mock-mode"
                    checked={useMockAI}
                    onCheckedChange={setUseMockAI}
                  />
                </div>

                {!useMockAI && (
                  <div className="space-y-2 pt-2 border-t border-border">
                    <div className="space-y-1">
                      <Label htmlFor="api-key" className="text-xs">
                        API密钥
                      </Label>
                      <Input
                        id="api-key"
                        type="password"
                        placeholder="sk-..."
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="base-url" className="text-xs">
                        API地址（可选）
                      </Label>
                      <Input
                        id="base-url"
                        placeholder="https://api.openai.com/v1"
                        value={baseURL}
                        onChange={(e) => setBaseURL(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 矩阵手动输入 */}
            <Card>
              <CardHeader>
                <CardTitle>矩阵输入</CardTitle>
                <CardDescription>手动输入矩阵的元素</CardDescription>
              </CardHeader>
              <CardContent>
                {dimension === '2x2' ? (
                  <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
                    {[0, 1].map(row => 
                      [0, 1].map(col => (
                        <Input
                          key={`${row}-${col}`}
                          type="number"
                          step="0.1"
                          value={matrix2x2[row][col]}
                          onChange={(e) => updateMatrix2x2Element(row, col, e.target.value)}
                          className="text-center text-lg font-mono"
                        />
                      ))
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
                    {[0, 1, 2].map(row => 
                      [0, 1, 2].map(col => (
                        <Input
                          key={`${row}-${col}`}
                          type="number"
                          step="0.1"
                          value={matrix3x3[row][col]}
                          onChange={(e) => updateMatrix3x3Element(row, col, e.target.value)}
                          className="text-center text-sm font-mono"
                        />
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 数学属性 */}
            <Card>
              <CardHeader>
                <CardTitle>数学属性</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm text-muted-foreground">行列式 (Determinant)</Label>
                  <p className="text-2xl font-mono font-bold text-primary">
                    {det.toFixed(4)}
                  </p>
                  {Math.abs(det) < 1e-10 && (
                    <p className="text-xs text-destructive mt-1">
                      ⚠️ 矩阵不可逆
                    </p>
                  )}
                </div>

                <Separator />

                <div>
                  <Label className="text-sm text-muted-foreground">迹 (Trace)</Label>
                  <p className="text-xl font-mono font-bold">
                    {trace.toFixed(4)}
                  </p>
                </div>

                <Separator />

                <div>
                  <Label className="text-sm text-muted-foreground">特征值 (Eigenvalues)</Label>
                  <div className="space-y-1 mt-1">
                    {evals.map((ev, idx) => (
                      <p key={idx} className="text-lg font-mono">
                        λ<sub>{idx + 1}</sub> ={' '}
                        {ev.imag === 0
                          ? ev.real.toFixed(4)
                          : `${ev.real.toFixed(4)} ${ev.imag >= 0 ? '+' : ''}${ev.imag.toFixed(4)}i`}
                      </p>
                    ))}
                  </div>
                </div>

                {dimension === '3x3' && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">矩阵性质</Label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 bg-muted rounded">
                          对称: {isSymmetric(matrix3x3) ? '✓' : '✗'}
                        </div>
                        <div className="p-2 bg-muted rounded">
                          正交: {isOrthogonal(matrix3x3) ? '✓' : '✗'}
                        </div>
                        {isSymmetric(matrix3x3) && (
                          <div className="p-2 bg-muted rounded col-span-2">
                            正定: {isPositiveDefinite(matrix3x3) ? '✓' : '✗'}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* 预设变换 */}
            {dimension === '2x2' && (
              <Card>
                <CardHeader>
                  <CardTitle>预设变换</CardTitle>
                  <CardDescription>对当前矩阵应用变换（矩阵乘法）</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={() => applyPreset('identity')}
                      className="text-sm"
                    >
                      单位矩阵
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => applyPreset('rotate90')}
                      className="text-sm"
                    >
                      旋转90°
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => applyPreset('rotate45')}
                      className="text-sm"
                    >
                      旋转45°
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => applyPreset('reflectX')}
                      className="text-sm"
                    >
                      X轴反射
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => applyPreset('reflectY')}
                      className="text-sm"
                    >
                      Y轴反射
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => applyPreset('shear')}
                      className="text-sm"
                    >
                      剪切
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => applyPreset('squeeze')}
                      className="text-sm"
                    >
                      挤压
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => applyPreset('scale2')}
                      className="text-sm"
                    >
                      缩放2倍
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 高级计算（3x3矩阵） */}
            {dimension === '3x3' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-primary" />
                    高级计算
                  </CardTitle>
                  <CardDescription>相似对角化、合同变换等</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={calculate3x3Properties}
                      className="text-sm"
                    >
                      计算属性
                    </Button>
                    <Button
                      variant="outline"
                      onClick={performDiagonalization}
                      className="text-sm"
                    >
                      相似对角化
                    </Button>
                    <Button
                      variant="outline"
                      onClick={performCongruence}
                      className="text-sm col-span-2"
                    >
                      合同变换
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 图形选择（仅2x2） */}
            {dimension === '2x2' && (
              <Card>
                <CardHeader>
                  <CardTitle>图形类型</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      variant={shapeType === 'square' ? 'default' : 'outline'}
                      onClick={() => setShapeType('square')}
                      className="flex-1"
                    >
                      正方形
                    </Button>
                    <Button
                      variant={shapeType === 'F' ? 'default' : 'outline'}
                      onClick={() => setShapeType('F')}
                      className="flex-1"
                    >
                      F字形
                    </Button>
                    <Button
                      variant={shapeType === 'grid' ? 'default' : 'outline'}
                      onClick={() => setShapeType('grid')}
                      className="flex-1"
                    >
                      网格点
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 右侧展示区 */}
          <div className="xl:sticky xl:top-8 h-fit">
            {dimension === '2x2' ? (
              <Card className="h-[600px] xl:h-[800px]">
                <CardHeader>
                  <CardTitle>变换可视化</CardTitle>
                  <CardDescription>
                    蓝色虚线：原始图形 | 红色实线：变换后图形 | 绿色箭头：特征向量
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[calc(100%-5rem)]">
                  <MatrixVisualizer matrix={matrix2x2} shape={shapeType} />
                </CardContent>
              </Card>
            ) : (
              <Card className="h-[600px] xl:h-[800px]">
                <CardHeader>
                  <CardTitle>3×3矩阵信息</CardTitle>
                  <CardDescription>
                    3D可视化功能开发中，当前显示矩阵详细信息
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold mb-2">当前矩阵</h3>
                    <div className="font-mono text-sm space-y-1">
                      {matrix3x3.map((row, i) => (
                        <div key={i}>
                          [{row.map(v => v.toFixed(2).padStart(6)).join(', ')}]
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold mb-2">矩阵性质</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>行列式:</span>
                        <span className="font-mono">{det.toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>迹:</span>
                        <span className="font-mono">{trace.toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>对称:</span>
                        <span>{isSymmetric(matrix3x3) ? '是' : '否'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>正交:</span>
                        <span>{isOrthogonal(matrix3x3) ? '是' : '否'}</span>
                      </div>
                      {isSymmetric(matrix3x3) && (
                        <div className="flex justify-between">
                          <span>正定:</span>
                          <span>{isPositiveDefinite(matrix3x3) ? '是' : '否'}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold mb-2">特征值（近似）</h3>
                    <div className="space-y-1 text-sm font-mono">
                      {eigenvalues3x3(matrix3x3).map((val, i) => (
                        <div key={i}>
                          λ<sub>{i + 1}</sub> = {val.toFixed(4)}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* 页脚 */}
        <div className="text-center text-sm text-muted-foreground py-4">
          <p>© 2025 AI Matrix Lab | 探索线性代数的美妙世界</p>
        </div>
      </div>
    </div>
  );
}
