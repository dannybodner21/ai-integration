import { supabase } from '@/lib/supabase'
import { sendWelcomeEmail, sendNewsletterConfirmation } from './resendService'

export interface EmailSubscription {
  email: string
  form_source: string
  first_name?: string
  last_name?: string
  phone_number?: string
}

export const subscribeToNewsletter = async (subscription: EmailSubscription) => {
  try {
    // Check if we're using the mock client (local development without env vars)
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      console.log('📧 Mock mode: Contact would be stored in Supabase:', subscription)
      
      // Still try to send welcome email even in mock mode
      try {
        await sendWelcomeEmail({
          email: subscription.email,
          firstName: subscription.first_name,
          lastName: subscription.last_name
        });
        console.log('📧 Welcome email sent (mock mode)');
      } catch (emailError) {
        console.log('📧 Welcome email failed (mock mode):', emailError);
      }
      
      return { success: true, data: null, message: 'Successfully subscribed (mock mode)' }
    }

    console.log('🔌 Connecting to Supabase...')
    console.log('📧 Inserting contact:', subscription)

    const { data, error } = await supabase
      .from('contacts')
      .insert([subscription])
      .select()

    if (error) {
      console.log('⚠️  Supabase error:', error)
      // If it's a duplicate email error, we can handle it gracefully
      if (error.code === '23505') { // Unique constraint violation
        return { success: true, message: 'Email already subscribed' }
      }
      throw error
    }

    console.log('✅ Contact successfully stored in Supabase:', data)
    
    // Send welcome email via Resend
    try {
      console.log('📧 Sending welcome email via Resend...')
      const emailResult = await sendWelcomeEmail({
        email: subscription.email,
        firstName: subscription.first_name,
        lastName: subscription.last_name
      });
      console.log('✅ Welcome email sent successfully:', emailResult);
    } catch (emailError) {
      console.error('❌ Error sending welcome email:', emailError)
      
      // Provide user-friendly feedback about what happened
      const errorMessage = (emailError as Error).message;
      if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
        console.warn('⚠️  Welcome email failed due to network issues, but subscription was successful!');
        console.warn('💡 This is common in development environments.');
        console.warn('💡 In production, this should work normally.');
      }
      
      // Don't fail the subscription if email fails - just log it
      // The user is still subscribed to the newsletter
    }
    
    return { success: true, data, message: 'Successfully subscribed' }
  } catch (error) {
    console.error('❌ Error subscribing to newsletter:', error)
    throw error
  }
}

// Function to send newsletter confirmation emails
export const sendNewsletterConfirmationEmail = async (email: string) => {
  try {
    const result = await sendNewsletterConfirmation(email);
    console.log('✅ Newsletter confirmation email sent:', result);
    return result;
  } catch (error) {
    console.error('❌ Error sending newsletter confirmation:', error);
    throw error;
  }
}
