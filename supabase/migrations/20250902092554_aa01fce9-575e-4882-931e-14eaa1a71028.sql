-- Fix RLS policies for leads table to restrict access properly
-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Only authenticated users can view leads" ON public.leads;

-- Create a more restrictive policy - only allow users to view their own leads if they have a user_id column
-- Or implement admin-only access. For now, let's make it admin-only since this appears to be internal lead data
CREATE POLICY "Only allow read access to leads for specific operations" 
ON public.leads 
FOR SELECT 
USING (false); -- Completely restrict SELECT access for now

-- Keep the insert policy as is since we want anonymous users to be able to create leads
-- But let's make the existing insert policy more explicit
DROP POLICY IF EXISTS "Anyone can create leads" ON public.leads;
CREATE POLICY "Allow anonymous lead creation" 
ON public.leads 
FOR INSERT 
WITH CHECK (true);