import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { usePDFDialog } from '@/contexts/PDFDialogContext';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  File,
  Search,
  Upload,
  FolderOpen,
  Eye,
  Download,
  Calendar,
  User,
} from 'lucide-react';

interface PDFFile {
  id: number;
  unique_id: string;
  title: string;
  description: string;
  version: number;
  size: number;
  created_at: string;
  updated_at: string;
  uploaded_by: string;
  url: string;
}

interface PDFListProps {
  folderId?: number | string | null;
  projectId?: number;
}

export default function PDFList({ folderId, projectId }: PDFListProps) {
  const [pdfFiles, setPdfFiles] = useState<PDFFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const { openPDFDialog } = usePDFDialog();

  useEffect(() => {
    // Hämta PDF-filer från API
    const fetchPDFFiles = async () => {
      try {
        setLoading(true);
        // Använd vår API-integration för att hämta listan
        // PDFAPIService är exporterad till window från pdf-api-integration.js
        const files = await (window as any).PDFAPIService.getPDFList(folderId);
        setPdfFiles(files);
        setError(null);
      } catch (err) {
        console.error('Error fetching PDF files:', err);
        setError('Kunde inte hämta PDF-filer. Kontrollera din anslutning.');
      } finally {
        setLoading(false);
      }
    };

    fetchPDFFiles();
  }, [folderId]);

  // Filtrera PDF-filer baserat på söktermen
  const filteredPDFFiles = pdfFiles.filter(file => 
    file.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.uploaded_by.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Formatera filstorlek för bättre läsbarhet
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    else return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  // Formatera datum för bättre läsbarhet
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Hantera uppladdning av ny PDF
  const handleUpload = async () => {
    if (!fileToUpload) return;

    try {
      setLoading(true);
      
      // Använd vår API-integration för att ladda upp filen
      const result = await (window as any).PDFAPIService.uploadPDF(fileToUpload, {
        title: fileToUpload.name,
        description: 'Uppladdad ' + new Date().toLocaleString(),
        projectId: projectId || 1,
        folderId: folderId === 'root' ? null : folderId
      });

      // Uppdatera listan efter uppladdning
      setPdfFiles(prev => [result, ...prev]);
      setFileToUpload(null);
      setError(null);
    } catch (err) {
      console.error('Error uploading PDF file:', err);
      setError('Kunde inte ladda upp PDF-filen. Kontrollera din anslutning.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex items-center space-x-2">
          <h2 className="text-2xl font-bold">PDF-dokument</h2>
          {folderId && (
            <div className="px-2 py-1 bg-slate-100 rounded text-sm flex items-center">
              <FolderOpen className="h-4 w-4 mr-1 text-blue-500" />
              {folderId === 'root' ? 'Rot' : `Mapp: ${folderId}`}
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Sök dokument..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Input 
              type="file"
              accept="application/pdf"
              className="w-auto"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFileToUpload(e.target.files[0]);
                }
              }}
            />
            <Button 
              onClick={handleUpload}
              disabled={!fileToUpload || loading}
            >
              <Upload className="h-4 w-4 mr-2" />
              Ladda upp
            </Button>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <span className="ml-3">Laddar PDF-dokument...</span>
        </div>
      ) : filteredPDFFiles.length === 0 ? (
        <div className="text-center py-10 border rounded-lg bg-slate-50">
          <File className="h-12 w-12 mx-auto text-slate-400" />
          <h3 className="mt-2 text-lg font-medium">Inga PDF-dokument</h3>
          <p className="text-slate-500 mt-1">
            {searchTerm 
              ? 'Inga dokument matchar din sökning. Rensa sökningen och försök igen.' 
              : 'Ladda upp ett PDF-dokument för att komma igång.'}
          </p>
        </div>
      ) : (
        <div className="border rounded-md overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dokument</TableHead>
                <TableHead>Storlek</TableHead>
                <TableHead>Senast ändrad</TableHead>
                <TableHead>Uppladdad av</TableHead>
                <TableHead className="text-right">Åtgärder</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPDFFiles.map((file) => (
                <TableRow key={file.id}>
                  <TableCell>
                    <div 
                      className="flex items-start cursor-pointer"
                      onClick={() => openPDFDialog({
                        fileId: file.id,
                        filename: file.title,
                        projectId: projectId,
                        folderId: folderId === 'root' ? null : (folderId as number)
                      })}
                    >
                      <File className="h-5 w-5 mr-2 mt-1 flex-shrink-0 text-blue-500" />
                      <div>
                        <div className="font-medium">{file.title}</div>
                        {file.description && (
                          <div className="text-xs text-slate-500 mt-1">{file.description}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{formatFileSize(file.size)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <Calendar className="h-3 w-3 mr-1 text-slate-400" />
                      {formatDate(file.updated_at)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <User className="h-3 w-3 mr-1 text-slate-400" />
                      {file.uploaded_by}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openPDFDialog({
                          fileId: file.id,
                          filename: file.title,
                          projectId: projectId,
                          folderId: folderId === 'root' ? null : (folderId as number)
                        })}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          window.open(file.url, '_blank');
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}