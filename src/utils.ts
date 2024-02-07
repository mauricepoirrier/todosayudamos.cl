import { createHmac } from "node:crypto";
import { Buffer } from 'node:buffer';

// Yeah i'm using an exchange so it is cheaper to exchange for CLP
export class BudaHMACAuth {
  private api_key: string;
  private secret: string;

  constructor() {
    this.api_key = import.meta.env.BUDA_API_KEY;
    this.secret = import.meta.env.BUDA_API_SECRET;
  }

  private getNonce(): string {
    return (Date.now() * 1000).toString();
  }

  private sign(method: string, path_url: string, body?: string): { signature: string, nonce: string } {
    const nonce = this.getNonce();
    const components = [method, path_url];
    if (body) {
      components.push(Buffer.from(body).toString('base64'));
    }
    components.push(nonce);
    const msg = components.join(' ');

    const hmac = createHmac('sha384', this.secret);
    hmac.update(msg);
    const signature = hmac.digest('hex');

    return { signature, nonce };
  }

  public async makeRequest(method: string, path: string, data?: any): Promise<any> {
    const { signature, nonce } = this.sign(method, path, data ? JSON.stringify(data) : undefined);

    const headers = {
      'X-SBTC-APIKEY': this.api_key,
      'X-SBTC-NONCE': nonce,
      'X-SBTC-SIGNATURE': signature,
      'Content-Type': 'application/json', // Added for JSON body support
    };
    try {
      const response = await fetch(`https://www.buda.com${path}`, {
        method: method,
        headers: headers,
        body: data ? JSON.stringify(data) : null,
      });

      const responseData = await response.json();
      console.log(responseData);
      return responseData;
    } catch (error) {
      console.error(error);
    }
  }
}