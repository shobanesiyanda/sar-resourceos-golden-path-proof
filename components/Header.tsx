"use client";

import { useEffect, useState } from "react";

const navigation = [
  { name: "About Us", href: "/about" },
  { name: "Operations", href: "/operations" },
  { name: "Sustainability", href: "/sustainability" },
  { name: "Investor Relations", href: "/investor-relations" },
  { name: "Media", href: "/media" },
  { name: "Leadership", href: "/leadership" },
  { name: "Careers", href: "/careers" },
  { name: "Contact", href: "/contact" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  function toggleMenu() {
    setMenuOpen((prev) => !prev);
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[linear-gradient(135deg,#0a1526_0%,#10233f_45%,#0a1526_100%)] text-white backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-10">
          <a
            href="/"
            className="flex min-w-0 items-center gap-3"
            aria-label="Shobane African Resources home"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#c8a239] text-lg font-semibold text-[#c8a239] shadow-[inset_0_0_0_1px_rgba(200,162,57,0.15)]">
              SAR
            </div>

            <div className="min-w-0">
              <div className="truncate text-[11px] font-semibold uppercase tracking-[0.22em] text-white sm:text-[12px]">
                Shobane African Resources
              </div>
              <div className="truncate text-[9px] uppercase tracking-[0.32em] text-white/55 sm:text-[10px]">
                African Resource Development
              </div>
            </div>
          </a>

          <button
            type="button"
            onClick={toggleMenu}
            className="inline-flex items-center justify-center rounded-[22px] border border-white/10 bg-white/6 px-5 py-3 text-sm font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:bg-white/10"
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </header>

      {menuOpen ? (
        <div
          className="fixed inset-0 z-[60] bg-[#07111f]/96 backdrop-blur-md"
          id="site-menu"
        >
          <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-10">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <a
                href="/"
                onClick={closeMenu}
                className="flex min-w-0 items-center gap-3"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#c8a239] text-base font-semibold text-[#c8a239]">
                  SAR
                </div>

                <div className="min-w-0">
                  <div className="truncate text-[11px] font-semibold uppercase tracking-[0.22em] text-white sm:text-[12px]">
                    Shobane African Resources
                  </div>
                  <div className="truncate text-[9px] uppercase tracking-[0.32em] text-white/55 sm:text-[10px]">
                    African Resource Development
                  </div>
                </div>
              </a>

              <button
                type="button"
                onClick={closeMenu}
                className="inline-flex items-center justify-center rounded-[22px] border border-white/10 bg-white/6 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                aria-label="Close menu"
              >
                Close
              </button>
            </div>

            <nav className="mt-6 grid gap-3">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={closeMenu}
                  className="rounded-2xl border border-white/15 bg-white/[0.03] px-4 py-4 text-sm font-medium text-white transition hover:bg-white/[0.07]"
                >
                  {item.name}
                </a>
              ))}
            </nav>

            <div className="mt-4">
              <a
                href="/contact"
                onClick={closeMenu}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-white px-5 py-4 text-sm font-semibold text-slate-900 transition hover:opacity-95"
              >
                Enquire
              </a>
            </div>

            <div className="mt-8 rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">
                Corporate profile
              </p>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/68">
                Shobane African Resources is an African resources company
                focused on sourcing, supply and disciplined commercial
                execution across selected value chains.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
  }
