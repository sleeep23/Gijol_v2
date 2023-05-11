import NextAuth, { TokenSet } from 'next-auth';
import KakaoProvider from 'next-auth/providers/kakao';
import GoogleProvider from 'next-auth/providers/google';
import { getMembershipStatus } from '../../../lib/utils/auth';
import { MembershipStatusResponseType } from '../../../lib/types/auth';
import { BASE_DEV_URL } from '../../../lib/const';

export default NextAuth({
  pages: {
    signIn: '/login',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || '',
      clientSecret: process.env.GOOGLE_SECRET || '',
      authorization: {
        params: { access_type: 'offline', prompt: 'consent' },
      },
    }),
    KakaoProvider({
      clientId: process.env.KAKAO_ID || '',
      clientSecret: process.env.KAKAO_SECRET || '',
    }),
  ],
  secret: process.env.JWT_SECRET || '',
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24,
    updateAge: 60 * 60,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    maxAge: 60 * 60 * 24,
  },
  callbacks: {
    async signIn({ account }) {
      const isMember: 'SIGN_IN' | 'SIGN_UP' = await getMembershipStatus(account?.id_token);
      if (isMember === 'SIGN_IN') {
        return true;
      } else if (isMember === 'SIGN_UP') {
        return `${BASE_DEV_URL}/login/signup`;
      }
      return true;
    },
    async jwt({ token, account, trigger }) {
      if (account && account.expires_at) {
        token.id_token = account?.id_token;
        token.access_token = account?.access_token;
        token.refresh_token = account?.refresh_token;
        token.expires_at = account?.expires_at;
        return token;
      }
      if (trigger === 'update') {
        try {
          const response = await fetch('https://oauth2.googleapis.com/token', {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              client_id: process.env.GOOGLE_ID as string,
              client_secret: process.env.GOOGLE_SECRET as string,
              grant_type: 'refresh_token',
              refresh_token: token.refresh_token as string,
            }),
            method: 'POST',
          });
          const tokens: TokenSet = await response.json();
          if (tokens.expires_at) {
            token.id_token = tokens.id_token;
            token.access_token = tokens.access_token;
            token.expires_at = Math.floor(Date.now() / 1000 + tokens.expires_at);
            token.refresh_token = tokens.refresh_token ?? token.refresh_token;
          }
          return token;
        } catch (error) {
          throw new Error('Error refreshing token');
        }
      } else {
        return token;
      }
    },
    async session({ session, token }) {
      session.user.id_token = token.id_token;
      session.user.refresh_token = token.refresh_token;
      session.user.access_token = token.access_token;
      session.user.expires_at = token.expires_at;
      return session;
    },
  },
});
