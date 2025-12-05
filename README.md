# R V P J & Co. - Platform Documentation

> **Comprehensive CMS & Client Portal for Chartered Accountancy Firm**

A full-stack web application built with Next.js 16, featuring public website, admin dashboard, and client portal with real-time communication capabilities.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [System Architecture](#system-architecture)
- [User Roles & Permissions](#user-roles--permissions)
- [Features Documentation](#features-documentation)
- [Database Schema](#database-schema)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## 🌟 Overview

R V P J & Co. Platform is a comprehensive content management system designed specifically for chartered accountancy firms. It provides three main portals:

1. **Public Website** - Marketing and information portal
2. **Admin Dashboard** - Staff and management portal
3. **Client Portal** - Secure client communication and document management

---

## ✨ Key Features

### Public Website
- 📄 **Services Pages** - Detailed information about CA services
- 🧮 **Financial Calculators** - 13+ calculators (GST, Income Tax, EMI, SIP, RERA, etc.)
- 📰 **Knowledge Bank** - Articles, bulletins, and resources
- 💼 **Career Portal** - Job listings and applications
- 📧 **Contact & Enquiry Forms** - Lead generation
- 📱 **Responsive Design** - Mobile-first approach

### Admin Dashboard
- 👥 **User Management** - Create and manage users with role-based access
- 📊 **Dashboard Analytics** - Overview of system activities
- 💬 **Live Chat Management** - Handle client queries in real-time
- 📱 **WhatsApp Integration** - Bulk messaging and broadcasts
- 📁 **Client Documents** - View and update document status
- 📝 **Content Management** - Manage pages and media
- 🎯 **Task Management** - Assign and track tasks
- ⏰ **Attendance System** - Staff attendance tracking
- 📋 **Enquiry Management** - Handle contact form submissions
- 💼 **Career Applications** - Review job applications

### Client Portal
- 🔐 **Secure Login** - PAN & Birth Date authentication
- 📄 **Document Management** - Upload and view documents
- 💬 **Live Chat** - Direct communication with staff
- 📅 **Meetings** - View scheduled meetings and join video calls
- 📥 **Downloads** - Access forms and resources
- 👤 **Profile Management** - Update client information

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** Next.js 16 (React 19)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui + Radix UI
- **Icons:** Lucide React
- **State Management:** React Hooks
- **Form Handling:** React Hook Form (optional)

### Backend
- **Runtime:** Node.js
- **API:** Next.js App Router (Server Actions & API Routes)
- **Authentication:** NextAuth.js v5
- **Database:** PostgreSQL (via Supabase)
- **ORM:** Prisma
- **Storage:** Supabase Storage

### Real-time Features
- **Live Chat:** Custom implementation with Prisma
- **WhatsApp:** whatsapp-web.js (development)
- **Video/Voice Calls:** Jitsi Meet integration

### Deployment
- **Hosting:** Vercel (recommended) / Self-hosted
- **Database:** Supabase PostgreSQL
- **Storage:** Supabase Storage (rvpj-media bucket)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database (Supabase account)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rvpj-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://..."
   DIRECT_URL="postgresql://..."

   # NextAuth
   AUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   # or
   npx prisma migrate dev --name init
   ```

5. **Seed initial data (optional)**
   ```bash
   npx prisma db seed
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open the application**
   - Public Site: http://localhost:3000
   - Admin Login: http://localhost:3000/login
   - Client Login: http://localhost:3000/client-login

---

## 🏗️ System Architecture

```
rvpj-platform/
├── app/
│   ├── (public)/              # Public website routes
│   │   ├── page.tsx           # Home page
│   │   ├── about/             # About page
│   │   ├── services/          # Services pages
│   │   ├── calculators/       # Financial calculators
│   │   ├── contact/           # Contact page
│   │   └── ...
│   ├── (dashboard)/           # Admin dashboard routes
│   │   └── dashboard/
│   │       ├── page.tsx       # Dashboard home
│   │       ├── users/         # User management
│   │       ├── live-chat/     # Chat management
│   │       ├── whatsapp/      # WhatsApp features
│   │       ├── client-documents/
│   │       ├── tasks/
│   │       └── ...
│   ├── (client-portal)/       # Client portal routes
│   │   └── client-portal/
│   │       ├── page.tsx       # Client dashboard
│   │       ├── documents/     # Client documents
│   │       ├── chat/          # Client chat
│   │       └── ...
│   ├── api/                   # API routes
│   │   ├── auth/              # NextAuth endpoints
│   │   └── whatsapp/          # WhatsApp API
│   └── layout.tsx             # Root layout
├── components/
│   ├── layout/                # Layout components
│   │   ├── site-header.tsx
│   │   ├── site-footer.tsx
│   │   └── dashboard/
│   ├── forms/                 # Form components
│   ├── ui/                    # shadcn/ui components
│   └── ...
├── lib/
│   ├── auth.ts                # NextAuth configuration
│   ├── prisma.ts              # Prisma client
│   ├── permissions.ts         # Role-based access control
│   ├── constants/             # App constants
│   ├── whatsapp/              # WhatsApp manager
│   └── ...
├── prisma/
│   └── schema.prisma          # Database schema
├── public/                    # Static assets
└── ...
```

---

## 👥 User Roles & Permissions

### Role Hierarchy

1. **ADMIN** - Full system access
2. **PARTNER** - High-level access, can manage staff
3. **MANAGER** - Department management access
4. **STAFF** - Limited operational access
5. **CLIENT** - Client portal access only

### Permission Matrix

| Feature | ADMIN | PARTNER | MANAGER | STAFF | CLIENT |
|---------|-------|---------|---------|-------|--------|
| Dashboard Overview | ✅ | ✅ | ✅ | ✅ | ❌ |
| User Management | ✅ | ✅ | ✅ | ❌ | ❌ |
| Client Documents | ✅ | ✅ | ✅ | ✅ | Own only |
| Live Chat (Admin) | ✅ | ✅ | ✅ | ✅ | ❌ |
| Live Chat (Client) | ❌ | ❌ | ❌ | ❌ | ✅ |
| WhatsApp Bulk | ✅ | ✅ | ✅ | ❌ | ❌ |
| Task Management | ✅ | ✅ | ✅ | View only | ❌ |
| Attendance | ✅ | ✅ | ✅ | Own only | ❌ |
| Site Settings | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 📚 Features Documentation

### 1. Authentication

#### Admin/Staff Login
- **Route:** `/login`
- **Method:** Email + Password
- **Features:**
  - Session-based authentication (NextAuth.js)
  - Role-based redirects
  - Remember me functionality
  - Secure password hashing

#### Client Login
- **Route:** `/client-login`
- **Method:** PAN Number + Birth Date
- **Features:**
  - Client registration (auto-creates account)
  - Secure PAN-based authentication
  - Direct portal access

### 2. Admin Dashboard

#### Dashboard Home (`/dashboard`)
```typescript
// Features:
- System statistics
- Recent activities
- Quick actions
- Role-specific widgets
```

#### User Management (`/dashboard/users`)
```typescript
// Capabilities:
- Create new users (staff/clients)
- Assign roles and permissions
- Manage custom permissions
- View user activity
- Delete/deactivate users
```

**Creating a New User:**
1. Navigate to Dashboard → Users & Roles
2. Click "Create New User"
3. Fill in details (name, email, password, role)
4. Assign permissions
5. Save

#### Client Documents (`/dashboard/client-documents`)
```typescript
// Features:
- View all client-uploaded documents
- Search by client name
- Filter by document status
- Update document status (Pending/Approved/Rejected)
- Download documents
- View document details
```

**Document Status Workflow:**
- Client uploads → Status: PENDING
- Admin reviews → Update to APPROVED/REJECTED
- Client sees updated status in their portal

#### Live Chat Management (`/dashboard/live-chat`)
```typescript
// Features:
- View all active chat rooms
- Assign chats to staff members
- Reply to client messages
- Send files and documents
- Initiate video/voice calls (Jitsi)
- Schedule meetings
- Close resolved chats
```

**Handling a Chat:**
1. Open Live Chat from dashboard
2. Select a chat room from the list
3. View chat history
4. Reply to client messages
5. Optional: Start call or schedule meeting
6. Close chat when resolved

#### WhatsApp Integration (`/dashboard/whatsapp/bulk`)

⚠️ **Important:** Currently using `whatsapp-web.js` for development. For production, use official WhatsApp Business API.

```typescript
// Features:
- QR code login (WhatsApp Web)
- Session management
- Bulk messaging
- Broadcast lists
- Scheduled messages
- Message templates
```

**Setting Up WhatsApp:**
1. Navigate to Dashboard → WhatsApp Bulk
2. Click "Login & Show QR Code"
3. Scan QR with WhatsApp mobile app
4. Wait for "Connected" status
5. Start sending messages

**Sending Bulk Messages:**
1. Go to "Broadcast" tab
2. Enter phone numbers (comma-separated)
3. Compose message
4. Send immediately or schedule

### 3. Client Portal

#### Client Dashboard (`/client-portal`)
```typescript
// Overview:
- Welcome message
- Quick stats (documents, meetings)
- Recent activities
- Quick actions
```

#### Document Management

**Upload Document** (`/client-portal/upload`)
1. Click "Upload Document"
2. Select file (PDF, images, docs)
3. Add title and description
4. Submit
5. Track status in "My Documents"

**View Documents** (`/client-portal/documents`)
- View all uploaded documents
- Check approval status
- Download approved documents
- Filter by status

#### Live Chat (`/client-portal/chat`)
```typescript
// Features:
- Create new chat
- Send messages to staff
- Upload files
- Start video/voice calls
- View meeting schedules
```

**Starting a Chat:**
1. Go to Live Chat
2. If no chat exists, it's created automatically
3. Type message and send
4. Staff will respond from admin panel

### 4. Financial Calculators

#### Available Calculators

1. **GST Calculator** (`/calculators/gst`)
   - GST inclusive/exclusive calculation
   - CGST/SGST breakdown

2. **Income Tax Calculator** (`/calculators/income-tax`)
   - Old vs New regime
   - FY 2024-25 tax slabs
   - Deduction calculations

3. **EMI Calculator** (`/calculators/emi`)
   - Monthly EMI calculation
   - Interest vs principal breakdown

4. **SIP Calculator** (`/calculators/sip`)
   - Mutual fund SIP returns
   - Maturity value calculation

5. **TDS Calculator** (`/calculators/tds`)
   - Various TDS types (194J, 194C, etc.)
   - Net amount calculation

6. **HRA Calculator** (`/calculators/hra`)
   - HRA exemption under Section 10(13A)
   - Metro vs non-metro calculation

7. **Home Loan Calculator** (`/calculators/home-loan`)
   - Home loan EMI
   - Tax benefits information

8. **Auto Loan Calculator** (`/calculators/auto-loan`)
   - Car/vehicle loan EMI
   - Down payment consideration

9. **RERA Calculator** (`/calculators/rera`)
   - Property cost breakdown
   - Balance amount calculation

10. **RERA Interest Calculator** (`/calculators/rera-interest`)
    - Delay possession interest
    - MCLR + 2% rate

11. **RERA Refund Calculator** (`/calculators/rera-refund`)
    - Refund with interest
    - Voluntary vs delay cancellation

12. **Net Worth Calculator** (`/calculators/net-worth`)
    - Assets vs liabilities
    - Debt-to-asset ratio

13. **Net Profit Calculator** (`/calculators/net-profit`)
    - Gross, operating, net profit
    - Profit margins

---

## 🗄️ Database Schema

### Key Models

```prisma
// User Management
model User {
  id            String    @id @default(cuid())
  email         String?   @unique
  name          String?
  password      String?
  role          UserRole  @default(CLIENT)
  panNumber     String?   @unique
  birthDate     DateTime?
  // ... more fields
}

enum UserRole {
  ADMIN
  PARTNER
  MANAGER
  STAFF
  CLIENT
}

// Document Management
model ClientDocument {
  id          String              @id @default(cuid())
  title       String
  fileUrl     String
  status      DocumentStatus      @default(PENDING)
  userId      String
  user        User                @relation(fields: [userId])
  uploadedAt  DateTime            @default(now())
}

enum DocumentStatus {
  PENDING
  APPROVED
  REJECTED
}

// Chat System
model ChatRoom {
  id          String          @id @default(cuid())
  clientId    String
  client      User            @relation("ClientChats", fields: [clientId])
  assignedToId String?
  assignedTo  User?           @relation("AssignedChats", fields: [assignedToId])
  status      ChatRoomStatus  @default(ACTIVE)
  messages    ChatMessage[]
  createdAt   DateTime        @default(now())
}

model ChatMessage {
  id          String       @id @default(cuid())
  roomId      String
  room        ChatRoom     @relation(fields: [roomId])
  senderId    String
  sender      User         @relation(fields: [senderId])
  content     String
  type        MessageType  @default(TEXT)
  fileUrl     String?
  sentAt      DateTime     @default(now())
}

// WhatsApp Integration
model WhatsAppMessage {
  id          String    @id @default(cuid())
  phone       String
  message     String
  status      String    @default("pending")
  sentAt      DateTime?
  createdAt   DateTime  @default(now())
}

// ... more models in schema.prisma
```

### Running Migrations

```bash
# Create a new migration
npx prisma migrate dev --name your_migration_name

# Apply migrations to production
npx prisma migrate deploy

# Reset database (⚠️ development only)
npx prisma migrate reset

# Generate Prisma Client after schema changes
npx prisma generate

# Open Prisma Studio (GUI)
npx prisma studio
```

---

## 🔐 Environment Variables

### Required Variables

```env
# Database Connection
DATABASE_URL="postgresql://user:password@host:5432/database"
DIRECT_URL="postgresql://user:password@host:5432/database"

# NextAuth Configuration
AUTH_SECRET="generated-secret-key-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### Optional Variables

```env
# Email Configuration (for notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"

# WhatsApp API (for production)
WHATSAPP_API_KEY="your-api-key"
WHATSAPP_PHONE_NUMBER_ID="your-phone-id"

# Analytics
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
```

### Generating AUTH_SECRET

```bash
openssl rand -base64 32
```

---

## 🚀 Deployment

### Deploying to Vercel

1. **Push code to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to vercel.com
   - Import your repository
   - Select "Next.js" framework

3. **Configure Environment Variables**
   - Add all variables from `.env`
   - Use Supabase production URLs

4. **Deploy**
   - Vercel will automatically build and deploy
   - Domain: `your-app.vercel.app`

### Custom Domain Setup

1. In Vercel dashboard → Settings → Domains
2. Add your domain (e.g., `rvpj.in`)
3. Update DNS records as instructed
4. Enable HTTPS (automatic)

### Database Setup (Supabase)

1. **Create Project**
   - Go to supabase.com
   - Create new project

2. **Configure Storage**
   ```sql
   -- Create storage bucket
   INSERT INTO storage.buckets (id, name, public)
   VALUES ('rvpj-media', 'rvpj-media', true);
   ```

3. **Set RLS Policies**
   - Go to Storage → rvpj-media → Policies
   - Make bucket public or configure specific policies

4. **Get Connection Strings**
   - Project Settings → Database
   - Copy connection strings to `.env`

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Build Errors

**Error:** `Module not found`
```bash
# Solution: Clear cache and reinstall
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

**Error:** `Prisma Client not generated`
```bash
npx prisma generate
```

#### 2. Authentication Issues

**Issue:** Login not working
- Check `AUTH_SECRET` is set
- Verify `NEXTAUTH_URL` matches your domain
- Clear browser cookies
- Check database connection

**Issue:** Client login with PAN failing
- Ensure PAN is uppercase
- Verify birth date format (YYYY-MM-DD)
- Check User model has `panNumber` and `birthDate` fields

#### 3. Database Issues

**Error:** `Can't reach database server`
- Check DATABASE_URL is correct
- Verify database is running
- Check firewall/network settings
- For Supabase: Confirm project is active

**Error:** `Migration failed`
```bash
# Reset and reapply migrations (⚠️ development only)
npx prisma migrate reset
npx prisma migrate dev
```

#### 4. File Upload Issues

**Error:** `new row violates row-level security policy`
```sql
-- Solution: Make Supabase bucket public
UPDATE storage.buckets
SET public = true
WHERE id = 'rvpj-media';

-- Or add INSERT policy
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'rvpj-media');
```

#### 5. WhatsApp Issues

**Issue:** QR code not showing
- Delete `.wwebjs_auth` folder
- Restart dev server
- Ensure Chrome/Chromium is installed
- Set `headless: false` for debugging

**Issue:** Session disconnects frequently
- Use official WhatsApp Business API for production
- `whatsapp-web.js` is for development only

#### 6. Permission Issues

**Issue:** User can't access certain pages
- Check role permissions in `/dashboard/users`
- Verify `lib/permissions.ts` has correct role mappings
- Clear user session and re-login

### Debug Mode

Enable detailed logging:

```typescript
// lib/auth.ts
export const authConfig = {
  debug: process.env.NODE_ENV === "development",
  // ...
}
```

### Getting Help

1. Check error logs in terminal
2. Use browser DevTools Console
3. Check Vercel deployment logs
4. Review Supabase logs
5. Consult Next.js documentation: https://nextjs.org/docs

---

## 📝 Development Guidelines

### Code Structure

```typescript
// Use Server Components by default
export default async function Page() {
  const data = await getData();
  return <Component data={data} />;
}

// Use "use client" only when needed
"use client";
export function InteractiveComponent() {
  const [state, setState] = useState();
  // ...
}
```

### Server Actions

```typescript
// app/actions.ts
"use server";

export async function createUser(formData: FormData) {
  const data = {
    name: formData.get("name"),
    // ...
  };
  
  await prisma.user.create({ data });
  revalidatePath("/dashboard/users");
}
```

### API Routes

```typescript
// app/api/example/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const data = await fetchData();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  // Process data
  return NextResponse.json({ success: true });
}
```

---

## 📄 License

Proprietary - R V P J & Co. All rights reserved.

---

## 👥 Support

For technical support or questions:
- **Email:** admin@rvpj.in
- **Phone:** +91 9978781078
- **Website:** https://rvpj.in

---

## 🎯 Roadmap

### Upcoming Features
- [ ] Email notifications system
- [ ] Advanced reporting and analytics
- [ ] Document versioning
- [ ] Mobile app (React Native)
- [ ] Official WhatsApp Business API integration
- [ ] Payment gateway integration
- [ ] Client feedback system
- [ ] Advanced search functionality
- [ ] Audit trail/activity logs
- [ ] Two-factor authentication

---

**Last Updated:** December 2024  
**Version:** 1.0.0  
**Built with ❤️ for R V P J & Co.**
