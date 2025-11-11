
import { Button } from "@/components/ui/button";

interface CTASectionProps {
  onShowAuth: (userType: 'student' | 'teacher') => void;
}

const CTASection = ({ onShowAuth }: CTASectionProps) => {
  return (
    <section className="py-8 md:py-12 lg:py-16 bg-gradient-to-r from-green-600 to-blue-600 text-white">
      <div className="container mx-auto px-3 md:px-4 text-center">
        <h3 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2 md:mb-3 leading-tight">
          Ready to Transform Your Learning?
        </h3>
        <p className="text-sm md:text-base lg:text-lg mb-4 md:mb-6 opacity-90 max-w-2xl mx-auto leading-relaxed">
          Join thousands of students who are already seeing better grades and achieving their academic goals.
        </p>
        <Button 
          size="lg" 
          className="bg-white text-green-600 hover:bg-gray-100 w-full sm:w-auto min-h-11 text-sm md:text-base font-semibold hover:scale-105 transition-transform duration-200 touch-manipulation"
          onClick={() => onShowAuth('student')}
        >
          Start Free Today
        </Button>
      </div>
    </section>
  );
};

export default CTASection;
