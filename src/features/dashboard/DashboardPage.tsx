import React from 'react';
import { StatCard } from './components/StatCard';
import { DollarSign, ShoppingBag, Users, AlertTriangle, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { cn } from '../../lib/utils';

export const DashboardPage: React.FC = () => {
    // Mock data - replace with real API calls later
    const stats = [
        {
            title: 'Total Revenue',
            value: '$45,231.89',
            icon: DollarSign,
            trend: { value: 20.1, isPositive: true }
        },
        {
            title: 'Active Orders',
            value: '+573',
            icon: ShoppingBag,
            trend: { value: 12.5, isPositive: true }
        },
        {
            title: 'Total Clients',
            value: '2,345',
            icon: Users,
            trend: { value: 4.3, isPositive: true }
        },
        {
            title: 'Low Stock Items',
            value: '12',
            icon: AlertTriangle,
            trend: { value: 2.5, isPositive: false }
        }
    ];

    const recentOrders = [
        { id: '#ORD-7352', customer: 'Alice Johnson', date: '2024-03-15', amount: '$120.50', status: 'Completed' },
        { id: '#ORD-7353', customer: 'Bob Smith', date: '2024-03-14', amount: '$75.20', status: 'Pending' },
        { id: '#ORD-7354', customer: 'Charlie Brown', date: '2024-03-14', amount: '$340.00', status: 'Processing' },
        { id: '#ORD-7355', customer: 'Diana Prince', date: '2024-03-13', amount: '$54.00', status: 'Completed' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500 mt-1">Overview of your store's performance.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} className="border-l-4 border-l-indigo-500" />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Orders */}
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Recent Orders</CardTitle>
                        <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">View All</button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Order ID</th>
                                        <th className="px-6 py-3 font-medium">Customer</th>
                                        <th className="px-6 py-3 font-medium">Date</th>
                                        <th className="px-6 py-3 font-medium">Amount</th>
                                        <th className="px-6 py-3 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {recentOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">{order.id}</td>
                                            <td className="px-6 py-4">{order.customer}</td>
                                            <td className="px-6 py-4 text-gray-500">{order.date}</td>
                                            <td className="px-6 py-4 font-medium">{order.amount}</td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "px-2.5 py-0.5 rounded-full text-xs font-medium",
                                                    order.status === 'Completed' && "bg-green-100 text-green-800",
                                                    order.status === 'Pending' && "bg-yellow-100 text-yellow-800",
                                                    order.status === 'Processing' && "bg-blue-100 text-blue-800",
                                                )}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Sales Overview (Placeholder for now) */}
                <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-none">
                    <CardHeader className="border-white/10">
                        <CardTitle className="text-white">Sales Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-indigo-100 text-sm">Target</p>
                                <p className="text-2xl font-bold">$50,000</p>
                            </div>
                            <div className="h-12 w-12 bg-white/10 rounded-full flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className="w-full bg-black/20 rounded-full h-2 mb-2">
                            <div className="bg-white h-2 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                        <p className="text-sm text-indigo-100">75% of monthly goal reached</p>

                        <div className="mt-8 pt-6 border-t border-white/10">
                            <p className="text-sm font-medium mb-3">Top Selling Categories</p>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-indigo-100">Electronics</span>
                                    <span className="font-bold">45%</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-indigo-100">Clothing</span>
                                    <span className="font-bold">30%</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-indigo-100">Home & Garden</span>
                                    <span className="font-bold">25%</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
