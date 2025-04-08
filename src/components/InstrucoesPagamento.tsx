import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface InstrucoesPagamentoProps {
  numerosSelecionados: number[];
  valorPorNumero?: number;
}

const InstrucoesPagamento: React.FC<InstrucoesPagamentoProps> = ({ 
  numerosSelecionados,
  valorPorNumero = 10
}) => {
  const valorTotal = numerosSelecionados.length * valorPorNumero;

  const copiarChave = () => {
    const chave = 'eduardo.es@ufpe.br';
    const tempInput = document.createElement('textarea');
    tempInput.value = chave;
    document.body.appendChild(tempInput);
    tempInput.select();
    try {
      document.execCommand('copy');
      toast.success('Chave PIX copiada com sucesso!');
    } catch (err) {
      toast.error('Erro ao copiar a chave PIX');
    }
    document.body.removeChild(tempInput);
  };
  

  return (
    <Card>
      <CardHeader className="bg-rifa-primary/10">
        <CardTitle className="text-xl font-semibold">Instruções de Pagamento</CardTitle>
        <CardDescription>
          Complete seu pagamento para garantir seus números
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-4">
        {numerosSelecionados.length > 0 ? (
          <>
            <div className="space-y-2">
              <p className="text-base">
                <span className="font-semibold">Números selecionados:</span>{' '}
                {numerosSelecionados.sort((a, b) => a - b).map(n => n.toString().padStart(3, '0')).join(', ')}
              </p>
              <div className="text-xl font-bold">
                Total a pagar: R$ {valorTotal.toFixed(2).replace('.', ',')}
              </div>
            </div>
            
            <div className="pt-2 space-y-3">
              <p className="font-medium">Faça o pagamento via PIX:</p>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-2">
                <div>
                  <span className="font-medium">Chave PIX (E-mail):</span> 
                  <div className="bg-white border border-gray-200 rounded px-3 py-1.5 mt-1 flex justify-between items-center">
                    <code className="text-sm">eduardo.es@ufpe.br</code>
                    <button 
                      onClick={copiarChave}
                      className="text-xs text-rifa-primary hover:text-rifa-accent font-medium"
                    >
                      Copiar
                    </button>
                  </div>
                </div>
                
                <div>
                  <span className="font-medium">Nome:</span> 
                  <div className="mt-1">
                    <span className="text-sm">Eduardo da Silva</span>
                  </div>
                </div>
                
                <div>
                  <span className="font-medium">Banco:</span> 
                  <div className="mt-1">
                    <span className="text-sm">Banco do Brasil</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-3">
                <AlertTriangle className="text-amber-500 h-5 w-5 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <span className="font-medium">Importante:</span> Após realizar o pagamento, 
                  envie o comprovante através do formulário abaixo. Sua compra só será confirmada após a 
                  validação do pagamento.
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            Selecione números para ver as instruções de pagamento
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InstrucoesPagamento;
