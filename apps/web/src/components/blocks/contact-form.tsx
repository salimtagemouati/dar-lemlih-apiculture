'use client';

import { useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Send, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { submitContactAction } from '@/app/actions/contact';

const schema = z.object({
  name: z.string().min(2, 'Nom requis'),
  email: z.string().email('Email invalide'),
  subject: z.string().min(2, 'Sujet requis'),
  message: z.string().min(10, 'Message trop court')
});

type FormValues = z.infer<typeof schema>;

export function ContactForm({ locale: _locale }: { locale: string }) {
  const t = useTranslations('contact.form');
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', subject: '', message: '' }
  });

  const onSubmit = form.handleSubmit(values => {
    startTransition(async () => {
      const result = await submitContactAction(values);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(t('success'));
      form.reset();
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          placeholder={t('name')}
          {...form.register('name')}
          aria-label={t('name')}
          error={!!form.formState.errors.name}
        />
        <Input
          type="email"
          placeholder={t('email')}
          {...form.register('email')}
          aria-label={t('email')}
          error={!!form.formState.errors.email}
        />
      </div>
      <Input
        placeholder={t('subject')}
        {...form.register('subject')}
        aria-label={t('subject')}
        error={!!form.formState.errors.subject}
      />
      <textarea
        placeholder={t('message')}
        rows={5}
        {...form.register('message')}
        aria-label={t('message')}
        className="w-full resize-none rounded-2xl border-0 bg-white/80 px-4 py-3.5 text-sm text-charcoal-900 shadow-inner placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-amber-300/60 dark:bg-charcoal-900/60 dark:text-amber-50 dark:placeholder:text-charcoal-500 dark:focus:ring-amber-600/40"
      />
      {form.formState.errors.message && (
        <p className="-mt-3 text-xs text-red-600">{form.formState.errors.message.message}</p>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full rounded-full sm:w-auto"
        disabled={isPending}
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t('submit')}
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            {t('submit')}
          </span>
        )}
      </Button>
    </form>
  );
}
