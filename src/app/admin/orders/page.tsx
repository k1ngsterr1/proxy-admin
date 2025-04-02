"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy } from "lucide-react"
import AdminLayout from "@/components/layout/AdminLayout"
import { Badge } from "@/components/ui/badge"

import { useOrdersData } from "@/lib/orders"
import { useSearchParams } from "next/navigation"
import { proxySellerId } from "@/lib/orders"

type ProxyType = "isp" | "ipv6" | "resident"

export default function Orders() {
    const [activeTab, setActiveTab] = useState<ProxyType>("resident")
    const [expandedPorts, setExpandedPorts] = useState<number | null>(null)

    const searchParams = useSearchParams();
    const userId = searchParams.get("userId");


    const { data: orders, isLoading, } = useOrdersData(activeTab, userId ?? "")
    const { data: proxySeller } = proxySellerId(userId ?? "")

    console.log("proxySeller", proxySeller)

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
    }

    const formatBytes = (bytes: string) => {
        const b = Number.parseInt(bytes)
        const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
        if (b === 0) return "0 Byte"
        const i = Math.floor(Math.log(b) / Math.log(1024))
        return Math.round(b / Math.pow(1024, i)) + " " + sizes[i]
    }

    return (
        <AdminLayout>
            <div className="flex-1 flex flex-col">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Заказы</h1>
                    <p className="text-muted-foreground">Управление прокси</p>
                </div>

                <div className="bg-[#1a1a1a] rounded-md p-6">
                    <Tabs defaultValue="resident" onValueChange={(value) => setActiveTab(value as ProxyType)} className="w-full">
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
                            <div className="flex flex-row gap-x-2">
                                <span className="text-white text-md">Proxy seller id:</span>
                                <span className="text-white text-md">
                                    {proxySeller?.map((item: any) => item?.proxySellerId).join(", ")}
                                </span>
                            </div>
                        </div>
                        <TabsContent value="resident">
                            <div className="max-w-full overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-[#333] text-[#b3b3b3] text-sm text-left">
                                            <th className="py-3 pr-4 font-normal">Логин</th>
                                            <th className="py-3 px-4 font-normal">Пароль</th>
                                            <th className="py-3 px-4 font-normal">Порты</th>
                                            <th className="py-3 px-4 font-normal">Лимит трафика</th>
                                            <th className="py-3 px-4 font-normal">Срок истечения</th>
                                            <th className="py-3 px-4 font-normal">Статус</th>
                                            <th className="py-3 px-4 font-normal">Номер заказа</th>
                                            <th className="py-3 px-4 font-normal">Остаток трафика</th>
                                            <th className="py-3 pl-4 font-normal">Использование трафика</th>
                                        </tr>
                                    </thead>
                                    {isLoading &&
                                        <tbody>
                                            <tr>
                                                <td colSpan={9} className="mt-8 text-center">
                                                    <p className="text-[#b3b3b3] text-lg mt-8 mb-4">Загрузка...</p>
                                                </td>
                                            </tr>
                                        </tbody>
                                    }
                                    {orders?.data?.items?.length === 0 ?
                                        (
                                            <tbody>
                                                <tr>
                                                    <td colSpan={9} className="py-4 px-4 text-center">
                                                        <p className="text-[#b3b3b3] text-sm">Нет данных</p>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        ) : (
                                            <tbody>
                                                {orders?.data?.items?.map((item: any, index: number) => (
                                                    <tr key={index} className="border-b border-[#333]">
                                                        <td className="py-4 pr-4">{item.login}</td>
                                                        <td className="py-4 px-4">{item.password}</td>
                                                        <td className="py-4 px-4">
                                                            <div className="flex flex-wrap gap-1">
                                                                {expandedPorts === index ? (
                                                                    <>
                                                                        {item?.ports.map((port: any, i: number) => (
                                                                            <span key={i} className="px-2 py-0.5 bg-[#333] rounded-md text-xs">
                                                                                {port}
                                                                            </span>
                                                                        ))}
                                                                        <span
                                                                            className="px-2 py-0.5 bg-[#333] rounded-md text-xs cursor-pointer"
                                                                            onClick={() => setExpandedPorts(null)}
                                                                        >
                                                                            Свернуть
                                                                        </span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        {item?.ports?.slice(0, 3).map((port: number, i: number) => (
                                                                            <span key={i} className="px-2 py-0.5 bg-[#333] rounded-md text-xs">
                                                                                {port}
                                                                            </span>
                                                                        ))}
                                                                        {item.ports && item.ports.length > 3 && (
                                                                            <span
                                                                                className="px-2 py-0.5 bg-[#333] rounded-md text-xs cursor-pointer"
                                                                                onClick={() => setExpandedPorts(index)}
                                                                            >
                                                                                +{item?.ports?.length - 3}
                                                                            </span>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-4">{formatBytes(item?.package_info?.traffic_limit)}</td>
                                                        <td className="py-4 px-4">
                                                            {formatBytes(item.package_info?.traffic_limit || "0")}
                                                        </td>
                                                        <td className="py-4 px-4">
                                                            {item.package_info?.is_active ? <Badge variant="success" className="bg-green-500/20 text-green-500 hover:bg-green-500/30">
                                                                Активен</Badge> : <Badge variant="destructive">Неактивен</Badge>}
                                                        </td>
                                                        <td className="py-4 px-4">ORD-{Math.floor(Math.random() * 10000)}</td>
                                                        <td className="py-4 px-4">{formatBytes(item?.package_info?.traffic_left)}</td>
                                                        <td className="py-4 pl-4">{formatBytes(item?.package_info?.traffic_usage)}</td>
                                                    </tr>
                                                ))}
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
                                            <th className="py-3 pr-4 font-normal">IP</th>
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
                                                <td colSpan={7} className="py-4 text-center text-[#b3b3b3]">
                                                    Загрузка...
                                                </td>
                                            </tr>
                                        )}

                                        {!isLoading && orders?.data?.items?.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="py-4 text-center text-[#b3b3b3]">
                                                    Нет данных
                                                </td>
                                            </tr>
                                        )}

                                        {!isLoading && orders?.data?.items?.map((item: any, index: number) => (
                                            <tr key={index} className="border-b border-[#333]">
                                                <td className="py-4 pr-4">{item?.ip}</td>
                                                <td className="py-4 px-4">{item?.protocol}</td>
                                                <td className="py-4 px-4">{item?.port_socks || "-"}</td>
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
                                            <th className="py-3 pr-4 font-normal">IP</th>
                                            <th className="py-3 px-4 font-normal">Протокол</th>
                                            <th className="py-3 px-4 font-normal">Порт SOCKS</th>
                                            <th className="py-3 px-4 font-normal">Порт HTTP</th>
                                            <th className="py-3 px-4 font-normal">Страна</th>
                                            <th className="py-3 px-4 font-normal">Логин</th>
                                            <th className="py-3 pl-4 font-normal">Пароль</th>
                                        </tr>
                                    </thead>
                                    {isLoading &&
                                        <tbody>
                                            <tr>
                                                <td colSpan={9} className="mt-8 text-center">
                                                    <p className="text-[#b3b3b3] text-lg mt-8 mb-4">Загрузка...</p>
                                                </td>
                                            </tr>
                                        </tbody>
                                    }
                                    <tbody>
                                        {orders?.data?.items?.length === 0 ?
                                            (
                                                <tbody>
                                                    <tr>
                                                        <td colSpan={9} className="py-4 px-4 text-center">
                                                            <p className="text-[#b3b3b3] text-sm">Нет данных</p>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            ) : (
                                                <>
                                                    {orders?.data?.items?.map((item: any, index: number) => (
                                                        <tr key={index} className="border-b border-[#333]">
                                                            <td className="py-4 pr-4">{item?.ip}</td>
                                                            <td className="py-4 px-4">{item.protocol}</td>
                                                            <td className="py-4 px-4">{item.port_socks || "-"}</td>
                                                            <td className="py-4 px-4">{item.port_http}</td>
                                                            <td className="py-4 px-4">{item.country}</td>
                                                            <td className="py-4 px-4">{item.login}</td>
                                                            <td className="py-4 pl-4">
                                                                <div className="flex items-center gap-2">
                                                                    <span>{item.password}</span>
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
                                                </>)}
                                    </tbody>
                                </table>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </AdminLayout>
    )
}

