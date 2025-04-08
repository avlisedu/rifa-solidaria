
import React, { useState } from 'react';
import MainLayout, { RifaTabs } from '@/components/MainLayout';
import NumerosSeletor from '@/components/NumerosSeletor';
import FormularioComprador from '@/components/FormularioComprador';
import InstrucoesPagamento from '@/components/InstrucoesPagamento';
import ConsultaNumeros from '@/components/ConsultaNumeros';
import { Card } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';

const Index = () => {
  const [numerosSelecionados, setNumerosSelecionados] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState('comprar');
  
  const handleNumerosChange = (numeros: number[]) => {
    setNumerosSelecionados(numeros);
  };
  
  const handleSubmitSuccess = () => {
    setNumerosSelecionados([]);
    toast.success("Compra realizada com sucesso!");
    setActiveTab('consultar');
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto">
        <div className="bg-rifa-primary/10 rounded-lg p-4 md:p-6 mb-8">
          <h2 className="text-2xl font-bold text-rifa-primary mb-2">
            Rifa Solidária - Apoio ao Doutorado
          </h2>
          <p className="mb-4">
            Olá! Estou passando por um momento desafiador no meu doutorado e preciso da sua ajuda. 
            Atualmente estou sem bolsa, e para continuar meus estudos, estou realizando esta rifa solidária.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-bold text-lg mb-2">Como funciona</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Cada número custa R$ 10,00</li>
                <li>Escolha quantos números quiser</li>
                <li>Faça o pagamento via PIX</li>
                <li>Envie o comprovante para confirmar</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-bold text-lg mb-2">Prêmio</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>1º lugar: Prêmio principal</li>
                <li>Sorteio pela Loteria Federal</li>
                <li>Data do sorteio: A confirmar</li>
                <li>Resultado divulgado nas redes sociais</li>
              </ul>
            </div>
          </div>
          <p className="text-sm text-center">
            Sua ajuda faz toda a diferença! Obrigado por participar.
          </p>
        </div>

        <RifaTabs defaultTab={activeTab}>
          <TabsContent value="comprar" className="space-y-8">
            <NumerosSeletor onNumerosChange={handleNumerosChange} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <InstrucoesPagamento numerosSelecionados={numerosSelecionados} />
              
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Confirme sua compra</h3>
                <FormularioComprador 
                  numerosSelecionados={numerosSelecionados}
                  onSubmitSuccess={handleSubmitSuccess}
                />
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="consultar">
            <ConsultaNumeros />
          </TabsContent>
        </RifaTabs>
      </div>
    </MainLayout>
  );
};

export default Index;
