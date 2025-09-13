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
      
      // Send email with PDF contents and contact details
      const response = await fetch(`https://ojtfnhzqhfsprebvpmvx.supabase.co/functions/v1/send-pdf-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qdGZuaHpxaGZzcHJlYnZwbXZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NDQwNDQsImV4cCI6MjA2ODEyMDA0NH0.4EQ-NFJWqu9v3VXzk21g_O-sEmNr7y6kDoYrgICc584`
        },
        body: JSON.stringify({
          contactForm,
          inputs,
          results
        })
      });

      if (!response.ok) {
        console.error('Email sending failed:', await response.text());
        // Don't fail the entire process if email fails
      }
      
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