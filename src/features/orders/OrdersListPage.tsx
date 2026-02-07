import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService, type Order, type OrderStatus, type PaymentStatus } from '../../services/order.service';
import { cn } from '../../lib/utils';
import {
    Plus,
    Search,
    Eye,
    ShoppingBag,
    AlertCircle,
    Loader2,
    Clock,
    CheckCircle2,
    XCircle,
    Ban,
    Filter
} from 'lucide-react';

const formatPrice = (amount: number): string => {
    return new Intl.NumberFormat('fr-MA', {
        style: 'currency',
        currency: 'MAD',
        minimumFractionDigits: 2,
    }).format(amount);
};

export function OrdersListPage() {
    const navigate = useNavigate();

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await orderService.getAll();
            setOrders(data);
        } catch (err) {
            setError('Failed to load orders. Please try again.');
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const filteredOrders = orders.filter(order => {
        const matchesSearch = 
            order.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.id.toString().includes(searchQuery);
        const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const StatusBadge = ({ status }: { status: OrderStatus }) => {
        const styles = {
            PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
            CONFIRMED: 'bg-green-100 text-green-800 border-green-200',
            CANCELED: 'bg-red-100 text-red-800 border-red-200',
            REJECTED: 'bg-gray-100 text-gray-800 border-gray-200',
        };

        const icons = {
            PENDING: Clock,
            CONFIRMED: CheckCircle2,
            CANCELED: XCircle,
            REJECTED: Ban,
        };

        const Icon = icons[status];

        return (
            <span className={`
                inline-flex items-center gap-1.5
                px-2.5 py-1 rounded-full
                text-xs font-medium
                border ${styles[status]}
            `}>
                <Icon className="w-3.5 h-3.5" />
                {status}
            </span>
        );
    };

    const PaymentStatusBadge = ({ status }: { status: PaymentStatus }) => {
        const styles = {
            EN_ATTENTE: 'bg-amber-100 text-amber-800',
            ENCAISSE: 'bg-green-100 text-green-800',
            REJETE: 'bg-red-100 text-red-800',
        };

        return (
            <span className={cn(
                "text-xs font-medium px-2 py-1 rounded-full",
                styles[status]
            )}>
                {status}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Orders</h1>
                        <p className="text-gray-500 mt-1">Manage customer orders</p>
                    </div>
                    <button
                        onClick={() => navigate('/orders/new')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm hover:shadow-md"
                    >
                        <Plus className="w-4 h-4" />
                        Create Order
                    </button>
                </div>

                {/* Filters Bar */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search orders by ID or customer..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'ALL')}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                            >
                                <option value="ALL">All Status</option>
                                <option value="PENDING">Pending</option>
                                <option value="CONFIRMED">Confirmed</option>
                                <option value="CANCELED">Canceled</option>
                                <option value="REJECTED">Rejected</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <p className="text-red-700">{error}</p>
                        <button
                            onClick={fetchOrders}
                            className="ml-auto text-sm text-red-600 hover:text-red-800 font-medium"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                    </div>
                ) : filteredOrders.length === 0 ? (
                    /* Empty State */
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 py-16 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShoppingBag className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">No orders found</h3>
                        <p className="text-gray-500 mb-6">
                            {searchQuery || statusFilter !== 'ALL' ? 'Try adjusting your filters' : 'Create your first order to get started'}
                        </p>
                        {!searchQuery && statusFilter === 'ALL' && (
                            <button
                                onClick={() => navigate('/orders/new')}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Create Order
                            </button>
                        )}
                    </div>
                ) : (
                    /* Orders Table */
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Order ID
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Customer
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Payment
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Total
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredOrders.map((order) => (
                                    <tr
                                        key={order.id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <span className="font-mono font-medium text-gray-900">
                                                #{order.id}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{order.clientName}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={order.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <PaymentStatusBadge status={order.paymentStatus} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-mono font-semibold text-gray-900">
                                                {formatPrice(order.totalAmount)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => navigate(`/orders/${order.id}`)}
                                                className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Summary */}
                {!loading && filteredOrders.length > 0 && (
                    <div className="mt-6 text-sm text-gray-500 text-center">
                        Showing {filteredOrders.length} of {orders.length} orders
                    </div>
                )}
            </div>
        </div>
    );
}
