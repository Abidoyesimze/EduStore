// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './component/Navbar';
import HomePage from './component/HomePage';
import Footer from './component/Footer';
import Features from './component/Features';
import '@rainbow-me/rainbowkit/styles.css';
import RoleSelectionPage from './component/RoleSelectionPage';
import '@rainbow-me/rainbowkit/styles.css';
import EducatorDashboard from './component/dashboard/EducatorDashboard';
import UploadFile from './component/dashboard/UploadFile';
import MyFiles from './component/dashboard/MyFiles';
import AccessControl from './component/dashboard/AccessControl';
import Dashboard from './component/Dashboard';
import MyResources from './component/MyResources';
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
  filecoinCalibration
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from '@tanstack/react-query';
import './App.css';

// Configure Wagmi
const config = getDefaultConfig({
  appName: 'Edustore',
  projectId: 'a69043ecf4dca5c34a5e70fdfeac4558',
  chains: [mainnet, polygon, optimism, arbitrum, base, filecoinCalibration],
  ssr: true,
});

// Initialize QueryClient
const queryClient = new QueryClient();

// Layout component to handle conditional rendering of Navbar and Footer
// const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const location = useLocation();
//   const isDashboard = location.pathname === '/dashboard';

//   return (
//     <div className="min-h-screen flex flex-col">
//       {!isDashboard && <Navbar />}
//       <main className="flex-grow">{children}</main>
//       {!isDashboard && <Footer />}
//     </div>
//   );
// };

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
        <Router>
          <div className="min-h-screen w-full flex flex-col">
          <Navbar />
          <main className="flex-grow w-full">
          <Routes>
             <Route path="/" element={<HomePage />} />
             <Route path='/features' element={<Features />} />
             <Route path="/roles" element={<RoleSelectionPage />} />
              <Route path="/Educator-dashboard" element={<EducatorDashboard />} />
              <Route path="/upload" element={<UploadFile />} />
              <Route path="/dashboard/upload" element={<UploadFile />} />
              <Route path="/files" element={<MyFiles />} />
              <Route path="/access" element={<AccessControl />} />
              <Route path='/student-dashboard' element={<Dashboard/>} />
              <Route path='/resources' element={<MyResources />} />
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