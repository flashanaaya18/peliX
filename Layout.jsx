import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidenav from './Sidenav';
import BottomNav from './BottomNav'; // Asumimos que el menú inferior es otro componente

const Layout = () => {
  const [isSidenavOpen, setSidenavOpen] = useState(false);

  return (
    <>
      <Header />
      <Sidenav isOpen={isSidenavOpen} closeNav={() => setSidenavOpen(false)} />
      <main>
        <Outlet />
      </main>
      <BottomNav openSidenav={() => setSidenavOpen(true)} />
    </>
  );
};

export default Layout;