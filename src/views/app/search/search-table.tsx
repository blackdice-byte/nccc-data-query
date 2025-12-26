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
  BookmarkCheck,
  Archive,
  ExternalLink,
  Download,
  Share2,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { SearchResult } from "./search-columns";
import { useBookmarkStore } from "@/store/bookmark.store";
import { useArchiveStore } from "@/store/archive.store";

interface SearchTableProps<TData extends SearchResult, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onArchive?: (contractId: string) => void;
}

export function SearchTable<TData extends SearchResult, TValue>({
  columns,
  data,
  onArchive,
}: SearchTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const { addBookmark, removeBookmark, isBookmarked } = useBookmarkStore();
  const { archiveForUser, isArchivedByUser } = useArchiveStore();

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

  const handleBookmark = async (contract: SearchResult) => {
    const bookmarked = isBookmarked(contract._id);
    if (bookmarked) {
      const success = await removeBookmark(contract._id);
      if (success) {
        toast.success(`Removed bookmark: ${contract.contractTitle}`);
      }
    } else {
      const success = await addBookmark(contract._id);
      if (success) {
        toast.success(`Bookmarked: ${contract.contractTitle}`);
      }
    }
  };

  const handleArchive = async (contract: SearchResult) => {
    const success = await archiveForUser(contract._id);
    if (success) {
      toast.success(`Archived: ${contract.contractTitle}`);
      onArchive?.(contract._id);
    } else {
      toast.error("Failed to archive contract");
    }
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
                const bookmarked = isBookmarked(contract._id);
                const archived = isArchivedByUser(contract._id);
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
                        {bookmarked ? (
                          <>
                            <BookmarkCheck className="mr-2 h-4 w-4 text-primary" />
                            Remove Bookmark
                          </>
                        ) : (
                          <>
                            <Bookmark className="mr-2 h-4 w-4" />
                            Bookmark
                          </>
                        )}
                        <ContextMenuShortcut>⌘B</ContextMenuShortcut>
                      </ContextMenuItem>
                      <ContextMenuItem 
                        onClick={() => handleArchive(contract)}
                        disabled={archived}
                      >
                        <Archive className="mr-2 h-4 w-4" />
                        {archived ? "Already Archived" : "Archive"}
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
