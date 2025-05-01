import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RifaNumber } from '@/types/rifa';
import { Pagination } from '@/components/ui/pagination';
import { rifaService } from '@/services/supabaseClient';

interface NumerosSeletorProps {
  onNumerosChange: (numeros: number[]) => void;
}

const NumerosSeletor: React.FC<NumerosSeletorProps> = ({ onNumerosChange }) => {
  const [todosNumeros, setTodosNumeros] = useState<RifaNumber[]>([]);
  const [numerosSelecionados, setNumerosSelecionados] = useState<number[]>([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const numerosPorPagina = 100;
  const totalPaginas = 5;

  useEffect(() => {
    const fetchNumeros = async () => {
      setIsLoading(true);
      try {
        const numerosData = await rifaService.getNumeros();

        // Gera de 301 a 500
        const inicialNumeros: RifaNumber[] = Array.from({ length: 500 }, (_, i) => ({
          numero: i + 1,
          status: 'disponivel'
        }));

        const usados = numerosData.filter(n => n.numero >= 1 && n.numero <= 500);
        const atualizados = inicialNumeros.map((n) => {
          const encontrado = usados.find(u => u.numero === n.numero);
          return encontrado || n;
        });

        setTodosNumeros(atualizados);
      } catch (error) {
        console.error('Erro ao carregar números:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNumeros();
  }, []);

  const numerosExibidos = todosNumeros
    .filter(n => n.numero >= 1 && n.numero <= 500)
    .slice((paginaAtual - 1) * numerosPorPagina, paginaAtual * numerosPorPagina);

  const toggleNumero = (numero: number) => {
    if (numerosSelecionados.includes(numero)) {
      const updated = numerosSelecionados.filter(n => n !== numero);
      setNumerosSelecionados(updated);
      onNumerosChange(updated);
    } else {
      const updated = [...numerosSelecionados, numero];
      setNumerosSelecionados(updated);
      onNumerosChange(updated);
    }
  };

  const getStatusColor = (numero: number, status: string): string => {
    if (numerosSelecionados.includes(numero)) {
      return 'bg-rifa-primary text-white';
    }

    switch (status) {
      case 'disponivel':
        return 'bg-white hover:bg-gray-100 text-gray-800';
      case 'reservado':
        return 'bg-yellow-100 text-yellow-800 cursor-not-allowed';
      case 'pago':
        return 'bg-red-100 text-red-800 cursor-not-allowed';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="font-medium">Selecione seus números da sorte:</span>
          <div className="text-sm text-gray-500">
            Números selecionados: {numerosSelecionados.length} {numerosSelecionados.length > 0 &&
              `(${numerosSelecionados.sort((a, b) => a - b).join(', ')})`}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPaginaAtual(prev => Math.max(prev - 1, 1))}
            disabled={paginaAtual === 1}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            onClick={() => setPaginaAtual(prev => Math.min(prev + 5, totalPaginas))}
            disabled={paginaAtual === totalPaginas}
          >
            Próxima
          </Button>
        </div>
      </div>

      <Card className="p-4 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rifa-primary"></div>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-2">
              <div className="px-3 py-1 bg-rifa-primary text-white rounded-full text-sm font-medium">
                Página {paginaAtual} de {totalPaginas} – Números {1 + (paginaAtual - 1) * 100} a {Math.min(500, 1 + paginaAtual * 100 - 1)}
              </div>
            </div>
            <div className="number-grid">
              {numerosExibidos.map((rifaNumber) => {
                const numeroAtual = rifaNumber.numero;
                const isDisponivel = rifaNumber.status === 'disponivel';

                return (
                  <Button
                    key={numeroAtual}
                    className={`number-item ${numerosSelecionados.includes(numeroAtual) ? 'selected' : ''} ${getStatusColor(numeroAtual, rifaNumber.status)}`}
                    disabled={!isDisponivel}
                    variant="outline"
                    onClick={() => isDisponivel && toggleNumero(numeroAtual)}
                  >
                    {numeroAtual.toString().padStart(3, '0')}
                  </Button>
                );
              })}
            </div>
          </>
        )}
      </Card>

      <div className="flex justify-center">
        <Pagination>
          {[...Array(5)].map((_, index) => (
            <Button
              key={index + 1}
              variant={paginaAtual === index + 1 ? "default" : "outline"}
              onClick={() => setPaginaAtual(index + 1)}
              className="mx-1"
            >
              {index + 1}
            </Button>
          ))}
        </Pagination>
      </div>


    </div>
  );
};

export default NumerosSeletor;
