import { AuthForm } from "@/components/Auth/AuthForm";
import { withAuth } from "@/lib/withAuth";
import { useRouter } from "next/router";
import { useState } from "react";


export default function Login() {
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const router = useRouter();

    const handleSuccess = async (sessionData?: { user: any }) => {
        // 登录成功后，直接设置用户信息
        // Cookie 由后端自动设置，无需手动管理
        // 注册时如果需要邮箱验证，不会调用这个函数
        console.log('sessionData-----', sessionData);
        if (sessionData?.user) {
            router.push('/');
        }
      };

  return <AuthForm mode={mode} onModeChange={mode => setMode(mode)} onSuccess={handleSuccess} />
}

export const  getServerSideProps = withAuth(async ({auth})  => {
    if (auth.user) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        };
    }

    return { props: {} };
})