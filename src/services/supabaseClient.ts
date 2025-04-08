
import { createClient } from '@supabase/supabase-js';
import { RifaNumber } from '../types/rifa';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


export const rifaService = {
  async getNumeros(): Promise<RifaNumber[]> {
    const { data, error } = await supabase
      .from('rifa')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) {
      console.error('Erro ao buscar números:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      const initialNumbers: RifaNumber[] = Array.from({ length: 1000 }, (_, i) => ({
        numero: i,
        status: 'disponivel'
      }));
      return initialNumbers;
    }
    
    return data.map(item => {
      let numeroValue: number;
      
      if (Array.isArray(item.numero)) {
        numeroValue = item.numero[0] || 0;
      } else if (typeof item.numero === 'number') {
        numeroValue = item.numero;
      } else {
        numeroValue = 0;
      }
      
      return {
        id: item.id,
        numero: numeroValue,
        status: item.comprovante ? 'pago' : (item.nome ? 'reservado' : 'disponivel'),
        nome_comprador: item.nome,
        telefone_comprador: item.telefone,
        instagram_comprador: item.instagram,
        data_compra: item.data_reserva,
        comprovante_url: item.comprovante
      };
    });
  },
  
  async getNumerosComprados(telefone: string): Promise<RifaNumber[]> {
    const { data, error } = await supabase
      .from('rifa')
      .select('*')
      .eq('telefone', telefone)
      .order('id', { ascending: true });
    
    if (error) {
      console.error('Erro ao buscar números comprados:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    return data.map(item => {
      let numeroValue: number;
      
      if (Array.isArray(item.numero)) {
        numeroValue = item.numero[0] || 0;
      } else if (typeof item.numero === 'number') {
        numeroValue = item.numero;
      } else {
        numeroValue = 0;
      }
      
      return {
        id: item.id,
        numero: numeroValue,
        status: item.comprovante ? 'pago' : 'reservado',
        nome_comprador: item.nome,
        telefone_comprador: item.telefone,
        instagram_comprador: item.instagram,
        data_compra: item.data_reserva,
        comprovante_url: item.comprovante
      };
    });
  },
  
  async reservarNumeros(numeros: number[], dadosComprador: {
    nome: string;
    telefone: string;
    instagram: string;
  }): Promise<boolean> {
    try {
      for (const numero of numeros) {
        const { error } = await supabase
          .from('rifa')
          .insert({
            numero: numero,
            nome: dadosComprador.nome,
            telefone: dadosComprador.telefone.replace(/\D/g, ''),
            instagram: dadosComprador.instagram,
            data_reserva: new Date().toISOString()
          });
        
        if (error) {
          console.error(`Erro ao reservar número ${numero}:`, error);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao processar reserva de números:', error);
      return false;
    }
  },
  
  async uploadComprovante(file: File, telefone: string, numeros: number[]): Promise<string | null> {
    // Create a unique filename with the current timestamp
    const fileExt = file.name.split('.').pop();
    const fileName = `${telefone}-${Date.now()}.${fileExt}`;
    
    try {
      // Upload to the "comprovantes" bucket (which already exists)
      const { error: uploadError, data } = await supabase.storage
        .from('comprovantes')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) {
        console.error('Erro ao fazer upload do comprovante:', uploadError);
        return null;
      }
      
      // Get the public URL of the uploaded file
      const { data: urlData } = supabase.storage
        .from('comprovantes')
        .getPublicUrl(fileName);
      
      if (!urlData || !urlData.publicUrl) {
        console.error('Erro ao obter URL pública do comprovante');
        return null;
      }
      
      const publicUrl = urlData.publicUrl;
      
      // Update all reserved numbers with the comprovante URL
      for (const numero of numeros) {
        const { error: updateError } = await supabase
          .from('rifa')
          .update({ comprovante: publicUrl })
          .eq('telefone', telefone)
          .eq('numero', [numero]);
        
        if (updateError) {
          console.error(`Erro ao atualizar número ${numero} com comprovante:`, updateError);
        }
      }
      
      return publicUrl;
    } catch (error) {
      console.error('Erro ao processar upload de comprovante:', error);
      return null;
    }
  }
};
