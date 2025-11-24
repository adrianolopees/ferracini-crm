/**
 * Aplica máscara de telefone brasileiro no formato (XX) XXXXX-XXXX
 * Limita a entrada a 11 dígitos (DDD + número)
 *
 * @param value - String contendo o número (pode ter caracteres não numéricos)
 * @returns Número formatado com máscara
 *
 * @example
 * maskPhone('11987654321'); // "(11) 98765-4321"
 * maskPhone('1198765');     // "(11) 98765"
 * maskPhone('11');          // "11"
 */
export function maskPhone(value: string): string {
  const digits = clearNumber(value);
  const limited = digits.slice(0, 11);

  if (limited.length <= 2) return limited;
  if (limited.length <= 6) {
    return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
  }
  return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
}

/**
 * Remove todos os caracteres não numéricos de uma string
 *
 * @param value - String a ser limpa
 * @returns String contendo apenas dígitos
 *
 * @example
 * clearNumber('(11) 98765-4321'); // "11987654321"
 * clearNumber('abc123def456');    // "123456"
 */
export function clearNumber(value: string): string {
  return value.replace(/\D/g, '');
}
