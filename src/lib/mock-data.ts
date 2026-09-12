// Mock data for Phase 1 (Foundation). Replace with real data sources in later phases.

export const mockKpis = {
  caixa: { value: "R$ 18.420,00", trend: 8.2 },
  vendas: { value: "R$ 6.940,00", trend: 12.5 },
  tarefas: { value: "7 pendentes", trend: -2 },
  lucro: { value: "R$ 2.310,00", trend: 4.1 },
  despesas: { value: "R$ 4.630,00", trend: -3.4 },
};

export const mockCashFlow = [
  { label: "Seg", value: 1200 },
  { label: "Ter", value: 2100 },
  { label: "Qua", value: 800 },
  { label: "Qui", value: 3400 },
  { label: "Sex", value: 2600 },
  { label: "Sáb", value: 4200 },
  { label: "Dom", value: 1500 },
];

export const mockSparkline = [4, 6, 5, 8, 7, 9, 8, 11, 10, 13];

export type MockSale = {
  id: string;
  cliente: string;
  canal: "E-commerce" | "Instagram" | "WhatsApp";
  valor: string;
  status: "pendente" | "concluido" | "cancelado";
  data: string;
};

export const mockRecentSales: MockSale[] = [
  { id: "1", cliente: "Ana Beatriz Souza", canal: "E-commerce", valor: "R$ 349,00", status: "concluido", data: "10/09" },
  { id: "2", cliente: "Carlos Mendes", canal: "Instagram", valor: "R$ 189,90", status: "pendente", data: "10/09" },
  { id: "3", cliente: "Juliana Prado", canal: "WhatsApp", valor: "R$ 520,00", status: "concluido", data: "09/09" },
  { id: "4", cliente: "Rafael Lima", canal: "E-commerce", valor: "R$ 99,00", status: "cancelado", data: "08/09" },
];

export type MockPayment = {
  id: string;
  descricao: string;
  vencimento: string;
  valor: string;
  prioridade: "alta" | "media" | "baixa";
};

export const mockUpcomingPayments: MockPayment[] = [
  { id: "1", descricao: "Fornecedor de tecido", vencimento: "13/09", valor: "R$ 2.400,00", prioridade: "alta" },
  { id: "2", descricao: "Aluguel do ateliê", vencimento: "15/09", valor: "R$ 1.800,00", prioridade: "alta" },
  { id: "3", descricao: "Ferramenta de e-mail", vencimento: "20/09", valor: "R$ 89,00", prioridade: "baixa" },
];

export type MockTask = {
  id: string;
  titulo: string;
  prioridade: "alta" | "media" | "baixa";
  prazo: string;
};

export const mockPriorityTasks: MockTask[] = [
  { id: "1", titulo: "Fechar fornecedor de tecido", prioridade: "alta", prazo: "Hoje" },
  { id: "2", titulo: "Revisar fotos da nova coleção", prioridade: "media", prazo: "Amanhã" },
  { id: "3", titulo: "Responder DMs do Instagram", prioridade: "media", prazo: "Hoje" },
  { id: "4", titulo: "Planejar campanha do dia dos pais", prioridade: "baixa", prazo: "Sex" },
];

export type MockAlert = {
  id: string;
  titulo: string;
  descricao: string;
};

export const mockAlerts: MockAlert[] = [
  { id: "1", titulo: "Estoque baixo", descricao: "3 produtos com menos de 5 unidades." },
  { id: "2", titulo: "Fatura vencendo", descricao: "Aluguel do ateliê vence em 4 dias." },
];
