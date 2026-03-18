import { useState, useMemo } from 'react';
import DialogModal from './DialogModal';

interface ProductCount {
  name: string;
  count: number;
}

interface AllProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductCount[];
  totalReserves: number;
}

function AllProductsModal({ isOpen, onClose, products, totalReserves }: AllProductsModalProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, search]);

  const maxCount = products[0]?.count ?? 1;

  return (
    <DialogModal
      isOpen={isOpen}
      onClose={() => {
        setSearch('');
        onClose();
      }}
      title="Todos os Modelos Procurados"
    >
      {/* Busca */}
      <div className="relative mb-4">
        <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
        <input
          type="text"
          placeholder="Buscar modelo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 focus:border-transparent"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        )}
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <p className="text-center text-gray-500 text-sm py-8">Nenhum modelo encontrado</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((product) => {
            const globalRank = products.indexOf(product) + 1;
            const pct = Math.round((product.count / maxCount) * 100);

            return (
              <div key={product.name} className="flex items-center gap-3 py-2 px-1">
                {/* Rank */}
                <span className="w-7 text-right text-xs font-semibold text-gray-400 flex-shrink-0">#{globalRank}</span>

                {/* Nome + barra */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-800 truncate pr-2">{product.name}</span>
                    <span className="text-sm font-bold text-blue-600 flex-shrink-0">{product.count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rodapé */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <span>
          {filtered.length === products.length
            ? `${products.length} modelo${products.length !== 1 ? 's' : ''}`
            : `${filtered.length} de ${products.length} modelos`}
        </span>
        <span>{totalReserves} reservas no total</span>
      </div>
    </DialogModal>
  );
}

export default AllProductsModal;
