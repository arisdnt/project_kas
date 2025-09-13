import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { LaporanStokPage } from './features/laporan/stok/pages/LaporanStokPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="w-full h-screen">
        <LaporanStokPage />
      </div>
    </BrowserRouter>
  );
}