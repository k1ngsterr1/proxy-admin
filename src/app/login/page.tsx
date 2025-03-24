"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useLogin } from "@/lib/auth"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const loginMutation = useLogin()
  const loading = loginMutation.isPending

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      // Вызываем мутацию для входа
      await loginMutation.mutateAsync({ email, password }, {
        onSuccess: () => {
          // При успешной аутентификации перенаправляем на админ-панель
          router.push('/admin')
        },
        onError: (error) => {
          // При ошибке показываем сообщение
          setError(error.message || 'Неверный email или пароль')
        }
      })
    } catch (err) {
      // Этот блок выполнится только если произойдет ошибка вне мутации
      setError("Произошла ошибка при входе")
      console.error('Ошибка аутентификации:', err)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <div className="flex flex-col items-center justify-center w-full">
        <div className="w-full max-w-md px-4">
          <div className="flex justify-center mb-8">
            <Image
              src="/logo.jpg"
              alt="PROXY.LUXE"
              width={200}
              height={60}
              className="font-montserrat"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">Вход в админ-панель</CardTitle>
              <CardDescription className="text-center">
                Введите ваши данные для входа в систему
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@proxy.luxe"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Пароль</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  {error && (
                    <div className="text-destructive text-sm font-medium py-1">{error}</div>
                  )}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Вход..." : "Войти"}
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-muted-foreground">
                PROXY.LUXE © {new Date().getFullYear()}
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
