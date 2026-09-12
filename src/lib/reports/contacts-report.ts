import type { Contact } from "@/lib/contacts/types";
import type { Sale } from "@/lib/sales/types";
import { aggregateContactHistory } from "@/lib/sales/calculations";
import type { PeriodRange } from "./period-range";
import { isWithinRange } from "./period-range";

export type ContactsReport = {
  novos: number;
  clientes: number;
  recorrentes: number;
  inativos: number;
  topContacts: { contactId: string; nome: string; totalComprado: number; quantidadeCompras: number }[];
};

export function buildContactsReport(contacts: Contact[], sales: Sale[], range: PeriodRange): ContactsReport {
  const novos = contacts.filter((c) => isWithinRange(c.createdAt.slice(0, 10), range)).length;
  const clientes = contacts.filter((c) => c.status === "cliente").length;
  const recorrentes = contacts.filter((c) => c.status === "recorrente").length;
  const inativos = contacts.filter((c) => c.status === "inativo").length;

  const salesInRange = sales.filter((s) => isWithinRange(s.date, range));
  const topContacts = contacts
    .map((contact) => {
      const history = aggregateContactHistory(salesInRange, contact.id);
      return { contactId: contact.id, nome: contact.name, totalComprado: history.totalPurchased, quantidadeCompras: history.purchaseCount };
    })
    .filter((c) => c.quantidadeCompras > 0)
    .sort((a, b) => b.totalComprado - a.totalComprado);

  return { novos, clientes, recorrentes, inativos, topContacts };
}
