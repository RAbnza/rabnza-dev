export interface NavigationItem {
  label: string;
  href: string;
  section?: string;
}

export const navigationItems: NavigationItem[] = [
  {
    label: "About",
    href: "/#about",
    section: "about",
  },
  {
    label: "Work",
    href: "/#work",
    section: "work",
  },
  {
    label: "Résumé",
    href: "/resume/",
  },
  {
    label: "Contact",
    href: "/#contact",
    section: "contact",
  },
];

export const secondaryNavigationItems: NavigationItem[] = [
  { label: "Portfolio", href: "/" },
  { label: "Projects", href: "/projects/" },
  { label: "Résumé", href: "/resume/" },
  { label: "Contact", href: "/#contact" },
];
