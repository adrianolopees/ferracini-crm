import { useMemo } from 'react';
import type { Customer, ArchiveReason } from '@/schemas/customerSchema';

interface LossReasonsChartProps {
  archived: Customer[];
  loading?: boolean;
}

const REASON_CONFIG: Record<
  ArchiveReason,
  { label: string; icon: string; color: string; bg: string; bar: string }
> = {
  gave_up: {
    label: 'Desistiu',
    icon: 'fa-solid fa-person-walking-arrow-right',
    color: 'text-red-600',
    bg: 'bg-red-50',
    bar: 'bg-red-400',
  },
  no_response: {
    label: 'Não Respondeu',
    icon: 'fa-solid fa-phone-slash',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    bar: 'bg-amber-400',
  },
  bought_elsewhere: {
    label: 'Comprou Fora',
    icon: 'fa-solid fa-store',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    bar: 'bg-orange-400',
  },
  product_unavailable: {
    label: 'Indisponível',
    icon: 'fa-solid fa-ban',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    bar: 'bg-purple-400',
  },
  exceeded_wait_time: {
    label: 'Tempo Excedido',
    icon: 'fa-solid fa-clock',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    bar: 'bg-blue-400',
  },
  other: {
    label: 'Outro',
    icon: 'fa-solid fa-circle-question',
    color: 'text-gray-500',
    bg: 'bg-gray-50',
    bar: 'bg-gray-400',
  },
};

const REASON_ORDER: ArchiveReason[] = [
  'gave_up',
  'no_response',
  'bought_elsewhere',
  'product_unavailable',
  'exceeded_wait_time',
  'other',
];

function LossReasonsChart({ archived, loading = false }: LossReasonsChartProps) {
  const reasons = useMemo(() => {
    const counts: Partial<Record<ArchiveReason, number>> = {};

    archived.forEach((customer) => {
      if (customer.archiveReason) {
        counts[customer.archiveReason] = (counts[customer.archiveReason] ?? 0) + 1;
      }
    });

    const total = archived.length;

    return REASON_ORDER.map((reason) => ({
      reason,
      count: counts[reason] ?? 0,
      pct: total > 0 ? Math.round(((counts[reason] ?? 0) / total) * 100) : 0,
      config: REASON_CONFIG[reason],
    }));
  }, [archived]);

  const hasData = archived.length > 0;

  return (
    <div className="mt-8 pt-6 border-t border-gray-100">
      <h3 className="text-base text-center font-semibold text-gray-700 mb-4 flex items-center justify-center gap-2">
        <i className="fa-solid fa-triangle-exclamation text-amber-500"></i>
        Por que perdemos clientes?
      </h3>

      {loading || !hasData ? (
        <p className="text-center text-sm text-gray-400 py-4">
          {loading ? 'Carregando...' : 'Nenhum cliente arquivado ainda'}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {reasons.map(({ reason, count, pct, config }) => (
              <div
                key={reason}
                className={`${config.bg} rounded-xl p-3 flex flex-col gap-2`}
              >
                <div className="flex items-center gap-2">
                  <i className={`${config.icon} ${config.color} text-sm`}></i>
                  <span className="text-xs font-medium text-gray-600 leading-tight">{config.label}</span>
                </div>

                <div className="flex items-end justify-between">
                  <span className={`text-xl font-bold ${config.color}`}>{count}</span>
                  <span className="text-xs text-gray-400 font-medium">{pct}%</span>
                </div>

                <div className="h-1.5 bg-white/70 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${config.bar} rounded-full transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400 text-center mt-3">
            {archived.length} cliente{archived.length !== 1 ? 's' : ''} arquivado{archived.length !== 1 ? 's' : ''} no total
          </p>
        </>
      )}
    </div>
  );
}

export default LossReasonsChart;
