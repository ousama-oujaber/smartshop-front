import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { orderService, type Order, type OrderStatus } from '../../services/order.service';
import { useAuth } from '../auth/AuthContext';
import { cn } from '../../lib/utils';
import {
    ArrowLeft,
    AlertCircle,
    Loader2,
    Clock,
    CheckCircle2,
    XCircle,
    Ban,
    Package,
    User,
    CreditCard,
    Tag,
    Check,
    X,
    Trash2
} from 'lucide-react';

const formatPrice = (amount: number): string => {
    return new Intl.NumberFormat('fr-MA', {
        style: 'currency',
        currency: 'MAD',
        minimumFractionDigits: 2,
    }).format(amount);
};

export function OrderDetailPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN';

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        loadOrder();
    }, [id]);

    const loadOrder = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await orderService.getById(Number(id));
            setOrder(data);
        } catch (err) {
            setError('Failed to load order details');
            console.error('Error loading order:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        if (!confirm('Are you sure you want to confirm this order?')) return;
        setActionLoading(true);
        try {
            const updated = await orderService.confirm(Number(id));
            setOrder(updated);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to confirm order');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!confirm('Are you sure you want to cancel this order?')) return;
        setActionLoading(true);
        try {
            const updated = await orderService.cancel(Number(id));
            setOrder(updated);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to cancel order');
        } finally {
            setActionLoading(false);
        }
    };

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
                px-3 py-1.5 rounded-full
                text-sm font-medium
                border ${styles[status]}
            `}>
                <Icon className="w-4 h-4" />
                {status}
            </span>
        );
    };

    const PaymentStatusBadge = ({ status }: { status: Order['paymentStatus'] }) => {
        const styles = {
            EN_ATTENTE: 'bg-amber-100 text-amber-800',
            ENCAISSE: 'bg-green-100 text-green-800',
            REJETE: 'bg-red-100 text-red-800',
        };

        return (
            <span className={cn(
                "text-sm font-medium px-3 py-1.5 rounded-full",
                styles[status]
            )}>
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

    if (error || !order) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={() => navigate('/orders')}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Orders
                    </button>
                    <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-red-900 mb-2">Error Loading Order</h2>
                        <p className="text-red-700 mb-4">{error || 'Order not found'}</p>
                        <button
                            onClick={loadOrder}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const canConfirm = order.status === 'PENDING' && isAdmin;
    const canCancel = order.status === 'PENDING' && isAdmin;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/orders')}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Orders
                </button>

                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                                Order #{order.id}
                            </h1>
                            <StatusBadge status={order.status} />
                        </div>
                        <p className="text-gray-500 mt-1 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {order.clientName}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {canConfirm && (
                            <button
                                onClick={handleConfirm}
                                disabled={actionLoading}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                                <Check className="w-4 h-4" />
                                Confirm Order
                            </button>
                        )}
                        {canCancel && (
                            <button
                                onClick={handleCancel}
                                disabled={actionLoading}
                                className="inline-flex items-center gap-2 px-4 py-2 border-2 border-red-600 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                            >
                                <X className="w-4 h-4" />
                                Cancel Order
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Order Items */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Items Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Package className="w-5 h-5 text-gray-400" />
                                    Order Items
                                </h2>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="px-6 py-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                                <Package className="w-6 h-6 text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{item.productName}</p>
                                                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-gray-900 font-mono">
                                                {formatPrice(item.price * item.quantity)}
                                            </p>
                                            <p className="text-sm text-gray-500 font-mono">
                                                {formatPrice(item.price)} each
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Summary */}
                    <div className="space-y-6">
                        {/* Payment Status Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                                <CreditCard className="w-4 h-4" />
                                Payment Status
                            </h3>
                            <PaymentStatusBadge status={order.paymentStatus} />
                        </div>

                        {/* Order Summary Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Tag className="w-5 h-5 text-gray-400" />
                                    Order Summary
                                </h3>
                            </div>
                            <div className="p-6 space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-mono text-gray-900">{formatPrice(order.subTotal)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Discount</span>
                                    <span className="font-mono text-green-600">-{formatPrice(order.totalDiscount)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Tax (TVA 20%)</span>
                                    <span className="font-mono text-gray-900">{formatPrice(order.tax)}</span>
                                </div>
                                <div className="pt-3 border-t border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-gray-900">Total</span>
                                        <span className="text-xl font-bold text-indigo-600 font-mono">
                                            {formatPrice(order.totalAmount)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions for Admin */}
                        {isAdmin && order.status === 'PENDING' && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-3">
                                <h3 className="font-medium text-gray-900 mb-2">Actions</h3>
                                <button
                                    onClick={handleConfirm}
                                    disabled={actionLoading}
                                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                >
                                    <Check className="w-4 h-4" />
                                    Confirm Order
                                </button>
                                <button
                                    onClick={handleCancel}
                                    disabled={actionLoading}
                                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border-2 border-red-600 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Cancel Order
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
