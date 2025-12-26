import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Building2,
  User,
  FileText,
  Hash,
  Download,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Archive,
  Share2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useContractStore } from "@/store/contract.store";
import { useBookmarkStore } from "@/store/bookmark.store";
import { useArchiveStore } from "@/store/archive.store";
import { api } from "@/config/axios";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface MediaItem {
  _id: string;
  url: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
}

const ContractDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    currentContract,
    isLoading,
    error,
    fetchContractById,
    clearCurrentContract,
  } = useContractStore();
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarkStore();
  const { archiveForUser, isArchivedByUser } = useArchiveStore();

  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);

  useEffect(() => {
    if (id) {
      fetchContractById(id);
    }
    return () => clearCurrentContract();
  }, [id, fetchContractById, clearCurrentContract]);

  useEffect(() => {
    const fetchMedia = async () => {
      if (!id) return;
      setIsLoadingMedia(true);
      try {
        const { data } = await api.get(`/media?contractId=${id}`);
        if (data.success) {
          setMedia(data.data.media || []);
        }
      } catch {
        setMedia([]);
      } finally {
        setIsLoadingMedia(false);
      }
    };
    fetchMedia();
  }, [id]);

  const bookmarked = id ? isBookmarked(id) : false;
  const archived = id ? isArchivedByUser(id) : false;

  const handleBookmark = async () => {
    if (!id) return;
    if (bookmarked) {
      const success = await removeBookmark(id);
      if (success) toast.success("Bookmark removed");
    } else {
      const success = await addBookmark(id);
      if (success) toast.success("Contract bookmarked");
    }
  };

  const handleArchive = async () => {
    if (!id || archived) return;
    const success = await archiveForUser(id);
    if (success) {
      toast.success("Contract archived");
    } else {
      toast.error("Failed to archive contract");
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "completed":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "pending":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "cancelled":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !currentContract) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Contract not found</h3>
            <p className="text-muted-foreground mb-4">
              {error ||
                "The contract you're looking for doesn't exist or has been removed."}
            </p>
            <Button onClick={() => navigate("/app")}>Go to Search</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold">
                {currentContract.contractTitle}
              </h1>
              <Badge
                variant="outline"
                className={getStatusColor(currentContract.status)}
              >
                {currentContract.status || "Unknown"}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {currentContract.contractNumber} • {currentContract.year}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleBookmark}>
            {bookmarked ? (
              <BookmarkCheck className="h-4 w-4 text-primary" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleArchive}
            disabled={archived}
          >
            <Archive className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contract Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Operator</p>
                    <p className="font-medium">{currentContract.operator}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Contractor</p>
                    <p className="font-medium">
                      {currentContract.contractorName}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Hash className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Contract Number
                    </p>
                    <p className="font-medium">
                      {currentContract.contractNumber}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Contract Value
                    </p>
                    <p className="font-medium">
                      {formatCurrency(currentContract.contractValue)}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="font-medium">
                      {formatDate(currentContract.startDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">End Date</p>
                    <p className="font-medium">
                      {formatDate(currentContract.endDate)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documents
                {media.length > 0 && (
                  <Badge variant="secondary">{media.length}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingMedia ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading documents...
                </div>
              ) : media.length > 0 ? (
                <div className="space-y-2">
                  {media.map((doc) => (
                    <div
                      key={doc._id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium truncate">
                            {doc.originalName || doc.filename}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(doc.size)} • {doc.mimetype}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <a href={doc.url} download>
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No documents uploaded</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleBookmark}
              >
                {bookmarked ? (
                  <>
                    <BookmarkCheck className="h-4 w-4 mr-2 text-primary" />
                    Remove Bookmark
                  </>
                ) : (
                  <>
                    <Bookmark className="h-4 w-4 mr-2" />
                    Add Bookmark
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleArchive}
                disabled={archived}
              >
                <Archive className="h-4 w-4 mr-2" />
                {archived ? "Already Archived" : "Archive Contract"}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Link
              </Button>
              {media.length > 0 && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <a href={media[0]?.url} download>
                    <Download className="h-4 w-4 mr-2" />
                    Download Documents
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Year</span>
                <span className="font-medium">{currentContract.year}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Documents</span>
                <span className="font-medium">{media.length}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Has Documents</span>
                <span className="font-medium">
                  {currentContract.hasDocument ? "Yes" : "No"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContractDetail;
