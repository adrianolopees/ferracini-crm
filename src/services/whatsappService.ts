import { Customer } from '@/types/customer';

const domPedroNumber = '(19) 99682-1710';
const campinasNumber = '(19) 98221-5561';

function formatPhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

function openWhatsApp(phone: string, message: string) {
  const cleanPhone = formatPhone(phone);
  const url = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

export function notifyProductArrived(customer: Customer) {
  const message = `Oi ${customer.name}! Ferracini Maxi Shopping aqui! O ${customer.model} que você procurava chegou! Posso reservar pra você?`;
  openWhatsApp(customer.phone, message);
}

export function notifyOtherStore(customer: Customer) {
  const message = `Oi ${customer.name}! Ferracini Maxi Shopping aqui! Não temos o ${customer.model} agora, mas temos em outra loja! Podemos trazer pra você e avisar quando chegar. Quer que a gente faça isso?`;
  openWhatsApp(customer.phone, message);
}

export function checkLojaDomPedro(customer: Customer) {
  const message = `Olá, Vocês têm disponível o ${customer.model}, ref ${customer.reference} número ${customer.size}, ${customer.color}?`;
  openWhatsApp(domPedroNumber, message);
}

export function checkLojaCampinas(customer: Customer) {
  const message = `Olá, Vocês têm disponível o ${customer.model}, ref ${customer.reference} número ${customer.size}, ${customer.color}?`;
  openWhatsApp(campinasNumber, message);
}

export function sendGenericMessage(customer: Customer) {
  const message = `Oi ${customer.name}! Ferracini Maxi Shopping aqui! Tudo bem?`;
  openWhatsApp(customer.phone, message);
}
