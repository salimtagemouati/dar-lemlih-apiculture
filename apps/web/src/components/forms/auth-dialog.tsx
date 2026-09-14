'use client';

import { useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { forgotPasswordAction, loginAction, registerAction } from '@/app/actions/auth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const registerSchema = loginSchema
  .extend({
    name: z.string().min(2),
    confirmPassword: z.string().min(8)
  })
  .refine(values => values.password === values.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword']
  });

const resetSchema = z.object({
  email: z.string().email()
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;
type ResetValues = z.infer<typeof resetSchema>;

type AuthTabsProps = {
  onAuthenticated?: () => void;
};

function AuthTabs({ onAuthenticated }: AuthTabsProps) {
  const t = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirectTo') ?? `/${locale}/account`;

  const [tab, setTab] = useState<'login' | 'register' | 'reset'>('login');
  const [isPending, startTransition] = useTransition();
  const [resetSent, setResetSent] = useState(false);

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' }
  });

  const resetForm = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: '' }
  });

  const handleAuthSuccess = () => {
    onAuthenticated?.();
    router.replace(redirectTo as `/${string}`);
    router.refresh();
  };

  const handleLogin = loginForm.handleSubmit(values => {
    startTransition(async () => {
      const result = await loginAction(values);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(t('success'));
      loginForm.reset();
      handleAuthSuccess();
    });
  });

  const handleRegister = registerForm.handleSubmit(values => {
    startTransition(async () => {
      const result = await registerAction({
        name: values.name,
        email: values.email,
        password: values.password
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(t('success'));
      registerForm.reset();
      handleAuthSuccess();
    });
  });

  const handleReset = resetForm.handleSubmit(values => {
    startTransition(async () => {
      const result = await forgotPasswordAction(values.email);
      // Backend always returns 200 with a generic message — display it as-is.
      toast.success(result.message);
      resetForm.reset();
      setResetSent(true);
    });
  });

  return (
    <Tabs
      value={tab}
      onValueChange={value => {
        setTab(value as typeof tab);
        setResetSent(false);
      }}
      className="space-y-6"
    >
      <TabsList className="w-full">
        <TabsTrigger value="login">{t('tabs.login')}</TabsTrigger>
        <TabsTrigger value="register">{t('tabs.register')}</TabsTrigger>
        <TabsTrigger value="reset">{t('tabs.reset')}</TabsTrigger>
      </TabsList>

      <TabsContent value="login" className="border-0 bg-transparent p-0 shadow-none">
        <form className="space-y-4" onSubmit={handleLogin}>
          <Input
            type="email"
            placeholder={t('email')}
            {...loginForm.register('email')}
            error={!!loginForm.formState.errors.email}
          />
          <Input
            type="password"
            placeholder={t('password')}
            {...loginForm.register('password')}
            error={!!loginForm.formState.errors.password}
          />
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? '…' : t('submit')}
          </Button>
          <button
            type="button"
            onClick={() => setTab('reset')}
            className="block w-full text-center text-xs text-charcoal-500 hover:text-amber-600"
          >
            {t('forgot')}
          </button>
        </form>
      </TabsContent>

      <TabsContent value="register" className="border-0 bg-transparent p-0 shadow-none">
        <form className="space-y-4" onSubmit={handleRegister}>
          <Input
            placeholder="Nom complet"
            {...registerForm.register('name')}
            error={!!registerForm.formState.errors.name}
          />
          <Input
            type="email"
            placeholder={t('email')}
            {...registerForm.register('email')}
            error={!!registerForm.formState.errors.email}
          />
          <Input
            type="password"
            placeholder={t('password')}
            {...registerForm.register('password')}
            error={!!registerForm.formState.errors.password}
          />
          <Input
            type="password"
            placeholder={t('confirmPassword')}
            {...registerForm.register('confirmPassword')}
            error={!!registerForm.formState.errors.confirmPassword}
          />
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? '…' : t('tabs.register')}
          </Button>
        </form>
      </TabsContent>

      <TabsContent value="reset" className="border-0 bg-transparent p-0 shadow-none">
        {resetSent ? (
          <div className="space-y-3 rounded-2xl border border-amber-200/40 bg-amber-50/60 p-6 text-center text-sm text-amber-800 dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-200">
            <p className="font-medium">Vérifiez votre boîte de réception.</p>
            <p>
              Si un compte existe avec cet email, un lien de réinitialisation a
              été envoyé.
            </p>
            <Button variant="ghost" size="sm" onClick={() => setTab('login')}>
              ← Retour à la connexion
            </Button>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleReset}>
            <p className="text-xs text-charcoal-500 dark:text-charcoal-400">
              Saisissez votre email — nous vous enverrons un lien pour
              réinitialiser votre mot de passe.
            </p>
            <Input
              type="email"
              placeholder={t('email')}
              {...resetForm.register('email')}
              error={!!resetForm.formState.errors.email}
            />
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? '…' : t('tabs.reset')}
            </Button>
          </form>
        )}
      </TabsContent>
    </Tabs>
  );
}

export function AuthDialog() {
  const t = useTranslations('auth');
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="rounded-full">
          {t('tabs.login')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('submit')}</DialogDescription>
        </DialogHeader>
        <AuthTabs onAuthenticated={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

export function AuthPanel() {
  const t = useTranslations('auth');

  return (
    <div className="mx-auto max-w-lg rounded-3xl border border-white/20 bg-white/80 p-10 shadow-glass backdrop-blur dark:border-white/10 dark:bg-charcoal-900/60">
      <div className="mb-8 space-y-2 text-center">
        <h1 className="font-display text-3xl font-semibold text-charcoal-900 dark:text-amber-50">
          {t('title')}
        </h1>
        <p className="text-sm text-charcoal-600 dark:text-charcoal-300">{t('submit')}</p>
      </div>
      <AuthTabs />
    </div>
  );
}
