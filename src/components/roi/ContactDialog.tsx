import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ContactForm } from '@/types/roi';

interface ContactDialogProps {
  showContactDialog: boolean;
  onOpenChange: (open: boolean) => void;
  contactForm: ContactForm;
  onUpdateContactForm: (field: keyof ContactForm, value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isFormValid: boolean;
}

export function ContactDialog({
  showContactDialog,
  onOpenChange,
  contactForm,
  onUpdateContactForm,
  onSubmit,
  isSubmitting,
  isFormValid
}: ContactDialogProps) {
  return (
    <Dialog open={showContactDialog} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-brand-primary">
            Download Your CAPI Impact Report
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={contactForm.firstName}
                onChange={(e) => onUpdateContactForm('firstName', e.target.value)}
                placeholder="John"
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={contactForm.lastName}
                onChange={(e) => onUpdateContactForm('lastName', e.target.value)}
                placeholder="Doe"
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={contactForm.email}
              onChange={(e) => onUpdateContactForm('email', e.target.value)}
              placeholder="sales@adfixus.com"
              required
            />
          </div>
          <div>
            <Label htmlFor="company">Company *</Label>
            <Input
              id="company"
              value={contactForm.company}
              onChange={(e) => onUpdateContactForm('company', e.target.value)}
              placeholder="Your Company"
              required
            />
          </div>
          <Button 
            onClick={onSubmit}
            disabled={!isFormValid || isSubmitting}
            className="w-full text-white font-semibold bg-brand-secondary hover:bg-brand-secondary/90"
          >
            {isSubmitting ? 'Generating Report...' : 'Download Report'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}