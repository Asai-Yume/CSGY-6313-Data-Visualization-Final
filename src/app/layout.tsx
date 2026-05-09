import { PropsWithChildren } from 'react';

export function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <div className="page-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">CS-GY 6313 / CUSP-GX 6006</p>
          <h1>NYC 311 Noise Complaint Explorer</h1>
        </div>
      </header>
      {children}
    </div>
  );
}