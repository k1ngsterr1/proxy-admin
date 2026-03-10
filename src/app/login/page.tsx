"use client";

import type React from "react";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLogin } from "@/lib/auth";

export default function LoginPage() {
  const [words, setWords] = useState<string[]>(Array(12).fill(""));
  const [error, setError] = useState("");
  const router = useRouter();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const loginMutation = useLogin();
  const loading = loginMutation.isPending;

  const setInputRef = useCallback(
    (index: number) => (el: HTMLInputElement | null) => {
      inputRefs.current[index] = el;
    },
    []
  );

  const handleWordChange = (index: number, value: string) => {
    // Handle paste of full seed phrase
    const trimmed = value.trim();
    const pastedWords = trimmed.split(/\s+/);
    if (pastedWords.length >= 12) {
      const newWords = pastedWords.slice(0, 12).map((w) => w.toLowerCase());
      setWords(newWords);
      inputRefs.current[11]?.focus();
      return;
    }

    // Single word input — auto-advance on space
    if (value.endsWith(" ")) {
      const word = value.trim().toLowerCase();
      const newWords = [...words];
      newWords[index] = word;
      setWords(newWords);
      if (index < 11) {
        inputRefs.current[index + 1]?.focus();
      }
      return;
    }

    const newWords = [...words];
    newWords[index] = value.toLowerCase();
    setWords(newWords);
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (index < 11) {
        inputRefs.current[index + 1]?.focus();
      } else {
        handleLogin();
      }
    }
    if (e.key === "Backspace" && words[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");

    const seedPhrase = words.map((w) => w.trim()).join(" ");
    const filledWords = words.filter((w) => w.trim() !== "");

    if (filledWords.length !== 12) {
      setError("Введите все 12 слов сид-фразы.");
      return;
    }

    try {
      await loginMutation.mutateAsync(
        { seedPhrase },
        {
          onSuccess: () => {
            router.push("/admin");
          },
          onError: (error) => {
            setError(error.message || "Неверная сид-фраза");
          },
        }
      );
    } catch (err) {
      setError("Неверная сид-фраза или ошибка сервера");
      console.error("Ошибка аутентификации:", err);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <div className="flex flex-col items-center justify-center w-full">
        <div className="w-full max-w-lg px-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Вход в админ-панель</CardTitle>
              <CardDescription className="text-center">
                Введите 12-словную сид-фразу для доступа
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    {words.map((word, index) => (
                      <div key={index} className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono select-none">
                          {index + 1}.
                        </span>
                        <Input
                          ref={setInputRef(index)}
                          type="text"
                          autoComplete="off"
                          spellCheck={false}
                          placeholder={`Слово ${index + 1}`}
                          value={word}
                          onChange={(e) =>
                            handleWordChange(index, e.target.value)
                          }
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          className="pl-8 font-mono text-sm"
                        />
                      </div>
                    ))}
                  </div>
                  {error && (
                    <div className="text-destructive text-sm font-medium py-1">
                      {error}
                    </div>
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
  );
}
