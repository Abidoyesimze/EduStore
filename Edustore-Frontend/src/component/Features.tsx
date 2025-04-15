// src/components/Features.tsx
import React from 'react';
import Group1 from '../assets/Group (2).png';
import Group2 from '../assets/Group (3).png';
import Group3 from '../assets/Vector (4).png';
import Group4 from '../assets/Vector (5).png';
import Group5 from '../assets/Vector (6).png';
import Group6 from '../assets/Vector (7).png';
import Group7 from '../assets/Group (6).png';

// Define the feature data as an array for better maintainability
const features = [
  {
    icon: Group1,
    title: 'Decentralized File Storage',
    description:
      'Files are uploaded and distributed across IPFS nodes, ensuring high availability and resistance to data loss.',
    align: 'left',
  },
  {
    icon: Group2,
    title: 'Persistent Hosting via Filecoin',
    description:
      'Files stay available for the long term through miner incentives, reducing the need for expensive central infrastructure.',
    align: 'right',
  },
  {
    icon: Group3,
    title: 'Smart Access Controls',
    description:
      'Define who can access what with granular control using FVM smart contracts — from public resources to private datasets.',
    align: 'left',
  },
  {
    icon: Group4,
    title: 'Automated Storage Payments',
    description:
      'Let smart contracts handle payouts to storage providers in Filecoin tokens. Fully decentralized and auditable.',
    align: 'right',
  },
  {
    icon: Group5,
    title: 'Immutable Audit Trails',
    description:
      'Every file upload, permission change, and download is logged immutably — building trust and compliance.',
    align: 'left',
  },
  {
    icon: Group6,
    title: 'Intuitive Dashboard',
    description:
      'A modern, responsive UI with drag-and-drop upload, file tagging, and access management. Designed for ease of use.',
    align: 'right',
  },
  {
    icon: Group7,
    title: 'Built for Everyone',
    description:
      'Includes accessibility features (screen reader support, contrast themes, multilingual options) for inclusive education.',
    align: 'left',
  },
];

const Features: React.FC = () => {
  return (
    <section className="relative py-16 overflow-hidden">
      {/* Background Circle (Top Left) */}
      <div
        className="absolute -z-10 rounded-full"
        style={{
          width: '600px',
          height: '600px',
          top: '-300px',
          left: '-179px',
          background: '#E3EFE7',
        }}
      />

      {/* Background Circle (Middle Right) */}
      <div
        className="absolute -z-10 rounded-full"
        style={{
          width: '400px',
          height: '400px',
          background: '#D9D6C8',
          top: '600px',
          right: '-200px',
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-12">
          Our Features
        </h1>

        {/* Feature Cards */}
        <div className="space-y-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`flex justify-${
                feature.align === 'left' ? 'start' : 'end'
              } w-full`}
            >
              <div
                className={`bg-white rounded-lg shadow-lg p-6 flex items-start gap-4 max-w-lg w-full sm:w-3/4 lg:w-1/2 ${
                  feature.align === 'left' ? 'mr-auto' : 'ml-auto'
                }`}
              >
                <img
                  src={feature.icon}
                  alt={feature.title}
                  className="w-10 h-11 flex-shrink-0"
                />
                <div>
                  <h3
                    className={`${
                      feature.align === 'left'
                        ? 'text-xl sm:text-2xl'
                        : 'text-lg sm:text-xl'
                    } font-semibold text-gray-800`}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;