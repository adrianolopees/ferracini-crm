/**
 * Script para corrigir clientes finalizados que foram marcados como arquivados por engano
 *
 * Execute este script uma única vez para limpar dados inconsistentes.
 *
 * Como usar:
 * 1. Importe este script em algum lugar do app (ex: Dashboard)
 * 2. Chame a função fixFinalizedArchived() uma vez
 * 3. Remova a chamada depois da execução
 */

import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/services/firebase';

export async function fixFinalizedArchived() {
  try {
    console.log('🔧 Iniciando correção de clientes finalizados...');

    // Buscar todos os clientes finalizados que estão arquivados
    const q = query(
      collection(db, 'clientes'),
      where('status', '==', 'finalizado'),
      where('arquivado', '==', true)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log('✅ Nenhum cliente finalizado arquivado encontrado. Banco está correto!');
      return;
    }

    console.log(`📋 Encontrados ${snapshot.size} clientes finalizados arquivados (inconsistentes)`);

    let fixed = 0;
    const promises = snapshot.docs.map(async (document) => {
      const data = document.data();
      console.log(`  → Corrigindo: ${data.cliente}`);

      await updateDoc(doc(db, 'clientes', document.id), {
        arquivado: false,
        motivoArquivamento: null,
        dataArquivamento: null,
        observacoes: null,
      });

      fixed++;
    });

    await Promise.all(promises);

    console.log(`✅ Correção completa! ${fixed} clientes finalizados foram des-arquivados.`);
    alert(`✅ ${fixed} cliente(s) finalizado(s) foram corrigidos!`);

  } catch (error) {
    console.error('❌ Erro ao corrigir clientes:', error);
    alert('❌ Erro ao corrigir clientes. Verifique o console.');
  }
}
