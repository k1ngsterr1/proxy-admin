"use client"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function Header() {
  return (
    <header className="bg-secondary border-b border-border h-16 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold">Админ-панель</h1>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Avatar className="w-8 h-8 ">
            <AvatarFallback className="text-primary-foreground">A</AvatarFallback>
          </Avatar>
          <div className="text-left hidden md:block">
            <p className="text-sm font-medium">Администратор</p>
            <p className="text-xs text-muted-foreground">admin@proxy.luxe</p>
          </div>
        </div>
      </div>
    </header>
  )
}

