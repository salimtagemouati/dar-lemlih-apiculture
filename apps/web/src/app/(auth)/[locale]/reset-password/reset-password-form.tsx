'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { resetPasswordAction } from '@/app/actions/password';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Locale } from '@/i18n/routing';

const schema = z
  .object({
    password: z.string().min(8, 'Au moins 8 caractères'),
    confirmPassword: z.string()
  })
  .refine(v => v.password === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Les mots de passe ne correspondent pas'
  });

type Values = z.infer<typeof schema>;

export function ResetPasswordForm({ token, locale }: { token: string; locale: Locale }) {
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const router = useRouter();

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' }
  });

  const onSubmit = form.handleSubmit(values => {
    startTransition(async () => {
      const result = await resetPasswordAction(token, values.password);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message);
      setDone(true);
      setTimeout(() => router.replace(`/${locale}/login` as `/${string}`), 1500);
    });
  });

  if (done) {
    return (
      <p className="rounded-2xl border border-atlas-200/40 bg-atlas-50/60 p-4 text-center text-sm text-atlas-800 dark:border-atlas-800/40 dark:bg-atlas-950/30 dark:text-atlas-300">
        Mot de passe mis à jour. Redirection vers la connexion…
      </p>
    );
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <Input
        type="password"
        placeholder="Nouveau mot de passe"
        {...form.register('password')}
        error={!!form.formState.errors.password}
      />
      <Input
        type="password"
        placeholder="Confirmer le mot de passe"
        {...form.register('confirmPassword')}
        error={!!form.formState.errors.confirmPassword}
      />
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? '…' : 'Mettre à jour'}
      </Button>
    </form>
  );
}
