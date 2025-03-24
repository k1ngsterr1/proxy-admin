"use client"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useCurrentUser } from "@/lib/user"
import { Skeleton } from "../ui/skeleton"

export default function Header() {
  // Используем хук для получения данных пользователя
  const { data: user, isLoading, isError } = useCurrentUser();

  // Получаем первую букву имени для аватара
  const getInitial = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'A';
  };

  return (
    <header className="bg-secondary border-b border-border h-16 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold">Админ-панель</h1>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Avatar className="w-8 h-8 ">
            <AvatarFallback className="text-primary-foreground">{getInitial()}</AvatarFallback>
          </Avatar>
          <div className="text-left hidden md:block">
            {isLoading ? (
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            ) : isError ? (
              <p className="text-sm text-muted-foreground">Ошибка загрузки</p>
            ) : (
              <>
                <p className="text-sm font-medium">{user?.name || 'Администратор'}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

