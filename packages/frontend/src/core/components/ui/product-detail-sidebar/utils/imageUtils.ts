import { useAuthStore } from '@/core/store/authStore'

export async function convertMinioUrl(minioUrl: string | null | undefined): Promise<string | null> {
  console.log('convertMinioUrl called with:', minioUrl)

  if (!minioUrl || !minioUrl.startsWith('minio://')) {
    console.log('convertMinioUrl: Not a MinIO URL, returning as-is')
    return minioUrl || null
  }

  try {
    const objectKey = minioUrl.replace('minio://pos-files/', '')
    console.log('convertMinioUrl: Extracted object key:', objectKey)

    const token = useAuthStore.getState().token
    console.log('convertMinioUrl: Using token:', token ? 'Present' : 'Missing')

    const apiUrl = `http://localhost:3000/api/dokumen/object-url`
    console.log('convertMinioUrl: Making request to:', apiUrl)

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ object_key: objectKey })
    })

    console.log('convertMinioUrl: Response status:', response.status)

    if (response.ok) {
      const result = await response.json()
      console.log('convertMinioUrl: Response data:', result)
      return result.data?.url || null
    } else {
      const errorText = await response.text()
      console.error('convertMinioUrl: API error:', response.status, errorText)
      return null
    }
  } catch (error) {
    console.error('convertMinioUrl: Exception:', error)
    return null
  }
}

export const getDebugInfo = (originalUrl?: string) => {
  const token = useAuthStore.getState().token

  return {
    originalUrl: originalUrl || 'No URL',
    hasAuthToken: token ? 'Present' : 'Missing',
    apiEndpoint: 'http://localhost:3000/api/dokumen/object-url'
  }
}