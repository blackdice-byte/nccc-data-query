import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Download, FileText } from "lucide-react";
import type { IContract } from "@/interface/contract";

export interface SearchResult extends IContract {
  _id: string;
  media?: Array<{
    url: string;
    filename: string;
    originalName: string;
  }>;
  zipUrl?: string | null;
}

export const searchColumns: ColumnDef<SearchResult>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "download",
    header: () => <FileText className="h-4 w-4" />,
    cell: ({ row }) => {
      const media = row.original.media;
      const zipUrl = row.original.zipUrl;

      if (!media || media.length === 0) {
        return <span className="text-muted-foreground">—</span>;
      }

      // If multiple files, show zip download; otherwise show single file download
      const downloadUrl = zipUrl || media[0]?.url;

      return (
        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center text-primary hover:text-primary/80"
          title={media.length > 1 ? `Download ${media.length} files` : "Download document"}
        >
          <Download className="h-4 w-4" />
        </a>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "operator",
    header: "Operator",
  },
  {
    accessorKey: "contractorName",
    header: "Contractor",
  },
  {
    accessorKey: "contractTitle",
    header: "Contract Title",
    cell: ({ row }) => (
      <div className="max-w-xs truncate" title={row.getValue("contractTitle")}>
        {row.getValue("contractTitle")}
      </div>
    ),
  },
  {
    accessorKey: "year",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Year
        <ArrowUpDown className="ml-1 h-3 w-3" />
      </Button>
    ),
  },
  {
    accessorKey: "contractNumber",
    header: "Contract #",
  },
  {
    accessorKey: "contractValue",
    header: "Value",
    cell: ({ row }) => {
      const value = row.getValue("contractValue") as number;
      if (!value) return "N/A";
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
      }).format(value);
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      if (!status) return "—";
      const colorMap = {
        active: "text-green-600 bg-green-100",
        completed: "text-blue-600 bg-blue-100",
        pending: "text-yellow-600 bg-yellow-100",
        cancelled: "text-red-600 bg-red-100",
      };
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            colorMap[status as keyof typeof colorMap] || "bg-gray-100 text-gray-600"
          }`}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    },
  },
];
