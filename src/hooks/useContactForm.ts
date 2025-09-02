import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { ContactForm, ROIInputs, ROIResults } from '@/types/roi';

export function useContactForm() {
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [contactForm, setContactForm] = useState<ContactForm>({
    firstName: '',
    lastName: '',
    email: '',
    company: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const updateContactForm = (field: keyof ContactForm, value: string) => {
    setContactForm(prev => ({ ...prev, [field]: value }));
  };

  const resetContactForm = () => {
    setContactForm({
      firstName: '',
      lastName: '',
      email: '',
      company: ''
    });
  };

  const isFormValid = (): boolean => {
    return Boolean(contactForm.firstName && 
                  contactForm.lastName && 
                  contactForm.email && 
                  contactForm.company);
  };

  const submitContactForm = async (inputs: ROIInputs, results: ROIResults) => {
    if (!isFormValid()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {

      const { data, error } = await supabase.functions.invoke('send-roi-report', {
        body: {
          userInfo: contactForm,
          inputs: {
            annualRevenue: inputs.annualRevenue.toString(),
            displayShare: inputs.displayShare,
            videoShare: inputs.videoShare,
            chromePercentage: inputs.chromePercentage,
            performanceCampaignPercentage: inputs.performanceCampaignPercentage
          },
          results
        }
      });

      if (error) {
        toast({
          title: "Error",
          description: `Failed to send email: ${error.message}`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success!",
          description: "Your CAPI impact report has been sent successfully.",
        });
        setShowContactDialog(false);
        resetContactForm();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: `An unexpected error occurred: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    showContactDialog,
    setShowContactDialog,
    contactForm,
    updateContactForm,
    resetContactForm,
    isSubmitting,
    isFormValid,
    submitContactForm,
  };
}