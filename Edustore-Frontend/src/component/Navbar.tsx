import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import { CustomButton } from './Button/CustomConnectButton';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
 

  return (
    <nav className=" py-6 px-6 z-10 relative">
      <div className="max-w-7xl mx-auto">
        {/* White rounded container */}
        <div className="bg-white rounded-lg shadow-sm px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <img src={logo} alt="EduStore Logo" className="h-8 w-auto mr-2" />
                
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/features" className="text-gray-600 hover:text-green-500 transition-colors">
                Features
              </Link>
              <Link to="/services" className="text-gray-600 hover:text-green-500 transition-colors">
                Services
              </Link>
              <Link to="/about" className="text-gray-600 hover:text-green-500 transition-colors">
                About
              </Link>
              <Link to="/contact" className="text-gray-600 hover:text-green-500 transition-colors">
                Contact
              </Link>
            </div>

            {/* Connect Wallet Button */}
            <div className="hidden md:block">
              {/* <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                Connect Wallet
              </button> */}
              <CustomButton />
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-col space-y-4">
                <Link to="/features" className="text-gray-600 hover:text-green-500 transition-colors">
                  Features
                </Link>
                <Link to="/services" className="text-gray-600 hover:text-green-500 transition-colors">
                  Services
                </Link>
                <Link to="/about" className="text-gray-600 hover:text-green-500 transition-colors">
                  About
                </Link>
                <Link to="/contact" className="text-gray-600 hover:text-green-500 transition-colors">
                  Contact
                </Link>
                <CustomButton />
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;