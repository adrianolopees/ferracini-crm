import { Spinner } from '../ui';

interface ActionCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: string;
  colorScheme: 'blue' | 'yellow' | 'green';
  loading?: boolean;
  onClick: () => void;
}

const CARD_COLORS = {
  blue: {
    border: 'border-blue-500',
    bg: 'bg-blue-100',
    icon: 'text-blue-600',
    spinner: 'text-blue-500',
  },
  yellow: {
    border: 'border-yellow-500',
    bg: 'bg-yellow-100',
    icon: 'text-yellow-600',
    spinner: 'text-yellow-500',
  },
  green: {
    border: 'border-green-500',
    bg: 'bg-green-100',
    icon: 'text-green-600',
    spinner: 'text-green-500',
  },
};

function ActionCard({ title, value, subtitle, icon, colorScheme, loading, onClick }: ActionCardProps) {
  const colors = CARD_COLORS[colorScheme];

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${colors.border} hover:shadow-lg transition-shadow cursor-pointer`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1 whitespace-nowrap ">{title}</p>
          <p className="text-3xl font-bold text-gray-900">
            {loading ? <Spinner size="md" color={colorScheme} /> : value}
          </p>
        </div>
        <div className={`${colors.bg} rounded-full p-4`}>
          <i className={`${icon} text-2xl ${colors.icon}`} />
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-4">{subtitle}</p>
    </div>
  );
}

export default ActionCard;
