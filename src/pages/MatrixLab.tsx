import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { MatrixVisualizer } from '@/components/MatrixVisualizer';
import type { Matrix2x2 } from '@/lib/matrix';
import { determinant, eigenvalues, presetTransforms } from '@/lib/matrix';
import { mockParseNaturalLanguage, parseNaturalLanguageWithAI } from '@/services/openai';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function MatrixLab() {
  const { toast } = useToast();
  
  // 矩阵状态
  const [matrix, setMatrix] = useState<Matrix2x2>([[1, 0], [0, 1]]);
  
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

  // 更新矩阵元素
  const updateMatrixElement = (row: number, col: number, value: string) => {
    const num = Number.parseFloat(value) || 0;
    const newMatrix: Matrix2x2 = [
      [...matrix[0]],
      [...matrix[1]]
    ] as Matrix2x2;
    newMatrix[row][col] = num;
    setMatrix(newMatrix);
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
        // Mock模式
        const result = mockParseNaturalLanguage(naturalLanguage);
        if (result) {
          setMatrix(result);
          toast({
            title: '✓ 转换成功',
            description: '已使用本地规则解析',
          });
        } else {
          toast({
            title: '无法识别',
            description: '请尝试: rotate 45, reflect x-axis, scale 2, shear 1.5',
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
        setMatrix(result);
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

  // 应用预设变换
  const applyPreset = (name: keyof typeof presetTransforms) => {
    setMatrix(presetTransforms[name]);
    toast({
      title: '✓ 已应用预设',
      description: `变换: ${name}`,
    });
  };

  // 计算数学属性
  const det = determinant(matrix);
  const evals = eigenvalues(matrix);

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
                  描述你想要的变换，例如: Rotate 45 degrees, Reflect X-axis
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
                <CardDescription>手动输入2x2矩阵的元素</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
                  <Input
                    type="number"
                    step="0.1"
                    value={matrix[0][0]}
                    onChange={(e) => updateMatrixElement(0, 0, e.target.value)}
                    className="text-center text-lg font-mono"
                  />
                  <Input
                    type="number"
                    step="0.1"
                    value={matrix[0][1]}
                    onChange={(e) => updateMatrixElement(0, 1, e.target.value)}
                    className="text-center text-lg font-mono"
                  />
                  <Input
                    type="number"
                    step="0.1"
                    value={matrix[1][0]}
                    onChange={(e) => updateMatrixElement(1, 0, e.target.value)}
                    className="text-center text-lg font-mono"
                  />
                  <Input
                    type="number"
                    step="0.1"
                    value={matrix[1][1]}
                    onChange={(e) => updateMatrixElement(1, 1, e.target.value)}
                    className="text-center text-lg font-mono"
                  />
                </div>
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
                  {evals[0].imag !== 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      复数特征值（不显示特征向量）
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 预设变换 */}
            <Card>
              <CardHeader>
                <CardTitle>预设变换</CardTitle>
                <CardDescription>快速演示常见变换</CardDescription>
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

            {/* 图形选择 */}
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
          </div>

          {/* 右侧展示区 */}
          <div className="xl:sticky xl:top-8 h-fit">
            <Card className="h-[600px] xl:h-[800px]">
              <CardHeader>
                <CardTitle>变换可视化</CardTitle>
                <CardDescription>
                  蓝色虚线：原始图形 | 红色实线：变换后图形 | 绿色箭头：特征向量
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[calc(100%-5rem)]">
                <MatrixVisualizer matrix={matrix} shape={shapeType} />
              </CardContent>
            </Card>
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
