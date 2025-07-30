"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminLayout from "@/components/layout/AdminLayout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, Copy } from "lucide-react";

import { useOrdersData } from "@/lib/orders";
import { useSearchParams } from "next/navigation";

type ProxyType = "isp" | "ipv6" | "resident";

export default function Orders() {
  const [activeTab, setActiveTab] = useState<ProxyType>("resident");

  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  const { data: orders, isLoading } = useOrdersData(activeTab, userId ?? "");

  console.log(orders);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const exportProxiesToTxt = (
    proxies: any[],
    type: ProxyType,
    protocol: "http" | "socks"
  ) => {
    if (!proxies || proxies.length === 0) return;

    let contentFirstFormat = "";
    let contentSecondFormat = "";

    proxies.forEach((proxy, index) => {
      if (type === "resident" && Array.isArray(proxy.package_list)) {
        if (index > 0) return;
        proxy.package_list.forEach((item: any) => {
          const ip = "185.162.130.86";
          const login = item.login || "user";
          const password = item.password || "pass";
          const ports = item.export?.ports || 0;

          for (let port = 10000; port < 10000 + ports; port++) {
            contentFirstFormat += `${ip}:${port}:${login}:${password}\n`;
            contentSecondFormat += `${protocol}://${login}:${password}@${ip}:${port}\n`;
          }
        });
      } else {
        const login = proxy.login || "user";
        const password = proxy.password || "pass";
        const port = protocol === "socks" ? proxy.port_socks : proxy.port_http;

        contentFirstFormat += `${proxy.ip}:${port}:${login}:${password}\n`;
        contentSecondFormat += `${protocol}://${login}:${password}@${proxy.ip}:${port}\n`;
      }
    });

    const finalContent = `${contentFirstFormat}\n${contentSecondFormat}`;
    const blob = new Blob([finalContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().split("T")[0];

    a.href = url;
    a.download = `proxy-${protocol}-${type}-${date}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const proxies = orders?.data?.items || [];

  return (
    <AdminLayout>
      <div className="flex-1 flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Заказы</h1>
          <p className="text-muted-foreground">Управление прокси</p>
        </div>

        <div className="bg-[#1a1a1a] rounded-md p-6">
          <Tabs
            defaultValue="resident"
            onValueChange={(value) => setActiveTab(value as ProxyType)}
            className="w-full"
          >
            <div className="flex flex-row justify-between w-full">
              <TabsList className="mb-6 bg-[#0f0f0f] p-1 rounded-md">
                <TabsTrigger
                  value="resident"
                  className="rounded-md data-[state=active]:bg-[#333] data-[state=active]:text-white"
                >
                  Resident
                </TabsTrigger>
                <TabsTrigger
                  value="isp"
                  className="rounded-md data-[state=active]:bg-[#333] data-[state=active]:text-white"
                >
                  ISP
                </TabsTrigger>
                <TabsTrigger
                  value="ipv6"
                  className="rounded-md data-[state=active]:bg-[#333] data-[state=active]:text-white"
                >
                  IPv6
                </TabsTrigger>
              </TabsList>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="gap-2 flex flex-row items-center rounded-md bg-[#333] w-32 h-10 justify-center">
                    <Download size={16} /> Экспорт
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 bg-[#0f0f0f] text-white border border-[#333] rounded-md">
                  <DropdownMenuItem
                    onClick={() =>
                      exportProxiesToTxt(proxies, activeTab, "http")
                    }
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Сохранить HTTP(s)
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() =>
                      exportProxiesToTxt(proxies, activeTab, "socks")
                    }
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Сохранить SOCKS
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <TabsContent value="resident">
              <div className="max-w-full overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#333] text-[#b3b3b3] text-sm text-left">
                      <th className="py-3 pr-4 font-normal">Название</th>
                      <th className="py-3 px-4 font-normal">IP-адрес</th>
                      <th className="py-3 px-4 font-normal">Протокол</th>
                      <th className="py-3 px-4 font-normal">Порт HTTP</th>
                      <th className="py-3 px-4 font-normal">Логин</th>
                      <th className="py-3 px-4 font-normal">Пароль</th>
                      <th className="py-3 px-4 font-normal">Страна</th>
                    </tr>
                  </thead>
                  {isLoading && (
                    <tbody>
                      <tr>
                        <td colSpan={9} className="mt-8 text-center">
                          <p className="text-[#b3b3b3] text-lg mt-8 mb-4">
                            Загрузка...
                          </p>
                        </td>
                      </tr>
                    </tbody>
                  )}
                  {orders?.data?.items?.length === 0 ? (
                    <tbody>
                      <tr>
                        <td colSpan={9} className="py-4 px-4 text-center">
                          <p className="text-[#b3b3b3] text-sm">Нет данных</p>
                        </td>
                      </tr>
                    </tbody>
                  ) : (
                    <tbody>
                      {orders?.data?.items?.map((order: any, index: number) =>
                        order.package_list?.map(
                          (pkg: any, subIndex: number) => (
                            <tr
                              key={`${index}-${subIndex}`}
                              className="border-b border-[#333]"
                            >
                              <td className="py-4 pr-4">{pkg.title}</td>
                              <td className="py-4 px-4">185.162.130.86</td>
                              <td className="py-4 px-4">SOCKS5/HTTP</td>
                              <td className="py-4 px-4">
                                {(() => {
                                  const ports = pkg?.export?.ports;
                                  const start = 10000;

                                  if (!ports || ports === 0) return "—";

                                  if (ports >= 3) {
                                    return `${start}, ..., ${
                                      start + ports - 1
                                    }`;
                                  }

                                  return Array.from(
                                    { length: ports },
                                    (_, i) => start + i
                                  ).join(", ");
                                })()}
                              </td>
                              <td className="py-4 px-4">{pkg?.login ?? "—"}</td>
                              <td className="py-4 px-4">
                                {pkg?.password ?? "—"}
                              </td>
                              <td className="py-4 px-4">
                                {pkg.geo?.country ?? "—"}
                              </td>
                            </tr>
                          )
                        )
                      )}
                    </tbody>
                  )}
                </table>
              </div>
            </TabsContent>

            <TabsContent value="isp">
              <div className="w-full overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#333] text-[#b3b3b3] text-sm text-left">
                      <th className="py-3 pr-4 font-normal">№ заказа</th>
                      <th className="py-3 px-4 font-normal">IP</th>
                      <th className="py-3 px-4 font-normal">Протокол</th>
                      <th className="py-3 px-4 font-normal">Порт SOCKS</th>
                      <th className="py-3 px-4 font-normal">Порт HTTP</th>
                      <th className="py-3 px-4 font-normal">Страна</th>
                      <th className="py-3 px-4 font-normal">Логин</th>
                      <th className="py-3 pl-4 font-normal">Пароль</th>
                    </tr>
                  </thead>

                  <tbody>
                    {isLoading && (
                      <tr>
                        <td
                          colSpan={8}
                          className="py-4 text-center text-[#b3b3b3]"
                        >
                          Загрузка...
                        </td>
                      </tr>
                    )}

                    {!isLoading && orders?.data?.items?.length === 0 && (
                      <tr>
                        <td
                          colSpan={8}
                          className="py-4 text-center text-[#b3b3b3]"
                        >
                          Нет данных
                        </td>
                      </tr>
                    )}

                    {!isLoading &&
                      orders?.data?.items?.map((item: any, index: number) => (
                        <tr key={index} className="border-b border-[#333]">
                          <td className="py-4 pr-4">
                            {item?.order_number || "—"}
                          </td>
                          <td className="py-4 px-4">{item?.ip}</td>
                          <td className="py-4 px-4">{item?.protocol}</td>
                          <td className="py-4 px-4">
                            {item?.port_socks || "-"}
                          </td>
                          <td className="py-4 px-4">{item?.port_http}</td>
                          <td className="py-4 px-4">{item?.country}</td>
                          <td className="py-4 px-4">{item?.login}</td>
                          <td className="py-4 pl-4">
                            <div className="flex items-center gap-2">
                              <span>{item?.password}</span>
                              <button
                                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-[#333]"
                                onClick={() => copyToClipboard(item.password)}
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="ipv6">
              <div className="w-full overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#333] text-[#b3b3b3] text-sm text-left">
                      <th className="py-3 pr-4 font-normal">№ заказа</th>
                      <th className="py-3 px-4 font-normal">IP</th>
                      <th className="py-3 px-4 font-normal">Протокол</th>
                      <th className="py-3 px-4 font-normal">Порт SOCKS</th>
                      <th className="py-3 px-4 font-normal">Порт HTTP</th>
                      <th className="py-3 px-4 font-normal">Страна</th>
                      <th className="py-3 px-4 font-normal">Логин</th>
                      <th className="py-3 pl-4 font-normal">Пароль</th>
                    </tr>
                  </thead>

                  {isLoading && (
                    <tbody>
                      <tr>
                        <td colSpan={8} className="mt-8 text-center">
                          <p className="text-[#b3b3b3] text-lg mt-8 mb-4">
                            Загрузка...
                          </p>
                        </td>
                      </tr>
                    </tbody>
                  )}
                  <tbody>
                    {orders?.data?.items?.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-4 px-4 text-center">
                          <p className="text-[#b3b3b3] text-sm">Нет данных</p>
                        </td>
                      </tr>
                    ) : (
                      <>
                        {orders?.data?.items?.map(
                          (item: any, index: number) => (
                            <tr key={index} className="border-b border-[#333]">
                              <td className="py-4 pr-4">
                                {item?.order_number || "—"}
                              </td>
                              <td className="py-4 px-4">{item?.ip}</td>
                              <td className="py-4 px-4">{item?.protocol}</td>
                              <td className="py-4 px-4">
                                {item?.port_socks || "-"}
                              </td>
                              <td className="py-4 px-4">{item?.port_http}</td>
                              <td className="py-4 px-4">{item?.country}</td>
                              <td className="py-4 px-4">{item?.login}</td>
                              <td className="py-4 pl-4">
                                <div className="flex items-center gap-2">
                                  <span>{item.password}</span>
                                  <button
                                    className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-[#333]"
                                    onClick={() =>
                                      copyToClipboard(item?.password)
                                    }
                                  >
                                    <Copy className="h-3 w-3" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        )}
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminLayout>
  );
}
