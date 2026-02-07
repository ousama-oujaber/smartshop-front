import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { clientService, type Client, type Order } from '../../services/client.service';
import { useAuth } from '../auth/AuthContext';
import { cn } from '../../lib/utils';
import {
    ArrowLeft,
    AlertCircle,
    Loader2,
    Mail,
    ShoppingBag,
    CreditCard,
    Calendar,
    Edit,
    Package,
    Clock,
    CheckCircle2,
    XCircle,
    Ban
} from 'lucide-react';

const formatPrice = (amount: number): string => {
    return new Intl.NumberFormat('fr-MA', {
        style: 'currency',
        currency: 'MAD',
        minimumFractionDigits: 2,
    }).format(amount);
};

const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('fr-MA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};



export function ClientDetailPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN';

    const [client, setClient] = useState<Client | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadClientData();
    }, [id]);

    const loadClientData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [clientData, orderHistory] = await Promise.all([
                clientService.getById(Number(id)),
                clientService.getOrderHistory(Number(id))
            ]);
            setClient(clientData);
            setOrders(orderHistory);
        } catch (err) {
            setError('Failed to load client details');
            console.error('Error loading client data:', err);
        } finally {
            setLoading(false);
        }
    };

    const TierBadge = ({ tier }: { tier: Client['tier'] }) => {
        const styles = {
            BASIC: 'from-gray-100 to-gray-200 text-gray-700',
            SILVER: 'from-gray-200 to-gray-300 text-gray-800',
            GOLD: 'from-amber-200 to-yellow-400 text-yellow-900',
            PLATINUM: 'from-indigo-200 to-purple-400 text-indigo-900',
        };

        return (
            <span className={`
                inline-flex items-center px-3 py-1 rounded-full
                text-xs font-bold uppercase tracking-wide
                bg-gradient-to-r ${styles[tier]}
                shadow-sm
            `}>
                {tier}
            </span>
        );
    };

    const StatusBadge = ({ status }: { status: Order['status'] }) => {
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (error || !client) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={() => navigate('/clients')}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Clients
                    </button>
                    <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-red-900 mb-2">Error Loading Client</h2>
                        <p className="text-red-700 mb-4">{error || 'Client not found'}</p>
                        <button
                            onClick={loadClientData}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/clients')}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Clients
                </button>

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-2xl font-semibold text-indigo-600">
                                {client.fullName.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{client.fullName}</h1>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-gray-500 flex items-center gap-1">
                                    <Mail className="w-4 h-4" />
                                    {client.email}
                                </span>
                                <TierBadge tier={client.tier} />
                            </div>
                        </div>
                    </div>
                    {isAdmin && (
                        <button
                            onClick={() => navigate(`/clients/${client.id}/edit`)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            <Edit className="w-4 h-4" />
                            Edit Client
                        </button>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-3 text-gray-500 mb-2">
                            <CreditCard className="w-5 h-5" />
                            <span className="text-sm font-medium">Total Spent</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 font-mono">
                            {formatPrice(client.totalSpent)}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-3 text-gray-500 mb-2">
                            <ShoppingBag className="w-5 h-5" />
                            <span className="text-sm font-medium">Total Orders</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{client.totalOrders}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-3 text-gray-500 mb-2">
                            <Calendar className="w-5 h-5" />
                            <span className="text-sm font-medium">First Order</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900">{formatDate(client.firstOrderDate)}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-3 text-gray-500 mb-2">
                            <Calendar className="w-5 h-5" />
                            <span className="text-sm font-medium">Last Order</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900">{formatDate(client.lastOrderDate)}</p>
                    </div>
                </div>

                {/* Order History */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">Order History</h2>
                    </div>

                    {orders.length === 0 ? (
                        <div className="py-12 text-center">
                            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No orders yet</h3>
                            <p className="text-gray-500">This client hasn't placed any orders</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {orders.map((order) => (
                                <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                                        <div className="flex items-center gap-4">
                                            <span className="font-mono font-semibold text-gray-900">
                                                #{order.id}
                                            </span>
                                            <StatusBadge status={order.status} />
                                            <span className={cn(
                                                "text-xs font-medium px-2 py-1 rounded-full",
                                                order.paymentStatus === 'ENCAISSE' && "bg-green-100 text-green-800",
                                                order.paymentStatus === 'EN_ATTENTE' && "bg-amber-100 text-amber-800",
                                                order.paymentStatus === 'REJETE' && "bg-red-100 text-red-800"
                                            )}>
                                                {order.paymentStatus}
                                            </span>
                                        </div>
                                        <p className="text-2xl font-bold text-indigo-600 font-mono">
                                            {formatPrice(order.totalAmount)}
                                        </p>
                                    </div>

                                    {/* Order Items */}
                                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                        <div className="space-y-2">
                                            {order.items?.map((item, idx) => (
                                                <div key={idx} className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Package className="w-4 h-4 text-gray-400" />
                                                        <span className="text-gray-700">{item.productName}</span>
                                                        <span className="text-gray-400">× {item.quantity}</span>
                                                    </div>
                                                    <span className="font-mono text-gray-900">
                                                        {formatPrice(item.price * item.quantity)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Order Summary */}
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                        <span>Subtotal: <strong className="text-gray-900 font-mono">{formatPrice(order.subTotal)}</strong></span>
                                        <span>Discount: <strong className="text-green-600 font-mono">-{formatPrice(order.totalDiscount)}</strong></span>
                                        <span>Tax: <strong className="text-gray-900 font-mono">{formatPrice(order.tax)}</strong></span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
