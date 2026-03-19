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
      <div className="bg-red-50 border-l-4 border-red-300 p-4 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <i className="fa-solid fa-clock text-red-500 text-xl mr-3"></i>
            <div>
              <p className="text-sm font-medium text-red-700">
                {count} cliente{count > 1 ? 's' : ''} estão aguardando +30 dias
              </p>
              <p className="text-xs text-red-600 mt-1 hidden md:flex">
                {count > 1 ? 'Todos movidos' : 'Foi movido'} automaticamente para Histórico → +30 dias
              </p>
            </div>
          </div>
          <button
            onClick={onClick}
            className="px-4 py-2 bg-red-400 hover:bg-red-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
          >
            <i className="fa-solid fa-arrow-right text-red-700"></i>
          </button>
        </div>
      </div>
    </AnimatedContainer>
  );
}

export default LongWaitAlert;
