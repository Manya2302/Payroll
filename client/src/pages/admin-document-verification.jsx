import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, CheckCircle, XCircle, Clock, Eye, Download, Search } from "lucide-react";

export default function AdminDocumentVerification() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [verificationNotes, setVerificationNotes] = useState("");

  const { data: documentsData, isLoading } = useQuery({
    queryKey: ["/api/admin/documents"],
    queryFn: async () => {
      const response = await fetch("/api/admin/documents", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch documents");
      return response.json();
    },
  });

  const verifyDocumentMutation = useMutation({
    mutationFn: async ({ documentId, verificationStatus, verificationNotes }) => {
      return await apiRequest("PUT", `/api/admin/documents/${documentId}/verify`, {
        verificationStatus,
        verificationNotes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/documents"] });
      setSelectedDocument(null);
      setVerificationNotes("");
      toast({
        title: "Success",
        description: "Document verification status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleVerify = (status) => {
    if (!selectedDocument) return;

    verifyDocumentMutation.mutate({
      documentId: selectedDocument._id,
      verificationStatus: status,
      verificationNotes,
    });
  };

  const documents = documentsData?.documents || [];

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      !searchTerm ||
      (doc.employeeInfo?.firstName + " " + doc.employeeInfo?.lastName)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      doc.employeeInfo?.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.documentType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" || doc.verificationStatus === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100" data-testid="badge-approved">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100" data-testid="badge-rejected">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100" data-testid="badge-pending">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <Layout>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="mt-2">You do not have permission to access this page.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900" data-testid="text-page-title">
            Document Verification
          </h1>
          <p className="text-gray-600 mt-2">
            Review and verify employee uploaded documents
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="hover-elevate">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-documents">
                {documents.length}
              </div>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600" data-testid="text-pending-documents">
                {documents.filter((d) => d.verificationStatus === "pending").length}
              </div>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" data-testid="text-approved-documents">
                {documents.filter((d) => d.verificationStatus === "approved").length}
              </div>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600" data-testid="text-rejected-documents">
                {documents.filter((d) => d.verificationStatus === "rejected").length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filter Documents</CardTitle>
            <CardDescription>Search and filter employee documents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by employee name, ID, or document type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-48" data-testid="select-filter-status">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Documents</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading documents...</p>
            </div>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center min-h-[200px]">
              <FileText className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-600">No documents found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredDocuments.map((doc) => (
              <Card key={doc._id} className="hover-elevate" data-testid={`card-document-${doc._id}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div>
                          <h3 className="font-semibold text-lg" data-testid={`text-document-name-${doc._id}`}>
                            {doc.documentName}
                          </h3>
                          <p className="text-sm text-gray-600">{doc.documentType}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 text-sm">
                        <div>
                          <span className="text-gray-600">Employee: </span>
                          <span className="font-medium" data-testid={`text-employee-name-${doc._id}`}>
                            {doc.employeeInfo?.firstName} {doc.employeeInfo?.lastName}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Employee ID: </span>
                          <span className="font-medium" data-testid={`text-employee-id-${doc._id}`}>
                            {doc.employeeInfo?.employeeId || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Department: </span>
                          <span className="font-medium">
                            {doc.employeeInfo?.department || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Uploaded: </span>
                          <span className="font-medium">
                            {new Date(doc.uploadedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3">{getStatusBadge(doc.verificationStatus)}</div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedDocument(doc)}
                        data-testid={`button-review-${doc._id}`}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Review
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(doc.documentUrl, "_blank")}
                        data-testid={`button-download-${doc._id}`}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={!!selectedDocument} onOpenChange={(open) => !open && setSelectedDocument(null)}>
          <DialogContent className="max-w-2xl" data-testid="dialog-review-document">
            <DialogHeader>
              <DialogTitle>Review Document</DialogTitle>
              <DialogDescription>
                Review and verify the employee document
              </DialogDescription>
            </DialogHeader>

            {selectedDocument && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Employee: </span>
                    <span className="font-medium">
                      {selectedDocument.employeeInfo?.firstName}{" "}
                      {selectedDocument.employeeInfo?.lastName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Employee ID: </span>
                    <span className="font-medium">
                      {selectedDocument.employeeInfo?.employeeId || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Document Type: </span>
                    <span className="font-medium">{selectedDocument.documentType}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Document Name: </span>
                    <span className="font-medium">{selectedDocument.documentName}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Uploaded: </span>
                    <span className="font-medium">
                      {new Date(selectedDocument.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Status: </span>
                    {getStatusBadge(selectedDocument.verificationStatus)}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Verification Notes (Optional)
                  </label>
                  <Textarea
                    placeholder="Add notes about the verification..."
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    rows={3}
                    data-testid="textarea-verification-notes"
                  />
                </div>

                <div className="border rounded-md p-4">
                  <p className="text-sm text-gray-600 mb-2">Document Preview:</p>
                  <Button
                    variant="outline"
                    onClick={() => window.open(selectedDocument.documentUrl, "_blank")}
                    className="w-full"
                    data-testid="button-view-document"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Document
                  </Button>
                </div>
              </div>
            )}

            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedDocument(null);
                  setVerificationNotes("");
                }}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleVerify("rejected")}
                disabled={verifyDocumentMutation.isPending}
                data-testid="button-reject"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={() => handleVerify("approved")}
                disabled={verifyDocumentMutation.isPending}
                data-testid="button-approve"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
