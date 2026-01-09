const dados1 = { nome: 'João', idade: 25 };
const dados2 = { cidade: 'SP', idade: 30 };
const mesclado = { ...dados1, ...dados2 };
console.log(mesclado);
/* import { UpdateStoreSchema } from '../schemas/storeSettingsSchema';

const partialUpdate = { phone: '(11)99999-9999' };
console.log(UpdateStoreSchema.safeParse(partialUpdate)); */

/* const validStore = {
  id: 'maxi',
  name: 'Maxi Shopping',
  phone: '(11) 91416-2842',
  color: '#F59E0B',
};

const result = StoreSchema.safeParse(validStore);

try {
  if (result.success) {
    console.log('✅ Válido', result);
  } else {
    console.log(result);
  }
} finally {
  console.log('terminou');
} */

/* const storeSettings = {
  workspaceId: 'maxi',
  defaultStoreId: 'store1',
  stores: [{ id: 'store2', name: 'Loja Campinas', phone: '(19) 99999-9999', color: '#FE5489' }],
  updatedAt: new Date().toISOString(),
  updatedBy: 'teste@email.com',
};

const resultSettings = StoreSettingsSchema.safeParse(storeSettings);

try {
  if (resultSettings.success) {
    console.log(resultSettings.data);
  } else {
    console.log(resultSettings);
  }
} finally {
  console.log('finalizou');
}
 */
