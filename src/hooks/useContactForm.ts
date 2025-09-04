import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { buildAdfixusProposalPdf } from '@/utils/pdfmakeGenerator';
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
      // Generate and download PDF report
      await buildAdfixusProposalPdf(inputs, results);
      
      toast({
        title: "Success!",
        description: "Your CAPI impact report has been downloaded successfully.",
      });
      
      setShowContactDialog(false);
      resetContactForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to generate report: ${error.message}`,
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