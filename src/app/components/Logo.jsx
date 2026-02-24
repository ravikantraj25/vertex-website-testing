import Link from 'next/link'
import Image from 'next/image'
export default function Logo() {
  return (
    <div>
    <Link href="/" className="block" aria-label="Cruip">
      <div className="flex items-center md:h-3">
        <Image src="/logo.svg" alt='Logo' width={120} height={35} />
      </div>
    </Link>
    </div>
  )
}