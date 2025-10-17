import { DialogModal } from '@/components/ui/DialogModal';
import { Customer } from '@/types/customer';
import { formatDistanceToNow } from '@/utils';
import { getCustomerStatus } from '@/utils/customerStatus';
import { AnimatedListItem } from '@/components/animations';

interface CustomerListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  customers: Customer[];
  loading: boolean;
  onWhatsApp: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  onCheckLojaCampinas?: (customer: Customer) => void; // Opcional
  onCheckLojaDomPedro?: (customer: Customer) => void; // Opcional
}

export function CustomerListModal({
  isOpen,
  onClose,
  title,
  customers,
  loading,
  onWhatsApp,
  onDelete,
  onCheckLojaCampinas,
  onCheckLojaDomPedro,
}: CustomerListModalProps) {
  return (
    <DialogModal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="max-h-[60vh] overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <i className="fa-solid fa-spinner fa-spin text-blue-500 text-3xl"></i>
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <i className="fa-solid fa-inbox text-gray-400 text-2xl"></i>
            </div>
            <p className="text-gray-600 font-medium">
              Nenhum cliente encontrado
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {customers.map((customer, index) => {
              const status = getCustomerStatus(customer.dataCriacao);

              return (
                <AnimatedListItem key={customer.id} index={index}>
                  <div
                    className={`bg-gray-50 rounded-lg p-4 border-l-4 hover:shadow-md transition-shadow duration-200 ${status.borderClass}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-semibold text-gray-900">
                              {customer.cliente}
                            </h3>
                            <span
                              className={`inline-block w-2 h-2 rounded-full ${status.dotClass}`}
                              title={status.label}
                            ></span>
                          </div>
                          {customer.vendedor && (
                            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                              {customer.vendedor}
                            </span>
                          )}
                        </div>
                        <span className={`text-xs block mb-1 ${status.textClass}`}>
                          Aguardando há{' '}
                          {formatDistanceToNow(customer.dataCriacao)}
                        </span>
                      <div className="space-y-2">
                        <span className="text-sm text-gray-600 block">
                          {customer.celular}
                        </span>

                        {/* Botões de Ação */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Botão 1: Contatar Cliente */}
                          <button
                            onClick={() => onWhatsApp(customer)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors"
                            title="Avisar cliente que temos em outra loja"
                          >
                            <i className="fa-brands fa-whatsapp"></i>
                            <span>Cliente</span>
                          </button>

                          {/* Botão 2: Consultar Loja Campinas (só aparece se a função foi passada) */}
                          {onCheckLojaCampinas && (
                            <button
                              onClick={() => onCheckLojaCampinas(customer)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors"
                              title="Consultar disponibilidade na Loja Campinas"
                            >
                              <i className="fa-solid fa-store"></i>
                              <span>Campinas</span>
                            </button>
                          )}

                          {/* Botão 3: Consultar Loja Dom Pedro (só aparece se a função foi passada) */}
                          {onCheckLojaDomPedro && (
                            <button
                              onClick={() => onCheckLojaDomPedro(customer)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-500 text-white text-xs rounded-lg hover:bg-purple-600 transition-colors"
                              title="Consultar disponibilidade na Loja Dom Pedro"
                            >
                              <i className="fa-solid fa-store"></i>
                              <span>Dom Pedro</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => onDelete(customer)}
                      className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Excluir cliente"
                    >
                      <i className="fa-regular fa-trash-can text-base"></i>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500 text-xs">Modelo:</span>
                      <p className="font-semibold text-gray-900">
                        {customer.modelo}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs">Ref:</span>
                      <p className="font-semibold text-gray-900">
                        {customer.referencia}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs">Nº:</span>
                      <p className="font-semibold text-gray-900">
                        {customer.numeracao}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs">Cor:</span>
                      <p className="font-semibold text-gray-900">
                        {customer.cor}
                      </p>
                    </div>
                  </div>
                </div>
              </AnimatedListItem>
              );
            })}
          </div>
        )}
      </div>
    </DialogModal>
  );
}
