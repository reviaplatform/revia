import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Magnifer, Filter, UserPlus } from "@solar-icons/react";
import { AdminActionsDropdown } from "@/components/admin-actions-dropdown";
import { adminService, Admin } from "@/services/adminService";
import { SpinnerCustom } from "@/components/ui/spinner-custom";
import { toast } from "sonner";
import { CreateAdminModal } from "@/components/create-admin-modal";
import { TableRowsSkeleton } from "@/components/table-skeleton";

export function AdminTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [adminsData, setAdminsData] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const response = await adminService.getAdminList(1, 100);
      let list: Admin[] = [];
      if (Array.isArray(response)) {
        list = response;
      } else if (response?.data) {
        if (Array.isArray(response.data)) {
          list = response.data;
        } else if (response.data.admins && Array.isArray(response.data.admins)) {
          list = response.data.admins;
        }
      } else if (response?.admins) {
        list = response.admins;
      } else if (response?.results) {
        list = response.results;
      }
      setAdminsData(list);
    } catch (error: any) {
      toast.error("Failed to load admins", {
        description: error.message || "Could not reach the server.",
      });
      setAdminsData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const filteredAdmins = adminsData.filter((admin) => {
    const name = admin.name || "";
    const email = admin.email || "";
    const id = admin.id || admin._id || "";
    const role = admin.role || "";
    const isDeleted = !!admin.deletedAt;
    const status = isDeleted ? "banned" : "active";

    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || status.toLowerCase() === statusFilter;
    const matchesRole =
      roleFilter === "all" || role.toLowerCase() === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  const activeCount = adminsData.filter(a => !a.deletedAt).length;
  const bannedCount = adminsData.filter(a => !!a.deletedAt).length;

  return (
    <div className="w-full space-y-6">
      {/* Table Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-xl font-semibold tracking-tight text-foreground">
            Admin Management
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Manage administrative accounts, define role-based permissions, and audit system access.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-px">
            <div className="px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-l-md flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-semibold tabular-nums text-primary">{activeCount} Active</span>
            </div>
            <div className="px-3 py-1.5 bg-destructive/10 border border-destructive/20 border-l-0 rounded-r-md flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
              <span className="text-xs font-semibold tabular-nums text-destructive">{bannedCount} Banned</span>
            </div>
          </div>
        </div>
      </div>

      {/* Unified Action Bar */}
      <div className="grid grid-cols-1 sm:flex items-center gap-3 p-1.5 bg-muted/30 border border-border/50 rounded-lg">
        <div className="relative flex-1 group">
          <Magnifer className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search admins..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 bg-background border-border/50 focus:border-primary/50 focus:ring-primary/10 transition-all text-sm"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 w-[130px] bg-background border-border/50 text-xs font-medium">
              <div className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
            </SelectContent>
          </Select>

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="h-10 w-[130px] bg-background border-border/50 text-xs font-medium">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="hidden sm:block w-px h-6 bg-border/50 mx-1" />

        <CreateAdminModal onSuccess={fetchAdmins} />
      </div>

      {/* Table Section */}
      <div className="rounded-md border border-border/50 bg-card overflow-x-auto transition-all duration-300">
        <Table className="w-full min-w-[1000px]">
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="w-[100px] text-[11px] font-bold uppercase tracking-wider pl-6">ID</TableHead>
                <TableHead className="min-w-[150px] md:min-w-[200px] text-[11px] font-bold uppercase tracking-wider">Administrator</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider">Role</TableHead>
                <TableHead className="w-[110px] text-[11px] font-bold uppercase tracking-wider text-center">Status</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider">Last Activity</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider">Phone</TableHead>
                <TableHead className="text-right w-[80px] text-[11px] font-bold uppercase tracking-wider pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRowsSkeleton columnCount={6} />
              ) : filteredAdmins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center bg-background/30 italic">
                     <div className="text-sm text-muted-foreground">No administrative accounts found matching your filters.</div>
                  </TableCell>
                </TableRow>
              ) : filteredAdmins.map((admin, idx) => (
                <TableRow 
                  key={admin.id || admin._id || admin.email}
                  className="group relative hover:bg-primary/[0.02] border-border/40 transition-all duration-300 animate-in fade-in slide-in-from-left-2"
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  <TableCell className="relative font-mono text-[10px] text-muted-foreground/70 tracking-tighter pl-6">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-center" />
                    {admin.id.slice(-6).toUpperCase()}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm tracking-tight">{admin.name}</span>
                      <span className="text-[11px] text-muted-foreground font-medium truncate max-w-[150px] md:max-w-none">{admin.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-2 py-0 h-5 border-none rounded-sm font-bold uppercase tracking-tight ${
                        admin.role === "admin" 
                          ? "bg-primary/10 text-primary" 
                          : "bg-orange-500/10 text-orange-600"
                      }`}
                    >
                      {admin.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-2 py-0 h-5 border-none rounded-sm font-bold uppercase tracking-tight ${
                          admin.deletedAt ? "bg-destructive/10 text-destructive" : "bg-wf-green/10 text-wf-green"
                        }`}
                      >
                        {admin.deletedAt ? "BANNED" : "ACTIVE"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs tabular-nums text-muted-foreground">
                    {admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleDateString() : "Never"}
                  </TableCell>
                  <TableCell className="text-xs font-medium text-muted-foreground">
                    {admin.phoneNumber}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                      <AdminActionsDropdown
                        adminId={admin.id || admin._id || ""}
                        adminName={admin.name}
                        adminEmail={admin.email}
                        adminStatus={admin.deletedAt ? "banned" : "active"}
                        adminRole={admin.role}
                        onSuccess={fetchAdmins}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
      </div>
    </div>
  );
}
