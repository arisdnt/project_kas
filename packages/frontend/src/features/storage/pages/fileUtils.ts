import { 
  Image, 
  File, 
  FileText, 
  FileIcon, 
  FileSpreadsheet, 
  FileImage, 
  FileVideo, 
  FileAudio, 
  FileArchive, 
  FileCode,
  FilePlus,
  FileQuestion,
  File as FileDefault
} from "lucide-react"

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export function getFileType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg']
  const documentTypes = ['pdf', 'doc', 'docx', 'txt', 'rtf']
  const spreadsheetTypes = ['xls', 'xlsx', 'csv']
  const presentationTypes = ['ppt', 'pptx']
  
  if (imageTypes.includes(ext || '')) return 'image'
  if (documentTypes.includes(ext || '')) return 'document'
  if (spreadsheetTypes.includes(ext || '')) return 'spreadsheet'
  if (presentationTypes.includes(ext || '')) return 'presentation'
  
  return 'other'
}

export function getFileIcon(type: string, filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase()
  
  // Get icon based on file extension for better specificity
  switch (ext) {
    // Images
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
    case 'bmp':
    case 'svg':
    case 'tiff':
    case 'ico':
      return FileImage
      
    // Documents
    case 'pdf':
      return FileText
    case 'doc':
    case 'docx':
    case 'rtf':
      return FileText
      
    // Spreadsheets
    case 'xls':
    case 'xlsx':
    case 'csv':
      return FileSpreadsheet
      
    // Presentations
    case 'ppt':
    case 'pptx':
      return FileText
      
    // Videos
    case 'mp4':
    case 'avi':
    case 'mov':
    case 'wmv':
    case 'flv':
    case 'webm':
    case 'mpeg':
      return FileVideo
      
    // Audio
    case 'mp3':
    case 'wav':
    case 'ogg':
    case 'flac':
    case 'aac':
    case 'm4a':
      return FileAudio
      
    // Archives
    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
    case 'gz':
      return FileArchive
      
    // Code files
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
    case 'html':
    case 'css':
    case 'scss':
    case 'json':
    case 'xml':
    case 'py':
    case 'php':
    case 'java':
    case 'cpp':
    case 'c':
    case 'h':
      return FileCode
      
    // Text files
    case 'txt':
    case 'md':
    case 'log':
      return FileText
      
    default:
      // Fallback to general type
      switch (type) {
        case 'image':
          return FileImage
        case 'document':
          return FileText
        case 'spreadsheet':
          return FileSpreadsheet
        case 'presentation':
          return FileText
        default:
          return FileDefault
      }
  }
}

export function getFileIconColor(ext: string): string {
  const colorMap: Record<string, string> = {
    // Images
    'jpg': 'text-green-600',
    'jpeg': 'text-green-600',
    'png': 'text-green-600',
    'gif': 'text-green-600',
    'webp': 'text-green-600',
    'bmp': 'text-green-600',
    'svg': 'text-green-600',
    'tiff': 'text-green-600',
    'ico': 'text-green-600',
    
    // Documents
    'pdf': 'text-red-600',
    'doc': 'text-blue-600',
    'docx': 'text-blue-600',
    'rtf': 'text-blue-600',
    'txt': 'text-gray-600',
    'md': 'text-gray-600',
    
    // Spreadsheets
    'xls': 'text-green-600',
    'xlsx': 'text-green-600',
    'csv': 'text-green-600',
    
    // Presentations
    'ppt': 'text-orange-600',
    'pptx': 'text-orange-600',
    
    // Videos
    'mp4': 'text-purple-600',
    'avi': 'text-purple-600',
    'mov': 'text-purple-600',
    'wmv': 'text-purple-600',
    'flv': 'text-purple-600',
    'webm': 'text-purple-600',
    'mpeg': 'text-purple-600',
    
    // Audio
    'mp3': 'text-pink-600',
    'wav': 'text-pink-600',
    'ogg': 'text-pink-600',
    'flac': 'text-pink-600',
    'aac': 'text-pink-600',
    'm4a': 'text-pink-600',
    
    // Archives
    'zip': 'text-yellow-600',
    'rar': 'text-yellow-600',
    '7z': 'text-yellow-600',
    'tar': 'text-yellow-600',
    'gz': 'text-yellow-600',
    
    // Code files
    'js': 'text-yellow-600',
    'jsx': 'text-yellow-600',
    'ts': 'text-blue-600',
    'tsx': 'text-blue-600',
    'html': 'text-orange-600',
    'css': 'text-blue-600',
    'scss': 'text-pink-600',
    'json': 'text-gray-600',
    'xml': 'text-orange-600',
    'py': 'text-blue-600',
    'php': 'text-indigo-600',
    'java': 'text-red-600',
    'cpp': 'text-blue-600',
    'c': 'text-blue-600',
    'h': 'text-blue-600',
  }
  
  return colorMap[ext] || 'text-gray-600'
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export function getCategoryColor(category: string): string {
  switch (category) {
    case 'produk':
      return 'bg-purple-100 text-purple-800'
    case 'dokumen':
      return 'bg-blue-100 text-blue-800'
    case 'umum':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function getMimeTypeExtension(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    // Images
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/bmp': 'bmp',
    'image/svg+xml': 'svg',
    'image/tiff': 'tiff',
    'image/ico': 'ico',
    
    // Documents
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/vnd.ms-powerpoint': 'ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
    'application/rtf': 'rtf',
    
    // Text files
    'text/plain': 'txt',
    'text/csv': 'csv',
    'text/html': 'html',
    'text/css': 'css',
    'text/javascript': 'js',
    'application/json': 'json',
    'application/xml': 'xml',
    
    // Archives
    'application/zip': 'zip',
    'application/x-rar-compressed': 'rar',
    'application/x-tar': 'tar',
    'application/gzip': 'gz',
    'application/x-7z-compressed': '7z',
    
    // Audio
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
    'audio/ogg': 'ogg',
    'audio/midi': 'midi',
    'audio/x-wav': 'wav',
    'audio/aac': 'aac',
    'audio/flac': 'flac',
    
    // Video
    'video/mp4': 'mp4',
    'video/avi': 'avi',
    'video/mpeg': 'mpeg',
    'video/quicktime': 'mov',
    'video/x-ms-wmv': 'wmv',
    'video/x-flv': 'flv',
    'video/webm': 'webm',
    
    // Others
    'application/octet-stream': 'bin',
    'application/x-msdownload': 'exe',
    'application/x-shockwave-flash': 'swf',
  }
  
  return mimeToExt[mimeType] || mimeType.split('/').pop()?.toUpperCase() || 'Unknown'
}