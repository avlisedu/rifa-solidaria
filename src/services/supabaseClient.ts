
import { createClient } from '@supabase/supabase-js';
import { RifaNumber } from '../types/rifa';

const SUPABASE_URL = "https://xkwusqpqmtjfehabofiv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhrd3VzcXBxbXRqZmVoYWJvZml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3NDYwNTUsImV4cCI6MjA1OTMyMjA1NX0.dMgmFugtFepEzo4ouOr6iaNH2OkhJZyPTS8Vkl8Rkrk";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const rifaService = {
  async getNumeros(): Promise<RifaNumber[]> {
    // First, let's query the database to see what data we get
    const { data, error } = await supabase
      .from('rifa')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) {
      console.error('Erro ao buscar números:', error);
      return [];
    }
    
    // Check if we need to generate numbers from 0-999
    if (!data || data.length === 0) {
      // Create an array with 1000 numbers (0-999)
      const initialNumbers: RifaNumber[] = Array.from({ length: 1000 }, (_, i) => ({
        numero: i,
        status: 'disponivel'
      }));
      return initialNumbers;
    }
    
    // Map the results to RifaNumber type
    return data.map(item => {
      // For existing data, extract the numero from the database
      // Check if numero is stored as an array or single value
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
    
    // Map the results to RifaNumber type
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
      // For each number, create an individual record
      for (const numero of numeros) {
        const { error } = await supabase
          .from('rifa')
          .insert({
            numero: [numero], // Store as array based on your DB schema
            nome: dadosComprador.nome,
            telefone: dadosComprador.telefone,
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
    const fileExt = file.name.split('.').pop();
    const fileName = `${telefone}-${Date.now()}.${fileExt}`;
    const filePath = `comprovantes/${fileName}`;
    
    try {
      // 1. Upload the file to storage
      const { error: uploadError } = await supabase.storage
        .from('rifa-comprovantes')
        .upload(filePath, file);
      
      if (uploadError) {
        console.error('Erro ao fazer upload do comprovante:', uploadError);
        return null;
      }

      // 2. Get the public URL
      const { data } = supabase.storage
        .from('rifa-comprovantes')
        .getPublicUrl(filePath);
      
      // 3. Update all reserved numbers for this user with the payment proof URL
      for (const numero of numeros) {
        const { error: updateError } = await supabase
          .from('rifa')
          .update({ comprovante: data.publicUrl })
          .eq('telefone', telefone)
          .eq('numero', [numero]); // Match the array format
        
        if (updateError) {
          console.error(`Erro ao atualizar número ${numero} com comprovante:`, updateError);
        }
      }
      
      return data.publicUrl;
    } catch (error) {
      console.error('Erro ao processar upload de comprovante:', error);
      return null;
    }
  }
};
