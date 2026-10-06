-- Run this in Supabase > SQL Editor AFTER schema_v18.sql

-- Before / after photos, and technician notes
alter table attachments add column kind text not null default 'photo' check (kind in ('before','after','photo'));
alter table requests add column tech_notes text;

-- Upload restrictions enforced by the server: photos, videos and PDFs, up to 15 MB
update storage.buckets
set file_size_limit = 15728640,
    allowed_mime_types = array['image/jpeg','image/png','image/webp','image/heic','image/heif','video/mp4','video/quicktime','application/pdf']
where id = 'job-files';
