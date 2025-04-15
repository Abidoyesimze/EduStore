// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './component/Navbar';
import HomePage from './component/HomePage';
import Footer from './component/Footer';
import Features from './component/features';
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
} from "@tanstack/react-query";


const config = getDefaultConfig({
  appName: 'Edustore',
  projectId: 'YOUR_PROJECT_ID',
  chains: [mainnet, polygon, optimism, arbitrum, base],
  ssr: true, 
});
const queryClient = new QueryClient();

function App() {
  return (
    <div>
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
          </Routes>
          </main>
          <Footer />
         </div>
        </Router>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
      
    </div>
  );
}

export default App;