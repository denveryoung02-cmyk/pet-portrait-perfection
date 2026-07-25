-- Closes a real duplicate-order gap found while testing the owner+pet
-- feature: recordPaidOrder (src/lib/fulfillment.server.ts) was a
-- check-then-insert with no DB backstop, unlike generateHeroPack's atomic
-- upsert+onConflict claim (src/lib/hero-pack.server.ts:176-194). Two real
-- stripe_session_id values already had duplicate rows from concurrent
-- webhook + success-page calls (cleaned up in this same session before
-- this migration was written, so this ADD CONSTRAINT succeeds).
--
-- stripe_session_id is nullable (no order-creation path in the live app
-- sets it to anything other than a real session id — the one other insert
-- path, src/services/orders.ts's placeOrder, is dead code, never imported
-- anywhere). A UNIQUE constraint in Postgres allows unlimited NULLs since
-- NULL is never considered equal to another NULL, so this is safe
-- regardless.

alter table public.orders
  add constraint orders_stripe_session_id_key unique (stripe_session_id);
