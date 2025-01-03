interface DashboardHeaderProps {
  heading: string;
  description?: string;
  action?: React.ReactNode;
}

export function DashboardHeader({
  heading,
  description,
  action
}: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="grid gap-1">
        <h1 className="font-heading text-3xl md:text-4xl">{heading}</h1>
        {description && (
          <p className="text-lg text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div className="ml-auto">{action}</div>}
    </div>
  );
} 