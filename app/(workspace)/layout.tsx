import Workspace from '../workspace';
import { requireChatGPTUser } from '../chatgpt-auth';
export const dynamic = 'force-dynamic';

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const user = await requireChatGPTUser('/overview');
  return <><Workspace user={{ name: user.fullName || 'Преподаватель', email: user.email }} />{children}</>;
}
