import 'reflect-metadata';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getExpressApp } from '../src/app.factory';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const app = await getExpressApp();
  return app(req, res);
}
