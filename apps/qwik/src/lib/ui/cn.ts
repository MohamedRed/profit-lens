import type { ClassList } from '@builder.io/qwik';

const normalizeClass = (value: ClassList | null | undefined): string[] => {
  if (!value) {
    return [];
  }

  if (typeof value === 'string') {
    return value.trim() ? [value] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => normalizeClass(item));
  }

  return Object.entries(value)
    .filter(([, enabled]) => Boolean(enabled))
    .map(([className]) => className);
};

export const cn = (...parts: Array<ClassList | null | undefined>) => {
  return parts.flatMap((part) => normalizeClass(part)).join(' ');
};
