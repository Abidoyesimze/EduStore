import educationIcon from "../assets/education.png";

const WhoItsFor = () => {
  return (
    <>
      <section className="max-w-7xl mx-auto px-6 py-20 rounded-lg my-16 bg-cover bg-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10">
              Who It's For?
            </h2>

            <ul className="space-y-8">
              <li className="flex items-start">
                <span className="flex-shrink-0 h-8 w-8 text-yellow-500 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </span>
                <div>
                  <h3 className="font-semibold text-lg">Educators</h3>
                  <p className="text-gray-600">Securely store and share lessons, syllabi, and assessments</p>
                </div>
              </li>

              <li className="flex items-start">
                <span className="flex-shrink-0 h-8 w-8 text-yellow-500 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </span>
                <div>
                  <h3 className="font-semibold text-lg">Students</h3>
                  <p className="text-gray-600">Access learning materials from anywhere, anytime</p>
                </div>
              </li>

              <li className="flex items-start">
                <span className="flex-shrink-0 h-8 w-8 text-yellow-500 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </span>
                <div>
                  <h3 className="font-semibold text-lg">Institutions</h3>
                  <p className="text-gray-600">Cut infrastructure costs and increase transparency</p>
                </div>
              </li>

              <li className="flex items-start">
                <span className="flex-shrink-0 h-8 w-8 text-yellow-500 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </span>
                <div>
                  <h3 className="font-semibold text-lg">Developers</h3>
                  <p className="text-gray-600">Build LMS integrations and add-ons</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Right Column - Education Image */}
          <div className="flex justify-center">
            <img 
              src={educationIcon} 
              alt="Educational resources illustration" 
              className="w-full max-w-md"
            />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <div className="w-full bg-white">
        <div className="max-w-7xl mx-auto text-center py-12 px-6">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Start Building a Censorship-Free Education Future
          </h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Access and share knowledge freely with a secure, open, and 
            decentralized learning platform for everyone.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors">
              Launch MVP
            </button>
            <button className="bg-white text-black px-6 py-3 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors">
              Join Waitlist
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default WhoItsFor;