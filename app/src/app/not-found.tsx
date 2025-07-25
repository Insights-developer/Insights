import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto mt-20 p-8 bg-white rounded shadow text-center">
      <h1 className="text-3xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="mb-2">Sorry, the page you are looking for does not exist.</p>
      <Link href="/" className="text-blue-600 underline">Go Home</Link>
    </div>
  );
}
