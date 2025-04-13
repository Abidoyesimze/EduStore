import fileStorage from "../assets/filestorage.png";

const ValueProposition = () => {
  return (
    <section className="max-w-7xl mx-auto px-6 py-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        {/* Left Column - Image */}
        <div className="flex justify-center">
          <img 
            src={fileStorage} 
            alt="File storage drawer in the cloud" 
            className="w-full max-w-md"
          />
        </div>
        
        {/* Right Column - Value Props */}
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            Core Value Proposition
          </h2>
          
          <ul className="space-y-4">
            <li className="flex items-start">
              <span className="flex-shrink-0 h-6 w-6 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <svg className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
              <span>Full data control</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 h-6 w-6 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <svg className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
              <span>No central failures</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 h-6 w-6 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <svg className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
              <span>Transparent access logs</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 h-6 w-6 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <svg className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
              <span>100% global accessibility</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 h-6 w-6 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <svg className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
              <span>Lower long-term storage costs</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default ValueProposition;