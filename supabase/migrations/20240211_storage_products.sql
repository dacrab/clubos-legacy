-- Create a new bucket for product images
insert into storage.buckets (id, name, public)
values ('products', 'products', true);

-- Allow public access to view images
create policy "Public Access"
on storage.objects for select
to public
using (bucket_id = 'products');

-- Allow authenticated users to upload images
create policy "Authenticated users can upload images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'products' AND
  (storage.foldername(name))[1] = 'product-images'
);

-- Allow authenticated users to update their own images
create policy "Authenticated users can update their own images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'products' AND
  (storage.foldername(name))[1] = 'product-images'
);

-- Allow authenticated users to delete their own images
create policy "Authenticated users can delete their own images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'products' AND
  (storage.foldername(name))[1] = 'product-images'
); 