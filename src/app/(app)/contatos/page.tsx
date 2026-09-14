import { PageHeader } from "@/components/common/page-header";
import { ContactsPanel } from "@/components/contacts/contacts-panel";

export default function ContatosPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Contatos"
        description="Clientes, fornecedores e parceiros da marca."
      />
      <ContactsPanel />
    </div>
  );
}
