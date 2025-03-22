import { Activity } from "lucide-react"
import type { LogEvent } from "../../types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface RecentActivityProps {
  logs: LogEvent[]
}

export default function RecentActivity({ logs }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Недавняя активность</CardTitle>
        <Button variant="link" className="text-primary">
          Смотреть все
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 pb-3 border-b border-border">
              <div className="p-2 bg-primary/10 rounded-full">
                <Activity size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{log.eventType}</p>
                <p className="text-xs text-muted-foreground">{log.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(log.timestamp).toLocaleString()} • IP: {log.ipAddress}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

