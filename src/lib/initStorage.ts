import { supabase } from './supabase';

export async function initializeStorageBuckets() {
  try {
    // Attempt to list buckets with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      clearTimeout(timeoutId);
      
      if (listError) {
        console.warn('Warning: Could not list storage buckets (non-critical):', listError.message);
        return;
      }

      // Create avatars bucket if it doesn't exist
      const avatarBucket = buckets?.find(b => b.name === 'avatars');
      if (!avatarBucket) {
        const { error: avatarError } = await supabase.storage.createBucket('avatars', {
          public: true,
          fileSizeLimit: 5242880, // 5MB
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
        });
        
        if (avatarError) {
          console.warn('Warning: Could not create avatars bucket:', avatarError.message);
        }
      }

      // Create need-images bucket if it doesn't exist
      const needImagesBucket = buckets?.find(b => b.name === 'need-images');
      if (!needImagesBucket) {
        const { error: needImagesError } = await supabase.storage.createBucket('need-images', {
          public: true,
          fileSizeLimit: 10485760, // 10MB
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
        });
        
        if (needImagesError) {
          console.warn('Warning: Could not create need-images bucket:', needImagesError.message);
        }
      }
    } catch (timeoutError) {
      console.warn('Warning: Storage initialization timed out (non-critical):', timeoutError);
    }
  } catch (error) {
    console.warn('Warning: Storage initialization failed (non-critical):', error);
  }
}
