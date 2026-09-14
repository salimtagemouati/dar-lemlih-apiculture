import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { Section } from '@/components/blocks/section';
import { ContactForm } from '@/components/blocks/contact-form';
import { Mail, MapPin, Clock } from 'lucide-react';

export async function generateMetadata({ params }: { params: { locale: Locale } }): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'contact' });
  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

export default async function ContactPage({ params }: { params: { locale: Locale } }) {
  setRequestLocale(params.locale);

  const t = await getTranslations({ locale: params.locale, namespace: 'contact' });

  const contactInfo = [
    { icon: Mail, label: t('info.email'), href: 'mailto:concierge@dar-lemlih.com' },
    { icon: MapPin, label: t('info.location'), href: '#' },
    { icon: Clock, label: t('info.hours'), href: '#' },
  ];

  return (
    <>
      <Section>
        <div className="mb-14 space-y-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.5em] text-amber-600 dark:text-amber-400">
            Dar Lemlih
          </p>
          <h1 className="font-display text-hero text-charcoal-900 dark:text-amber-50">
            {t('title')}
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-charcoal-600 dark:text-charcoal-300">
            {t('subtitle')}
          </p>
        </div>
      </Section>

      <Section background="warm">
        <div className="grid gap-10 lg:grid-cols-[1fr,1.2fr] lg:gap-16">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="space-y-6">
              {contactInfo.map((item, index) => {
                const Icon = item.icon;
                return (
                  <a
                    key={index}
                    href={item.href}
                    className="flex items-start gap-4 rounded-2xl border border-white/15 bg-white/60 p-5 shadow-glass backdrop-blur-sm transition-all duration-300 hover:shadow-elevated hover:-translate-y-0.5 dark:border-white/8 dark:bg-charcoal-900/50"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100/80 dark:bg-amber-900/20">
                      <Icon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <span className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300">
                      {item.label}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Contact Form */}
          <div className="rounded-3xl border border-white/20 bg-white/70 p-8 shadow-glass backdrop-blur-xl sm:p-10 dark:border-white/8 dark:bg-charcoal-900/60">
            <ContactForm locale={params.locale} />
          </div>
        </div>
      </Section>
    </>
  );
}
