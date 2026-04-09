import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const useAuth = () => {
    const router = useRouter();
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
    const id = typeof window !== 'undefined' ? sessionStorage.getItem('id') : null;


    useEffect(() => {
        if (!token) {
            router.push('/');
        }
        if (!id) {
            router.push('/');
        }
    }, [router, token, id]);

    return { isAuthenticated: !!token };
};


//usage of this hook:
// import { useAuth } from '@/hooks/useAuth';

// inside the page function:
// const { isAuthenticated } = useAuth();
// if (!isAuthenticated) return null;

//it´s a synchronous check, so nothing is render, if there is no token and no id