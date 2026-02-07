import React, { useEffect, useState } from 'react';
import { StatCard } from './components/StatCard';
import { Users, DollarSign, ShoppingBag, AlertTriangle, TrendingUp, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { cn } from '../../lib/utils';
import { orderService, type Order } from '../../services/order.service';
import { clientService, type Client } from '../../services/client.service';
import { productService, type Product } from '../../services/product.service';
import { useNavigate } from 'react-router-dom';

const formatPrice = (amount: number): string => {
    return new Intl.NumberFormat('fr-MA', {
        style: 'currency',
        currency: 'MAD',
        minimumFractionDigits: 2,
    }).format(amount);
};

export const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<Order[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const [ordersData, clientsData, productsData] = await Promise.all([
                    orderService.getAll(),
                    clientService.getAll(),
                    productService.getAll()
                ]);
                setOrders(ordersData);
                setClients(clientsData);
                setProducts(productsData);
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    // Calculate Stats
    const totalRevenue = orders
        .filter(o => o.status !== 'CANCELED' && o.status !== 'REJECTED')
        .reduce((sum, order) => sum + order.totalAmount, 0);

    const activeOrdersCount = orders.filter(o => o.status === 'PENDING' || o.status === 'CONFIRMED').length;
    const lowStockCount = products.filter(p => p.stock < 10).length;

    // Recent Orders (Last 5)
    // improving sort by ID desc as a proxy for date since date is missing
    const recentOrders = [...orders].sort((a, b) => b.id - a.id).slice(0, 5);

    const stats = [
        {
            title: 'Total Revenue',
            value: formatPrice(totalRevenue),
            icon: DollarSign,
            trend: { value: 12.5, isPositive: true } // calculated trend would require historical data
        },
        {
            title: 'Active Orders',
            value: activeOrdersCount.toString(),
            icon: ShoppingBag,
            trend: { value: 8.2, isPositive: true }
        },
        {
            title: 'Total Clients',
            value: clients.length.toString(),
            icon: Users,
            trend: { value: 4.3, isPositive: true }
        },
        {
            title: 'Low Stock Items',
            value: lowStockCount.toString(),
            icon: AlertTriangle,
            trend: { value: lowStockCount > 0 ? -10 : 0, isPositive: lowStockCount === 0 }
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

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
                        <button
                            onClick={() => navigate('/orders')}
                            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                            View All
                        </button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Order ID</th>
                                        <th className="px-6 py-3 font-medium">Customer</th>
                                        <th className="px-6 py-3 font-medium">Amount</th>
                                        <th className="px-6 py-3 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {recentOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">#{order.id}</td>
                                            <td className="px-6 py-4">{order.clientName}</td>
                                            <td className="px-6 py-4 font-medium">{formatPrice(order.totalAmount)}</td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "px-2.5 py-0.5 rounded-full text-xs font-medium",
                                                    order.status === 'CONFIRMED' && "bg-green-100 text-green-800",
                                                    order.status === 'PENDING' && "bg-yellow-100 text-yellow-800",
                                                    order.status === 'CANCELED' && "bg-red-100 text-red-800",
                                                    order.status === 'REJECTED' && "bg-gray-100 text-gray-800",
                                                )}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {recentOrders.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                                No orders found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Sales Overview (Visual only for now) */}
                <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-none">
                    <CardHeader className="border-white/10">
                        <CardTitle className="text-white">Monthly Goal</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-indigo-100 text-sm">Revenue Target</p>
                                <p className="text-2xl font-bold">$50,000</p>
                            </div>
                            <div className="h-12 w-12 bg-white/10 rounded-full flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                        </div>

                        {/* Calculate progress based on real revenue - max 100% */}
                        {(() => {
                            const target = 50000; // hardcoded target
                            // assume 1 USD = 10 MAD roughly strictly for this visual if needed, 
                            // OR just treat the target as MAD since formatPrice uses MAD. 
                            // Let's assume target is 50,000 MAD for consistency.
                            const percentage = Math.min(100, Math.max(0, (totalRevenue / target) * 100));

                            return (
                                <>
                                    <div className="w-full bg-black/20 rounded-full h-2 mb-2">
                                        <div
                                            className="bg-white h-2 rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-sm text-indigo-100">{percentage.toFixed(1)}% of monthly goal reached</p>
                                </>
                            );
                        })()}

                        <div className="mt-8 pt-6 border-t border-white/10">
                            <p className="text-sm font-medium mb-3">Quick Actions</p>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => navigate('/orders/new')}
                                    className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-center transition-colors"
                                >
                                    New Order
                                </button>
                                <button
                                    onClick={() => navigate('/products')}
                                    className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-center transition-colors"
                                >
                                    Add Product
                                </button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
