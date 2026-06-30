-- Prevent duplicate bundle_portrait rows for the same (order_id, art_style).
-- A partial unique index covers only rows where type = 'bundle_portrait',
-- leaving other order_items types (digital_download, etc.) unaffected.
-- This is the authoritative guard against the TOCTOU race in
-- generateNextBundlePortrait: if two concurrent Workers both try to claim
-- the same style, the second INSERT fails with code 23505 and is handled
-- gracefully in application code.

create unique index if not exists order_items_bundle_portrait_style_unique
  on public.order_items (order_id, ((options->>'art_style')))
  where ((options->>'type') = 'bundle_portrait');
