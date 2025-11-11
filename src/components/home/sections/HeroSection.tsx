
import RotatingHeroContent from "./RotatingHeroContent";

interface HeroSectionProps {
  onShowAuth: (userType: 'student' | 'teacher' | 'parent' | 'admin') => void;
}

const HeroSection = ({ onShowAuth }: HeroSectionProps) => {
  return (
    <section className="py-8 md:py-16 px-4 min-h-[calc(100vh-6rem)] md:min-h-0 flex items-center">
      <div className="container mx-auto w-full">
        <RotatingHeroContent onShowAuth={onShowAuth} />
      </div>
    </section>
  );
};

export default HeroSection;
