import { useState, useEffect } from 'react';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-primary-800 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-6">
          <img 
            src="https://i.ibb.co/Pxsjh0j/costone.png"
            alt="Costone Logo"
            className="w-32 h-32 mx-auto rounded-full border-4 border-white shadow-lg"
          />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">COSTONE BASKET SIENA</h1>
        <p className="text-primary-100">Statistiche & Analisi Schemi</p>
      </div>
    </div>
  );
}