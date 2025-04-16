// src/App.tsx
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './component/Navbar';
import HomePage from './component/HomePage';
import Footer from './component/Footer';
import Features from './component/Features';
import Dashboard from './component/Dashboard';
import RoleSelectionPage from './component/RoleSelectionPage';
//import Services from './component/Services';
//import About from './component/About';
//import Contact from './component/Contact';
import '@rainbow-me/rainbowkit/styles.css';
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
            <Routes>
              {/* Routes with Navbar and Footer */}
              <Route
                path="/"
                element={
                  <Layout>
                    <HomePage />
                  </Layout>
                }
              />
              <Route
                path="/features"
                element={
                  <Layout>
                    <Features />
                  </Layout>
                }
              />
              {/* <Route
                path="/services"
                element={
                  <Layout>
                    <Services />
                  </Layout>
                }
              />
              <Route
                path="/about"
                element={
                  <Layout>
                    <About />
                  </Layout>
                }
              />
              <Route
                path="/contact"
                element={
                  <Layout>
                    <Contact />
                  </Layout>
                }
              /> */}
              <Route
                path="/roles"
                element={
                  <Layout>
                    <RoleSelectionPage />
                  </Layout>
                }
              />
              {/* Dashboard route without Navbar and Footer */}
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </Router>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;