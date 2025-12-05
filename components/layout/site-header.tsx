"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";

import {
  publicNavLinks,
  serviceNavLinks,
  calculatorNavLinks,
  knowledgeUtilityLinks,
} from "@/lib/constants/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggle = () => setMobileOpen((prev) => !prev);
  const closeMenu = () => setMobileOpen(false);

  return (
    <header className="border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75">
      <div className="container flex flex-col gap-4 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="font-semibold text-xl text-primary"
            onClick={closeMenu}
          >
            R V P J & Co.
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            {publicNavLinks.map((link) => {
              if (link.label === "Services") {
                return (
                  <DropdownMenu key={link.href}>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={cn(
                          "flex items-center gap-1 text-muted-foreground transition hover:text-primary focus:outline-none",
                          pathname.startsWith("/services") && "text-primary",
                        )}
                      >
                        Services
                        <ChevronDown size={14} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-64">
                      {serviceNavLinks.map((service) => (
                        <DropdownMenuItem asChild key={service.href}>
                          <Link
                            href={service.href}
                            className={cn(
                              "w-full",
                              pathname === service.href && "text-primary",
                            )}
                          >
                            {service.label}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuItem asChild>
                        <Link href="/services" className="w-full font-medium text-primary">
                          View all services
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              }

              if (link.label === "Knowledge Bank") {
                return (
                  <DropdownMenu key={link.href}>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={cn(
                          "flex items-center gap-1 text-muted-foreground transition hover:text-primary focus:outline-none",
                          pathname.startsWith("/knowledge-bank") && "text-primary",
                        )}
                      >
                        Knowledge Bank
                        <ChevronDown size={14} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-64">
                      {Object.entries(knowledgeUtilityLinks).map(([section, links]) => (
                        <div key={section} className="px-2 py-1">
                          <p className="text-xs font-semibold text-muted-foreground mb-1">{section}</p>
                          {links.map((item) => (
                            <DropdownMenuItem asChild key={item.href}>
                              <Link
                                href={item.href}
                                className={cn("w-full text-left", pathname === item.href && "text-primary")}
                              >
                                {item.label}
                              </Link>
                            </DropdownMenuItem>
                          ))}
                        </div>
                      ))}
                      <DropdownMenuItem asChild>
                        <Link href="/knowledge-bank" className="w-full font-medium text-primary">
                          View Knowledge Bank
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              }

              if (link.label === "Calculators") {
                return (
                  <DropdownMenu key={link.href}>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={cn(
                          "flex items-center gap-1 text-muted-foreground transition hover:text-primary focus:outline-none",
                          pathname.startsWith("/calculators") && "text-primary",
                        )}
                      >
                        Calculators
                        <ChevronDown size={14} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-64 max-h-96 overflow-y-auto">
                      {calculatorNavLinks.map((calc) => (
                        <DropdownMenuItem asChild key={calc.href}>
                          <Link
                            href={calc.href}
                            className={cn(
                              "w-full",
                              pathname === calc.href && "text-primary",
                            )}
                          >
                            {calc.label}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuItem asChild>
                        <Link href="/calculators" className="w-full font-medium text-primary">
                          View all calculators
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-muted-foreground transition hover:text-primary",
                    pathname === link.href && "text-primary",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Button asChild size="sm" variant="outline" className="hidden md:inline-flex">
              <Link href="/client-login">Client Portal</Link>
            </Button>
            <Button asChild size="sm" variant="secondary" className="hidden md:inline-flex">
              <Link href="/login">Staff Login</Link>
            </Button>
            <Button asChild size="sm" className="hidden md:inline-flex">
              <Link href="/contact">Request a Call</Link>
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="md:hidden"
              onClick={handleToggle}
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>

        {mobileOpen ? (
          <div className="space-y-3 rounded-lg border bg-card p-4 md:hidden">
            {publicNavLinks.map((link) => {
              if (link.label === "Services") {
                return (
                  <div key={link.href} className="space-y-2">
                    <Link
                      href="/services"
                      onClick={closeMenu}
                      className={cn(
                        "block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
                        pathname === "/services" && "bg-muted text-primary",
                      )}
                    >
                      Services
                    </Link>
                    <div className="ml-4 space-y-1 border-l pl-4">
                      {serviceNavLinks.map((service) => (
                        <Link
                          key={service.href}
                          href={service.href}
                          onClick={closeMenu}
                          className={cn(
                            "block rounded-md px-3 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground",
                            pathname === service.href && "bg-muted text-primary",
                          )}
                        >
                          {service.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }

              if (link.label === "Knowledge Bank") {
                return (
                  <div key={link.href} className="space-y-2">
                    <Link
                      href="/knowledge-bank"
                      onClick={closeMenu}
                      className={cn(
                        "block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
                        pathname.startsWith("/knowledge-bank") && "bg-muted text-primary",
                      )}
                    >
                      Knowledge Bank
                    </Link>
                    <div className="ml-4 space-y-1 border-l pl-4">
                      {Object.entries(knowledgeUtilityLinks).map(([section, links]) => (
                        <div key={section}>
                          <p className="text-xs font-semibold text-muted-foreground mb-1">{section}</p>
                          {links.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={closeMenu}
                              className={cn(
                                "block rounded-md px-3 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground",
                                pathname === item.href && "bg-muted text-primary",
                              )}
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              if (link.label === "Calculators") {
                return (
                  <div key={link.href} className="space-y-2">
                    <Link
                      href="/calculators"
                      onClick={closeMenu}
                      className={cn(
                        "block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
                        pathname === "/calculators" && "bg-muted text-primary",
                      )}
                    >
                      Calculators
                    </Link>
                    <div className="ml-4 space-y-1 border-l pl-4 max-h-64 overflow-y-auto">
                      {calculatorNavLinks.map((calc) => (
                        <Link
                          key={calc.href}
                          href={calc.href}
                          onClick={closeMenu}
                          className={cn(
                            "block rounded-md px-3 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground",
                            pathname === calc.href && "bg-muted text-primary",
                          )}
                        >
                          {calc.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className={cn(
                    "block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
                    pathname === link.href && "bg-muted text-primary",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="flex flex-col gap-2 pt-2">
              <Button asChild variant="outline" size="sm" onClick={closeMenu}>
                <Link href="/client-login">Client Portal</Link>
              </Button>
              <Button asChild variant="secondary" size="sm" onClick={closeMenu}>
                <Link href="/login">Staff Login</Link>
              </Button>
              <Button asChild size="sm" onClick={closeMenu}>
                <Link href="/contact">Request a Call</Link>
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}

