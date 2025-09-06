-- Create storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-pictures', 'profile-pictures', true);

-- Create policies for profile picture uploads
CREATE POLICY "Profile pictures are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profile-pictures');

CREATE POLICY "Anyone can upload profile pictures" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'profile-pictures');

CREATE POLICY "Anyone can update profile pictures" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'profile-pictures');

CREATE POLICY "Anyone can delete profile pictures" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'profile-pictures');