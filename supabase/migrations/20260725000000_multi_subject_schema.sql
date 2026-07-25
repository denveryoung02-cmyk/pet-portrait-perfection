-- Owner+pet (multi-subject) feature — Step 1 of the build plan: schema only.
-- Additive only: two new columns, no existing table behaviour changes.
-- No application code reads or writes these columns yet.

-- Distinguishes the existing single-pet flow ('single_pet', the default —
-- applied to all existing rows) from the new multi-subject flow
-- ('multi_subject'). Application code will use this to skip Hero Pack
-- generation entirely for multi-subject orders (hero_profiles /
-- adventure_pack_assets are untouched by this migration and by that skip).
alter table public.orders
  add column order_type text not null default 'single_pet'
  check (order_type in ('single_pet', 'multi_subject'));

-- Tags an uploaded photo as a person or a pet for the multi-subject flow.
-- Nullable, no default: existing rows and the existing single-pet upload
-- flow (src/services/uploads.ts) never set this column and are unaffected.
alter table public.uploaded_images
  add column subject_type text
  check (subject_type in ('person', 'pet'));

-- No migration needed for generations.generation_params — it already exists
-- as a nullable jsonb column. Documenting the expected shape for
-- multi-subject rows here since there's no other natural place for it yet
-- (application code that populates it is a later build step):
--
--   {
--     "subjects": [
--       { "uploadedImageId": "<uuid>", "subjectType": "person" | "pet", "name": "<string>" }
--     ],
--     "tier": "solo" | "family" | "full_house"
--   }
--
-- generations.uploaded_image_id stays nullable (already the case today) for
-- multi-subject rows; the full subject list lives in generation_params above.
