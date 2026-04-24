import Link from "next/link";

export default function AuthQuickAccess() {
  return (
    <div className="bb-auth-quick-access">
      <Link href="/login" className="bb-auth-link">
        Login
      </Link>
      <Link href="/signup" className="bb-auth-link is-primary">
        Sign up
      </Link>
    </div>
  );
}
