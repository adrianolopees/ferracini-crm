export function maskPhone(value: string): string {
  const digits = clearNumber(value);
  const limited = digits.slice(0, 11);

  if (limited.length <= 2) return limited;
  if (limited.length <= 6) {
    return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
  }
  return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
}

export function clearNumber(value: string): string {
  return value.replace(/\D/g, '');
}
