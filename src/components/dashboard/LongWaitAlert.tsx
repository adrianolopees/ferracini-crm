import { AnimatedContainer } from '@/components/animations';

interface LongWaitAlertProps {
  count: number;
  loading: boolean;
  onClick: () => void;
}

function LongWaitAlert({ count, loading, onClick }: LongWaitAlertProps) {
  if (loading || count === 0) return null;

  return (
    <AnimatedContainer type="slideDown" delay={0.4}>
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <i className="fa-solid fa-clock text-yellow-600 text-xl mr-3"></i>
            <div>
              <p className="text-sm font-medium text-yellow-800">
                {count} cliente{count > 1 ? 's' : ''} aguardando há 30+ dias
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                {count > 1 ? 'Foram movidos' : 'Foi movido'} automaticamente para Histórico → 30+ dias
              </p>
            </div>
          </div>
          <button
            onClick={onClick}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
          >
            Ver Lista
          </button>
        </div>
      </div>
    </AnimatedContainer>
  );
}

export default LongWaitAlert;
