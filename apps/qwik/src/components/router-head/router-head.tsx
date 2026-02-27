import { component$ } from '@builder.io/qwik';
import { useDocumentHead, useLocation } from '@builder.io/qwik-city';

/**
 * The RouterHead component is placed inside of the document `<head>` element.
 */
export const RouterHead = component$(() => {
  const head = useDocumentHead();
  const loc = useLocation();
  const base = import.meta.env.BASE_URL;
  const resolvedTitle = head.title?.trim() || 'Liive Profit';

  return (
    <>
      <title>{resolvedTitle}</title>

      <link rel="canonical" href={loc.url.href} />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
      />
      <link rel="icon" type="image/svg+xml" href={`${base}favicon.svg`} />
      <link rel="icon" type="image/png" sizes="192x192" href={`${base}icons/Icon-192-v2.png`} />
      <link rel="shortcut icon" href={`${base}icons/Icon-192-v2.png`} />
      <link rel="apple-touch-icon" sizes="180x180" href={`${base}apple-touch-icon-v2.png`} />

      {head.meta.map((m) => (
        <meta key={m.key} {...m} />
      ))}

      {head.links.map((l) => (
        <link key={l.key} {...l} />
      ))}

      {head.styles.map((s) => (
        <style
          key={s.key}
          {...s.props}
          {...(s.props?.dangerouslySetInnerHTML
            ? {}
            : { dangerouslySetInnerHTML: s.style })}
        />
      ))}

      {head.scripts.map((s) => (
        <script
          key={s.key}
          {...s.props}
          {...(s.props?.dangerouslySetInnerHTML
            ? {}
            : { dangerouslySetInnerHTML: s.script })}
        />
      ))}
    </>
  );
});
