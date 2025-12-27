import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useContractStore } from "@/store/contract.store";

export default function ContractsPage() {
  const { contracts, isLoading, fetchContracts } = useContractStore();

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  if (isLoading && contracts.length === 0) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={contracts} />
    </div>
  );
}
