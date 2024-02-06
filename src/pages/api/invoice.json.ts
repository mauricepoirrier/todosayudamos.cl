import type { APIRoute } from 'astro';
import { BudaHMACAuth } from '../../utils';

export const prerender = false;

export const POST: APIRoute = async ({ params, request }) => {
  if (request.headers.get("Content-Type") !== "application/json") {
    return new Response('Content-Type must be application/json', { status: 415 });
  }
  const body = await request.json();

  if (!body.amount) {
    return new Response('sats is required', { status: 400 });
  }
  const sats = Number(body.amount)
  if (sats > 0) {
    return new Response('sats must be greater than 0', { status: 400 });
  }
  console.log(sats);

  const auth = new BudaHMACAuth();
  const data = {
    'amount_satoshis': sats,
    'currency': 'BTC',
    'memo': 'Chilean wildfires donation',
    'expiry_seconds': 60 * 60
  }
  console.log(data);
  const response = await auth.makeRequest('POST', '/api/v2/lightning_network_invoices', data);
  return new Response(
    JSON.stringify({
      invoice: response.lightning_network_invoice
    }),
    { status: 201 }
  )
}
