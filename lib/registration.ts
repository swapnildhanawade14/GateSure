export type RegistrationType = 'resident' | 'vendor';

export function getRegistrationTypeLabel(type: RegistrationType): string {
  switch (type) {
    case 'resident':
      return 'Resident';
    case 'vendor':
      return 'Vendor';
    default:
      return 'Resident';
  }
}

export function buildRegistrationQrCode(type: RegistrationType, id: string): string {
  const prefix = type === 'vendor' ? 'VENDOR' : 'RESIDENT';
  return `${prefix}:${id}`;
}

export function parseRegistrationQrCode(value: string): { type: RegistrationType; id: string } | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const [prefix, ...rest] = trimmed.split(':');
  if (!prefix || !rest.length) return null;

  const id = rest.join(':');
  if (!id) return null;

  if (prefix === 'RESIDENT') return { type: 'resident', id };
  if (prefix === 'VENDOR') return { type: 'vendor', id };

  return null;
}

export function matchesRegistrationQrCode(
  value: string,
  type: RegistrationType,
  id: string
): boolean {
  return buildRegistrationQrCode(type, id) === value.trim();
}
