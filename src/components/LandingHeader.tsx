import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trophy, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export const LandingHeader = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle scroll for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header 
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          "bg-white/95 backdrop-blur-md border-b border-gray-200/50",
          "supports-[padding:env(safe-area-inset-top)]:pt-[env(safe-area-inset-top)]",
          isScrolled && "shadow-lg bg-white/98",
        )}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo Section - Left */}
            <button
              onClick={() => handleNavClick("/")}
              className="flex items-center gap-3 min-h-[44px] min-w-[44px] -ml-2 px-2 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors"
              aria-label="Sports Journal Home"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md border border-white/20">
                <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Sports Journal
                </h1>
              </div>
            </button>

            {/* Desktop Navigation - Center */}
            <nav className="hidden lg:flex items-center gap-8">
              <button
                onClick={() => {
                  const element = document.getElementById('features');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => {
                  const element = document.getElementById('how-it-works');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                How It Works
              </button>
              <button
                onClick={() => {
                  const element = document.getElementById('testimonials');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Testimonials
              </button>
              <button
                onClick={() => handleNavClick("/pricing")}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Pricing
              </button>
            </nav>

            {/* Right Section - Auth Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Desktop Auth Buttons */}
              <div className="hidden sm:flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={() => handleNavClick("/login")}
                  className="text-gray-700 hover:text-gray-900 font-medium px-4 py-2 hover:bg-gray-100"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => handleNavClick("/register")}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-6 py-2 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Get Started
                </Button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={handleMobileMenuToggle}
                className="sm:hidden flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6 text-gray-700" />
                ) : (
                  <Menu className="h-6 w-6 text-gray-700" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Mobile Menu Panel */}
          <div className="fixed right-0 top-0 h-full w-80 max-w-full bg-white shadow-2xl transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Sports Journal
                  </h2>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Close mobile menu"
                >
                  <X className="h-6 w-6 text-gray-700" />
                </button>
              </div>

              {/* Mobile Menu Navigation */}
              <nav className="flex-1 p-4 space-y-2">
                <button
                  onClick={() => {
                    const element = document.getElementById('features');
                    element?.scrollIntoView({ behavior: 'smooth' });
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                >
                  Features
                </button>
                <button
                  onClick={() => {
                    const element = document.getElementById('how-it-works');
                    element?.scrollIntoView({ behavior: 'smooth' });
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                >
                  How It Works
                </button>
                <button
                  onClick={() => {
                    const element = document.getElementById('testimonials');
                    element?.scrollIntoView({ behavior: 'smooth' });
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                >
                  Testimonials
                </button>
                <button
                  onClick={() => handleNavClick("/pricing")}
                  className="w-full text-left px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                >
                  Pricing
                </button>
              </nav>

              {/* Mobile Menu Auth Section */}
              <div className="p-4 border-t border-gray-200 space-y-3">
                <Button
                  variant="outline"
                  onClick={() => handleNavClick("/login")}
                  className="w-full text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50 font-medium"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => handleNavClick("/register")}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
