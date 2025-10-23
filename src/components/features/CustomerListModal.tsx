import { DialogModal, Tabs } from '@/components/ui';
import { Customer } from '@/types/customer';
import { formatDistanceToNow } from '@/utils';
import { getCustomerStatus } from '@/utils/customerStatus';
import { AnimatedListItem } from '@/components/animations';

interface Tab {
  id: string;
  label: string;
  count?: number;
  icon?: string;
}

interface CustomerListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  customers: Customer[];
  loading: boolean;
  onWhatsApp: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  onCheckLojaCampinas?: (customer: Customer) => void;
  onCheckLojaDomPedro?: (customer: Customer) => void;
  onAcceptTransfer?: (
    customer: Customer,
    store: 'Campinas' | 'Dom Pedro'
  ) => void;
  onProductArrived?: (customer: Customer) => void;
  onPurchaseCompleted?: (customer: Customer) => void;
  // Novos handlers para sub-estados
  onStoreHasStock?: (customer: Customer) => void;
  onStoreNoStock?: (customer: Customer) => void;
  onClientAccepted?: (customer: Customer) => void;
  onClientDeclined?: (customer: Customer) => void;
  // Props opcionais para tabs
  tabs?: Tab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

function CustomerListModal({
  isOpen,
  onClose,
  title,
  customers,
  loading,
  onWhatsApp,
  onDelete,
  onCheckLojaCampinas,
  onCheckLojaDomPedro,
  onAcceptTransfer,
  onProductArrived,
  onPurchaseCompleted,
  onStoreHasStock,
  onStoreNoStock,
  onClientAccepted,
  onClientDeclined,
  tabs,
  activeTab,
  onTabChange,
}: CustomerListModalProps) {
  const content = (
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
          <p className="text-gray-600 font-medium">Nenhum cliente encontrado</p>
        </div>
      ) : (
        <div className="space-y-4">
          {customers.map((customer, index) => {
            const status = getCustomerStatus(customer.dataCriacao);

            return (
              <AnimatedListItem key={customer.id} index={index}>
                <div
                  className={`${customer.status === 'finalizado' ? 'bg-emerald-50/50 border-l-emerald-500' : `bg-gray-50 ${status.borderClass}`}
                    rounded-lg p-4 border-l-4 hover:shadow-md transition-shadow duration-200`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold text-gray-900">
                            {customer.cliente}
                          </h3>
                          {customer.status === 'finalizado' ? (
                            <i
                              className="fa-solid fa-circle-check text-emerald-600"
                              title="Venda Concluída"
                            ></i>
                          ) : (
                            <span
                              className={`inline-block w-2 h-2 rounded-full ${status.dotClass}`}
                              title={status.label}
                            ></span>
                          )}
                        </div>
                        {customer.vendedor && (
                          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                            {customer.vendedor}
                          </span>
                        )}
                      </div>
                      {customer.status === 'finalizado' &&
                      customer.dataFinalizacao ? (
                        <span className="text-xs block mb-1 text-emerald-600 font-medium">
                          Finalizada em{' '}
                          {new Date(
                            customer.dataFinalizacao
                          ).toLocaleDateString('pt-BR')}
                        </span>
                      ) : (
                        <span
                          className={`text-xs block mb-1 ${status.textClass}`}
                        >
                          Aguardando há{' '}
                          {formatDistanceToNow(customer.dataCriacao)}
                        </span>
                      )}
                      <div className="space-y-2">
                        <span className="text-sm text-gray-600 block">
                          {customer.celular}
                        </span>

                        {/* Botões de Ação baseados no status */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Status: AGUARDANDO - SUB-ESTADO 1: Inicial */}
                          {(!customer.status ||
                            customer.status === 'aguardando') &&
                            !customer.consultandoLoja &&
                            !customer.lojaTemEstoque && (
                              <>
                                {onCheckLojaCampinas && (
                                  <button
                                    onClick={() =>
                                      onCheckLojaCampinas(customer)
                                    }
                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
                                    title="Consultar disponibilidade na Loja Campinas"
                                  >
                                    <i className="fa-solid fa-store"></i>
                                    <span>Verificar Campinas</span>
                                  </button>
                                )}

                                {onCheckLojaDomPedro && (
                                  <button
                                    onClick={() =>
                                      onCheckLojaDomPedro(customer)
                                    }
                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-500 text-white text-xs rounded-lg hover:bg-purple-600 transition-colors cursor-pointer"
                                    title="Consultar disponibilidade na Loja Dom Pedro"
                                  >
                                    <i className="fa-solid fa-store"></i>
                                    <span>Verificar Dom Pedro</span>
                                  </button>
                                )}
                              </>
                            )}

                          {/* Status: AGUARDANDO - SUB-ESTADO 2: Aguardando resposta da LOJA */}
                          {(!customer.status ||
                            customer.status === 'aguardando') &&
                            customer.consultandoLoja &&
                            !customer.lojaTemEstoque && (
                              <>
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
                                  📞 Aguardando resposta -{' '}
                                  {customer.consultandoLoja}
                                </span>

                                <button
                                  onClick={() =>
                                    onStoreHasStock && onStoreHasStock(customer)
                                  }
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors cursor-pointer"
                                  title="Loja confirmou que tem o produto"
                                >
                                  <i className="fa-solid fa-check"></i>
                                  <span>Tem Estoque</span>
                                </button>

                                <button
                                  onClick={() =>
                                    onStoreNoStock && onStoreNoStock(customer)
                                  }
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-colors cursor-pointer"
                                  title="Loja não tem o produto"
                                >
                                  <i className="fa-solid fa-times"></i>
                                  <span>Não Tem</span>
                                </button>
                              </>
                            )}

                          {/* Status: AGUARDANDO - SUB-ESTADO 3: Aguardando resposta do CLIENTE */}
                          {(!customer.status ||
                            customer.status === 'aguardando') &&
                            customer.consultandoLoja &&
                            customer.lojaTemEstoque && (
                              <>
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">
                                  💬 Cliente notificado -{' '}
                                  {customer.consultandoLoja}
                                </span>

                                <button
                                  onClick={() =>
                                    onClientAccepted &&
                                    onClientAccepted(customer)
                                  }
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white text-xs rounded-lg hover:bg-emerald-600 transition-colors cursor-pointer"
                                  title="Cliente aceitou aguardar transferência"
                                >
                                  <i className="fa-solid fa-check"></i>
                                  <span>Cliente Aceitou</span>
                                </button>

                                <button
                                  onClick={() =>
                                    onClientDeclined &&
                                    onClientDeclined(customer)
                                  }
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-colors cursor-pointer"
                                  title="Cliente recusou a transferência"
                                >
                                  <i className="fa-solid fa-times"></i>
                                  <span>Cliente Recusou</span>
                                </button>
                              </>
                            )}

                          {/* Status: AGUARDANDO TRANSFERÊNCIA - Botão de produto chegou */}
                          {customer.status === 'aguardando_transferencia' &&
                            onProductArrived && (
                              <>
                                <span className="text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
                                  De: {customer.lojaOrigem}
                                </span>
                                <button
                                  onClick={() => onProductArrived(customer)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors cursor-pointer"
                                  title="Produto chegou"
                                >
                                  <i className="fa-solid fa-box"></i>
                                  <span>Produto Chegou</span>
                                </button>
                              </>
                            )}

                          {/* Status: PRONTO PARA RETIRADA - Botão de compra concluída */}
                          {customer.status === 'contactado' &&
                            onPurchaseCompleted && (
                              <button
                                onClick={() => onPurchaseCompleted(customer)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white text-xs rounded-lg hover:bg-emerald-600 transition-colors cursor-pointer"
                                title="Cliente comprou"
                              >
                                <i className="fa-solid fa-circle-check"></i>
                                <span>Cliente Comprou</span>
                              </button>
                            )}

                          {/* Status: FINALIZADO - Mostrar apenas info */}
                          {customer.status === 'finalizado' && (
                            <span className="text-xs text-emerald-700 bg-emerald-100 px-2 py-1 rounded">
                              ✓ Venda Concluída
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Só mostra botão de excluir se NÃO for finalizado */}
                    {customer.status !== 'finalizado' && (
                      <button
                        onClick={() => onDelete(customer)}
                        className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Arquivar cliente"
                      >
                        <i className="fa-regular fa-trash-can text-base"></i>
                      </button>
                    )}
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
  );

  return (
    <DialogModal isOpen={isOpen} onClose={onClose} title={title}>
      {tabs && activeTab && onTabChange ? (
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={onTabChange}>
          {content}
        </Tabs>
      ) : (
        content
      )}
    </DialogModal>
  );
}

export default CustomerListModal;
