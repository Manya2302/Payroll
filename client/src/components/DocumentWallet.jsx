// import React, { useState } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { useQuery, useMutation } from "@tanstack/react-query";
// import { queryClient } from "@/lib/queryClient";
// import { useToast } from "@/hooks/use-toast";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { FileText, Upload, Trash2, Download, File } from "lucide-react";
// import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// const documentTypes = [
//   'Aadhaar Card',
//   'PAN Card',
//   'Passport',
//   'Voter ID',
//   'Driving License',
//   'Ration Card',
//   'Birth Certificate',
//   'Education Certificate',
//   'Experience Letter',
//   'Salary Slip',
//   'Bank Statement',
//   'Offer Letter',
//   'Appointment Letter',
//   'Relieving Letter',
//   'Other'
// ];

// const documentSchema = z.object({
//   documentType: z.string().min(1, "Document type is required"),
//   documentName: z.string().min(1, "Document name is required"),
// });

// export default function DocumentWallet() {
//   const { toast } = useToast();
//   const [selectedFile, setSelectedFile] = useState(null);

//   const documentForm = useForm({
//     resolver: zodResolver(documentSchema),
//     defaultValues: {
//       documentType: "",
//       documentName: "",
//     },
//   });

//   const { data: documentsData } = useQuery({
//     queryKey: ["/api/documents"],
//     queryFn: async () => {
//       const response = await fetch("/api/documents", {
//         credentials: "include",
//       });
//       if (!response.ok) throw new Error("Failed to fetch documents");
//       return response.json();
//     },
//   });

//   const uploadDocumentMutation = useMutation({
//     mutationFn: async (formData) => {
//       const response = await fetch("/api/documents/upload", {
//         method: "POST",
//         credentials: "include",
//         body: formData,
//       });
//       if (!response.ok) {
//         const error = await response.json();
//         throw new Error(error.message || "Failed to upload document");
//       }
//       return response.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
//       documentForm.reset();
//       setSelectedFile(null);
//       toast({
//         title: "Success",
//         description: "Document uploaded successfully",
//       });
//     },
//     onError: (error) => {
//       toast({
//         title: "Error",
//         description: error.message,
//         variant: "destructive",
//       });
//     },
//   });

//   const deleteDocumentMutation = useMutation({
//     mutationFn: async (documentId) => {
//       const response = await fetch(`/api/documents/${documentId}`, {
//         method: "DELETE",
//         credentials: "include",
//       });
//       if (!response.ok) throw new Error("Failed to delete document");
//       return response.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
//       toast({
//         title: "Success",
//         description: "Document deleted successfully",
//       });
//     },
//     onError: (error) => {
//       toast({
//         title: "Error",
//         description: error.message,
//         variant: "destructive",
//       });
//     },
//   });

//   const onDocumentSubmit = (data) => {
//     if (!selectedFile) {
//       toast({
//         title: "Error",
//         description: "Please select a file to upload",
//         variant: "destructive",
//       });
//       return;
//     }

//     const formData = new FormData();
//     formData.append("document", selectedFile);
//     formData.append("documentType", data.documentType);
//     formData.append("documentName", data.documentName);

//     uploadDocumentMutation.mutate(formData);
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setSelectedFile(file);
//     }
//   };

//   const handleDelete = (documentId) => {
//     if (confirm("Are you sure you want to delete this document?")) {
//       deleteDocumentMutation.mutate(documentId);
//     }
//   };

//   const documents = documentsData?.documents || [];

//   return (
//     <div className="space-y-6">
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Upload className="w-5 h-5" />
//             Upload New Document
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <Form {...documentForm}>
//             <form onSubmit={documentForm.handleSubmit(onDocumentSubmit)} className="space-y-4">
//               <FormField
//                 control={documentForm.control}
//                 name="documentType"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Document Type</FormLabel>
//                     <Select onValueChange={field.onChange} value={field.value}>
//                       <FormControl>
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select document type" />
//                         </SelectTrigger>
//                       </FormControl>
//                       <SelectContent>
//                         {documentTypes.map((type) => (
//                           <SelectItem key={type} value={type}>
//                             {type}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={documentForm.control}
//                 name="documentName"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Document Name</FormLabel>
//                     <FormControl>
//                       <Input placeholder="e.g., My Aadhaar Card" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <div>
//                 <label className="block text-sm font-medium mb-2">Select File</label>
//                 <Input
//                   type="file"
//                   accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
//                   onChange={handleFileChange}
//                   className="cursor-pointer"
//                 />
//                 {selectedFile && (
//                   <p className="text-sm text-gray-600 mt-2">
//                     Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
//                   </p>
//                 )}
//               </div>

//               <Button
//                 type="submit"
//                 disabled={uploadDocumentMutation.isPending}
//                 className="bg-primary hover:bg-primary/90"
//               >
//                 <Upload className="w-4 h-4 mr-2" />
//                 {uploadDocumentMutation.isPending ? "Uploading..." : "Upload Document"}
//               </Button>
//             </form>
//           </Form>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <FileText className="w-5 h-5" />
//             My Documents ({documents.length})
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           {documents.length === 0 ? (
//             <div className="text-center py-8 text-gray-500">
//               <File className="w-12 h-12 mx-auto mb-2 opacity-50" />
//               <p>No documents uploaded yet</p>
//             </div>
//           ) : (
//             <div className="space-y-3">
//               {documents.map((doc) => (
//                 <div
//                   key={doc.id}
//                   className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
//                 >
//                   <div className="flex items-center gap-3 flex-1">
//                     <FileText className="w-8 h-8 text-blue-500" />
//                     <div>
//                       <h4 className="font-medium">{doc.documentName}</h4>
//                       <p className="text-sm text-gray-600">{doc.documentType}</p>
//                       <p className="text-xs text-gray-500">
//                         Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
//                         {doc.fileSize && ` • ${(doc.fileSize / 1024).toFixed(2)} KB`}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="flex gap-2">
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       onClick={() => window.open(doc.documentUrl, "_blank")}
//                     >
//                       <Download className="w-4 h-4" />
//                     </Button>
//                     <Button
//                       size="sm"
//                       variant="destructive"
//                       onClick={() => handleDelete(doc.id)}
//                       disabled={deleteDocumentMutation.isPending}
//                     >
//                       <Trash2 className="w-4 h-4" />
//                     </Button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
// import { FileText, Upload, Trash2, Download, File } from "lucide-react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  // Eye, 
  Download, 
  // Search ,
  Upload, 
  Trash2,
  File
} from "lucide-react";

const documentTypes = [
  'Aadhaar Card',
  'PAN Card',
  'Passport',
  'Voter ID',
  'Driving License',
  'Ration Card',
  'Birth Certificate',
  'Education Certificate',
  'Experience Letter',
  'Salary Slip',
  'Bank Statement',
  'Offer Letter',
  'Appointment Letter',
  'Relieving Letter',
  'Other'
];

const documentSchema = z.object({
  documentType: z.string().min(1, "Document type is required"),
  documentName: z.string().min(1, "Document name is required"),
});

export default function DocumentWallet() {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState(null);

  const documentForm = useForm({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      documentType: "",
      documentName: "",
    },
  });

  const { data: documentsData } = useQuery({
    queryKey: ["/api/documents"],
    queryFn: async () => {
      const response = await fetch("/api/documents", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch documents");
      return response.json();
    },
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await fetch("/api/documents/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to upload document");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      documentForm.reset();
      setSelectedFile(null);
      toast({
        title: "Success",
        description: "Document uploaded successfully",
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

  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId) => {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete document");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Success",
        description: "Document deleted successfully",
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

  const onDocumentSubmit = (data) => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("document", selectedFile);
    formData.append("documentType", data.documentType);
    formData.append("documentName", data.documentName);

    uploadDocumentMutation.mutate(formData);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDelete = (documentId) => {
    if (confirm("Are you sure you want to delete this document?")) {
      deleteDocumentMutation.mutate(documentId);
    }
  };
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
  /**
   * NEW FUNCTION: Creates a temporary hidden <a> tag and clicks it to trigger download.
   * This is the best frontend way to force a download.
   * @param {string} url - The document's direct URL.
   * @param {string} fileName - The desired name for the downloaded file.
   */
  const handleDownload = (url, fileName) => {
    const link = document.createElement('a');
    link.href = url;
    // The download attribute forces the browser to download the linked URL
    // instead of navigating to it. fileName sets the default file name.
    link.setAttribute('download', fileName);
    link.target = '_blank'; // Opens in a new tab first (good fallback)
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
        title: "Download Initiated",
        description: `Downloading ${fileName}...`,
    });
  };

  const documents = documentsData?.documents || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload New Document
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...documentForm}>
            <form onSubmit={documentForm.handleSubmit(onDocumentSubmit)} className="space-y-4">
              <FormField
                control={documentForm.control}
                name="documentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {documentTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={documentForm.control}
                name="documentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., My Aadhaar Card" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <label className="block text-sm font-medium mb-2">Select File</label>
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                {selectedFile && (
                  <p className="text-sm text-gray-600 mt-2">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={uploadDocumentMutation.isPending}
                className="bg-primary hover:bg-primary/90"
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploadDocumentMutation.isPending ? "Uploading..." : "Upload Document"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            My Documents ({documents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <File className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No documents uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <FileText className="w-8 h-8 text-blue-500" />
                    <div>
                      <h4 className="font-medium">{doc.documentName}</h4>
                      <p className="text-sm text-gray-600">{doc.documentType}</p>
                      <p className="text-xs text-gray-500">
                        Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                        {doc.fileSize && ` • ${(doc.fileSize / 1024).toFixed(2)} KB`}
                      </p>
                    </div>
                    <div>
                    <span className="text-gray-600">Status: </span>
                    {getStatusBadge(doc.verificationStatus)}
                  </div>
                  </div>

                  <div className="flex gap-2">
                    {/* UPDATED DOWNLOAD BUTTON HANDLER */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(doc.documentUrl, doc.documentName)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(doc.id)}
                      disabled={deleteDocumentMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}