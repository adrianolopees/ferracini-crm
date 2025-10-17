import { Customer } from '@/types/customer';

const domPedroNumber = '19996821710';
const campinasNumber = '19982215561';

function formatPhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

function openWhatsApp(phone: string, message: string) {
  const cleanPhone = formatPhone(phone);

  // Usa wa.me (formato original que funcionava)
  const url = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;

  window.open(url, '_blank');
}

export function notifyProductArrived(customer: Customer) {
  const message = `Oi ${customer.cliente}! Ferracini Maxi Shopping aqui! O ${customer.modelo} que você procurava chegou! Posso reservar pra você?`;
  openWhatsApp(customer.celular, message);
}

export function notifyOtherStore(customer: Customer) {
  const message = `Oi ${customer.cliente}! Ferracini Maxi Shopping aqui! Não temos o ${customer.modelo} agora, mas temos em outra loja! Podemos trazer pra você e avisar quando chegar. Quer que a gente faça isso?`;
  openWhatsApp(customer.celular, message);
}

export function checkLojaDomPedro(customer: Customer) {
  const message = `Olá, Vocês têm disponível o ${customer.modelo}, ref ${customer.referencia} número ${customer.numeracao}, ${customer.cor}?`;
  openWhatsApp(domPedroNumber, message);
}

export function checkLojaCampinas(customer: Customer) {
  const message = `Olá, Vocês têm disponível o ${customer.modelo}, ref ${customer.referencia} número ${customer.numeracao}, ${customer.cor}?`;
  openWhatsApp(campinasNumber, message);
}

export function sendGenericMessage(customer: Customer) {
  const message = `Oi ${customer.cliente}! Ferracini Maxi Shopping aqui! Tudo bem?`;
  openWhatsApp(customer.celular, message);
}
