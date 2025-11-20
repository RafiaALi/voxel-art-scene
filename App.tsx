import React, { Suspense } from 'react';
import { Scene } from './components/Scene';
import { UI } from './components/UI';

const App: React.FC = () => {
  return (
    <div className="relative w-full h-full bg-slate-900">
      <UI />
      <Suspense fallback={
        <div className="flex items-center justify-center h-full w-full text-amber-400 font-mono animate-pulse">
          GENERATING VOXELS...
        </div>
      }>
        <Scene />
      </Suspense>
    </div>
  );
};

export default App;
