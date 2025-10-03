"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Users, Tag, FileClock, DollarSign, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <div
      className={`h-screen bg-secondary border-r border-border transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          {!collapsed ? (
            <Image
              src="/logo.jpg"
              alt="PROXY.LUXE"
              width={140}
              height={40}
              className="font-montserrat"
            />
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              className="text-muted-foreground hover:text-foreground"
            >
              {collapsed ? "→" : "←"}
            </Button>
          )}
        </div>
        {!collapsed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="text-muted-foreground hover:text-foreground"
          >
            {collapsed ? "→" : "←"}
          </Button>
        )}
      </div>

      <nav className="p-2">
        <ul className="space-y-1">
          <TooltipProvider>
            <li>
              {collapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/admin/users"
                      className={`sidebar-link ${
                        isActive("/admin/users") ? "active" : ""
                      }`}
                    >
                      <Users size={20} />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Пользователи</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Link
                  href="/admin/users"
                  className={`sidebar-link ${
                    isActive("/admin/users") ? "active" : ""
                  }`}
                >
                  <Users size={20} />
                  <span>Пользователи</span>
                </Link>
              )}
            </li>
            <li>
              {collapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/admin/promo-codes"
                      className={`sidebar-link ${
                        isActive("/admin/promo-codes") ? "active" : ""
                      }`}
                    >
                      <Tag size={20} />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Промо-коды</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Link
                  href="/admin/promo-codes"
                  className={`sidebar-link ${
                    isActive("/admin/promo-codes") ? "active" : ""
                  }`}
                >
                  <Tag size={20} />
                  <span>Промо-коды</span>
                </Link>
              )}
            </li>

            <li>
              {collapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/admin/logs-general"
                      className={`sidebar-link ${
                        isActive("/admin/logs-general") ? "active" : ""
                      }`}
                    >
                      <FileClock size={20} />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Логи</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Link
                  href="/admin/logs-general"
                  className={`sidebar-link ${
                    isActive("/admin/logs-general") ? "active" : ""
                  }`}
                >
                  <FileClock size={20} />
                  <span>Логи</span>
                </Link>
              )}
            </li>
            <li>
              {collapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/admin/partner-payouts"
                      className={`sidebar-link ${
                        isActive("/admin/partner-payouts") ? "active" : ""
                      }`}
                    >
                      <DollarSign size={20} />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Выплаты партнёрам</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Link
                  href="/admin/partner-payouts"
                  className={`sidebar-link ${
                    isActive("/admin/partner-payouts") ? "active" : ""
                  }`}
                >
                  <DollarSign size={20} />
                  <span>Выплаты партнёрам</span>
                </Link>
              )}
            </li>
            <li>
              {collapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/admin/articles"
                      className={`sidebar-link ${
                        isActive("/admin/articles") ? "active" : ""
                      }`}
                    >
                      <BookOpen size={20} />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Статьи</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Link
                  href="/admin/articles"
                  className={`sidebar-link ${
                    isActive("/admin/articles") ? "active" : ""
                  }`}
                >
                  <BookOpen size={20} />
                  <span>Статьи</span>
                </Link>
              )}
            </li>
            <li>
              {collapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/admin/articles/tags"
                      className={`sidebar-link ${
                        isActive("/admin/articles/tags") ? "active" : ""
                      }`}
                    >
                      <Tag size={20} />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Теги статей</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Link
                  href="/admin/articles/tags"
                  className={`sidebar-link ${
                    isActive("/admin/articles/tags") ? "active" : ""
                  }`}
                >
                  <Tag size={20} />
                  <span>Теги статей</span>
                </Link>
              )}
            </li>
          </TooltipProvider>
        </ul>
      </nav>
    </div>
  );
}
