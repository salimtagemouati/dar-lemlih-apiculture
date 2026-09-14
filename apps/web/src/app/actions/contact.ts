'use server';

import { sendContactMessage } from '@/lib/api/contact';
import { ApiClientError } from '@/lib/api/client';

type ContactActionResult =
  | { success: true; message: string }
  | { success: false; error: string };

export async function submitContactAction(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<ContactActionResult> {
  try {
    const result = await sendContactMessage(input);
    return { success: true, message: result.message };
  } catch (e) {
    if (e instanceof ApiClientError) {
      return { success: false, error: e.message };
    }
    return {
      success: false,
      error: e instanceof Error ? e.message : "Échec de l'envoi"
    };
  }
}
