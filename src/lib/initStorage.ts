"import { supabase } from './supabase';

export async function initializeStorageBuckets() {
  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
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
        console.error('Error creating avatars bucket:', avatarError);
      } else {
        console.log('Avatars bucket created successfully');
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
        console.error('Error creating need-images bucket:', needImagesError);
      } else {
        console.log('Need-images bucket created successfully');
      }
    }
  } catch (error) {
    console.error('Error initializing storage buckets:', error);
  }
}
"
