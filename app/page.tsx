import SignIn from './sign-in';
import { chatGPTSignInPath } from './chatgpt-auth';
export const dynamic = 'force-dynamic';
export default function Page() { return <SignIn signInPath={chatGPTSignInPath('/overview')} />; }
