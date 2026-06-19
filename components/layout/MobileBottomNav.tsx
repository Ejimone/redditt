"use client";

import {
  Cards,
  Compass,
  Fire,
  House,
  ListIcon,
  Newspaper,
} from "@phosphor-icons/react/ssr";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { href: "/",         label: "Home",    Icon: House },
  { href: "/trending", label: "Popular", Icon: Fire },
  { href: "/news",     label: "News",    Icon: Newspaper },
  { href: "/explore",  label: "Explore", Icon: Compass },
  { href: "/posts",    label: "Posts",   Icon: Cards },
];

function MobileNavLink({
  href,
  label,
  Icon,
}: (typeof navItems)[number]) {
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarMenuButton asChild onClick={() => setOpenMobile(false)}>
      <Link href={href} className="flex items-center gap-3 px-4 py-3 text-base font-semibold">
        <Icon className="size-5" weight="regular" aria-hidden />
        {label}
      </Link>
    </SidebarMenuButton>
  );
}

export default function MobileNav() {
  return (
      <SidebarProvider className="min-h-0 w-auto md:hidden">
        {/* Hamburger trigger — sits before the logo in the navbar on mobile */}
        <SidebarTrigger asChild>
          <button
              aria-label="Open menu"
              className="flex min-h-10 min-w-10 touch-manipulation items-center justify-center rounded-full text-foreground hover:bg-white/10"
          >
            <ListIcon size={32} />
          </button>
        </SidebarTrigger>

        {/* Sidebar */}
        <Sidebar side="left" variant="floating" collapsible="offcanvas">
          <SidebarContent className="pt-6">
            <SidebarMenu>
              {navItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <MobileNavLink {...item} />
                  </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
  );
}
