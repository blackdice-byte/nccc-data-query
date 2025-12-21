import { useState, useEffect } from "react";
import {
  Plus,
  Upload,
  X,
  FileText,
  Calendar,
  DollarSign,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useContractStore } from "@/store/contract.store";
import { useMediaStore } from "@/store/media.store";
import { toast } from "sonner";

interface ContractForm {
  operator: string;
  contractorName: string;
  contractTitle: string;
  year: string;
  contractNumber: string;
  startDate: string;
  endDate: string;
  contractValue: string;
}

const initialForm: ContractForm = {
  operator: "",
  contractorName: "",
  contractTitle: "",
  year: new Date().getFullYear().toString(),
  contractNumber: "",
  startDate: "",
  endDate: "",
  contractValue: "",
};

const Contracts = () => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ContractForm>(initialForm);
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const {
    contracts,
    isLoading: contractLoading,
    error: contractError,
    fetchContracts,
    createContract,
    clearError: clearContractError,
  } = useContractStore();

  const {
    uploadProgress,
    isLoading: mediaLoading,
    error: mediaError,
    clearError: clearMediaError,
  } = useMediaStore();

  const isLoading = contractLoading || mediaLoading;

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  useEffect(() => {
    if (contractError) {
      toast.error(contractError);
      clearContractError();
    }
    if (mediaError) {
      toast.error(mediaError);
      clearMediaError();
    }
  }, [contractError, mediaError, clearContractError, clearMediaError]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const contractData = {
      ...form,
      contractValue: parseFloat(form.contractValue) || 0,
    };

    const success = await createContract(contractData, files);

    if (success) {
      toast.success("Contract created successfully");
      resetForm();
      fetchContracts();
    }
  };

  const resetForm = () => {
    setForm(initialForm);
    setFiles([]);
    setShowForm(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contracts</h1>
          <p className="text-muted-foreground">
            Manage and create contracts with document uploads
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} disabled={isLoading}>
          {showForm ? (
            <>
              <X className="h-4 w-4 mr-2" /> Cancel
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" /> New Contract
            </>
          )}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Contract</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="operator">Operator</Label>
                  <Input
                    id="operator"
                    name="operator"
                    value={form.operator}
                    onChange={handleChange}
                    placeholder="e.g., SEPLAT, NNPC, SHELL"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contractorName">Contractor Name</Label>
                  <Input
                    id="contractorName"
                    name="contractorName"
                    value={form.contractorName}
                    onChange={handleChange}
                    placeholder="e.g., MONTEGO, SCHLUMBERGER"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contractTitle">Contract Title</Label>
                <Input
                  id="contractTitle"
                  name="contractTitle"
                  value={form.contractTitle}
                  onChange={handleChange}
                  placeholder="Enter contract title"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contractNumber">Contract Number</Label>
                  <Input
                    id="contractNumber"
                    name="contractNumber"
                    value={form.contractNumber}
                    onChange={handleChange}
                    placeholder="e.g., SEPLAT/MON/2024/001"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    name="year"
                    type="number"
                    value={form.year}
                    onChange={handleChange}
                    min="2000"
                    max="2100"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Start Date
                  </Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    End Date
                  </Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={form.endDate}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contractValue">
                    <DollarSign className="h-4 w-4 inline mr-1" />
                    Contract Value
                  </Label>
                  <Input
                    id="contractValue"
                    name="contractValue"
                    type="number"
                    value={form.contractValue}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    disabled={isLoading}
                  />
                </div>
              </div>


              {/* Document Upload Section */}
              <div className="space-y-2">
                <Label>
                  <Upload className="h-4 w-4 inline mr-1" />
                  Contract Documents
                </Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25 hover:border-muted-foreground/50"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Drag and drop files here, or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Supports PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, JPG, PNG
                  </p>
                  <input
                    type="file"
                    id="fileUpload"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => document.getElementById("fileUpload")?.click()}
                    disabled={isLoading}
                  >
                    Browse Files
                  </Button>
                </div>

                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium">
                      Selected Files ({files.length})
                    </p>
                    <div className="space-y-2">
                      {files.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-muted rounded-md"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFile(index)}
                            disabled={isLoading}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {mediaLoading && uploadProgress > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Uploading files...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Contract"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {!showForm && contracts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No contracts yet</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first contract
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" /> Create Contract
            </Button>
          </CardContent>
        </Card>
      )}

      {!showForm && contracts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>All Contracts ({contracts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contracts.map((contract) => (
                <div
                  key={contract.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <h4 className="font-medium">{contract.contractTitle}</h4>
                    <p className="text-sm text-muted-foreground">
                      {contract.operator} • {contract.contractorName} •{" "}
                      {contract.contractNumber}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      ${contract.contractValue?.toLocaleString() || "N/A"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {contract.year}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Contracts;
