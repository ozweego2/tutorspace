import Workspace from './workspace';
import { requireChatGPTUser } from './chatgpt-auth';

export default async function WorkspacePage({ section }: { section: string }) {
  const user = await requireChatGPTUser(`/${section}`);
  return <Workspace initialPage={section} user={{ name: user.fullName || 'Преподаватель', email: user.email }} />;
}
