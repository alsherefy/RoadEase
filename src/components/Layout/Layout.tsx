import React from 'react';
import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { dir } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50" dir={dir}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default Layout;