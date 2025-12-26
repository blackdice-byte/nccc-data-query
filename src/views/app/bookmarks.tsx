import { useEffect, useState } from "react";
import {
  Bookmark,
  Search,
  Trash2,
  ExternalLink,
  MoreHorizontal,
  Calendar,
  Building2,
  FileText,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useBookmarkStore } from "@/store/bookmark.store";

const Bookmarks = () => {
  const {
    bookmarks,
    isLoading,
    error,
    fetchBookmarks,
    removeBookmark,
    clearAllBookmarks,
    clearError,
  } = useBookmarkStore();

  const [filter, setFilter] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const filteredBookmarks = bookmarks.filter(
    (item) =>
      item.contractTitle.toLowerCase().includes(filter.toLowerCase()) ||
      item.operator.toLowerCase().includes(filter.toLowerCase()) ||
      item.contractorName.toLowerCase().includes(filter.toLowerCase()) ||
      item.contractNumber.toLowerCase().includes(filter.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCurrency = (value: number) => {
    if (!value) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleRemoveBookmark = async (id: string) => {
    setIsDeleting(true);
    const success = await removeBookmark(id);
    setIsDeleting(false);
    setDeleteDialogOpen(false);
    setItemToDelete(null);
    if (success) {
      toast.success("Bookmark removed");
    }
  };

  const handleClearAll = async () => {
    setIsDeleting(true);
    const success = await clearAllBookmarks();
    setIsDeleting(false);
    setClearAllDialogOpen(false);
    if (success) {
      toast.success("All bookmarks cleared");
    }
  };

  const handleViewContract = (id: string) => {
    window.open(`/app/contracts/${id}`, "_self");
  };

  // Loading state
  if (isLoading && bookmarks.length === 0) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Loading bookmarks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bookmarks</h1>
          <p className="text-muted-foreground">
            Your saved NCCC contracts for quick access
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchBookmarks()}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          {bookmarks.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setClearAllDialogOpen(true)}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Filter */}
      {bookmarks.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter bookmarks..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {/* Empty State */}
      {bookmarks.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No bookmarks yet</h3>
            <p className="text-muted-foreground mb-4">
              Save contracts to quickly access them later
            </p>
            <Button onClick={() => window.open("/app", "_self")}>
              <Search className="h-4 w-4 mr-2" />
              Search Contracts
            </Button>
          </CardContent>
        </Card>
      )}

      {/* No Filter Results */}
      {bookmarks.length > 0 && filteredBookmarks.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Search className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              No bookmarks match "{filter}"
            </p>
          </CardContent>
        </Card>
      )}

      {/* Bookmarks Grid */}
      {filteredBookmarks.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredBookmarks.map((bookmark) => (
            <Card
              key={bookmark.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-medium truncate cursor-pointer hover:text-primary"
                      onClick={() => handleViewContract(bookmark.id)}
                      title={bookmark.contractTitle}
                    >
                      {bookmark.contractTitle}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {bookmark.contractNumber}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleViewContract(bookmark.id)}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Contract
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => {
                          setItemToDelete(bookmark.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove Bookmark
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span className="truncate">{bookmark.operator}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span className="truncate">{bookmark.contractorName}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{bookmark.year}</span>
                  </div>
                  <span className="font-medium text-primary">
                    {formatCurrency(bookmark.contractValue)}
                  </span>
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  Bookmarked {formatDate(bookmark.bookmarkedAt)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Remove Single Bookmark Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove bookmark?</AlertDialogTitle>
            <AlertDialogDescription>
              This contract will be removed from your bookmarks. You can always
              bookmark it again later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => itemToDelete && handleRemoveBookmark(itemToDelete)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Remove"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear All Dialog */}
      <AlertDialog
        open={clearAllDialogOpen}
        onOpenChange={setClearAllDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all bookmarks?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all {bookmarks.length} bookmarked contracts. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAll}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Clear All"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Bookmarks;
