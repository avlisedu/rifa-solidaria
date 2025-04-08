
import { createClient } from '@supabase/supabase-js';
import { RifaNumber } from '../types/rifa';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
