import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function useAuthState() {
  const { data: session, status } = useSession();

  const isAuthenticated = status === 'authenticated';
  const isUnAuthenticated = status === 'unauthenticated';
  const isLoading = status === 'loading';
  const userData = session?.user;
  const expires = session?.expires;
  return { userData, expires, isAuthenticated, isUnAuthenticated, isLoading };
}
