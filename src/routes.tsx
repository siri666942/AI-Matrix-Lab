import MatrixLabEnhanced from './pages/MatrixLabEnhanced';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'AI Matrix Lab',
    path: '/',
    element: <MatrixLabEnhanced />
  }
];

export default routes;
