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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Magnifer, Filter, CartLarge, Restart } from "@solar-icons/react";
import { CustomerActionsDropdown } from "@/components/customer-actions-dropdown";
import { customerService, CustomerListItem } from "@/services/customerService";
import { TableRowsSkeleton } from "@/components/table-skeleton";
import { SpinnerCustom } from "@/components/ui/spinner-custom";
import { toast } from "sonner";

export function CustomerTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [customersData, setCustomersData] = useState<CustomerListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const response = await customerService.getCustomerList(1, 100);
      let list: CustomerListItem[] = [];
      if (Array.isArray(response)) {
        list = response;
      } else if (response?.data) {
        if (Array.isArray(response.data)) {
          list = response.data;
        } else if (response.data.customers && Array.isArray(response.data.customers)) {
          list = response.data.customers;
        } else if (response.data.items && Array.isArray(response.data.items)) {
          list = response.data.items;
        }
      } else if (response?.customers) {
        list = response.customers;
      } else if (response?.results) {
        list = response.results;
      }
      setCustomersData(list);
    } catch (error: any) {
      toast.error("Failed to load customers", {
        description: error.message || "Could not reach the server.",
      });
      setCustomersData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customersData.filter((customer) => {
    const name = customer.name || "";
    const email = customer.email || "";
    const id = customer.id || customer._id || "";
    const status = customer.status || "active";

    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || status.toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const activeCount = customersData.filter(c => (c.status || 'active').toLowerCase() === 'active').length;
  const bannedCount = customersData.filter(c => (c.status || '').toLowerCase() === 'banned').length;
  const deletedCount = customersData.filter(c => (c.status || '').toLowerCase() === 'deleted').length;

  return (
    <div className="w-full space-y-6">
      {/* Table Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-xl font-semibold tracking-tight text-foreground">
            Customer Management
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Manage your global customer base, analyze purchasing patterns, and perform account maintenance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-px">
            <div className="px-3 py-1.5 bg-wf-green/10 border border-wf-green/20 rounded-l-md flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-wf-green animate-pulse" />
              <span className="text-xs font-semibold tabular-nums text-wf-green">{activeCount} Active</span>
            </div>
            <div className="px-3 py-1.5 bg-destructive/10 border border-destructive/20 border-l-0 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
              <span className="text-xs font-semibold tabular-nums text-destructive">{bannedCount} Banned</span>
            </div>
            <div className="px-3 py-1.5 bg-muted border border-border/50 border-l-0 rounded-r-md flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
              <span className="text-xs font-semibold tabular-nums text-muted-foreground/70">{deletedCount} Deleted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Unified Action Bar */}
      <div className="grid grid-cols-1 sm:flex items-center gap-3 p-1.5 bg-muted/30 border border-border/50 rounded-lg">
        <div className="relative flex-1 group">
          <Magnifer className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search by name, email or ID..."
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
              <SelectItem value="deleted">Deleted</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-md border border-border/50 bg-card overflow-x-auto transition-all duration-300">
        <Table className="w-full min-w-[1100px]">
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="w-[100px] text-[11px] font-bold uppercase tracking-wider">ID</TableHead>
                <TableHead className="min-w-[150px] md:min-w-[200px] text-[11px] font-bold uppercase tracking-wider">Customer</TableHead>
                <TableHead className="w-[110px] text-[11px] font-bold uppercase tracking-wider text-center">Status</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider">Identity Details</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider">Last Activity</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider">Phone</TableHead>
                <TableHead className="text-right w-[80px] text-[11px] font-bold uppercase tracking-wider pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRowsSkeleton columnCount={6} />
              ) : filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center bg-background/30 italic">
                     <div className="text-sm text-muted-foreground">Search yielded no results for the selected criteria.</div>
                  </TableCell>
                </TableRow>
              ) : filteredCustomers.map((customer, idx) => (
                <TableRow 
                  key={customer.id || customer._id || idx}
                  className="group hover:bg-primary/5 border-border/40 transition-colors animate-in fade-in slide-in-from-left-2 duration-300"
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  <TableCell className="font-mono text-[11px] text-muted-foreground tracking-tighter">
                    {customer.id.slice(-6).toUpperCase()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border/50 shrink-0">
                        {customer.picture ? (
                          <img src={customer.picture} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">{customer.name.slice(0, 2)}</span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm tracking-tight truncate max-w-[120px] md:max-w-none">{customer.name}</span>
                        <span className="text-[11px] text-muted-foreground font-medium truncate max-w-[120px] md:max-w-none">{customer.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-2 py-0 h-5 border-none rounded-sm font-bold uppercase tracking-tight ${
                           customer.status === "active" 
                            ? "bg-wf-green/10 text-wf-green" 
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {customer.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="secondary" className="text-[8px] h-3.5 px-1 font-bold uppercase tracking-tighter">
                          {customer.gender}
                        </Badge>
                        <span className="text-[10px] font-medium text-muted-foreground">{customer.birthday || "No Birthday"}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {customer.lastLoginAt ? new Date(customer.lastLoginAt).toLocaleDateString() : "Never"}
                  </TableCell>
                  <TableCell className="text-xs font-medium text-muted-foreground tabular-nums">
                    {customer.phoneNumber}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end md:opacity-20 group-hover:opacity-100 transition-opacity">
                      <CustomerActionsDropdown
                        customerId={customer.id}
                        customerName={customer.name}
                        customerEmail={customer.email}
                        customerStatus={customer.status}
                        onSuccess={fetchCustomers}
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
