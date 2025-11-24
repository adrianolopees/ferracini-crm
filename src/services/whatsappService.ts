import { Customer } from '@/schemas/customerSchema';
import { clearNumber } from '@/utils';

const domPedroNumber = '(19) 99682-1710';
const campinasNumber = '(19) 98221-5561';

function openWhatsApp(phone: string, message: string) {
  const cleanPhone = clearNumber(phone);
  const url = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

export function notifyProductArrived(customer: Customer) {
  const message = `Oi ${customer.name}! Ferracini Maxi Shopping aqui! O ${customer.model} que você procurava chegou! Está separado para você no caixa!`;
  openWhatsApp(customer.phone, message);
}

export function notifyOtherStore(customer: Customer) {
  const message = `Oi ${customer.name}! Ferracini Maxi Shopping aqui! Temos o modelo que você gostou em outra loja! Podemos trazer pra você e avisar quando chegar. Pode ser?`;
  openWhatsApp(customer.phone, message);
}

export function sendStoreDomPedro(customer: Customer) {
  const message = `Oi! Tudo bem? Vocês têm o ${customer.model}, ref ${customer.reference} número ${customer.size}, ${customer.color}?`;
  openWhatsApp(domPedroNumber, message);
}

export function sendStoreCampinas(customer: Customer) {
  const message = `Oi! Tudo bem? Vocês têm o ${customer.model}, ref ${customer.reference} número ${customer.size}, ${customer.color}?`;
  openWhatsApp(campinasNumber, message);
}

export function sendGenericMessage(customer: Customer) {
  const message = `Oi ${customer.name}! Ferracini Maxi Shopping aqui! Tudo bem?`;
  openWhatsApp(customer.phone, message);
}
