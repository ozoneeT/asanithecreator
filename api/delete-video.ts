import { handleDeleteVideo } from '../lib/apiCore';
import { headerValue, jsonBody, type ApiRequest, type ApiResponse } from './_shared';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
  const { status, body } = await handleDeleteVideo(headerValue(req, 'x-studio-password'), jsonBody(req));
  res.setHeader('Cache-Control', 'no-store');
  res.status(status).json(body);
}
