import { useMemo } from 'react';
import type { Customer } from '@/schemas/customerSchema';
import { getDaysBetween } from '@/utils';

interface FunnelSpeedChartProps {
  customers: Customer[];
  loading?: boolean;
}

interface StageMetrics {
  label: string;
  sublabel: string;
  icon: string;
  color: string;
  bg: string;
  avgDays: number | null;
  sampleSize: number;
}

function FunnelSpeedChart({ customers, loading = false }: FunnelSpeedChartProps) {
  const stages = useMemo((): StageMetrics[] => {
    const completed = customers.filter(
      (c) => c.status === 'completed' && !c.archived && c.completedAt
    );

    // Etapa 1: Cadastro → Produto chegou (createdAt → contactedAt)
    const withContact = completed.filter((c) => c.contactedAt);
    const avgCadastroToContato =
      withContact.length > 0
        ? withContact.reduce((sum, c) => sum + getDaysBetween(c.createdAt, c.contactedAt!), 0) /
          withContact.length
        : null;

    // Etapa 2: Produto chegou → Finalização (contactedAt → completedAt)
    const withContactAndComplete = completed.filter((c) => c.contactedAt && c.completedAt);
    const avgContatoToFinal =
      withContactAndComplete.length > 0
        ? withContactAndComplete.reduce(
            (sum, c) => sum + getDaysBetween(c.contactedAt!, c.completedAt!),
            0
          ) / withContactAndComplete.length
        : null;

    // Etapa 3: Ciclo total (createdAt → completedAt)
    const avgCicloTotal =
      completed.length > 0
        ? completed.reduce((sum, c) => sum + getDaysBetween(c.createdAt, c.completedAt!), 0) /
          completed.length
        : null;

    return [
      {
        label: 'Espera pelo Produto',
        sublabel: 'Do cadastro até notificação',
        icon: 'fa-solid fa-hourglass-start',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        avgDays: avgCadastroToContato !== null ? Math.round(avgCadastroToContato) : null,
        sampleSize: withContact.length,
      },
      {
        label: 'Retirada pelo Cliente',
        sublabel: 'Da notificação até finalização',
        icon: 'fa-solid fa-person-walking',
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        avgDays: avgContatoToFinal !== null ? Math.round(avgContatoToFinal) : null,
        sampleSize: withContactAndComplete.length,
      },
      {
        label: 'Ciclo Completo',
        sublabel: 'Do cadastro até a venda',
        icon: 'fa-solid fa-flag-checkered',
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        avgDays: avgCicloTotal !== null ? Math.round(avgCicloTotal) : null,
        sampleSize: completed.length,
      },
    ];
  }, [customers]);

  const hasData = stages.some((s) => s.sampleSize > 0);

  return (
    <div className="mt-8 pt-6 border-t border-gray-100">
      <h3 className="text-base text-center font-semibold text-gray-700 mb-4 flex items-center justify-center gap-2">
        <i className="fa-solid fa-gauge-high text-blue-500"></i>
        Velocidade do Funil
      </h3>

      {loading || !hasData ? (
        <p className="text-center text-sm text-gray-400 py-4">
          {loading ? 'Carregando...' : 'Nenhuma venda finalizada ainda'}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {stages.map((stage) => (
            <div key={stage.label} className={`${stage.bg} rounded-xl p-4 flex flex-col gap-1`}>
              <div className="flex items-center gap-2">
                <i className={`${stage.icon} ${stage.color} text-sm`}></i>
                <span className="text-xs font-semibold text-gray-600">{stage.label}</span>
              </div>

              <div className="mt-1">
                {stage.avgDays !== null ? (
                  <span className={`text-2xl font-bold ${stage.color}`}>
                    {stage.avgDays}
                    <span className="text-sm font-normal text-gray-400 ml-1">dias</span>
                  </span>
                ) : (
                  <span className="text-sm text-gray-400">Sem dados</span>
                )}
              </div>

              <p className="text-xs text-gray-400 mt-0.5">
                {stage.sublabel} · {stage.sampleSize} venda{stage.sampleSize !== 1 ? 's' : ''}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FunnelSpeedChart;
