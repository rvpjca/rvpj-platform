export type NavLink = {
  label: string;
  href: string;
};

export const publicNavLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Knowledge Bank", href: "/knowledge-bank" },
  { label: "Calculators", href: "/calculators" },
  { label: "Downloads", href: "/downloads" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
];

export const dashboardNavLinks = [
  { label: "Overview", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Live Chat", href: "/dashboard/live-chat", icon: "MessageCircle" },
  { label: "WhatsApp Bulk", href: "/dashboard/whatsapp/bulk", icon: "Radio" },
  { label: "Pages", href: "/dashboard/pages", icon: "FileText" },
  { label: "Media Library", href: "/dashboard/media", icon: "Image" },
  { label: "Enquiries", href: "/dashboard/enquiries", icon: "MessageSquare" },
  { label: "Career Applications", href: "/dashboard/careers", icon: "Briefcase" },
  { label: "Client Documents", href: "/dashboard/client-documents", icon: "FolderOpen" },
  { label: "Tasks", href: "/dashboard/tasks", icon: "ClipboardList" },
  { label: "Attendance", href: "/dashboard/attendance", icon: "CalendarCheck" },
  { label: "Theme Settings", href: "/dashboard/theme", icon: "Palette" },
  { label: "Users & Roles", href: "/dashboard/users", icon: "Users" },
  { label: "Site Settings", href: "/dashboard/settings", icon: "Settings" },
];

export const clientPortalNavLinks = [
  { label: "Dashboard", href: "/client-portal", icon: "LayoutDashboard" },
  { label: "Live Chat", href: "/client-portal/chat", icon: "MessageCircle" },
  { label: "My Documents", href: "/client-portal/documents", icon: "FileText" },
  { label: "Upload Document", href: "/client-portal/upload", icon: "Upload" },
  { label: "Downloads", href: "/client-portal/downloads", icon: "Download" },
  { label: "Meetings", href: "/client-portal/meetings", icon: "Calendar" },
  { label: "Profile", href: "/client-portal/profile", icon: "User" },
];

export const serviceNavLinks: NavLink[] = [
  { label: "Audit & Assurance", href: "/services/audit-assurance" },
  { label: "Direct Tax Consultancy", href: "/services/direct-tax" },
  { label: "Indirect Tax / GST", href: "/services/indirect-tax" },
  { label: "Corporate Laws & Secretarial", href: "/services/corporate-laws" },
  { label: "Project Finance", href: "/services/project-finance" },
  { label: "Management Consultancy", href: "/services/management-consultancy" },
];

export const calculatorNavLinks: NavLink[] = [
  { label: "GST Calculator", href: "/calculators/gst" },
  { label: "Income Tax Calculator", href: "/calculators/income-tax" },
  { label: "EMI Calculator", href: "/calculators/emi" },
  { label: "SIP Calculator", href: "/calculators/sip" },
  { label: "TDS Calculator", href: "/calculators/tds" },
  { label: "Net Worth Calculator", href: "/calculators/net-worth" },
  { label: "Net Profit Calculator", href: "/calculators/net-profit" },
];

export const knowledgeUtilityLinks: Record<string, NavLink[]> = {
  TDS: [
    { label: "Rates of TDS", href: "/knowledge-bank/tds/rates-of-tds" },
    { label: "TDS Rates for NRI u/s 195", href: "/knowledge-bank/tds/nri-195" },
    { label: "Rates of Income Tax", href: "/knowledge-bank/tds/rates-of-income-tax" },
  ],
};

