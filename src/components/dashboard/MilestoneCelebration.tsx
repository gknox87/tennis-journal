import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getMilestoneMessage } from '@/utils/streakCalculations';
import { Share2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MilestoneCelebrationProps {
  streak: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Simple confetti particle component
function ConfettiParticle({ delay, duration, left, color }: {
  delay: number;
  duration: number;
  left: string;
  color: string;
}) {
  return (
    <div
      className="absolute w-2 h-2 rounded-full"
      style={{
        left,
        backgroundColor: color,
        animation: `confetti-fall ${duration}s ease-in ${delay}s forwards`,
        opacity: 0,
      }}
    />
  );
}

// Confetti component
function Confetti() {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 2,
    left: `${Math.random() * 100}%`,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map(particle => (
        <ConfettiParticle key={particle.id} {...particle} />
      ))}
    </div>
  );
}

export function MilestoneCelebration({ streak, open, onOpenChange }: MilestoneCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const milestone = getMilestoneMessage(streak);

  useEffect(() => {
    if (open) {
      setShowConfetti(true);
      // Hide confetti after animation
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleShare = async () => {
    const text = `I just hit ${streak} days of journaling! ${milestone.title} ${milestone.emoji}\n\n${milestone.message}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: milestone.title,
          text,
        });
      } catch (error) {
        // User cancelled or error occurred
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(text);
        alert('Milestone message copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };

  return (
    <>
      {/* Confetti overlay */}
      {showConfetti && (
        <div className="fixed inset-0 z-[60] pointer-events-none">
          <Confetti />
        </div>
      )}

      {/* Milestone Dialog */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-white to-orange-50/50 border-2 border-orange-200 shadow-2xl">
          <DialogHeader className="text-center space-y-4">
            {/* Animated emoji */}
            <div className="flex justify-center">
              <div className="text-8xl animate-bounce">
                {milestone.emoji}
              </div>
            </div>

            <DialogTitle className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              {milestone.title}
            </DialogTitle>

            <DialogDescription className="text-base md:text-lg text-gray-700 font-medium">
              {milestone.message}
            </DialogDescription>

            <div className="pt-4">
              <p className="text-2xl md:text-3xl font-bold text-orange-600">
                {streak} Days Strong!
              </p>
            </div>
          </DialogHeader>

          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <Button
              onClick={handleShare}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share Achievement
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="flex-1"
            >
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add CSS for confetti animation */}
      <style>{`
        @keyframes confetti-fall {
          0% {
            opacity: 1;
            transform: translateY(-100vh) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: translateY(100vh) rotate(720deg);
          }
        }
      `}</style>
    </>
  );
}

