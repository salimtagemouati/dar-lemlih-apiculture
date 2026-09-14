/**
 * Root not-found page.
 *
 * Because next-intl's getRequestConfig reads `headers()` (a dynamic API),
 * the built-in /_not-found route cannot be statically rendered.
 * Marking it force-dynamic prevents the prerender error during `next build`.
 */
export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-display text-6xl font-bold text-charcoal-900 dark:text-amber-50">
        404
      </h1>
      <p className="text-lg text-charcoal-600 dark:text-charcoal-300">
        Page introuvable — الصفحة غير موجودة — Page not found
      </p>
      <a
        href="/"
        className="mt-4 rounded-full bg-amber-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
      >
        Retour à l&apos;accueil
      </a>
    </div>
  );
}
