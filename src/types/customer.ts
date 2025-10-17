export interface Customer {
  id: string;
  cliente: string;
  celular: string;
  modelo: string;
  referencia: string;
  numeracao: string;
  cor: string;
  vendedor?: string; // Opcional para compatibilidade com clientes antigos
  dataCriacao: string;
}

export interface ContactedCustomer extends Customer {
  dataContacto: string;
}
