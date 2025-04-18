
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TicketIcon, SearchIcon } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
<header className="bg-rifa-primary text-white shadow-md">
  <div className="container mx-auto py-4"> {}
    <h3 className="text-5xl font-bold text-center">Rifa Solidária</h3> {}
    <p className="text-center mt-4 text-white/90 text-lg">Ajude um estudante de Doutorado 🎓</p> {}
  </div>
</header>

      
      <main className="container mx-auto py-8 px-4">
        {children}
      </main>
      
      <footer className="bg-rifa-secondary text-white py-6 mt-10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-white/80 text-sm">
            Eduardo da Silva (eduardo.es@ufpe.br  )
          </p>
        </div>
      </footer>
    </div>
  );
};

export const RifaTabs: React.FC<{
  defaultTab?: string;
  children: React.ReactNode;
}> = ({ defaultTab = "comprar", children }) => {
  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-8">
        <TabsTrigger value="comprar" className="flex items-center gap-2">
          <TicketIcon className="h-4 w-4" />
          <span>Comprar Números</span>
        </TabsTrigger>
        <TabsTrigger value="consultar" className="flex items-center gap-2">
          <SearchIcon className="h-4 w-4" />
          <span>Consultar Meus Números</span>
        </TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
};

export default MainLayout;
