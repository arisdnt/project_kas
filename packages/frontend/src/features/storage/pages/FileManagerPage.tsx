import { useMemo, useRef, useState, useEffect } from 'react'
import { uploadFile, type UploadTarget } from '@/features/storage/services/storageService'
import { dokumenService, type DokumenItem } from '@/features/storage/services/dokumenService'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Card, CardContent } from '@/core/components/ui/card'
import { ScopeSelector } from '@/core/components/ui/scope-selector'
import { Separator } from '@/core/components/ui/separator'
import { useToast } from '@/core/hooks/use-toast'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { 
  Upload, 
  
  Copy, 
  Check, 
  FolderOpen,
  Image,
  FileText,
  Trash2,
  Eye,
  Search,
  Filter,
  HardDrive,
  Calendar,
  User,
  FileIcon
} from 'lucide-react'
import { ChevronDown } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/core/components/ui/table"
import { Badge } from "@/core/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/core/components/ui/dialog"
import DocumentPreviewModal from "@/features/storage/components/DocumentPreviewModal"
import { formatBytes, getFileType, formatDate, getMimeTypeExtension, getFileIcon, getFileIconColor } from "./fileUtils"

interface FileItem {
  id: string
  key: string
  name: string
  size: number
  type: string
  category: UploadTarget
  uploadedBy: string
  uploadedAt: Date
  url?: string
}

export function FileManagerPage() {
  const { toast } = useToast()
  const [target, setTarget] = useState<UploadTarget>('umum')
  const [isUploading, setIsUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<FileItem[]>([])
  // Removed unused resolveKey state
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<UploadTarget | 'all'>('all')
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewOpenUrl, setPreviewOpenUrl] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [scopeData, setScopeData] = useState<{ targetTenantId?: string; targetStoreId?: string; applyToAllTenants?: boolean; applyToAllStores?: boolean }>({})
  
  // Pagination state
  const [page, setPage] = useState(1)
  const [limit] = useState(50)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const tableContainerRef = useRef<HTMLDivElement>(null)

  // Load files from database
  const loadFiles = async (isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setIsLoadingMore(true)
      } else {
        setIsLoading(true)
        setPage(1)
        setFiles([])
      }
      
      const response = await dokumenService.getList({
        page: isLoadMore ? page + 1 : 1,
        limit,
        kategori: selectedCategory === 'all' ? undefined : selectedCategory,
        search: searchTerm || undefined
      })
      
      if (!response?.data?.items) {
        console.warn('No data received from API')
        if (!isLoadMore) setFiles([])
        return
      }
      
      const dokumenFiles: FileItem[] = response.data.items
        .filter((dok: DokumenItem) => dok.id && dok.id.trim() !== '') // Filter out invalid IDs
        .map((dok: DokumenItem) => ({
          id: dok.id, // ID is already a string UUID from backend
          key: dok.kunci_objek || '',
          name: dok.nama_file_asli || 'Unknown',
          size: dok.ukuran_file || 0,
          type: dok.tipe_mime || 'application/octet-stream',
          category: dok.kategori as UploadTarget || 'umum',
          uploadedBy: dok.diupload_oleh?.toString() || 'Unknown',
          uploadedAt: new Date(dok.tanggal_upload || Date.now())
        }))
      
      if (isLoadMore) {
        setFiles(prev => [...prev, ...dokumenFiles])
        setPage(prev => prev + 1)
      } else {
        setFiles(dokumenFiles)
        setPage(1)
      }
      
      setTotal(response.data.total)
      setHasMore(response.data.page < response.data.totalPages)
    } catch (error) {
      console.error('Error loading files:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat daftar file',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }

  useEffect(() => {
    loadFiles()
  }, [])

  // Debounced search and filter
  useEffect(() => {
    const timer = setTimeout(() => {
      loadFiles()
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm, selectedCategory])

  // Infinite scroll handler
  useEffect(() => {
    const container = tableContainerRef.current
    if (!container) return

    const handleScroll = () => {
      if (!hasMore || isLoadingMore || isLoading) return
      
      const { scrollTop, scrollHeight, clientHeight } = container
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight
      
      if (scrollPercentage > 0.8) { // Load more when 80% scrolled
        loadFiles(true)
      }
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [hasMore, isLoadingMore, isLoading])

  const helperText = useMemo(
    () => ({
      umum: 'Dokumen umum (resi, lampiran, dll.)',
      produk: 'Gambar produk (jpeg, png, webp, gif)',
      dokumen: 'File PDF/dokumen transaksi',
    }[target]),
    [target]
  )

  // filteredFiles logic inlined by using search/filter directly in load; kept raw files listing

  const stats = useMemo(() => {
    const totalSize = files.reduce((sum, file) => sum + file.size, 0)
    const categoryCounts = files.reduce((acc, file) => {
      acc[file.category] = (acc[file.category] || 0) + 1
      return acc
    }, {} as Record<UploadTarget, number>)
    
    return {
      totalFiles: files.length,
      totalSize,
      categoryCounts
    }
  }, [files])

  async function handleUpload() {
    const file = fileRef.current?.files?.[0]
    if (!file) {
      toast({ title: 'Pilih file terlebih dahulu', variant: 'destructive' })
      return
    }
    setIsUploading(true)
    try {
      // Upload file to storage bucket first
      await uploadFile(file, target)
      // After successful raw file upload, create dokumen metadata with scope (if backend supports)
      try {
        await dokumenService.create({
          status: 'aktif',
          kunci_objek: file.name, // assuming file name as key; adapt if service returns a key
          nama_file_asli: file.name,
          ukuran_file: file.size,
            tipe_mime: file.type || 'application/octet-stream',
          kategori: target,
          deskripsi: undefined,
          ...(scopeData)
        } as any)
      } catch (metaErr) {
        // Non-fatal if backend belum dukung scope fields; log silently
        console.warn('Dokumen metadata create (with scope) failed or skipped:', metaErr)
      }
      toast({ title: 'Berhasil unggah', description: file.name })
      
      // Reload files from database to get updated list
      await loadFiles()
      
      // Clear file input and close dialog
      if (fileRef.current) fileRef.current.value = ''
      setUploadDialogOpen(false)
      setScopeData({})
    } catch (e: any) {
      toast({ title: 'Gagal unggah', description: e?.message || 'Terjadi kesalahan', variant: 'destructive' })
    } finally {
      setIsUploading(false)
    }
  }

  async function openPreview(file: FileItem) {
    try {
      // Validate file ID
      if (!file.id || file.id.trim() === '') {
        throw new Error('ID file tidak valid')
      }
      
      // Use same-origin streaming endpoint to work offline without external viewer/CORS
      const streamUrl = dokumenService.getStreamUrl(file.id)
      // Also get presigned URL for opening in a new tab / download without auth header
      let openUrl: string | null = null
      try {
        const presigned = await dokumenService.getFileUrl(file.id)
        openUrl = presigned.data.url
      } catch {}
      setSelectedFile(file)
      setPreviewUrl(streamUrl)
      setPreviewOpenUrl(openUrl)
      setPreviewOpen(true)
    } catch (e: any) {
      toast({ title: 'Gagal membuka', description: e?.message || 'Tidak dapat mengakses file', variant: 'destructive' })
    }
  }

  async function resolveAndCopyUrl(fileId: string) {
    try {
      if (!fileId || fileId.trim() === '') {
        throw new Error('ID file tidak valid')
      }
      
      const response = await dokumenService.getFileUrl(fileId)
      await navigator.clipboard.writeText(response.data.url)
      setCopiedKey(fileId)
      setTimeout(() => setCopiedKey((k) => (k === fileId ? null : k)), 1200)
      toast({ title: 'URL disalin', description: 'Tempel untuk dibagikan' })
      setFiles((prev) => prev.map((it) => (it.id === fileId ? { ...it, url: response.data.url } : it)))
    } catch (e: any) {
      toast({ title: 'Gagal mendapatkan URL', description: e?.message || 'Coba lagi', variant: 'destructive' })
    }
  }

  async function handleDelete(fileId: string) {
    const file = files.find(f => f.id === fileId)
    if (!file) return

    if (!fileId || fileId.trim() === '') {
      toast({ title: 'Gagal menghapus', description: 'ID file tidak valid', variant: 'destructive' })
      return
    }

    setIsDeleting(fileId)
    try {
      await dokumenService.delete(fileId)
      // Reload files to reset pagination
      await loadFiles()
      toast({ title: 'File berhasil dihapus', description: file.name })
    } catch (e: any) {
      toast({ title: 'Gagal menghapus', description: e?.message || 'Terjadi kesalahan', variant: 'destructive' })
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Files</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalFiles}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <HardDrive className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Size</p>
                <p className="text-2xl font-bold text-gray-900">{formatBytes(stats.totalSize)}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FolderOpen className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Produk</p>
                <p className="text-2xl font-bold text-gray-900">{stats.categoryCounts.produk || 0}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Image className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dokumen</p>
                <p className="text-2xl font-bold text-gray-900">{stats.categoryCounts.dokumen || 0}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari file..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <Button variant="outline" className="min-w-40 justify-between">
                    <Filter className="h-4 w-4 mr-2" />
                    <span>{selectedCategory === 'all' ? 'Semua Kategori' : selectedCategory}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content className="min-w-[160px] bg-white rounded-md p-1 shadow border border-gray-200">
                    <DropdownMenu.Item 
                      className="px-2 py-1.5 text-sm rounded hover:bg-gray-50 outline-none cursor-pointer" 
                      onSelect={() => setSelectedCategory('all')}
                    >
                      Semua Kategori
                    </DropdownMenu.Item>
                    {(['umum', 'produk', 'dokumen'] as UploadTarget[]).map((t) => (
                      <DropdownMenu.Item 
                        key={t} 
                        className="px-2 py-1.5 text-sm rounded hover:bg-gray-50 outline-none cursor-pointer" 
                        onSelect={() => setSelectedCategory(t)}
                      >
                        <span className="capitalize">{t}</span>
                      </DropdownMenu.Item>
                    ))}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
              <Dialog open={uploadDialogOpen} onOpenChange={(open) => {
                setUploadDialogOpen(open)
                if (open) {
                  // Reset form when dialog opens
                  setTarget('umum')
                  if (fileRef.current) fileRef.current.value = ''
                  setScopeData({})
                }
              }}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Upload File Baru</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-5">
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium">Scope</h3>
                      <ScopeSelector onScopeChange={setScopeData} compact disabled={isUploading} />
                      <Separator />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="file">Pilih File</Label>
                      <Input id="file" type="file" ref={fileRef} className="cursor-pointer" />
                      <p className="text-xs text-gray-500">Maksimal 10MB. Format: JPEG, PNG, PDF, DOC</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Kategori</Label>
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <Button variant="outline" className="w-full justify-between">
                            <span className="capitalize">{target}</span>
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                          <DropdownMenu.Content className="w-full min-w-[160px] bg-white rounded-md p-1 shadow border border-gray-200">
                            {(['umum', 'produk', 'dokumen'] as UploadTarget[]).map((t) => (
                              <DropdownMenu.Item 
                                key={t} 
                                className="px-2 py-1.5 text-sm rounded hover:bg-gray-50 outline-none cursor-pointer" 
                                onSelect={() => setTarget(t)}
                              >
                                <span className="capitalize">{t}</span>
                              </DropdownMenu.Item>
                            ))}
                          </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                      </DropdownMenu.Root>
                      <p className="text-xs text-gray-500">{helperText}</p>
                    </div>
                    <Button 
                      onClick={handleUpload} 
                      disabled={isUploading} 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Mengupload...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload File
                        </>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {/* Scrollable table container */}
          <div 
            ref={tableContainerRef}
            className="overflow-auto max-h-[calc(100vh-400px)] relative"
            style={{ 
              minHeight: '400px',
              scrollbarWidth: 'thin',
              scrollbarColor: '#e5e7eb #f9fafb'
            }}
          >
            <Table className="relative">
              {/* Sticky header */}
              <TableHeader className="sticky top-0 z-10 bg-white shadow-sm">
                <TableRow>
                  <TableHead className="pl-6">Nama File</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Ukuran</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Tanggal Upload</TableHead>
                  <TableHead>Diupload Oleh</TableHead>
                  <TableHead className="text-right pr-6">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.length === 0 && !isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-16">
                      <div className="text-center">
                        <FileIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">Tidak ada file yang ditemukan</p>
                        <p className="text-xs text-gray-400 mt-1">Total: {total} file</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  files.map((file) => {
                    const fileType = getFileType(file.name)
                    const FileIconComponent = getFileIcon(fileType, file.name)
                    const fileExt = file.name.split('.').pop()?.toLowerCase() || ''
                    const iconColor = getFileIconColor(fileExt)
                    return (
                      <TableRow key={file.id}>
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <FileIconComponent className={`h-5 w-5 ${iconColor}`} />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{file.name}</p>
                              <p className="text-sm text-gray-500">{file.key}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {file.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-900">{formatBytes(file.size)}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-900">{getMimeTypeExtension(file.type)}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-900">{formatDate(file.uploadedAt)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-900">{file.uploadedBy}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openPreview(file)}
                              className="h-8 w-8 p-0"
                              aria-label="Detail"
                              title="Detail"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => resolveAndCopyUrl(file.id)}
                              className="h-8 w-8 p-0"
                            >
                              {copiedKey === file.id ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(file.id)}
                              disabled={isDeleting === file.id}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
                
                {/* Loading indicator row */}
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="text-sm text-gray-600">Memuat file...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                
                {/* Load more indicator */}
                {isLoadingMore && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      <div className="flex items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        <span className="text-sm text-gray-600">Memuat lebih banyak file...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                
                {/* End of data indicator */}
                {!hasMore && files.length > 0 && !isLoading && !isLoadingMore && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-500">
                          Menampilkan {files.length} dari {total} file
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Scroll ke bawah untuk memuat lebih banyak</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Preview Modal (clean, minimal wrapper) */}
      {selectedFile && previewUrl && (
        <DocumentPreviewModal
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          name={selectedFile.name}
          mimeType={selectedFile.type}
          size={selectedFile.size}
          url={previewUrl}
          openUrl={previewOpenUrl ?? undefined}
        />
      )}

      </div>
  )
}

export default FileManagerPage
