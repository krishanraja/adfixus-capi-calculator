import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowRight, Zap, TrendingUp, Shield } from 'lucide-react';

interface HeroStepProps {
  onNext: () => void;
}

export function HeroStep({ onNext }: HeroStepProps) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-4xl w-full text-center">
        {/* Main Logo */}
        <div className="mb-8">
          <img 
            src="/lovable-uploads/6c4484f1-aec6-4c58-99b0-b901b4e0655a.png" 
            alt="AdFixus Logo" 
            className="h-16 w-auto mx-auto mb-6"
          />
        </div>

        {/* Hero Content */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-brand-primary mb-6">
            Build a seamless and stable Conversion API with one contract.
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Discover how AdFixus unique Conversion API can boost your advertising performance and conversion tracking. Get a personalized plan in just a few minutes.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <div className="w-12 h-12 bg-brand-secondary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-brand-secondary" />
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold text-brand-primary mb-2">Revenue Growth</h3>
              <p className="text-sm text-muted-foreground">
                Increase conversion rates by up to 200% with enhanced data tracking
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <div className="w-12 h-12 bg-brand-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-brand-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold text-brand-primary mb-2">Privacy Compliant</h3>
              <p className="text-sm text-muted-foreground">
                Future-proof your campaigns against privacy changes
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <div className="w-12 h-12 bg-brand-purple/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-brand-purple" />
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold text-brand-primary mb-2">Quick Setup</h3>
              <p className="text-sm text-muted-foreground">
                Get started in minutes with our expert implementation team
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Button */}
        <Button 
          onClick={onNext}
          size="lg"
          className="bg-brand-secondary hover:bg-brand-secondary/90 text-white font-semibold px-8 py-4 text-lg"
        >
          Start Assessment
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}