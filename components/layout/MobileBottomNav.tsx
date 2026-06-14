import {
  Cards,
  Compass,
  Fire,
  House,
  Newspaper,
} from "@phosphor-icons/react/ssr";
import Link from "next/link";

const itemClass =
  "flex min-h-12 min-w-0 flex-1 touch-manipulation flex-col items-center justify-center gap-0.5 px-0.5 py-1.5 text-[10px] font-bold leading-tight text-muted-foreground transition-colors hover:text-foreground active:bg-white/10 sm:px-1";

export default function MobileBottomNav() {
  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 left-0 right-0 z-50 flex w-full items-stretch justify-evenly border-t border-white/10 bg-[#0b1416]/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 backdrop-blur-md md:hidden"
    >
      <Link href="/" className={itemClass}>
        <House className="size-6" weight="regular" aria-hidden />
        Home
      </Link>
      <Link href="/trending" className={itemClass}>
        <Fire className="size-6" weight="regular" aria-hidden />
        Popular
      </Link>
      <Link href="/news" className={itemClass}>
        <Newspaper className="size-6" weight="regular" aria-hidden />
        News
      </Link>
      <Link href="/explore" className={itemClass}>
        <Compass className="size-6" weight="regular" aria-hidden />
        Explore
      </Link>
      <Link href="/posts" className={itemClass}>
        <Cards className="size-6" weight="regular" aria-hidden />
        Posts
      </Link>
    </nav>
  );
}
