import Link from 'next/link';

export default function Navbar() {
  return (
    <nav>
      <Link href="/">Home</Link> |{' '}
      <Link href="/games">Games</Link> |{' '}
      <Link href="/draws">Draws</Link> |{' '}
      <Link href="/account">Account</Link> |{' '}
      <Link href="/admin">Admin</Link>
    </nav>
  );
}
