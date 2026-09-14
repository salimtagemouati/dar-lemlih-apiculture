'use server';

import { resetPassword as apiResetPassword } from '@/lib/api/auth';

type ResetActionResult =
  | { success: true; message: string }
  | { success: false; error: string };

export async function resetPasswordAction(token: string, newPassword: string): Promise<ResetActionResult> {
  try {
    const result = await apiResetPassword(token, newPassword);
    return { success: true, message: result.message };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Reset failed'
    };
  }
}
