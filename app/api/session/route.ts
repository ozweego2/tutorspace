import { getChatGPTUser } from '../../chatgpt-auth';
export const dynamic = 'force-dynamic';
export async function GET() {
  const user = await getChatGPTUser();
  return Response.json({ authenticated: !!user, email: user?.email || null }, { headers: { 'Cache-Control': 'private, no-store' } });
}
