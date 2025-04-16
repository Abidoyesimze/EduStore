// src/App.tsx
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './component/Navbar';
import HomePage from './component/HomePage';
import Footer from './component/Footer';
import Features from './component/Features';
import '@rainbow-me/rainbowkit/styles.css';
import RoleSelectionPage from './component/RoleSelectionPage';
//import Services from './component/Services';
//import About from './component/About';
//import Contact from './component/Contact';
import '@rainbow-me/rainbowkit/styles.css';
import EducatorDashboard from './component/dashboard/EducatorDashboard';
import UploadFile from './component/dashboard/UploadFile';
import MyFiles from './component/dashboard/MyFiles';
import AccessControl from './component/dashboard/AccessControl';
import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from '@tanstack/react-query';

// Configure Wagmi
const config = getDefaultConfig({
  appName: 'Edustore',
  projectId: 'YOUR_PROJECT_ID',
  chains: [mainnet, polygon, optimism, arbitrum, base],
  ssr: true,
});

// Initialize QueryClient
const queryClient = new QueryClient();

// Layout component to handle conditional rendering of Navbar and Footer
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';

  return (
    <div className="min-h-screen flex flex-col">
      {!isDashboard && <Navbar />}
      <main className="flex-grow">{children}</main>
      {!isDashboard && <Footer />}
    </div>
  );
};

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
          <Routes>
             <Route path="/" element={<HomePage />} />
             <Route path='/features' element={<Features />} />
             <Route path="/roles" element={<RoleSelectionPage />} />
              <Route path="/Educator-dashboard" element={<EducatorDashboard />} />
              <Route path="/upload" element={<UploadFile />} />
              <Route path="/files" element={<MyFiles />} />
              <Route path="/access" element={<AccessControl />} />
          </Routes>
          </main>
          <Footer />
         </div>
        </Router>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;