
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Phone, User, Instagram, Upload } from 'lucide-react';
import { RifaFormData } from '@/types/rifa';
import { toast } from 'sonner';
import { rifaService } from '@/services/supabaseClient';

const formSchema = z.object({
  nome: z.string().min(3, { message: 'Nome é obrigatório (mín. 3 caracteres)' }),
  telefone: z.string().min(10, { message: 'Telefone inválido' }),
  instagram: z.string().optional(),
  numeros: z.array(z.number()).min(1, { message: 'Selecione pelo menos um número' }),
  comprovante: z.instanceof(File).optional()
});

interface FormularioCompradorProps {
  numerosSelecionados: number[];
  onSubmitSuccess: () => void;
}

const FormularioComprador: React.FC<FormularioCompradorProps> = ({ 
  numerosSelecionados, 
  onSubmitSuccess 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comprovante, setComprovante] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const form = useForm<RifaFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      telefone: '',
      instagram: '',
      numeros: numerosSelecionados
    }
  });
  
  // Atualiza os números selecionados quando mudam externamente
  React.useEffect(() => {
    form.setValue('numeros', numerosSelecionados);
  }, [numerosSelecionados, form]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validar tipo de arquivo
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error('Por favor, selecione uma imagem válida (JPG, PNG)');
      return;
    }
    
    // Validar tamanho do arquivo (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('O arquivo é muito grande. Tamanho máximo: 5MB');
      return;
    }
    
    setComprovante(file);
    form.setValue('comprovante', file);
    
    // Criar preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const onSubmit = async (data: RifaFormData) => {
    if (numerosSelecionados.length === 0) {
      toast.error('Selecione pelo menos um número');
      return;
    }
    
    if (!comprovante) {
      toast.error('Envie um comprovante de pagamento');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 1. Reservar os números
      const reservaSuccess = await rifaService.reservarNumeros(numerosSelecionados, {
        nome: data.nome,
        telefone: data.telefone,
        instagram: data.instagram
      });
      
      if (!reservaSuccess) {
        toast.error('Erro ao reservar números. Tente novamente.');
        setIsSubmitting(false);
        return;
      }
      
      // 2. Fazer upload do comprovante
      const comprovanteUrl = await rifaService.uploadComprovante(
        comprovante,
        data.telefone,
        numerosSelecionados
      );
      
      if (!comprovanteUrl) {
        toast.error('Erro ao enviar comprovante. Contate o administrador.');
        setIsSubmitting(false);
        return;
      }
      
      toast.success('Rifa adquirida com sucesso!');
      onSubmitSuccess();
      form.reset();
      setComprovante(null);
      setPreviewUrl(null);
      
    } catch (error) {
      console.error('Erro ao processar compra:', error);
      toast.error('Ocorreu um erro. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome completo</FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input placeholder="Seu nome" className="pl-10" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="telefone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone (com DDD)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input 
                      placeholder="(00) 00000-0000" 
                      className="pl-10" 
                      {...field}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                      
                        if (value.length > 11) {
                          value = value.slice(0, 11); // Limita a 11 dígitos
                        }
                      
                        // Formata para (XX) XXXXX-XXXX
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
        </div>
        
        <FormField
          control={form.control}
          name="instagram"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instagram</FormLabel>
              <FormControl>
                <div className="relative">
                  <Instagram className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input 
                    placeholder="@seu_instagram" 
                    className="pl-10" 
                    {...field} 
                    onChange={(e) => {
                      // Remove espaços e múltiplos @
                      let value = e.target.value.replace(/\s/g, '').replace(/^@+/, '');
                    
                      // Garante que o valor sempre comece com @
                      field.onChange(`@${value}`);
                    }}
                    
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div>
          <FormLabel className="block mb-2">Comprovante de Pagamento</FormLabel>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                className="w-full md:w-auto"
                onClick={() => document.getElementById('comprovante-upload')?.click()}
              >
                <Upload className="mr-2 h-5 w-5" />
                {comprovante ? 'Trocar comprovante' : 'Enviar comprovante'}
              </Button>
              {comprovante && (
                <div className="text-sm text-muted-foreground">
                  {comprovante.name} ({Math.round(comprovante.size / 1024)} KB)
                </div>
              )}
            </div>
            
            <input
              id="comprovante-upload"
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              className="hidden"
              onChange={handleFileChange}
            />
            
            {previewUrl && (
              <div className="mt-2 relative rounded-md overflow-hidden border border-border">
                <img src={previewUrl} alt="Preview" className="max-h-48 object-contain mx-auto" />
              </div>
            )}
            
            {form.formState.errors.comprovante && (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.comprovante.message}
              </p>
            )}
          </div>
        </div>
        
        <div className="pt-4">
          <Button 
            type="submit" 
            className="w-full bg-rifa-primary hover:bg-rifa-primary/90" 
            disabled={isSubmitting || numerosSelecionados.length === 0 || !comprovante}
          >
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Processando...
              </>
            ) : (
              `Confirmar compra de ${numerosSelecionados.length} número${numerosSelecionados.length !== 1 ? 's' : ''}`
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default FormularioComprador;
