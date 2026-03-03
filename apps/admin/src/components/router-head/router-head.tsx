import { component$ } from '@builder.io/qwik';
import { useDocumentHead, useLocation } from '@builder.io/qwik-city';

export const RouterHead = component$(() => {
  const head = useDocumentHead();
  const loc = useLocation();

  return (
    <>
      <title>{head.title?.trim() || 'Profit Lens Admin'}</title>
      <link rel="canonical" href={loc.url.href} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      {head.meta.map((meta) => (
        <meta key={meta.key} {...meta} />
      ))}

      {head.links.map((link) => (
        <link key={link.key} {...link} />
      ))}

      {head.styles.map((style) => (
        <style
          key={style.key}
          {...style.props}
          {...(style.props?.dangerouslySetInnerHTML
            ? {}
            : { dangerouslySetInnerHTML: style.style })}
        />
      ))}

      {head.scripts.map((script) => (
        <script
          key={script.key}
          {...script.props}
          {...(script.props?.dangerouslySetInnerHTML
            ? {}
            : { dangerouslySetInnerHTML: script.script })}
        />
      ))}
    </>
  );
});
