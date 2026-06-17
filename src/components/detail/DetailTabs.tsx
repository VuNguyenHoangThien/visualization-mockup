import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, BarChart3, Boxes, Wrench, AlertCircle, Package } from "lucide-react";

export interface DetailTabsProps {
  info?: React.ReactNode;
  charts?: React.ReactNode;
  production?: React.ReactNode;
  bom?: React.ReactNode;
  maintenance?: React.ReactNode;
  alerts?: React.ReactNode;
  defaultValue?: string;
}

export function DetailTabs(props: DetailTabsProps) {
  return (
    <Tabs defaultValue={props.defaultValue ?? "info"} className="w-full">
      <TabsList className="bg-secondary/60 h-auto p-1 flex-wrap">
        <TabsTrigger value="info" className="gap-1.5"><Info className="h-3.5 w-3.5" />Info</TabsTrigger>
        <TabsTrigger value="charts" className="gap-1.5"><BarChart3 className="h-3.5 w-3.5" />Charts</TabsTrigger>
        <TabsTrigger value="production" className="gap-1.5"><Boxes className="h-3.5 w-3.5" />Production</TabsTrigger>
        <TabsTrigger value="bom" className="gap-1.5"><Package className="h-3.5 w-3.5" />BOM / Inventory</TabsTrigger>
        <TabsTrigger value="maintenance" className="gap-1.5"><Wrench className="h-3.5 w-3.5" />Maintenance</TabsTrigger>
        <TabsTrigger value="alerts" className="gap-1.5"><AlertCircle className="h-3.5 w-3.5" />Alerts</TabsTrigger>
      </TabsList>
      <TabsContent value="info" className="mt-4">{props.info ?? <EmptyTab label="Info" />}</TabsContent>
      <TabsContent value="charts" className="mt-4">{props.charts ?? <EmptyTab label="Charts" />}</TabsContent>
      <TabsContent value="production" className="mt-4">{props.production ?? <EmptyTab label="Production" />}</TabsContent>
      <TabsContent value="bom" className="mt-4">{props.bom ?? <EmptyTab label="BOM / Inventory" />}</TabsContent>
      <TabsContent value="maintenance" className="mt-4">{props.maintenance ?? <EmptyTab label="Maintenance" />}</TabsContent>
      <TabsContent value="alerts" className="mt-4">{props.alerts ?? <EmptyTab label="Alerts" />}</TabsContent>
    </Tabs>
  );
}

function EmptyTab({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
      <div className="font-medium text-foreground mb-1">{label}</div>
      Detailed {label.toLowerCase()} data will be available once connected to the live MES feed.
    </div>
  );
}

export function InfoGrid({ items }: { items: Array<{ label: string; value: React.ReactNode }> }) {
  return (
    <dl className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-3 rounded-xl border border-border bg-card p-4">
      {items.map((it, i) => (
        <div key={i}>
          <dt className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">{it.label}</dt>
          <dd className="mt-0.5 text-sm font-medium">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}
