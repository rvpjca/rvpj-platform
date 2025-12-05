"use client";

import { useState, useEffect, useTransition } from "react";
import { Search, Plus, Edit, Trash2, X, Loader2, CalendarDays, UserCheck, UserX, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAllAttendance, markAttendance, deleteAttendance, getUsers } from "../actions";

type Attendance = {
  id: string;
  userId: string;
  date: Date;
  status: "PRESENT" | "ABSENT" | "LEAVE" | "HOLIDAY" | "WORK_FROM_HOME";
  checkIn: Date | null;
  checkOut: Date | null;
  remarks: string | null;
  user: { id: string; name: string | null; email: string };
};

type User = {
  id: string;
  name: string | null;
  email: string;
};

const statusColors: Record<string, string> = {
  PRESENT: "bg-green-100 text-green-700",
  ABSENT: "bg-red-100 text-red-700",
  LEAVE: "bg-yellow-100 text-yellow-700",
  HOLIDAY: "bg-blue-100 text-blue-700",
  WORK_FROM_HOME: "bg-purple-100 text-purple-700",
};

const statusOptions = ["PRESENT", "ABSENT", "LEAVE", "HOLIDAY", "WORK_FROM_HOME"] as const;

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split("T")[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    userId: "",
    date: new Date().toISOString().split("T")[0],
    status: "PRESENT" as typeof statusOptions[number],
    checkIn: "",
    checkOut: "",
    remarks: "",
  });

  useEffect(() => {
    loadAttendance();
    loadUsers();
  }, []);

  const loadAttendance = async () => {
    const result = await getAllAttendance();
    if (result.attendance) {
      setAttendance(result.attendance as Attendance[]);
    }
  };

  const loadUsers = async () => {
    const result = await getUsers();
    if (result.users) {
      setUsers(result.users as User[]);
    }
  };

  const filteredAttendance = attendance.filter((record) => {
    const matchesSearch =
      (record.user.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      record.user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const recordDate = new Date(record.date).toISOString().split("T")[0];
    const matchesDate = !dateFilter || recordDate === dateFilter;
    return matchesSearch && matchesDate;
  });

  const todayRecords = attendance.filter((r) => {
    const today = new Date().toISOString().split("T")[0];
    const recordDate = new Date(r.date).toISOString().split("T")[0];
    return recordDate === today;
  });

  const stats = {
    total: todayRecords.length,
    present: todayRecords.filter((r) => r.status === "PRESENT").length,
    absent: todayRecords.filter((r) => r.status === "ABSENT").length,
    leave: todayRecords.filter((r) => r.status === "LEAVE" || r.status === "WORK_FROM_HOME").length,
  };

  const openCreateModal = () => {
    setFormData({
      userId: users[0]?.id || "",
      date: new Date().toISOString().split("T")[0],
      status: "PRESENT",
      checkIn: "09:00",
      checkOut: "",
      remarks: "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.userId) {
      alert("Please select a user");
      return;
    }

    startTransition(async () => {
      const result = await markAttendance({
        userId: formData.userId,
        date: formData.date,
        status: formData.status,
        checkIn: formData.checkIn || undefined,
        checkOut: formData.checkOut || undefined,
        remarks: formData.remarks || undefined,
      });
      if (result.success) {
        closeModal();
        loadAttendance();
      } else {
        alert(result.error || "Failed to mark attendance");
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this attendance record?")) return;

    startTransition(async () => {
      const result = await deleteAttendance(id);
      if (result.success) {
        loadAttendance();
      } else {
        alert(result.error || "Failed to delete attendance");
      }
    });
  };

  const formatTime = (date: Date | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance</h1>
          <p className="text-muted-foreground">Track and manage team attendance</p>
        </div>
        <Button onClick={openCreateModal} className="gap-2">
          <Plus size={16} />
          Mark Attendance
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-100 p-3">
                <CalendarDays className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Today Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-100 p-3">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.present}</p>
                <p className="text-sm text-muted-foreground">Present</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-red-100 p-3">
                <UserX className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.absent}</p>
                <p className="text-sm text-muted-foreground">Absent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-yellow-100 p-3">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.leave}</p>
                <p className="text-sm text-muted-foreground">Leave/WFH</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Attendance Records</CardTitle>
              <CardDescription>View and manage attendance history</CardDescription>
            </div>
            <div className="flex gap-2">
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-auto"
              />
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium text-muted-foreground">Employee</th>
                  <th className="pb-3 font-medium text-muted-foreground">Date</th>
                  <th className="pb-3 font-medium text-muted-foreground">Status</th>
                  <th className="pb-3 font-medium text-muted-foreground">Check In</th>
                  <th className="pb-3 font-medium text-muted-foreground">Check Out</th>
                  <th className="pb-3 font-medium text-muted-foreground">Remarks</th>
                  <th className="pb-3 font-medium text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendance.map((record) => (
                  <tr key={record.id} className="border-b last:border-0">
                    <td className="py-4">
                      <p className="font-medium">{record.user.name || record.user.email}</p>
                      <p className="text-xs text-muted-foreground">{record.user.email}</p>
                    </td>
                    <td className="py-4 text-muted-foreground">
                      {new Date(record.date).toLocaleDateString("en-IN")}
                    </td>
                    <td className="py-4">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusColors[record.status]}`}>
                        {record.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-4 text-muted-foreground">{formatTime(record.checkIn)}</td>
                    <td className="py-4 text-muted-foreground">{formatTime(record.checkOut)}</td>
                    <td className="py-4 text-muted-foreground max-w-[150px] truncate">
                      {record.remarks || "—"}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600"
                          onClick={() => handleDelete(record.id)}
                          disabled={isPending}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAttendance.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              {attendance.length === 0
                ? "No attendance records yet. Click 'Mark Attendance' to add."
                : "No records found for the selected date."}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Mark Attendance</h2>
              <Button variant="ghost" size="icon" onClick={closeModal}>
                <X size={20} />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="userId">Employee *</Label>
                <select
                  id="userId"
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select Employee</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name || user.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="status">Status *</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as typeof statusOptions[number] })}
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>{s.replace("_", " ")}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="checkIn">Check In</Label>
                  <Input
                    id="checkIn"
                    type="time"
                    value={formData.checkIn}
                    onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="checkOut">Check Out</Label>
                  <Input
                    id="checkOut"
                    type="time"
                    value={formData.checkOut}
                    onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="remarks">Remarks</Label>
                <Input
                  id="remarks"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="Optional notes..."
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={closeModal} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Mark Attendance"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}



