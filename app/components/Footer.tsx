'use client';

import Link from 'next/link';

interface FooterProps {
  className?: string;
  children?: React.ReactNode;
}

export default function Footer({ className, children }: FooterProps) {
  return (
    <footer className={`bg-gray-800 text-gray-400 py-8 ${className || ''}`}>
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 px-4">
        <div className="flex gap-6">
          <Link href="/cgv" className="hover:text-white transition-colors">CGV</Link>
          <Link href="/legal" className="hover:text-white transition-colors">Mentions légales</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
        </div>
        <div>
          &copy; {new Date().getFullYear()} VoltageGPU
        </div>
      </div>
    </footer>
  );
}
