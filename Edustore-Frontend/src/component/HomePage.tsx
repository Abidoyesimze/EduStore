import Hero from './Hero';
import WhoItsFor from './WhoItsFor';
import ValueProposition from './ValueProposition';
import HowItWorks from './HowItWorks';

const HomePage = () => {
  return (
    <div className="bg-[#F8FAF5]">
      <Hero />
      {/* <FeaturesSection /> */}
      <ValueProposition />
      <HowItWorks />
      <WhoItsFor />
    </div>
  );
};

export default HomePage;