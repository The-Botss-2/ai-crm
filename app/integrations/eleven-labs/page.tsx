import { auth } from '@/auth';
import { notFound } from "next/navigation";
import axios from 'axios';
import Breadcrumb from '@/components/Breadcrumb';
import Agents from '@/components/Agents';

export default async function Page() {
    const session = await auth();
    if (!session) return notFound();

    let responseData: any = null;
    let errorData: any = null;

    if (session.user?.id) {
        try {
            const res = await axios.get(`${process.env.CALLING_AGENT_URL}/api/elevenlabs/status/${session.user.id}`);
            responseData = res.data;
        } catch (error: any) {
            errorData = error.response?.data || error.message;
        }
    }

    return (
        <div className='px-4 py-2 flex flex-col gap-6'>
            <Breadcrumb/>
            {responseData && responseData.status=='connected' && <Agents/>}
            {errorData && <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-md text-sm font-semibold">
                {errorData.detail}
            </div>}


        </div>
    );
}