import { apiFetch } from './client';

export interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function sendContactMessage(request: ContactRequest): Promise<{ message: string }> {
  return apiFetch<{ message: string }>('/api/contact', {
    method: 'POST',
    body: { ...request },
    anonymous: true
  });
}
