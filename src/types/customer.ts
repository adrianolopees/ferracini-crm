export interface Customer {
  id: string;
  cliente: string;
  celular: string;
  modelo: string;
  referencia: string;
  numeracao: string;
  cor: string;
  dataCriacao: string;
}

export interface ContactedCustomer extends Customer {
  dataContacto: string;
}
