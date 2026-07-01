import { Button } from '@/components/ui/button';
import { Phone, RotateCcw } from 'lucide-react';

interface NavigationProps {
  onReset: () => void;
}

const BOOKING_URL =
  import.meta.env.VITE_MEETING_BOOKING_URL ||
  'https://outlook.office.com/book/SalesTeambooking@adfixus.com';

export function Navigation({ onReset }: NavigationProps) {
  return (
    <nav className="bg-transparent border-b border-border/40 sticky top-0 z-50 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo — forced white so it's visible on the dark background. */}
          <div className="flex items-center gap-3">
            <img
              src="/lovable-uploads/6c4484f1-aec6-4c58-99b0-b901b4e0655a.png"
              alt="AdFixus"
              className="h-7 w-auto"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
            <span className="hidden sm:inline text-sm font-medium text-muted-foreground border-l border-border/60 pl-3">
              The CAPI Data Bridge
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              onClick={() => window.open(BOOKING_URL, '_blank')}
              className="btn-gradient border-0"
            >
              <Phone className="w-4 h-4 mr-2" />
              Book a meeting
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
