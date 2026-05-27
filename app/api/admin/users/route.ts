import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { userId } = await auth();
  
  if (!userId) {
    console.error("Clerk auth() returned null userId. Headers:", req.headers);
    return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Fetch DB users from FastAPI Backend
    const res = await fetch('http://localhost:8000/api/admin/users', { cache: 'no-store' });
    const dbData = await res.json();
    
    if (dbData.status !== 'success') {
      return NextResponse.json(dbData, { status: 500 });
    }

    // 2. Fetch User list from Clerk
    const client = await clerkClient();
    const clerkUsersResponse = await client.users.getUserList();
    // In newer clerk sdks, getUserList returns { data: User[], totalCount: number }
    // If it's older it might just return User[] directly. Let's handle both.
    const clerkUsers = Array.isArray(clerkUsersResponse) ? clerkUsersResponse : clerkUsersResponse.data;

    // 3. Merge data using Clerk users as the base
    const mergedUsers = clerkUsers.map((cUser: any) => {
      const dbUser = dbData.data.find((u: any) => u.clerk_id === cUser.id);
      
      let fullName = `${cUser.firstName || ''} ${cUser.lastName || ''}`.trim();
      if (!fullName) fullName = cUser.id; // fallback
      
      let email = '';
      if (cUser.emailAddresses && cUser.emailAddresses.length > 0) {
        email = cUser.emailAddresses[0].emailAddress;
      }
      
      return {
        clerk_id: cUser.id,
        created_at: dbUser?.created_at || new Date(cUser.createdAt).toISOString(),
        last_login_at: dbUser?.last_login_at || new Date(cUser.lastSignInAt || cUser.createdAt).toISOString(),
        portfolio_count: dbUser?.portfolio_count || 0,
        role: dbUser?.role || 'user',
        fullName,
        email,
        imageUrl: cUser.imageUrl || ''
      };
    });

    return NextResponse.json({ status: 'success', data: mergedUsers });
  } catch (error) {
    return NextResponse.json({ status: 'error', message: String(error) }, { status: 500 });
  }
}
