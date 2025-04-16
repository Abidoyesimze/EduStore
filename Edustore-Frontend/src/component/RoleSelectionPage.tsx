import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Educator from "../assets/educator.png";
import Student from "../assets/student.png";

const roles = [
  {
    title: 'Student',
    description: 'Access learning materials from anywhere, anytime',
    image: Student,
    route: '/student-dashboard', // Add the route for the student dashboard
  },
  {
    title: 'Educator',
    description: 'Securely store and share lessons, syllabi, and assessments',
    image: Educator,
    route: '/Educator-dashboard', 
  },
];

const RoleSelectionPage = () => {
  const [selectedRole, setSelectedRole] = useState<string>('Student');
  const navigate = useNavigate();

  const handleNavigate = (route: string) => {
    navigate(route);
  };

  return (
    <div className="bg-[#F8FAF5] min-h-screen pt-28 px-6">
      <h2 className="text-center text-2xl md:text-3xl font-semibold mb-12 text-[#1C1C1C]">
        Select Your Role to Get Started
      </h2>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
        {roles.map((role) => (
          <div
            key={role.title}
            className={`rounded-2xl shadow-md p-6 bg-white transition-all border ${
              selectedRole === role.title ? 'border-yellow-400' : 'border-transparent'
            }`}
            onClick={() => setSelectedRole(role.title)}
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
              disabled={selectedRole !== role.title}
            >
              Get Started
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoleSelectionPage;
