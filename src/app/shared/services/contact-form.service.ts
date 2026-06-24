import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, Timestamp } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';

export interface ContactFormData {
  full_name: string;
  mobile: string;
  client_17293620987926: string; // Service Type
  client_16945026668577?: string; // Car Type
  client_16945026691088?: string; // Car Model
  client_16492513797105?: string; // Notes
  landing_page_slug?: string;
  landing_page_title?: string;
  created_at: any;
  status: 'new' | 'read' | 'replied';
}

@Injectable({
  providedIn: 'root'
})
export class ContactFormService {

  constructor(private firestore: Firestore) { }

  // Submit contact form
  submitContactForm(formData: Partial<ContactFormData>): Observable<string> {
    // ✅ Build contact data with proper defaults to avoid undefined values
    const contactData: any = {
      full_name: formData.full_name || '',
      mobile: formData.mobile || '',
      client_17293620987926: formData.client_17293620987926 || '',
      landing_page_slug: formData.landing_page_slug || '',
      landing_page_title: formData.landing_page_title || '',
      created_at: Timestamp.now(),
      status: 'new'
    };

    // ✅ Only add optional fields if they exist and are not undefined
    if (formData.client_16945026668577 !== undefined && formData.client_16945026668577 !== null) {
      contactData.client_16945026668577 = formData.client_16945026668577 || '';
    }
    if (formData.client_16945026691088 !== undefined && formData.client_16945026691088 !== null) {
      contactData.client_16945026691088 = formData.client_16945026691088 || '';
    }
    if (formData.client_16492513797105 !== undefined && formData.client_16492513797105 !== null) {
      contactData.client_16492513797105 = formData.client_16492513797105 || '';
    }

    const contactsRef = collection(this.firestore, 'contact_submissions');
    return from(addDoc(contactsRef, contactData)).pipe(
      map(docRef => docRef.id)
    );
  }

  // Send WhatsApp message
  sendWhatsAppMessage(phone: string, message: string): void {
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }

  // Send email (placeholder for future implementation)
  sendEmail(email: string, subject: string, message: string): void {
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    window.open(mailtoUrl);
  }
}
