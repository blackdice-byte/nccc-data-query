import { useEffect, useState } from "react";
import {
  Archive as ArchiveIcon,
  Search,
  RotateCcw,
  Trash2,
  MoreHorizontal,
  Calendar,
  Building2,
  FileText,
  Loader2,
  AlertTriangle,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useArchiveStore, type ArchivedContract } from "@/store/archive.store";
import { useAuthStore } from "@/store/auth.store";

const Archive = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";

  const {
    userArchive,
    userTotal,
    globalArchive,
    globalTotal,
    isLoading,
    fetchUserArchive,
    fetchGlobalArchive,
    restoreForUser,
    clearUserArchive,
    restoreGlobally,
    permanentlyDelete,
    emptyGlobalArchive,
  } = useArchiveStore();

  const [filter, setFilter] = useState("");
  const [activeTab, setActiveTab] = useState<"user" | "global">("user");
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ArchivedContract | null>(null);
  const [emptyArchiveDialogOpen, setEmptyArchiveDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUserArchive();
    if (isAdmin) {
      fetchGlobalArchive();
    }
  }, [fetchUserArchive, fetchGlobalArchive, isAdmin]);

  const currentArchive = activeTab === "user" ? userArchive : globalArchive;
  const currentTotal = activeTab === "user" ? userTotal : globalTotal;

  const filteredArchived = currentArchive.filter(
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

  const formatCurrency = (value: number | string) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(numValue)) return value;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numValue);
  };

  const handleRestore = async () => {
    if (!selectedItem) return;
    setActionLoading(true);
    
    const success = activeTab === "user" 
      ? await restoreForUser(selectedItem.id)
      : await restoreGlobally(selectedItem.id);
    
    setActionLoading(false);
    setRestoreDialogOpen(false);
    setSelectedItem(null);
    
    if (success) {
      toast.success("Contract restored successfully");
    } else {
      toast.error("Failed to restore contract");
    }
  };

  const handlePermanentDelete = async () => {
    if (!selectedItem) return;
    setActionLoading(true);
    
    const success = await permanentlyDelete(selectedItem.id);
    
    setActionLoading(false);
    setDeleteDialogOpen(false);
    setSelectedItem(null);
    
    if (success) {
      toast.success("Contract permanently deleted");
    } else {
      toast.error("Failed to delete contract");
    }
  };

  const handleEmptyArchive = async () => {
    setActionLoading(true);
    
    const success = activeTab === "user"
      ? await clearUserArchive()
      : await emptyGlobalArchive();
    
    setActionLoading(false);
    setEmptyArchiveDialogOpen(false);
    
    if (success) {
      toast.success("Archive emptied successfully");
    } else {
      toast.error("Failed to empty archive");
    }
  };

  const getArchivedByName = (item: ArchivedContract) => {
    if (activeTab === "user") return "You";
    if (item.archivedBy) {
      const { firstname, lastname, username } = item.archivedBy;
      if (firstname || lastname) {
        return `${firstname || ""} ${lastname || ""}`.trim();
      }
      return username;
    }
    return "Admin";
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Archive</h1>
          <p className="text-muted-foreground">
            Archived NCCC contracts • {currentTotal} item
            {currentTotal !== 1 ? "s" : ""}
          </p>
        </div>
        {currentTotal > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEmptyArchiveDialogOpen(true)}
            disabled={isLoading || actionLoading}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Empty Archive
          </Button>
        )}
      </div>

      {/* Tabs for User/Admin archive */}
      {isAdmin && (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "user" | "global")}>
          <TabsList>
            <TabsTrigger value="user">
              <ArchiveIcon className="h-4 w-4 mr-2" />
              My Archive ({userTotal})
            </TabsTrigger>
            <TabsTrigger value="global">
              <Shield className="h-4 w-4 mr-2" />
              Global Archive ({globalTotal})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* Filter */}
      {currentTotal > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter archived contracts..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {/* Loading State */}
      {isLoading && currentTotal === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="h-12 w-12 mx-auto text-muted-foreground mb-4 animate-spin" />
            <p className="text-muted-foreground">Loading archive...</p>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && currentTotal === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <ArchiveIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Archive is empty</h3>
            <p className="text-muted-foreground mb-4">
              {activeTab === "user" 
                ? "Contracts you archive will appear here"
                : "Globally archived contracts will appear here"}
            </p>
            <Button onClick={() => window.open("/app", "_self")}>
              <Search className="h-4 w-4 mr-2" />
              Search Contracts
            </Button>
          </CardContent>
        </Card>
      )}

      {/* No Filter Results */}
      {currentTotal > 0 && filteredArchived.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Search className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              No archived contracts match "{filter}"
            </p>
          </CardContent>
        </Card>
      )}

      {/* Info Banner */}
      {currentTotal > 0 && (
        <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium">
              {activeTab === "user" ? "Your archived contracts" : "Globally archived contracts"}
            </p>
            <p className="text-muted-foreground">
              {activeTab === "user"
                ? "Items in your archive are hidden from your search results. You can restore them at any time."
                : "Globally archived contracts are hidden from all users' search results. Only admins can restore or permanently delete them."}
            </p>
          </div>
        </div>
      )}

      {/* Archived List */}
      {filteredArchived.length > 0 && (
        <div className="space-y-3">
          {filteredArchived.map((item) => (
            <Card
              key={item.id}
              className="hover:shadow-md transition-shadow opacity-80 hover:opacity-100"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <ArchiveIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                      <h3
                        className="font-medium truncate"
                        title={item.contractTitle}
                      >
                        {item.contractTitle}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.contractNumber}
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
                        onClick={() => {
                          setSelectedItem(item);
                          setRestoreDialogOpen(true);
                        }}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Restore
                      </DropdownMenuItem>
                      {activeTab === "global" && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setSelectedItem(item);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Permanently
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span className="truncate">{item.operator}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span className="truncate">{item.contractorName}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{item.year}</span>
                  </div>
                  <div className="text-right font-medium">
                    {formatCurrency(item.contractValue)}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
                  <span>Archived {formatDate(item.archivedAt)}</span>
                  <span>by {getArchivedByName(item)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Restore Dialog */}
      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore contract?</AlertDialogTitle>
            <AlertDialogDescription>
              "{selectedItem?.contractTitle}" will be restored and
              visible in search results again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRestore}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Restore"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Permanent Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              "{selectedItem?.contractTitle}" will be permanently
              deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePermanentDelete}
              disabled={actionLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete Permanently"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Empty Archive Dialog */}
      <AlertDialog
        open={emptyArchiveDialogOpen}
        onOpenChange={setEmptyArchiveDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Empty archive?</AlertDialogTitle>
            <AlertDialogDescription>
              {activeTab === "user"
                ? `This will restore all ${currentTotal} contracts to your search results.`
                : `This will permanently delete all ${currentTotal} archived contract${currentTotal !== 1 ? "s" : ""}. This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEmptyArchive}
              disabled={actionLoading}
              className={activeTab === "global" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : activeTab === "user" ? (
                "Clear Archive"
              ) : (
                "Empty Archive"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Archive;
