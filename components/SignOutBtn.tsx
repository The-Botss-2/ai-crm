'use client';

import { IoIosLogOut } from 'react-icons/io';
import { toast } from 'react-hot-toast';
import { serverSignOut } from '@/actions/signout';
import { useRouter } from 'next/navigation';

export default function SignOutBtn() {
    const router = useRouter();

    const handleSignOut = async () => {
        const toastId = toast.loading('Signing out...');
        try {
            await serverSignOut();
            toast.success('Signed out successfully!', { id: toastId });
            setTimeout(() => {
                router.push('/signin'); // or wherever you want
            }, 100);
        } catch (error) {
            toast.error('Failed to sign out!', { id: toastId });
        }
    };

    return (
        <button onClick={handleSignOut} className="cursor-pointer" type="button">
            <IoIosLogOut />
        </button>
    );
}
