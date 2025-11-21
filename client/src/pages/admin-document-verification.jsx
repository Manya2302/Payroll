import { useState,useEffect } from "react";
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
import { useNavigate } from "react-router-dom";
import { Navigate } from "react-router-dom";
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
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Download, 
  Search 
} from "lucide-react";

export default function AdminDocumentVerification() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [verificationNotes, setVerificationNotes] = useState("");
  //  const navigate = useNavigate();

  if (user === null) {
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
  return null;
}

  // Fetch documents
  const { data: documentsData, isLoading, refetch } = useQuery({
    queryKey: ["/api/admin/documents"],
    queryFn: async () => {
      const response = await fetch("/api/admin/documents", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch documents");
      return response.json();
    },
  });

  // Mutation for verifying document
  const verifyDocumentMutation = useMutation({
    mutationFn: async ({ documentId, verificationStatus, verificationNotes }) => {
      return await apiRequest("PUT", `/api/admin/documents/${documentId}/verify`, {
        verificationStatus,
        verificationNotes,
      });
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["/api/admin/documents"], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          documents: oldData.documents.map((doc) =>
            doc._id === variables.documentId
              ? { ...doc, verificationStatus: variables.verificationStatus }
              : doc
          ),
        };
      });

      refetch();
      setSelectedDocument(null);
      setVerificationNotes("");
      toast({ title: "Success", description: "Document verification updated!" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
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

  // Filtering
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      !searchTerm ||
      `${doc.employeeInfo?.firstName} ${doc.employeeInfo?.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      doc.employeeInfo?.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.documentType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || doc.verificationStatus === filterStatus;

    const matchesType =
      filterType === "all" || doc.documentType === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Status Badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 text-sm px-3 py-1 flex items-center gap-1">
            <CheckCircle className="w-4 h-4" /> Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 text-sm px-3 py-1 flex items-center gap-1">
            <XCircle className="w-4 h-4" /> Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 text-sm px-3 py-1 flex items-center gap-1">
            <Clock className="w-4 h-4" /> Pending
          </Badge>
        );
    }
  };
if (user === null) {
  return <Navigate to="/login" replace />;
}
  if (!user || user.role !== "admin") {
    return (
      <Layout>
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="mt-2">You do not have permission to access this page.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">

        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Document Verification</h1>
          <p className="text-gray-600 mt-2">Review and verify employee uploaded documents</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader><CardTitle>Total Documents</CardTitle></CardHeader>
            <CardContent className="text-3xl font-bold">{documents.length}</CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Pending</CardTitle></CardHeader>
            <CardContent className="text-3xl font-bold text-yellow-600">
              {documents.filter((d) => d.verificationStatus === "pending").length}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Approved</CardTitle></CardHeader>
            <CardContent className="text-3xl font-bold text-green-600">
              {documents.filter((d) => d.verificationStatus === "approved").length}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Rejected</CardTitle></CardHeader>
            <CardContent className="text-3xl font-bold text-red-600">
              {documents.filter((d) => d.verificationStatus === "rejected").length}
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Documents</CardTitle>
            <CardDescription>Search and filter employee documents</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">

              {/* Search Box */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  className="pl-12 h-12 text-lg"
                  placeholder="Search employee, ID, document type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Status Filter */}
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="md:w-56 h-12 text-lg">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              {/* Type Filter */}
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="md:w-56 h-12 text-lg">
                  <SelectValue placeholder="Document Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Array.from(new Set(documents.map((d) => d.documentType))).map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

            </div>
          </CardContent>
        </Card>

        {/* DOCUMENT LIST */}
        {isLoading ? (
          <div className="flex justify-center p-10">
            <div className="animate-spin h-10 w-10 border-b-2 border-primary rounded-full"></div>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <Card className="p-12 text-center shadow-lg">
            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-lg text-gray-600">No documents found</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredDocuments.map((doc) => (
              <Card
                key={doc._id}
                className="shadow-md hover:shadow-xl transition-all border border-gray-200 rounded-xl"
              >
                <CardContent className="p-6 flex flex-col gap-6">

                  {/* Document header */}
                  <div className="flex items-center gap-5">
                    <div className="p-4 w-16 h-16 rounded-xl bg-blue-50 flex items-center justify-center">
                      <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl text-gray-900">{doc.documentName}</h3>
                      <p className="text-sm text-gray-600">{doc.documentType}</p>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-y-4 text-sm border-t pt-4">
                    <div>
                      <span className="text-gray-500">Employee:</span>
                      <p className="font-medium text-gray-800">
                        {doc.employeeInfo?.firstName} {doc.employeeInfo?.lastName}
                      </p>
                    </div>

                   

                    <div>
                      <span className="text-gray-500">Department:</span>
                      <p className="font-medium text-gray-800">{doc.employeeInfo?.department || "N/A"}</p>
                    </div>

                    <div>
                      <span className="text-gray-500">Uploaded:</span>
                      <p className="font-medium text-gray-800">
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <div className="text-sm font-semibold text-gray-600 mb-1">Status</div>
                    {getStatusBadge(doc.verificationStatus)}
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-end gap-3 mt-2">
                    {doc.verificationStatus === "pending" && (
                      <Button
                        size="sm"
                        className="px-5"
                        onClick={() => setSelectedDocument(doc)}
                      >
                        <Eye className="w-4 h-4 mr-2" /> Review
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      className="px-5"
                      onClick={() => window.open(doc.documentUrl, "_blank")}
                    >
                      <Download className="w-16 h-4 mr-2" /> Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Review Dialog */}
        <Dialog
          open={!!selectedDocument}
          onOpenChange={(open) => !open && setSelectedDocument(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Document</DialogTitle>
              <DialogDescription>Review and verify the employee document</DialogDescription>
            </DialogHeader>

            {selectedDocument && (
              <>
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-gray-600">Employee: </span>
                    <strong>{selectedDocument.employeeInfo?.firstName} {selectedDocument.employeeInfo?.lastName}</strong>
                  </div>
                 
                  <div>
                    <span className="text-gray-600">Document Type: </span>
                    <strong>{selectedDocument.documentType}</strong>
                  </div>
                  <div>
                    <span className="text-gray-600">Uploaded: </span>
                    <strong>{new Date(selectedDocument.uploadedAt).toLocaleDateString()}</strong>
                  </div>
                  <div>
                    <span className="text-gray-600">Status: </span>
                    {getStatusBadge(selectedDocument.verificationStatus)}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Verification Notes</label>
                  <Textarea
                    rows={3}
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    placeholder="Add notes (optional)"
                  />
                </div>

                <div className="border p-4 rounded mt-4">
                  <p className="text-sm mb-2">Document Preview:</p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(selectedDocument.documentUrl, "_blank")}
                  >
                    <Eye className="w-4 h-4 mr-2" /> View Document
                  </Button>
                </div>
              </>
            )}

            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedDocument(null);
                  setVerificationNotes("");
                }}
              >
                Cancel
              </Button>

              {/* Show Approve/Reject only if pending */}
              {selectedDocument?.verificationStatus === "pending" && (
                <>
                  <Button
                    variant="destructive"
                    onClick={() => handleVerify("rejected")}
                    disabled={verifyDocumentMutation.isPending}
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Reject
                  </Button>

                  <Button
                    onClick={() => handleVerify("approved")}
                    disabled={verifyDocumentMutation.isPending}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> Approve
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </Layout>
  );
}
