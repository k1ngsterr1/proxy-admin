"use client"

import { useState } from "react"
import { useUser } from "@/contexts/UserContext"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMutation } from "@tanstack/react-query"
import { userApi } from "@/lib/api/user"
import { useRouter } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"
import { useEffect } from "react"

export default function ProfilePage() {
  const router = useRouter()
  const { user, isLoading, error, refetchUser } = useUser()
  const [name, setName] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login")
    }
    
    if (user?.name) {
      setName(user.name)
    }
  }, [user, router])

  const updateMutation = useMutation({
    mutationFn: userApi.updateProfile,
    onSuccess: () => {
      refetchUser()
      setIsEditing(false)
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate({ name })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-8">Профиль пользователя</h1>
        <div className="flex justify-center py-10">
          <p className="text-lg text-muted-foreground">Загрузка информации...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-8">Профиль пользователя</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          <p>Ошибка при загрузке данных пользователя. Пожалуйста, попробуйте позже.</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-8">Профиль пользователя</h1>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-6 py-4 rounded-lg">
          <p>Пожалуйста, войдите в систему для просмотра профиля.</p>
          <Button 
            className="mt-4" 
            onClick={() => router.push("/login")}
          >
            Войти
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Профиль пользователя</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Информация о пользователе</CardTitle>
            <CardDescription>Основная информация о вашем аккаунте</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Имя</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Введите ваше имя"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsEditing(false)
                      if (user.name) setName(user.name)
                    }}
                  >
                    Отмена
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? "Сохранение..." : "Сохранить"}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Имя</p>
                  <p className="font-medium">{user.name || "Не указано"}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsEditing(true)}
                >
                  Изменить
                </Button>
              </div>
            )}
            
            <div>
              <p className="text-sm text-muted-foreground">Роль</p>
              <p className="font-medium capitalize">{user.role}</p>
            </div>
            
            {user.balance !== undefined && (
              <div>
                <p className="text-sm text-muted-foreground">Баланс</p>
                <p className="font-medium">${user.balance.toFixed(2)}</p>
              </div>
            )}
            
            {user.createdAt && (
              <div>
                <p className="text-sm text-muted-foreground">Дата регистрации</p>
                <p className="font-medium">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Безопасность</CardTitle>
            <CardDescription>Управление безопасностью вашего аккаунта</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Пароль</p>
              <p className="font-medium">••••••••</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Изменить пароль
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
