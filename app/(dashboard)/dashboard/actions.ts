"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { PageStatus, RoleKey, UserStatus, TaskStatus, TaskPriority, AttendanceStatus } from "@prisma/client";
import { hash } from "bcryptjs";

// ============== PAGES ACTIONS ==============

export async function getPages() {
  try {
    const pages = await prisma.page.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return { pages };
  } catch (error) {
    console.error("Error fetching pages:", error);
    return { pages: [], error: "Failed to fetch pages" };
  }
}

export async function createPage(data: {
  title: string;
  slug: string;
  description?: string;
  status?: PageStatus;
}) {
  try {
    const page = await prisma.page.create({
      data: {
        title: data.title,
        slug: data.slug.startsWith("/") ? data.slug : `/${data.slug}`,
        description: data.description,
        status: data.status || "DRAFT",
      },
    });
    revalidatePath("/dashboard/pages");
    return { success: true, page };
  } catch (error) {
    console.error("Error creating page:", error);
    return { success: false, error: "Failed to create page" };
  }
}

export async function updatePage(
  id: string,
  data: {
    title?: string;
    slug?: string;
    description?: string;
    status?: PageStatus;
  }
) {
  try {
    const page = await prisma.page.update({
      where: { id },
      data: {
        ...data,
        slug: data.slug ? (data.slug.startsWith("/") ? data.slug : `/${data.slug}`) : undefined,
      },
    });
    revalidatePath("/dashboard/pages");
    return { success: true, page };
  } catch (error) {
    console.error("Error updating page:", error);
    return { success: false, error: "Failed to update page" };
  }
}

export async function deletePage(id: string) {
  try {
    await prisma.page.delete({ where: { id } });
    revalidatePath("/dashboard/pages");
    return { success: true };
  } catch (error) {
    console.error("Error deleting page:", error);
    return { success: false, error: "Failed to delete page" };
  }
}

// ============== ROLES ACTIONS ==============

export async function getRoles() {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { createdAt: "asc" },
    });
    return { roles };
  } catch (error) {
    console.error("Error fetching roles:", error);
    return { roles: [], error: "Failed to fetch roles" };
  }
}

export async function updateRolePermissions(id: string, permissions: string[]) {
  try {
    const role = await prisma.role.update({
      where: { id },
      data: { permissions },
    });
    revalidatePath("/dashboard/users");
    return { success: true, role };
  } catch (error) {
    console.error("Error updating role permissions:", error);
    return { success: false, error: "Failed to update role permissions" };
  }
}

// ============== USERS ACTIONS ==============

export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      include: { role: true },
      orderBy: { createdAt: "desc" },
    });
    return { users };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { users: [], error: "Failed to fetch users" };
  }
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  roleKey: RoleKey;
  status?: UserStatus;
}) {
  try {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      return { success: false, error: "Email already exists" };
    }

    const role = await prisma.role.findUnique({ where: { key: data.roleKey } });
    if (!role) {
      return { success: false, error: "Invalid role" };
    }

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        hashedPassword: await hash(data.password, 12),
        roleId: role.id,
        status: data.status || "ACTIVE",
      },
    });
    revalidatePath("/dashboard/users");
    return { success: true, user };
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, error: "Failed to create user" };
  }
}

export async function updateUser(
  id: string,
  data: {
    name?: string;
    email?: string;
    roleKey?: RoleKey;
    status?: UserStatus;
    password?: string;
  }
) {
  try {
    const updateData: Record<string, unknown> = {};
    
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.status) updateData.status = data.status;
    if (data.password) updateData.hashedPassword = await hash(data.password, 12);
    
    if (data.roleKey) {
      const role = await prisma.role.findUnique({ where: { key: data.roleKey } });
      if (role) updateData.roleId = role.id;
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });
    revalidatePath("/dashboard/users");
    return { success: true, user };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, error: "Failed to update user" };
  }
}

export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({ where: { id } });
    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: "Failed to delete user" };
  }
}

// ============== ENQUIRIES ACTIONS ==============

export async function getEnquiries() {
  try {
    const enquiries = await prisma.contactSubmission.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { enquiries };
  } catch (error) {
    console.error("Error fetching enquiries:", error);
    return { enquiries: [], error: "Failed to fetch enquiries" };
  }
}

export async function updateEnquiryStatus(id: string, isRead: boolean) {
  try {
    await prisma.contactSubmission.update({
      where: { id },
      data: { isRead },
    });
    revalidatePath("/dashboard/enquiries");
    return { success: true };
  } catch (error) {
    console.error("Error updating enquiry:", error);
    return { success: false, error: "Failed to update enquiry" };
  }
}

export async function deleteEnquiry(id: string) {
  try {
    await prisma.contactSubmission.delete({ where: { id } });
    revalidatePath("/dashboard/enquiries");
    return { success: true };
  } catch (error) {
    console.error("Error deleting enquiry:", error);
    return { success: false, error: "Failed to delete enquiry" };
  }
}

// ============== CAREER APPLICATIONS ACTIONS ==============

export async function getCareerApplications() {
  try {
    const applications = await prisma.careerApplication.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { applications };
  } catch (error) {
    console.error("Error fetching applications:", error);
    return { applications: [], error: "Failed to fetch applications" };
  }
}

export async function updateApplicationStatus(id: string, status: string) {
  try {
    await prisma.careerApplication.update({
      where: { id },
      data: { status },
    });
    revalidatePath("/dashboard/careers");
    return { success: true };
  } catch (error) {
    console.error("Error updating application:", error);
    return { success: false, error: "Failed to update application" };
  }
}

export async function deleteApplication(id: string) {
  try {
    await prisma.careerApplication.delete({ where: { id } });
    revalidatePath("/dashboard/careers");
    return { success: true };
  } catch (error) {
    console.error("Error deleting application:", error);
    return { success: false, error: "Failed to delete application" };
  }
}

// ============== THEME SETTINGS ACTIONS ==============

export async function getThemeSettings() {
  try {
    const settings = await prisma.themeSetting.findMany();
    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });
    return { settings: settingsMap };
  } catch (error) {
    console.error("Error fetching theme settings:", error);
    return { settings: {}, error: "Failed to fetch theme settings" };
  }
}

export async function saveThemeSettings(settings: Record<string, string>) {
  try {
    for (const [key, value] of Object.entries(settings)) {
      await prisma.themeSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value, category: "theme" },
      });
    }
    revalidatePath("/dashboard/theme");
    return { success: true };
  } catch (error) {
    console.error("Error saving theme settings:", error);
    return { success: false, error: "Failed to save theme settings" };
  }
}

// ============== SITE SETTINGS ACTIONS ==============

export async function getSiteSettings() {
  try {
    const settings = await prisma.siteSetting.findMany();
    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });
    return { settings: settingsMap };
  } catch (error) {
    console.error("Error fetching site settings:", error);
    return { settings: {}, error: "Failed to fetch site settings" };
  }
}

export async function saveSiteSettings(settings: Record<string, string>) {
  try {
    for (const [key, value] of Object.entries(settings)) {
      await prisma.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value, category: "general" },
      });
    }
    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    console.error("Error saving site settings:", error);
    return { success: false, error: "Failed to save site settings" };
  }
}

// ============== TASKS ACTIONS ==============

export async function getTasks() {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return { tasks };
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return { tasks: [], error: "Failed to fetch tasks" };
  }
}

export async function createTask(data: {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  assigneeId?: string;
  clientName?: string;
  createdById: string;
}) {
  try {
    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status || "NOT_STARTED",
        priority: data.priority || "NORMAL",
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        assigneeId: data.assigneeId || null,
        clientName: data.clientName,
        createdById: data.createdById,
      },
    });
    revalidatePath("/dashboard/tasks");
    return { success: true, task };
  } catch (error) {
    console.error("Error creating task:", error);
    return { success: false, error: "Failed to create task" };
  }
}

export async function updateTask(
  id: string,
  data: {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: string;
    assigneeId?: string | null;
    clientName?: string;
  }
) {
  try {
    const task = await prisma.task.update({
      where: { id },
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
    });
    revalidatePath("/dashboard/tasks");
    return { success: true, task };
  } catch (error) {
    console.error("Error updating task:", error);
    return { success: false, error: "Failed to update task" };
  }
}

export async function deleteTask(id: string) {
  try {
    await prisma.task.delete({ where: { id } });
    revalidatePath("/dashboard/tasks");
    return { success: true };
  } catch (error) {
    console.error("Error deleting task:", error);
    return { success: false, error: "Failed to delete task" };
  }
}

// ============== ATTENDANCE ACTIONS ==============

export async function getAttendance(date?: string) {
  try {
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const attendance = await prisma.attendance.findMany({
      where: {
        date: {
          gte: targetDate,
          lt: nextDate,
        },
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return { attendance };
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return { attendance: [], error: "Failed to fetch attendance" };
  }
}

export async function getAllAttendance() {
  try {
    const attendance = await prisma.attendance.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { date: "desc" },
    });
    return { attendance };
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return { attendance: [], error: "Failed to fetch attendance" };
  }
}

export async function markAttendance(data: {
  userId: string;
  date: string;
  status: AttendanceStatus;
  checkIn?: string;
  checkOut?: string;
  remarks?: string;
}) {
  try {
    const dateObj = new Date(data.date);
    dateObj.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.upsert({
      where: {
        userId_date: {
          userId: data.userId,
          date: dateObj,
        },
      },
      update: {
        status: data.status,
        checkIn: data.checkIn ? new Date(`${data.date}T${data.checkIn}`) : null,
        checkOut: data.checkOut ? new Date(`${data.date}T${data.checkOut}`) : null,
        remarks: data.remarks,
      },
      create: {
        userId: data.userId,
        date: dateObj,
        status: data.status,
        checkIn: data.checkIn ? new Date(`${data.date}T${data.checkIn}`) : null,
        checkOut: data.checkOut ? new Date(`${data.date}T${data.checkOut}`) : null,
        remarks: data.remarks,
      },
    });
    revalidatePath("/dashboard/attendance");
    return { success: true, attendance };
  } catch (error) {
    console.error("Error marking attendance:", error);
    return { success: false, error: "Failed to mark attendance" };
  }
}

export async function deleteAttendance(id: string) {
  try {
    await prisma.attendance.delete({ where: { id } });
    revalidatePath("/dashboard/attendance");
    return { success: true };
  } catch (error) {
    console.error("Error deleting attendance:", error);
    return { success: false, error: "Failed to delete attendance" };
  }
}

