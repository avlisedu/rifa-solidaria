
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
          {/* <h2 className="text-2xl font-bold text-rifa-primary mb-2">
            Rifa Solidária - Apoio ao Doutorado
          </h2> */}
          <p className="mb-4 text-justify">        

          Olá! Recentemente entrei no doutorado (PPGEP/UFPE) — 7º lugar de 25 vagas. Tudo certo até aqui, né? Só faltou um pequeno detalhe: a bolsa 💰. Coincidência ou não, parece que ela resolveu pular justamente o meu nome.

          Como ainda não há previsão de receber esse auxílio, estou realizando esta rifa solidária pra conseguir continuar os estudos com um pouco mais de tranquilidade. Se puder ajudar, já fico imensamente grato. E ainda tem chance de ganhar um prêmio! 🎁📚
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-bold text-lg mb-2">Como funciona</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Cada número custa R$ 10,00</li>
                <li>Escolha quantos números quiser</li>
                <li>Faça o pagamento via PIX</li>
                <li>Envie o comprovante para confirmar (Obrigatório)</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-bold text-lg mb-2">Prêmio</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>1º lugar: R$ 200,00</li>
                <li>2º lugar: Barril de Chopp Heineken 5 Litros</li>
                <li>Sorteio pela Loteria Federal</li>
                <li>Data do sorteio: 01/05/2025</li>
                <li>Resultado divulgado nas redes sociais (@eo.silva)</li>
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
