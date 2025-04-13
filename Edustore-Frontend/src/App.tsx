// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './component/Navbar';
import HomePage from './component/HomePage';
import Footer from './component/Footer';


function App() {
  return (
    <div>
      <Router>
      <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
          <Routes>
             <Route path="/" element={<HomePage />} />
          </Routes>
          </main>
          <Footer />
        </div>
      </Router>
      
    </div>
  );
}

export default App;