import { auth } from '@/auth';
import { notFound } from "next/navigation";
import axios from 'axios';
import Breadcrumb from '@/components/Breadcrumb';
import PhoneNumbers from '@/components/PhoneNumbers';

export default async function Page() {
    const session = await auth();
    if (!session) return notFound();

    let responseData: any = null;
    let errorData: any = null;

    if (session.user?.id) {
        try {
            const res = await axios.get(`https://callingagent.thebotss.com/api/twilio/status/${session.user.id}`);
            responseData = res.data;
        } catch (error: any) {
            errorData = error.response?.data || error.message;
        }
    }

    return (
        <div className='px-6 py-2 flex flex-col gap-6'>
            <Breadcrumb/>
            {responseData && responseData.status=='connected' && <PhoneNumbers/>}
            {errorData && <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-md text-sm font-semibold">
                {errorData.detail}
            </div>}


        </div>
    );
}