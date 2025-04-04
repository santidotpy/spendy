import { SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export default function TopNav() {
    return (
        <nav className="flex items-center justify-between bg-gray-800 p-4">
            <div className="text-white text-lg font-bold">My App</div>
            <div className="flex items-center space-x-4">
                <SignedOut>
                    <SignInButton mode="modal">
                        Sign In
                    </SignInButton>
                    <SignUpButton mode="modal">
                        Sign Up
                    </SignUpButton>
                </SignedOut>
                <UserButton />
            </div>
        </nav>
    );
}