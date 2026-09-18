import { supabase, LESSON_MATERIALS_BUCKET } from './supabase'

/**
 * Upload a file to the Supabase lesson-materials bucket
 * @param {File} file - The file object to upload
 * @param {string} folder - Optional folder path within the bucket (e.g., 'photos', 'documents')
 * @returns {Promise<{url: string, path: string, error: null} | {url: null, path: null, error: string}>}
 */
export async function uploadFile(file, folder = '') {
  try {
    // Generate unique filename with timestamp
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${timestamp}_${sanitizedName}`
    const filePath = folder ? `${folder}/${fileName}` : fileName

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(LESSON_MATERIALS_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      return { url: null, path: null, error: error.message }
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(LESSON_MATERIALS_BUCKET)
      .getPublicUrl(data.path)

    return {
      url: publicUrlData.publicUrl,
      path: data.path,
      error: null
    }
  } catch (err) {
    console.error('Upload exception:', err)
    return { url: null, path: null, error: err.message }
  }
}

/**
 * Upload multiple files to the Supabase lesson-materials bucket
 * @param {File[]} files - Array of file objects to upload
 * @param {string} folder - Optional folder path within the bucket
 * @returns {Promise<Array<{url: string, path: string, fileName: string, error: null} | {url: null, path: null, fileName: string, error: string}>>}
 */
export async function uploadMultipleFiles(files, folder = '') {
  const uploadPromises = files.map(async (file) => {
    const result = await uploadFile(file, folder)
    return {
      ...result,
      fileName: file.name
    }
  })

  return Promise.all(uploadPromises)
}

/**
 * Delete a file from the Supabase lesson-materials bucket
 * @param {string} filePath - The path of the file to delete
 * @returns {Promise<{success: boolean, error: string | null}>}
 */
export async function deleteFile(filePath) {
  try {
    const { error } = await supabase.storage
      .from(LESSON_MATERIALS_BUCKET)
      .remove([filePath])

    if (error) {
      console.error('Delete error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch (err) {
    console.error('Delete exception:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Get public URL for an existing file
 * @param {string} filePath - The path of the file in the bucket
 * @returns {string} - Public URL of the file
 */
export function getPublicUrl(filePath) {
  const { data } = supabase.storage
    .from(LESSON_MATERIALS_BUCKET)
    .getPublicUrl(filePath)

  return data.publicUrl
}
