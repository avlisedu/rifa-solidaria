
import { createClient } from '@supabase/supabase-js';
import { RifaNumber } from '../types/rifa';

const SUPABASE_URL = "https://xkwusqpqmtjfehabofiv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhrd3VzcXBxbXRqZmVoYWJvZml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3NDYwNTUsImV4cCI6MjA1OTMyMjA1NX0.dMgmFugtFepEzo4ouOr6iaNH2OkhJZyPTS8Vkl8Rkrk";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const rifaService = {
  async getNumeros(): Promise<RifaNumber[]> {
    const { data, error } = await supabase
      .from('rifa')
      .select('*')
      .order('numero', { ascending: true });
    
    if (error) {
      console.error('Erro ao buscar números:', error);
      return [];
    }
    
    return data || [];
  },
  
  async getNumerosComprados(telefone: string): Promise<RifaNumber[]> {
    const { data, error } = await supabase
      .from('rifa')
      .select('*')
      .eq('telefone_comprador', telefone)
      .order('numero', { ascending: true });
    
    if (error) {
      console.error('Erro ao buscar números comprados:', error);
      return [];
    }
    
    return data || [];
  },
  
  async reservarNumeros(numeros: number[], dadosComprador: {
    nome: string;
    telefone: string;
    instagram: string;
  }): Promise<boolean> {
    const updates = numeros.map(numero => ({
      numero,
      status: 'reservado',
      nome_comprador: dadosComprador.nome,
      telefone_comprador: dadosComprador.telefone,
      instagram_comprador: dadosComprador.instagram,
      data_compra: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('rifa')
      .upsert(updates, { onConflict: 'numero' });
    
    if (error) {
      console.error('Erro ao reservar números:', error);
      return false;
    }
    
    return true;
  },
  
  async uploadComprovante(file: File, telefone: string, numeros: number[]): Promise<string | null> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${telefone}-${Date.now()}.${fileExt}`;
    const filePath = `comprovantes/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('rifa-comprovantes')
      .upload(filePath, file);
    
    if (uploadError) {
      console.error('Erro ao fazer upload do comprovante:', uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('rifa-comprovantes')
      .getPublicUrl(filePath);
    
    // Atualizar registros com URL do comprovante
    const { error: updateError } = await supabase
      .from('rifa')
      .update({ 
        status: 'pago', 
        comprovante_url: data.publicUrl 
      })
      .in('numero', numeros)
      .eq('telefone_comprador', telefone);

    if (updateError) {
      console.error('Erro ao atualizar com comprovante:', updateError);
      return null;
    }
    
    return data.publicUrl;
  }
};
