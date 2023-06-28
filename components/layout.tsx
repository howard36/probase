import Script from 'next/script';
import Sidebar from './sidebar';
import { FC } from 'react';

interface LayoutProps {
  title: string;
  children: React.ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }) => {
  return (
    <Sidebar>
      <main>{children}</main>
    </Sidebar>
  );
}

export default Layout;
