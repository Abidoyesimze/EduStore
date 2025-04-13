import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const Footer = () => {
  const [email, setEmail] = useState('');
  
  const handleSubscribe = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Add newsletter subscription logic here
    alert(`Subscribed with email: ${email}`);
    setEmail('');
  };

  return (
    <footer className="bg-[#F8FAF5] py-12 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        {/* Top section with logo and newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 pb-10 border-b border-gray-200">
          {/* Logo and social icons column */}
          <div className="flex flex-col items-start">
            <Link to="/" className="mb-6">
              <img src={logo} alt="EduStore Logo" className="h-10" />
            </Link>
            
            {/* Social Media Links */}
            <div className="flex space-x-4 mt-2">
              <a href="#" className="bg-gray-800 text-white p-2 rounded-full hover:bg-black transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
                </svg>
              </a>
              <a href="#" className="bg-gray-800 text-white p-2 rounded-full hover:bg-black transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
                </svg>
              </a>
              <a href="#" className="bg-gray-800 text-white p-2 rounded-full hover:bg-black transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
                </svg>
              </a>
              <a href="#" className="bg-gray-800 text-white p-2 rounded-full hover:bg-black transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path>
                </svg>
              </a>
            </div>
          </div>
          
          {/* Newsletter Subscription */}
          <div className="flex flex-col md:items-end">
            <div className="max-w-md w-full md:ml-auto">
              <form onSubmit={handleSubscribe} className="flex">
                <input
                  type="email"
                  placeholder="Enter your e-mail address..."
                  className="px-4 py-2 flex-grow border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button 
                  type="submit" 
                  className="bg-black text-white px-4 py-2 rounded-r-md hover:bg-gray-800 transition-colors whitespace-nowrap"
                >
                  Subscribe Now
                </button>
              </form>
            </div>
          </div>
        </div>
        
        {/* Middle section with navigation links */}
        <div className="flex flex-wrap justify-center gap-8 mb-10 pb-10 border-b border-gray-200">
          <Link to="/features" className="text-gray-600 hover:text-green-500 transition-colors">
            Features
          </Link>
          <Link to="/about" className="text-gray-600 hover:text-green-500 transition-colors">
            About
          </Link>
          <Link to="/contact" className="text-gray-600 hover:text-green-500 transition-colors">
            Contact
          </Link>
          <Link to="/privacy" className="text-gray-600 hover:text-green-500 transition-colors">
            Privacy Policy
          </Link>
          <Link to="/terms" className="text-gray-600 hover:text-green-500 transition-colors">
            Terms & Conditions
          </Link>
        </div>
        
        {/* Copyright */}
        <div className="text-center text-gray-500 text-sm">
          <p>© Copyright 2024, All Rights Reserved</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;