/**
 * LongWaitCard Component
 *
 * Card usado na página de Histórico > Espera Longa
 * Layout compacto para clientes aguardando há mais de 30 dias
 *
 * Exibe:
 * - Tempo de espera em destaque
 * - Produto em linha compacta
 * - Data de registro
 * - Ações: Contactar e Arquivar
 *
 * @module components/history/LongWaitCard
 */

import { Customer } from '@/types/customer';
import { formatDate, getDaysWaiting } from '@/utils';

interface LongWaitCardProps {
  customer: Customer;
  onContact?: (customer: Customer) => void;
  onReadyForPickup?: (customer: Customer) => void;
  onArchive?: (customer: Customer) => void;
}

function LongWaitCard({ customer, onContact, onReadyForPickup, onArchive }: LongWaitCardProps) {
  const daysWaiting = getDaysWaiting(customer.createdAt);

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
      {/* Header - Tempo de Espera */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="bg-yellow-500 text-white rounded-full w-10 h-10 flex items-center justify-center">
            <i className="fa-solid fa-clock text-lg"></i>
          </div>
          <div>
            <p className="text-xs text-gray-500">Aguardando há</p>
            <p className="text-lg font-bold text-yellow-700">{daysWaiting} dias</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Registrado em</p>
          <p className="text-sm font-medium text-gray-700">{formatDate(customer.createdAt)}</p>
        </div>
      </div>

      {/* Cliente e Produto */}
      <div className="bg-white rounded-lg p-3 mb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <i className="fa-solid fa-user text-gray-400 text-sm"></i>
              <p className="font-semibold text-gray-800">{customer.name}</p>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <i className="fa-solid fa-shoe-prints text-gray-400 text-sm"></i>
              <p className="text-sm text-gray-600">
                {customer.model} - Ref: {customer.reference}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-palette text-gray-400 text-sm"></i>
              <p className="text-sm text-gray-600">
                Nº {customer.size} - {customer.color}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="flex gap-2">
        {onContact && (
          <button
            onClick={() => onContact(customer)}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium"
          >
            <i className="fa-brands fa-whatsapp"></i>
            Contactar
          </button>
        )}
        {onReadyForPickup && (
          <button
            onClick={() => onReadyForPickup(customer)}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium"
          >
            <i className="fa-solid fa-box-open"></i>
            Pronto
          </button>
        )}
        {onArchive && (
          <button
            onClick={() => onArchive(customer)}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium"
          >
            <i className="fa-solid fa-archive"></i>
            Arquivar
          </button>
        )}
      </div>
    </div>
  );
}

export default LongWaitCard;
