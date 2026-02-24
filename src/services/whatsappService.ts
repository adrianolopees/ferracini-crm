import { Customer } from '@/schemas/customerSchema';
import { Store } from '@/schemas/storeSettingsSchema';
import { clearNumber } from '@/utils';

function openWhatsApp(phone: string, message: string) {
  const cleanPhone = clearNumber(phone);
  const url = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

/**
 * Envia mensagem para outra loja consultando disponibilidade
 */
export function sendToStore(customer: Customer, store: Store) {
  if (!store.phone) {
    throw new Error(`Telefone não configurado para a loja ${store.name}`);
  }
  const message = `Oi! Tudo bem? Vocês têm o ${customer.model}, ref ${customer.reference} número ${customer.size}, ${customer.color}?`;
  openWhatsApp(store.phone, message);
}

/**
 * Notifica cliente que produto chegou (usa loja principal)
 */
export function notifyProductArrived(customer: Customer, storeName: string) {
  const message = `Oi ${customer.name}! Ferracini ${storeName} aqui! O ${customer.model} que você procurava chegou! Está separado para você no caixa!`;
  openWhatsApp(customer.phone, message);
}

/**
 * Notifica cliente que tem produto em outra loja
 */
export function notifyOtherStore(customer: Customer, storeName: string) {
  const message = `Oi ${customer.name}! Ferracini ${storeName} aqui! Temos o modelo que você gostou em outra loja! Podemos trazer pra você e avisar quando chegar. Pode ser?`;
  openWhatsApp(customer.phone, message);
}

/**
 * Envia mensagem genérica para cliente
 */
export function sendGenericMessage(customer: Customer, storeName: string) {
  const message = `Oi ${customer.name}! Ferracini ${storeName} aqui! Tudo bem?`;
  openWhatsApp(customer.phone, message);
}
