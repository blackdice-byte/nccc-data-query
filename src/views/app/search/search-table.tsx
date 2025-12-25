/* eslint-disable react-hooks/incompatible-library */
"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  Copy,
  Bookmark,
  Archive,
  ExternalLink,
  Download,
  Share2,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { SearchResult } from "./search-columns";

interface SearchTableProps<TData extends SearchResult, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function SearchTable<TData extends SearchResult, TValue>({
  columns,
  data,
}: SearchTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const handleCopyId = (contract: SearchResult) => {
    const id = contract._id;
    navigator.clipboard.writeText(id);
    toast.success("Contract ID copied to clipboard");
  };

  const handleCopyContractNumber = (contract: SearchResult) => {
    navigator.clipboard.writeText(contract.contractNumber);
    toast.success("Contract number copied to clipboard");
  };

  const handleBookmark = (contract: SearchResult) => {
    // TODO: Implement bookmark API call
    toast.success(`Bookmarked: ${contract.contractTitle}`);
  };

  const handleArchive = (contract: SearchResult) => {
    // TODO: Implement archive API call
    toast.success(`Archived: ${contract.contractTitle}`);
  };

  const handleViewDetails = (contract: SearchResult) => {
    window.open(`/app/contracts/${contract._id}`, "_self");
  };

  const handleDownload = (contract: SearchResult) => {
    if (contract.media && contract.media.length > 0) {
      const url = contract.zipUrl || contract.media[0]?.url;
      if (url) {
        window.open(url, "_blank");
      }
    } else {
      toast.error("No documents available for download");
    }
  };

  const handleShare = (contract: SearchResult) => {
    const url = `${window.location.origin}/app/contracts/${contract._id}`;
    navigator.clipboard.writeText(url);
    toast.success("Contract link copied to clipboard");
  };

  const handleDelete = (contract: SearchResult) => {
    // TODO: Implement delete API call with confirmation
    toast.info(`Delete requested for: ${contract.contractTitle}`);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} result(s)
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Columns <ChevronDown className="ml-1 h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="px-4 py-3">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const contract = row.original;
                return (
                  <ContextMenu key={row.id}>
                    <ContextMenuTrigger asChild>
                      <TableRow
                        data-state={row.getIsSelected() && "selected"}
                        className="cursor-context-menu"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="px-4 py-3">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-56">
                      <ContextMenuItem onClick={() => handleViewDetails(contract)}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Details
                      </ContextMenuItem>
                      <ContextMenuItem onClick={() => handleDownload(contract)}>
                        <Download className="mr-2 h-4 w-4" />
                        Download Documents
                      </ContextMenuItem>
                      <ContextMenuSeparator />
                      <ContextMenuItem onClick={() => handleCopyId(contract)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy ID
                        <ContextMenuShortcut>⌘C</ContextMenuShortcut>
                      </ContextMenuItem>
                      <ContextMenuItem onClick={() => handleCopyContractNumber(contract)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Contract Number
                      </ContextMenuItem>
                      <ContextMenuItem onClick={() => handleShare(contract)}>
                        <Share2 className="mr-2 h-4 w-4" />
                        Copy Link
                      </ContextMenuItem>
                      <ContextMenuSeparator />
                      <ContextMenuItem onClick={() => handleBookmark(contract)}>
                        <Bookmark className="mr-2 h-4 w-4" />
                        Bookmark
                        <ContextMenuShortcut>⌘B</ContextMenuShortcut>
                      </ContextMenuItem>
                      <ContextMenuItem onClick={() => handleArchive(contract)}>
                        <Archive className="mr-2 h-4 w-4" />
                        Archive
                      </ContextMenuItem>
                      <ContextMenuSeparator />
                      <ContextMenuItem
                        variant="destructive"
                        onClick={() => handleDelete(contract)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                        <ContextMenuShortcut>⌘⌫</ContextMenuShortcut>
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
