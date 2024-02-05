import type { APIRoute } from 'astro';
import { BudaHMACAuth } from '../../utils';

export const prerender = false;

export const GET: APIRoute = async ({ params, request }) => {
  const auth = new BudaHMACAuth();
  const response = await auth.makeRequest('GET', '/api/v2/balances/BTC');
  const amount = (Number(response.balance.amount[0]) - 0.00120780);
  const sats = amount * 100000000;
  return new Response(
    JSON.stringify({
      amount: amount.toFixed(8),
      sats: sats.toFixed(0)
    }),
  )
}
