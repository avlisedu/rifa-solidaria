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
  const [numerosDisponiveis, setNumerosDisponiveis] = useState<RifaNumber[]>([]);
  const [numerosSelecionados, setNumerosSelecionados] = useState<number[]>([]);
  const [paginaAtual, setPaginaAtual] = useState(2);
  const [isLoading, setIsLoading] = useState(true);
  const numerosPorPagina = 100;
  
  const totalPaginas = Math.ceil(300 / numerosPorPagina);
  
  useEffect(() => {
    const fetchNumeros = async () => {
      setIsLoading(true);
      try {
        const numerosData = await rifaService.getNumeros();
        
        // Se não temos registros do banco, vamos criar um array com os 1000 números
        if (numerosData.length === 0) {
          const inicialNumeros: RifaNumber[] = Array.from({ length: 300 }, (_, i) => ({
            numero: i + 1,
            status: 'disponivel'
          }));
          setTodosNumeros(inicialNumeros);
          setNumerosDisponiveis(inicialNumeros);
        } else {
          setTodosNumeros(numerosData);
          setNumerosDisponiveis(numerosData.filter(n => n.status === 'disponivel'));
        }
      } catch (error) {
        console.error('Erro ao carregar números:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNumeros();
  }, []);
  
  // Números para exibir na página atual
  const numerosExibidos = numerosDisponiveis.filter(num => 
    num.numero >= (paginaAtual - 1) * numerosPorPagina && 
    num.numero < paginaAtual * numerosPorPagina
  );
  
  const toggleNumero = (numero: number) => {
    if (numerosSelecionados.includes(numero)) {
      const updatedSelecionados = numerosSelecionados.filter(n => n !== numero);
      setNumerosSelecionados(updatedSelecionados);
      onNumerosChange(updatedSelecionados);
    } else {
      const updatedSelecionados = [...numerosSelecionados, numero];
      setNumerosSelecionados(updatedSelecionados);
      onNumerosChange(updatedSelecionados);
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
            onClick={() => setPaginaAtual(prev => Math.max(prev - 1, 2))}
            disabled={paginaAtual === 1}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            onClick={() => setPaginaAtual(prev => Math.min(prev + 1, totalPaginas))}
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
              Página {paginaAtual} de {totalPaginas} - Números {(paginaAtual - 1) * numerosPorPagina + 1} a {Math.min(paginaAtual * numerosPorPagina, 300)}

              </div>
            </div>
            <div className="number-grid">
            {Array.from({ length: numerosPorPagina }, (_, i) => {
  const numeroAtual = (paginaAtual - 1) * numerosPorPagina + i + 1;
  if (numeroAtual > 300) return null;

                
                const rifaNumber = todosNumeros.find(n => n.numero === numeroAtual) || {
                  numero: numeroAtual,
                  status: 'disponivel'
                };
                
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
          <Button 
            variant="outline" 
            onClick={() => setPaginaAtual(2)}
            disabled={paginaAtual === 1}
            className="mx-1"
          >
            Início
          </Button>
          
          {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
            // Lógica para mostrar 5 páginas centradas na atual
            let pageToShow = paginaAtual - 2 + i;
            if (paginaAtual < 3) {
              pageToShow = i + 1;
            } else if (paginaAtual > totalPaginas - 2) {
              pageToShow = totalPaginas - 4 + i;
            }
            
            if (pageToShow > 0 && pageToShow <= totalPaginas) {
              return (
                <Button
                  key={pageToShow}
                  variant={pageToShow === paginaAtual ? "default" : "outline"}
                  onClick={() => setPaginaAtual(pageToShow)}
                  className="mx-1"
                >
                  {pageToShow}
                </Button>
              );
            }
            return null;
          })}
          
          <Button 
            variant="outline" 
            onClick={() => setPaginaAtual(totalPaginas)}
            disabled={paginaAtual === totalPaginas}
            className="mx-1"
          >
            Fim
          </Button>
        </Pagination>
      </div>
    </div>
  );
};

export default NumerosSeletor;





// import React, { useState, useEffect } from 'react';
// import { Button } from '@/components/ui/button';
// import { Card } from '@/components/ui/card';
// import { RifaNumber } from '@/types/rifa';
// import { Pagination } from '@/components/ui/pagination';
// import { rifaService } from '@/services/supabaseClient';

// interface NumerosSeletorProps {
//   onNumerosChange: (numeros: number[]) => void;
// }

// const NumerosSeletor: React.FC<NumerosSeletorProps> = ({ onNumerosChange }) => {
//   const [todosNumeros, setTodosNumeros] = useState<RifaNumber[]>([]);
//   const [numerosDisponiveis, setNumerosDisponiveis] = useState<RifaNumber[]>([]);
//   const [numerosSelecionados, setNumerosSelecionados] = useState<number[]>([]);
//   const [paginaAtual, setPaginaAtual] = useState(1);
//   const [isLoading, setIsLoading] = useState(true);
//   const numerosPorPagina = 100;

//   const totalPaginas = 2; // Só números de 201 a 400

//   useEffect(() => {
//     const fetchNumeros = async () => {
//       setIsLoading(true);
//       try {
//         const numerosData = await rifaService.getNumeros();

//         // Gerar apenas de 201 a 400
//         const inicialNumeros: RifaNumber[] = Array.from({ length: 200 }, (_, i) => ({
//           numero: i + 201,
//           status: 'disponivel'
//         }));

//         const usados = numerosData.filter(n => n.numero >= 201 && n.numero <= 400);
//         const atualizados = inicialNumeros.map((n) => {
//           const encontrado = usados.find(u => u.numero === n.numero);
//           return encontrado || n;
//         });

//         setTodosNumeros(atualizados);
//         setNumerosDisponiveis(atualizados.filter(n => n.status === 'disponivel'));
//       } catch (error) {
//         console.error('Erro ao carregar números:', error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchNumeros();
//   }, []);

//   const numerosExibidos = todosNumeros.filter(
//     num => num.numero >= (paginaAtual - 1) * numerosPorPagina + 201 &&
//            num.numero < paginaAtual * numerosPorPagina + 201
//   );

//   const toggleNumero = (numero: number) => {
//     if (numerosSelecionados.includes(numero)) {
//       const updatedSelecionados = numerosSelecionados.filter(n => n !== numero);
//       setNumerosSelecionados(updatedSelecionados);
//       onNumerosChange(updatedSelecionados);
//     } else {
//       const updatedSelecionados = [...numerosSelecionados, numero];
//       setNumerosSelecionados(updatedSelecionados);
//       onNumerosChange(updatedSelecionados);
//     }
//   };

//   const getStatusColor = (numero: number, status: string): string => {
//     if (numerosSelecionados.includes(numero)) {
//       return 'bg-rifa-primary text-white';
//     }

//     switch (status) {
//       case 'disponivel':
//         return 'bg-white hover:bg-gray-100 text-gray-800';
//       case 'reservado':
//         return 'bg-yellow-100 text-yellow-800 cursor-not-allowed';
//       case 'pago':
//         return 'bg-red-100 text-red-800 cursor-not-allowed';
//       default:
//         return 'bg-gray-100 text-gray-800';
//     }
//   };

//   return (
//     <div className="space-y-4">
//       <div className="flex items-center justify-between mb-4">
//         <div>
//           <span className="font-medium">Selecione seus números da sorte:</span>
//           <div className="text-sm text-gray-500">
//             Números selecionados: {numerosSelecionados.length} {numerosSelecionados.length > 0 &&
//               `(${numerosSelecionados.sort((a, b) => a - b).join(', ')})`}
//           </div>
//         </div>
//         <div className="flex gap-2">
//           <Button
//             variant="outline"
//             onClick={() => setPaginaAtual(prev => Math.max(prev - 1, 1))}
//             disabled={paginaAtual === 1}
//           >
//             Anterior
//           </Button>
//           <Button
//             variant="outline"
//             onClick={() => setPaginaAtual(prev => Math.min(prev + 1, totalPaginas))}
//             disabled={paginaAtual === totalPaginas}
//           >
//             Próxima
//           </Button>
//         </div>
//       </div>

//       <Card className="p-4 overflow-hidden">
//         {isLoading ? (
//           <div className="flex justify-center py-8">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rifa-primary"></div>
//           </div>
//         ) : (
//           <>
//             <div className="flex justify-center mb-2">
//               <div className="px-3 py-1 bg-rifa-primary text-white rounded-full text-sm font-medium">
//                 Página {paginaAtual} de {totalPaginas} - Números {201 + (paginaAtual - 1) * 100} a {Math.min(200 + 200, 200 + (paginaAtual) * 100)}
//               </div>
//             </div>
//             <div className="number-grid">
//               {numerosExibidos.map((rifaNumber) => {
//                 const numeroAtual = rifaNumber.numero;
//                 const isDisponivel = rifaNumber.status === 'disponivel';

//                 return (
//                   <Button
//                     key={numeroAtual}
//                     className={`number-item ${numerosSelecionados.includes(numeroAtual) ? 'selected' : ''} ${getStatusColor(numeroAtual, rifaNumber.status)}`}
//                     disabled={!isDisponivel}
//                     variant="outline"
//                     onClick={() => isDisponivel && toggleNumero(numeroAtual)}
//                   >
//                     {numeroAtual.toString().padStart(3, '0')}
//                   </Button>
//                 );
//               })}
//             </div>
//           </>
//         )}
//       </Card>

//       <div className="flex justify-center">
//         <Pagination>
//           <Button
//             variant="outline"
//             onClick={() => setPaginaAtual(1)}
//             disabled={paginaAtual === 1}
//             className="mx-1"
//           >
//             Início
//           </Button>

//           {[1, 2].map(page => (
//             <Button
//               key={page}
//               variant={page === paginaAtual ? "default" : "outline"}
//               onClick={() => setPaginaAtual(page)}
//               className="mx-1"
//             >
//               {page}
//             </Button>
//           ))}

//           <Button
//             variant="outline"
//             onClick={() => setPaginaAtual(totalPaginas)}
//             disabled={paginaAtual === totalPaginas}
//             className="mx-1"
//           >
//             Fim
//           </Button>
//         </Pagination>
//       </div>
//     </div>
//   );
// };

// export default NumerosSeletor;
