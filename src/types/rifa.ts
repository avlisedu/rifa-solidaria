
export type RifaNumber = {
  id?: string;
  numero: number;
  status: "disponivel" | "reservado" | "pago";
  nome_comprador?: string;
  telefone_comprador?: string;
  instagram_comprador?: string;
  data_compra?: string;
  comprovante_url?: string;
};

export type RifaFormData = {
  nome: string;
  telefone: string;
  instagram: string;
  numeros: number[];
  comprovante?: File;
};

export type RifaConsultaData = {
  telefone: string;
};
