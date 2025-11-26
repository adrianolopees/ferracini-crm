/**
 * 🔧 PÁGINA DE MIGRAÇÃO TEMPORÁRIA
 *
 * Esta página adiciona workspaceId: "real" em todos os customers existentes
 *
 * INSTRUÇÕES:
 * 1. Adicione esta rota temporariamente no App.tsx:
 *    <Route path="/migrate" element={<MigrateWorkspace />} />
 *
 * 2. Logue com sua conta REAL
 *
 * 3. Acesse: http://localhost:5173/migrate
 *
 * 4. Clique no botão "Iniciar Migração"
 *
 * 5. Aguarde concluir
 *
 * 6. REMOVA a rota do App.tsx depois de usar
 */

import { useState } from 'react';
import { collection, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { PageLayout, Button } from '@/components/ui';

interface MigrationStats {
  total: number;
  migrated: number;
  skipped: number;
  errors: number;
}

function MigrateWorkspace() {
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [stats, setStats] = useState<MigrationStats>({ total: 0, migrated: 0, skipped: 0, errors: 0 });

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()} - ${message}`]);
  };

  const migrateCustomers = async () => {
    setStatus('running');
    setLogs([]);
    addLog('🚀 Iniciando migração...');

    try {
      // Buscar todos os customers
      addLog('🔍 Buscando customers no Firestore...');
      const customersRef = collection(db, 'customers');
      const snapshot = await getDocs(customersRef);

      addLog(`📊 Encontrados ${snapshot.size} customers`);

      if (snapshot.empty) {
        addLog('⚠️ Nenhum customer encontrado');
        setStatus('success');
        return;
      }

      const batch = writeBatch(db);
      let migratedCount = 0;
      let skippedCount = 0;
      let errorCount = 0;

      // Processar cada customer
      for (const docSnap of snapshot.docs) {
        try {
          const data = docSnap.data();
          const customerName = data.name || 'Sem nome';

          if (data.workspaceId) {
            addLog(`⏭️ "${customerName}" → Já tem workspaceId: ${data.workspaceId}`);
            skippedCount++;
          } else {
            batch.update(docSnap.ref, { workspaceId: 'real' });
            addLog(`✅ "${customerName}" → Adicionando workspaceId: "real"`);
            migratedCount++;
          }
        } catch (error) {
          errorCount++;
          addLog(`❌ Erro ao processar customer: ${error}`);
        }
      }

      // Salvar alterações
      if (migratedCount > 0) {
        addLog(`\n💾 Salvando ${migratedCount} alterações no Firestore...`);
        await batch.commit();
        addLog('✅ Alterações salvas com sucesso!');
      }

      // Atualizar estatísticas
      setStats({
        total: snapshot.size,
        migrated: migratedCount,
        skipped: skippedCount,
        errors: errorCount,
      });

      addLog('\n═══════════════════════════════════════');
      addLog('🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!');
      addLog('═══════════════════════════════════════');
      addLog(`📊 Total: ${snapshot.size} customers`);
      addLog(`✅ Migrados: ${migratedCount}`);
      addLog(`⏭️ Pulados: ${skippedCount}`);
      if (errorCount > 0) {
        addLog(`❌ Erros: ${errorCount}`);
      }
      addLog('═══════════════════════════════════════');
      addLog('\n💡 Recarregue o Dashboard para ver os dados!');

      setStatus('success');
    } catch (error) {
      addLog(`\n❌ ERRO CRÍTICO: ${error}`);
      console.error('Erro na migração:', error);
      setStatus('error');
    }
  };

  return (
    <PageLayout
      title="Migração de"
      highlight="Workspace"
      subtitle="Adiciona workspaceId aos customers existentes"
    >
      <div className="max-w-4xl mx-auto px-4">
        {/* Card de Aviso */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-6 rounded-lg">
          <div className="flex items-start">
            <i className="fa-solid fa-triangle-exclamation text-yellow-400 text-2xl mr-4 mt-1"></i>
            <div>
              <h3 className="text-lg font-bold text-yellow-800 mb-2">⚠️ Atenção</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Esta página é temporária e deve ser removida após o uso</li>
                <li>• Execute a migração apenas UMA VEZ</li>
                <li>• Certifique-se de estar logado com a conta REAL</li>
                <li>• Esta ação adiciona workspaceId: "real" em todos os customers sem workspace</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Card de Estatísticas */}
        {stats.total > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Estatísticas</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-blue-600 text-sm font-medium">Total</div>
                <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-green-600 text-sm font-medium">Migrados</div>
                <div className="text-2xl font-bold text-green-900">{stats.migrated}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-gray-600 text-sm font-medium">Pulados</div>
                <div className="text-2xl font-bold text-gray-900">{stats.skipped}</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-red-600 text-sm font-medium">Erros</div>
                <div className="text-2xl font-bold text-red-900">{stats.errors}</div>
              </div>
            </div>
          </div>
        )}

        {/* Botão de Migração */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 text-center">
          <Button
            onClick={migrateCustomers}
            disabled={status === 'running'}
            variant="primary"
            className="px-8 py-3 text-lg"
          >
            {status === 'running' && <i className="fa-solid fa-spinner fa-spin mr-2"></i>}
            {status === 'idle' && '🚀 Iniciar Migração'}
            {status === 'running' && 'Migrando...'}
            {status === 'success' && '✅ Migração Concluída'}
            {status === 'error' && '❌ Erro na Migração'}
          </Button>

          {status === 'success' && (
            <div className="mt-4">
              <p className="text-green-600 font-medium mb-2">✅ Migração concluída com sucesso!</p>
              <a href="/dashboard" className="text-blue-600 hover:underline">
                → Voltar para o Dashboard
              </a>
            </div>
          )}
        </div>

        {/* Console de Logs */}
        <div className="bg-gray-900 rounded-xl shadow-lg p-6 overflow-hidden">
          <h3 className="text-white text-lg font-bold mb-4 flex items-center">
            <i className="fa-solid fa-terminal mr-2"></i>
            Console de Logs
          </h3>
          <div className="bg-black rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <div className="text-gray-500">Aguardando início da migração...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="text-green-400 mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export default MigrateWorkspace;
