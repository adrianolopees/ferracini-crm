interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'fullscreen';
}

function Spinner({ size = 'fullscreen' }: SpinnerProps) {
  if (size === 'fullscreen') {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
            <div
              className="w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin absolute top-0
  left-0"
            ></div>
          </div>
          <p className="text-gray-600 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  };

  return (
    <div
      className={`${sizes[size]} border-white border-t-transparent rounded-full animate-spin`}
    />
  );
}
export default Spinner;
