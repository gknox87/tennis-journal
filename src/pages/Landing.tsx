
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock, Share2, Smartphone, ChevronRight, Mail, MessageCircle } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 md:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Elevate Your Game with Tennis Pal
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                Effortlessly track your matches, record training notes, and share your progress with your coach in seconds.
              </p>
              <div className="flex gap-4">
                <Button
                  size="lg"
                  className="btn-primary"
                  onClick={() => navigate("/login")}
                >
                  Get Started
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="relative h-[400px] lg:h-[500px] rounded-lg overflow-hidden">
              <img
                src="/public/placeholder.svg"
                alt="Tennis Pal App Interface"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-background rounded-lg shadow-sm">
              <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Super Simple</h3>
              <p className="text-muted-foreground">
                No complicated menus – log your match stats in just a few taps.
              </p>
            </div>
            <div className="p-6 bg-background rounded-lg shadow-sm">
              <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Quick</h3>
              <p className="text-muted-foreground">
                Record training notes in seconds – get back on court faster.
              </p>
            </div>
            <div className="p-6 bg-background rounded-lg shadow-sm">
              <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <Share2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Ease of Sharing</h3>
              <p className="text-muted-foreground">
                Seamlessly share performance updates with your coach via WhatsApp or email.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Track",
                description: "Quickly record match scores and key stats.",
                icon: <Smartphone className="h-6 w-6" />,
              },
              {
                title: "Analyse",
                description: "Review your performance trends with clear analytics.",
                icon: <Clock className="h-6 w-6" />,
              },
              {
                title: "Share",
                description: "Instantly share insights with your coach.",
                icon: <Share2 className="h-6 w-6" />,
              },
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="h-16 w-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What Players Say</h2>
          <div className="max-w-3xl mx-auto">
            <blockquote className="text-center">
              <p className="text-xl text-muted-foreground italic mb-6">
                "Tennis Pal's simplicity is its strength – my training has never been more organised!"
              </p>
              <footer className="font-semibold">Alex, Competitive Player</footer>
            </blockquote>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="py-12 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6">
            <h3 className="text-2xl font-bold">
              Ready to Transform Your Game?
            </h3>
            <Button
              size="lg"
              className="btn-primary"
              onClick={() => navigate("/login")}
            >
              Get Started Now
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
            <div className="flex justify-center gap-4 mt-8">
              <MessageCircle className="h-6 w-6 text-muted-foreground hover:text-primary cursor-pointer" />
              <Mail className="h-6 w-6 text-muted-foreground hover:text-primary cursor-pointer" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
