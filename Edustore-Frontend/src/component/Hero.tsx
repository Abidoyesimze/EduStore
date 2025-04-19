import globe from "../assets/3d.png";
import cap from "../assets/cap.png";
import filecoin from "../assets/filecoin.png";
import {useNavigate} from "react-router-dom";

const HomePage = () => {

  const navigate = useNavigate();

  return (
    <div className="bg-[#F8FAF5] w-full">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left Column - Text */}
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              Store, Share & Secure Educational Resources Without Limits
            </h1>
            <p className="mt-4 text-gray-600">
              A decentralized platform powered by IPFS, Filecoin, and smart 
              contracts to help educators and learners store, manage, and 
              access materials anytime, anywhere.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors" onClick={() => navigate('/roles')}>
                Launch MVP
              </button>
              <button className="bg-white text-black px-6 py-3 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors" onClick={() => navigate('/features')}>
                Explore Features
              </button>
            </div>
            
            {/* Statistics */}
            <div className="mt-12 flex gap-12">
              <div>
                <h3 className="text-3xl font-bold">3579</h3>
                <p className="text-sm text-gray-500">Stored Data</p>
              </div>
              <div>
                <h3 className="text-3xl font-bold">$1M+</h3>
                <p className="text-sm text-gray-500">Trusted Customers</p>
              </div>
            </div>
          </div>
          
          {/* Right Column - Globe Image */}
          <div className="flex justify-center relative">
            {/* Main Globe Image */}
            <img 
  src={globe} 
  alt="3D Earth with educational resources" 
  className="w-full max-w-md relative z-10 animate-spin [animation-duration:3s]"
  // ⬆️ here we manually set animation duration using square brackets
/>



            {/* Graduation Cap */}
            <div className="absolute z-20 top-[5%] left-[80%] transform -translate-x-1/2 animate-bounce">
              <img 
              src={cap} 
              alt="Graduation Cap" 
              className="w-18"
              />
            </div>
            
            {/* Filecoin Logo */}
            <div className="absolute z-20 top-[30%] left-[12%] transform -translate-x-1/2 animate-pulse">
              <img 
              src={filecoin} 
              alt="Filecoin Logo" 
              className="w-18 h-11"
              />
            </div>
            
            
            
            {/* Curved Arrow */}
            <div className="absolute left-0g top-1/4 w-full h-full z-1">
              <svg
                className="w-full h-full"
                viewBox="0 0 200 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M40 80 C 40 40, 120 40, 120 80"
                  stroke="black"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  fill="none"
                />
                <polygon
                  points="125,80 120,75 115,80 120,85"
                  fill="black"
                />
              </svg>
            </div>
            
            {/* Abstract shapes around the globe */}
            <div className="absolute top-0 right-0 -mr-4 -mt-4 transform rotate-45">
              <div className="w-8 h-8 border-2 border-black opacity-20"></div>
            </div>
            <div className="absolute bottom-0 left-0 -ml-4 -mb-4">
              <div className="w-4 h-4 bg-green-400 rounded-full opacity-40"></div>
            </div>
          </div>
        </div>
      </section>


      {/* Features Section - With Gradient */}
      <section className="bg-gradient-to-r from-green-400 via-yellow-300 to-yellow-500 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <div className="bg-opacity-10 bg-white p-6 rounded-lg">
              <div className="bg-black w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">For Schools & Universities</h3>
              <p>Replace unreliable cloud storage with a verifiable, decentralized platform.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-opacity-10 bg-white p-6 rounded-lg">
              <div className="bg-black w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">For Individual Educators</h3>
              <p>Keep your teaching materials secure, and share them with students across geographies.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-opacity-10 bg-white p-6 rounded-lg">
              <div className="bg-black w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">For Online Education Platforms</h3>
              <p>Integrate with LMS tools to offer reliable, censorship-resistant access to learning materials.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;