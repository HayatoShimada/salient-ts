import Header from '@/components/layouts/Header';
import { Footer } from '@/components/layouts/Footer';
import UserList from '@/components/user/UserList';
import CreateUser from '@/components/user/CreateUser';
import bcrypt from 'bcrypt'
import { PhotoIcon, UserCircleIcon } from '@heroicons/react/24/solid'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Container } from '@/components/Container'
import { getServerSession } from 'next-auth'
import { options } from '@/lib/options'


interface User {
  id: number;
  name: string;
  email: string;
}

interface HomeProps {
  users: User[];
}


const Home: React.FC<HomeProps> = async ({ users }) => {
  // 部署名・ユーザータイプ・役職等の選択入力用にデータベースから取得
  const departments = await prisma.departments.findMany()
  const userTypes = await prisma.userTypes.findMany()
  const userPosts = await prisma.userPosts.findMany()
  
  return (
    <>
      <Header />
      <main className='pt-14'>
        <CreateUser
        departments = {departments}
        userTypes = {userTypes}
        userPosts = {userPosts}

        />
        <UserList />
      </main>
      <Footer />
    </>
  );
};

export default Home;
