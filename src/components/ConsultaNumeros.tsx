
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Phone, Search, Ticket } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RifaConsultaData, RifaNumber } from '@/types/rifa';
import { rifaService } from '@/services/supabaseClient';
import { toast } from 'sonner';

const consultaSchema = z.object({
  telefone: z.string().min(10, { message: 'Telefone inválido' })
});
// IMPORTS permanecem os mesmos...

const ConsultaNumeros: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [numerosComprados, setNumerosComprados] = useState<RifaNumber[]>([]);
  const [pesquisaRealizada, setPesquisaRealizada] = useState(false);
  const [nomeComprador, setNomeComprador] = useState<string | null>(null); // <- novo

  const form = useForm<RifaConsultaData>({
    resolver: zodResolver(consultaSchema),
    defaultValues: {
      telefone: ''
    }
  });

  const onSubmit = async (data: RifaConsultaData) => {
    setIsLoading(true);
    setPesquisaRealizada(true);

    try {
      const telefoneNumerico = data.telefone.replace(/\D/g, '');
      const numeros = await rifaService.getNumerosComprados(telefoneNumerico);

      setNumerosComprados(numeros);
      setNomeComprador(numeros.length > 0 ? numeros[0].nome : null); // <- extrai nome

      if (numeros.length === 0) {
        toast.info('Nenhum número encontrado para este telefone');
      }
    } catch (error) {
      console.error('Erro ao buscar números:', error);
      toast.error('Erro ao buscar números. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Consultar Meus Números</CardTitle>
        <CardDescription>
          Digite seu número de telefone para consultar suas compras
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Campo de telefone permanece o mesmo */}
            <FormField
              control={form.control}
              name="telefone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone cadastrado</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input 
                        placeholder="(00) 00000-0000" 
                        className="pl-10" 
                        {...field}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length > 11) value = value.slice(0, 11);

                          const ddd = value.slice(0, 2);
                          const parte1 = value.slice(2, 7);
                          const parte2 = value.slice(7, 11);

                          let formatted = '';
                          if (value.length > 7) {
                            formatted = `(${ddd}) ${parte1}-${parte2}`;
                          } else if (value.length > 2) {
                            formatted = `(${ddd}) ${parte1}`;
                          } else if (value.length > 0) {
                            formatted = `(${ddd}`;
                          }

                          field.onChange(formatted);
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Consultando...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Consultar
                </>
              )}
            </Button>
          </form>
        </Form>

        {pesquisaRealizada && !isLoading && (
          <div className="mt-6">
            <h3 className="font-medium text-lg mb-3">Resultado da consulta:</h3>

            {nomeComprador && (
              <p className="text-md text-gray-700 mb-2">
                Comprador: <span className="font-semibold text-rifa-primary">{nomeComprador}</span>
              </p>
            )}

            {numerosComprados.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {numerosComprados.length} número{numerosComprados.length !== 1 ? 's' : ''} encontrado{numerosComprados.length !== 1 ? 's' : ''} para este telefone:
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {numerosComprados.map(numero => (
                    <div 
                      key={numero.numero} 
                      className={`flex items-center justify-center p-2 rounded-md ${
                        numero.status === 'pago' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      <Ticket className="h-4 w-4 mr-1.5" />
                      <span className="font-medium">{numero.numero.toString().padStart(3, '0')}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 text-sm">
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-100 mr-2"></div>
                    <span>Reservado</span>
                  </div>
                  {/* <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-100 mr-2"></div>
                    <span>Pago (confirmado)</span>
                  </div> */}
                </div>
              </div>
            ) : (
              <p className="text-center py-4 text-muted-foreground">
                Nenhum número encontrado para este telefone.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConsultaNumeros;
