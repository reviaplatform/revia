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
import { Magnifer, Filter } from "@solar-icons/react";
import { providerService, ProviderListItem } from "@/services/providerService";
import { SpinnerCustom } from "@/components/ui/spinner-custom";
import { TableRowsSkeleton } from "@/components/table-skeleton";
import { toast } from "sonner";

export function ProviderTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [providersData, setProvidersData] = useState<ProviderListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProviders = async () => {
    setIsLoading(true);
    try {
      const response = await providerService.getProviderList(1, 100);
      let list: ProviderListItem[] = [];
      if (Array.isArray(response)) {
        list = response;
      } else if (response?.data) {
        if (Array.isArray(response.data)) {
          list = response.data;
        } else if (response.data.providers && Array.isArray(response.data.providers)) {
          list = response.data.providers;
        } else if (response.data.items && Array.isArray(response.data.items)) {
          list = response.data.items;
        }
      } else if (response?.providers) {
        list = response.providers;
      } else if (response?.results) {
        list = response.results;
      }
      setProvidersData(list);
    } catch (error: any) {
      toast.error("Failed to load providers", {
        description: error.message || "Could not reach the server.",
      });
      setProvidersData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const filteredProviders = providersData.filter((provider) => {
    const name = provider.name || "";
    const email = provider.email || "";
    const brandEn = provider.brand?.en || "";
    const id = provider.id || provider._id || "";
    const status = "active";

    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brandEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || status.toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const activeCount = providersData.length;

  return (
    <div className="w-full space-y-6">
      {/* Table Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-xl font-semibold tracking-tight text-foreground">
            Provider Management
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            View specialized service providers and monitor platform participation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-px">
            <div className="px-3 py-1.5 bg-wf-green/10 border border-wf-green/20 rounded-md flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-wf-green animate-pulse" />
              <span className="text-xs font-semibold tabular-nums text-wf-green">{activeCount} Active Providers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Unified Action Bar */}
      <div className="grid grid-cols-1 sm:flex items-center gap-3 p-1.5 bg-muted/30 border border-border/50 rounded-lg">
        <div className="relative flex-1 group">
          <Magnifer className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search providers or brands..."
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
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-md border border-border/50 bg-card overflow-x-auto transition-all duration-300">
        <Table className="w-full min-w-[900px]">
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="w-[100px] text-[11px] font-bold uppercase tracking-wider pl-6">ID</TableHead>
                <TableHead className="min-w-[150px] md:min-w-[200px] text-[11px] font-bold uppercase tracking-wider">Brand Owner</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider">Brand Identity</TableHead>
                <TableHead className="w-[110px] text-[11px] font-bold uppercase tracking-wider text-center">Status</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider">Last Activity</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider pr-6">Phone</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRowsSkeleton columnCount={5} />
              ) : filteredProviders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center bg-background/30 italic">
                     <div className="text-sm text-muted-foreground">No providers found matching your filters.</div>
                  </TableCell>
                </TableRow>
              ) : filteredProviders.map((provider, idx) => (
                <TableRow 
                  key={provider.id || idx}
                  className="group relative hover:bg-primary/[0.02] border-border/40 transition-all duration-300 animate-in fade-in slide-in-from-left-2"
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  <TableCell className="relative font-mono text-[10px] text-muted-foreground/70 tracking-tighter pl-6">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-center" />
                    {(provider.id || "").slice(-6).toUpperCase() || "NEW"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm tracking-tight">{provider.name}</span>
                      <span className="text-[11px] text-muted-foreground font-medium truncate max-w-[150px] md:max-w-none">{provider.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-foreground tracking-tight">{provider.brand.en}</span>
                      <span className="text-[10px] font-medium text-muted-foreground">{provider.brand.ar}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <Badge
                        variant="outline"
                        className="text-[10px] px-2 py-0 h-5 border-none rounded-sm font-bold uppercase tracking-tight bg-wf-green/10 text-wf-green"
                      >
                        ACTIVE
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs tabular-nums text-muted-foreground">
                    {provider.lastLoginAt ? new Date(provider.lastLoginAt).toLocaleDateString() : "Never"}
                  </TableCell>
                  <TableCell className="text-xs font-medium text-muted-foreground pr-6">
                    {provider.phoneNumber}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
      </div>
    </div>
  );
}
