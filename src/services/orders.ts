/**
 * Order placement service.
 *
 * Today this inserts directly into `orders` + `order_items` via the user's
 * RLS-scoped Supabase client. When Stripe Checkout is wired in, swap
 * `placeOrder` for a server function that creates a Stripe Checkout Session
 * and inserts the order with status="pending" + `stripe_session_id`.
 */
import { supabase } from "@/integrations/supabase/client";

export type CartItem = {
  productSlug: string;     // "tshirt" | "mug" | "poster" | "mousemat"
  productName: string;
  unitPriceCents: number;
  quantity: number;
  generationId?: string | null;
  options?: Record<string, unknown>; // size / fit / colour
};

export type ShippingAddress = {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  postcode: string;
  country?: string;
};

export const SHIPPING_FLAT_CENTS = 299;
export const CURRENCY = "usd";

export function calcTotals(items: CartItem[]) {
  const subtotal = items.reduce((s, i) => s + i.unitPriceCents * i.quantity, 0);
  const shipping = items.length === 0 ? 0 : SHIPPING_FLAT_CENTS;
  return { subtotalCents: subtotal, shippingCents: shipping, totalCents: subtotal + shipping };
}

export async function placeOrder(items: CartItem[], shipping: ShippingAddress) {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) throw new Error("Sign in to place an order.");
  if (!items.length) throw new Error("Cart is empty.");

  const { subtotalCents, shippingCents, totalCents } = calcTotals(items);

  // Look up product UUIDs by slug — products table is public-read.
  const slugs = Array.from(new Set(items.map((i) => i.productSlug)));
  const { data: products } = await supabase
    .from("products")
    .select("id, slug")
    .in("slug", slugs);
  const slugToId = new Map((products ?? []).map((p) => [p.slug, p.id]));

  const { data: order, error: ordErr } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      status: "pending",
      currency: CURRENCY,
      subtotal_cents: subtotalCents,
      shipping_cents: shippingCents,
      total_cents: totalCents,
      shipping_address: shipping,
    })
    .select("id")
    .single();
  if (ordErr || !order) throw new Error(`Could not create order: ${ordErr?.message}`);

  const rows = items.map((i) => ({
    order_id: order.id,
    product_id: slugToId.get(i.productSlug) ?? null,
    generation_id: i.generationId ?? null,
    quantity: i.quantity,
    unit_price_cents: i.unitPriceCents,
    options: (i.options ?? null) as any,
  }));
  const { error: itemsErr } = await supabase.from("order_items").insert(rows as any);
  if (itemsErr) throw new Error(`Could not save order items: ${itemsErr.message}`);

  return { orderId: order.id, totalCents };
}
