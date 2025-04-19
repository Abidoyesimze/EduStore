import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import Educator from "../assets/educator.png";
import Student from "../assets/student.png";

const roles = [
  {
    title: 'Student',
    description: 'Access learning materials from anywhere, anytime',
    image: Student,
    route: '/student-dashboard',
  },
  {
    title: 'Educator',
    description: 'Securely store and share lessons, syllabi, and assessments',
    image: Educator,
    route: '/Educator-dashboard',
  },
];

const RoleSelectionPage = () => {
  const { address, isConnected } = useAccount();
  const [selectedRole, setSelectedRole] = useState<string>('Student');
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();

  // Load role if already selected
  useEffect(() => {
    if (address) {
      const savedRole = localStorage.getItem(`role_${address}`);
      if (savedRole) {
        setUserRole(savedRole);
        setSelectedRole(savedRole);
      }
    }
  }, [address]);

  const handleNavigate = (route: string) => {
    if (address) {
      localStorage.setItem(`role_${address}`, selectedRole); // Save selected role
      navigate(route);
    }
  };

  return (
    <div className="bg-[#F8FAF5] min-h-screen pt-28 px-6">
      <h2 className="text-center text-2xl md:text-3xl font-semibold mb-6 text-[#1C1C1C]">
        Select Your Role to Get Started
      </h2>

      <div className="text-center mb-10">
        {isConnected ? (
          <p className="text-gray-700">
            Connected Wallet: <span className="font-semibold">{address}</span>
          </p>
        ) : (
          <p className="text-gray-500">Please connect your wallet to select a role.</p>
        )}
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
        {roles.map((role) => {
          const alreadyChosen = userRole && userRole !== role.title;

          return (
            <div
              key={role.title}
              className={`rounded-2xl shadow-md p-6 bg-white transition-all border ${
                selectedRole === role.title ? 'border-yellow-400' : 'border-transparent'
              } ${alreadyChosen ? 'opacity-50 pointer-events-none' : ''}`}
              onClick={() => !alreadyChosen && setSelectedRole(role.title)}
            >
              <div className="flex items-center mb-4">
                <div
                  className={`w-3 h-3 rounded-full mr-2 border-2 ${
                    selectedRole === role.title
                      ? 'bg-yellow-400 border-yellow-400'
                      : 'border-gray-300'
                  }`}
                ></div>
                <span className="font-medium text-gray-800">{role.title}</span>
              </div>

              <img
                src={role.image}
                alt={role.title}
                className="w-full h-52 object-cover rounded-lg mb-4"
              />

              <p className="text-gray-600 mb-4">{role.description}</p>

              <button
                className={`px-5 py-2 rounded-md font-medium ${
                  selectedRole === role.title
                    ? 'bg-black text-white'
                    : 'bg-gray-200 text-gray-600 cursor-not-allowed'
                }`}
                onClick={() => selectedRole === role.title && handleNavigate(role.route)}
                disabled={selectedRole !== role.title || !isConnected}
              >
                {alreadyChosen ? 'Role Already Chosen' : 'Get Started'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoleSelectionPage;
