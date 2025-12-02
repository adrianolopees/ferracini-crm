import { Spinner } from '@/components/ui';
interface MetricCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  icon: string;
  colorScheme: 'purple' | 'blue' | 'green' | 'emerald' | 'teal' | 'cyan';
  loading?: boolean;
}

const COLOR_SCHEMES = {
  purple: {
    gradient: 'from-purple-50 to-purple-100',
    border: 'border-purple-200',
    icon: 'text-purple-600',
    text: 'text-purple-700',
    number: 'text-purple-900',
    subtitle: 'text-purple-600',
  },
  blue: {
    gradient: 'from-blue-50 to-blue-100',
    border: 'border-blue-200',
    icon: 'text-blue-600',
    text: 'text-blue-700',
    number: 'text-blue-900',
    subtitle: 'text-blue-600',
  },
  green: {
    gradient: 'from-green-50 to-green-100',
    border: 'border-green-200',
    icon: 'text-green-600',
    text: 'text-green-700',
    number: 'text-green-900',
    subtitle: 'text-green-600',
  },
  emerald: {
    gradient: 'from-emerald-50 to-emerald-100',
    border: 'border-emerald-200',
    icon: 'text-emerald-600',
    text: 'text-emerald-700',
    number: 'text-emerald-900',
    subtitle: 'text-emerald-600',
  },
  teal: {
    gradient: 'from-teal-50 to-teal-100',
    border: 'border-teal-200',
    icon: 'text-teal-600',
    text: 'text-teal-700',
    number: 'text-teal-900',
    subtitle: 'text-teal-600',
  },
  cyan: {
    gradient: 'from-cyan-50 to-cyan-100',
    border: 'border-cyan-200',
    icon: 'text-cyan-600',
    text: 'text-cyan-700',
    number: 'text-cyan-900',
    subtitle: 'text-cyan-600',
  },
};

function MetricCard({ title, value, subtitle, icon, colorScheme, loading = false }: MetricCardProps) {
  const colors = COLOR_SCHEMES[colorScheme];

  return (
    <div className={`bg-gradient-to-br ${colors.gradient} rounded-lg p-4 border ${colors.border}`}>
      <div className="flex items-center gap-2 mb-2">
        <i className={`${icon} ${colors.icon}`} />
        <p className={`text-xs font-medium ${colors.text}`}>{title}</p>
      </div>
      <p className={`text-3xl font-bold ${colors.number}`}>
        {loading ? <Spinner size="md" color={colorScheme} /> : value}
      </p>
      <p className={`text-xs ${colors.subtitle} mt-1`}>{subtitle}</p>
    </div>
  );
}

export default MetricCard;
