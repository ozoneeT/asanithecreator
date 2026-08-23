import { handleStudioAuth } from '../lib/apiCore';
import { headerValue, type ApiRequest, type ApiResponse } from './_shared';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
  const { status, body } = await handleStudioAuth(headerValue(req, 'x-studio-password'));
  res.setHeader('Cache-Control', 'no-store');
  res.status(status).json(body);
}
