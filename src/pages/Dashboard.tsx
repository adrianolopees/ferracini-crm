import { useAuth } from '@/hooks/useAuth';
import { Navigation } from '@/components/ui';
import { AnimatedContainer } from '@/components/animations';

function Dashboard() {
  const { user } = useAuth();
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <Navigation />

      <main className="flex-1 overflow-y-auto bg-gray-50">
        <AnimatedContainer type="slideDown" className="text-center mb-8 mt-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900  mb-2">
            Painel
          </h1>
        </AnimatedContainer>
      </main>
    </div>
  );
}

export default Dashboard;
