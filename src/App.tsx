import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileHeader } from '@/components/layout/MobileHeader';
import CalculatorPage from '@/pages/CalculatorPage';
import SettingsPage from '@/pages/SettingsPage';
import FilamentsPage from '@/pages/FilamentsPage';
import ProductsPage from '@/pages/ProductsPage';

export default function App() {
  return (
    <BrowserRouter>
      <TooltipProvider>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col min-h-0">
            <MobileHeader />
            <main className="flex-1 overflow-y-auto overflow-x-hidden">
              <Routes>
                <Route path="/" element={<Navigate to="/calculator" replace />} />
                <Route path="/calculator" element={<CalculatorPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/filaments" element={<FilamentsPage />} />
                <Route path="/products" element={<ProductsPage />} />
              </Routes>
            </main>
          </div>
        </div>
        <Toaster />
        <ConfirmDialog />
      </TooltipProvider>
    </BrowserRouter>
  );
}
