import { createAuthClient } from "better-auth/react"
export const { useSession, signIn, signUp, signOut } = createAuthClient({
    /** The base URL of the server (optional if you're using the same domain) */
    baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_BASE_URL,
})