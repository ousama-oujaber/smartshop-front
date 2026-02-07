import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { paymentService, type PaymentMethod, type CreatePaymentRequest } from '../../services/payment.service';
import { orderService, type Order } from '../../services/order.service';
import { cn } from '../../lib/utils';
import {
    ArrowLeft,
    Save,
    Loader2,
    AlertCircle,
    CheckCircle2,
    CreditCard,
    Banknote,
    Landmark,
    Receipt,
    Building2,
    Calendar,
    DollarSign
} from 'lucide-react';

const formatPrice = (amount: number): string => {
    return new Intl.NumberFormat('fr-MA', {
        style: 'currency',
        currency: 'MAD',
        minimumFractionDigits: 2,
    }).format(amount);
};

export function AddPaymentPage() {
    const navigate = useNavigate();
    const { orderId: paramOrderId } = useParams<{ orderId: string }>();
    const [searchParams] = useSearchParams();
    const queryOrderId = searchParams.get('orderId');
    const orderId = paramOrderId || queryOrderId;

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState<CreatePaymentRequest>({
        orderId: Number(orderId),
        amount: 0,
        paymentMethod: 'ESPECES',
        reference: '',
        bank: '',
        chequeNumber: '',
        dueDate: '',
    });

    const [errors, setErrors] = useState<Partial<Record<keyof CreatePaymentRequest, string>>>({});

    useEffect(() => {
        if (orderId) {
            loadOrder();
        } else {
            setError('Order ID is required');
            setLoading(false);
        }
    }, [orderId]);

    const loadOrder = async () => {
        setLoading(true);
        try {
            const data = await orderService.getById(Number(orderId));
            setOrder(data);
        } catch (err) {
            setError('Failed to load order details');
            console.error('Error loading order:', err);
        } finally {
            setLoading(false);
        }
    };

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof CreatePaymentRequest, string>> = {};

        if (!formData.amount || formData.amount <= 0) {
            newErrors.amount = 'Amount must be greater than 0';
        } else if (order && formData.amount > order.totalAmount) {
            newErrors.amount = 'Amount cannot exceed order total';
        }

        if (!formData.reference.trim()) {
            newErrors.reference = 'Reference is required';
        }

        if (formData.paymentMethod === 'CHEQUE') {
            if (!formData.bank?.trim()) {
                newErrors.bank = 'Bank is required for cheque payments';
            }
            if (!formData.chequeNumber?.trim()) {
                newErrors.chequeNumber = 'Cheque number is required';
            }
            if (!formData.dueDate) {
                newErrors.dueDate = 'Due date is required for cheque payments';
            }
        }

        if (formData.paymentMethod === 'VIREMENT') {
            if (!formData.bank?.trim()) {
                newErrors.bank = 'Bank is required for bank transfers';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setSubmitting(true);
        setError(null);
        setSuccess(false);

        try {
            const paymentData: CreatePaymentRequest = {
                orderId: Number(orderId),
                amount: formData.amount,
                paymentMethod: formData.paymentMethod,
                reference: formData.reference.trim(),
                ...(formData.bank && { bank: formData.bank.trim() }),
                ...(formData.chequeNumber && { chequeNumber: formData.chequeNumber.trim() }),
                ...(formData.dueDate && { dueDate: formData.dueDate }),
            };

            await paymentService.create(paymentData);
            setSuccess(true);
            setTimeout(() => {
                navigate(`/orders/${orderId}`);
            }, 1500);
        } catch (err: any) {
            const message = err.response?.data?.message || err.response?.data?.error || 'Failed to add payment';
            setError(message);
            console.error('Error creating payment:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleChange = (field: keyof CreatePaymentRequest, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const paymentMethods: { value: PaymentMethod; label: string; icon: React.ReactNode }[] = [
        { value: 'ESPECES', label: 'Cash (Espèces)', icon: <Banknote className="w-5 h-5" /> },
        { value: 'CHEQUE', label: 'Check (Chèque)', icon: <Receipt className="w-5 h-5" /> },
        { value: 'VIREMENT', label: 'Bank Transfer (Virement)', icon: <Landmark className="w-5 h-5" /> },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (error && !order) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-2xl mx-auto">
                    <button
                        onClick={() => navigate('/orders')}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Orders
                    </button>
                    <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-red-900 mb-2">Error</h2>
                        <p className="text-red-700">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-2xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate(orderId ? `/orders/${orderId}` : '/orders')}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {order ? `Back to Order #${order.id}` : 'Back to Orders'}
                </button>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Add Payment</h1>
                    <p className="text-gray-500 mt-1">
                        {order ? (
                            <>Add a payment for order <strong>#{order.id}</strong> - {order.clientName}</>
                        ) : (
                            'Add a new payment'
                        )}
                    </p>
                    {order && (
                        <div className="mt-4 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-indigo-700 font-medium">Order Total:</span>
                                <span className="text-xl font-bold text-indigo-900 font-mono">
                                    {formatPrice(order.totalAmount)}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Success Message */}
                {success && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <p className="text-green-700 font-medium">
                            Payment added successfully! Redirecting...
                        </p>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 space-y-6">
                        {/* Payment Method */}
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">
                                Payment Method <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {paymentMethods.map((method) => (
                                    <button
                                        key={method.value}
                                        type="button"
                                        onClick={() => handleChange('paymentMethod', method.value)}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 border rounded-lg transition-all",
                                            formData.paymentMethod === method.value
                                                ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                                                : "border-gray-300 hover:border-gray-400 text-gray-700"
                                        )}
                                    >
                                        {method.icon}
                                        <span className="font-medium text-sm">{method.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Amount */}
                        <div className="space-y-2">
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                                Amount <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="number"
                                    id="amount"
                                    step="0.01"
                                    min="0.01"
                                    value={formData.amount || ''}
                                    onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
                                    placeholder="0.00"
                                    className={cn(
                                        "w-full pl-10 pr-4 py-2.5 border rounded-lg transition-all",
                                        "focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500",
                                        errors.amount
                                            ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                                            : "border-gray-300 hover:border-gray-400"
                                    )}
                                />
                            </div>
                            {errors.amount && (
                                <p className="text-sm text-red-600">{errors.amount}</p>
                            )}
                        </div>

                        {/* Reference */}
                        <div className="space-y-2">
                            <label htmlFor="reference" className="block text-sm font-medium text-gray-700">
                                Reference <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    id="reference"
                                    value={formData.reference}
                                    onChange={(e) => handleChange('reference', e.target.value)}
                                    placeholder="e.g., REF-001"
                                    className={cn(
                                        "w-full pl-10 pr-4 py-2.5 border rounded-lg transition-all",
                                        "focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500",
                                        errors.reference
                                            ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                                            : "border-gray-300 hover:border-gray-400"
                                    )}
                                />
                            </div>
                            {errors.reference && (
                                <p className="text-sm text-red-600">{errors.reference}</p>
                            )}
                        </div>

                        {/* Bank - Required for CHEQUE and VIREMENT */}
                        {(formData.paymentMethod === 'CHEQUE' || formData.paymentMethod === 'VIREMENT') && (
                            <div className="space-y-2">
                                <label htmlFor="bank" className="block text-sm font-medium text-gray-700">
                                    Bank <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        id="bank"
                                        value={formData.bank}
                                        onChange={(e) => handleChange('bank', e.target.value)}
                                        placeholder="e.g., Bank of America"
                                        className={cn(
                                            "w-full pl-10 pr-4 py-2.5 border rounded-lg transition-all",
                                            "focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500",
                                            errors.bank
                                                ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                                                : "border-gray-300 hover:border-gray-400"
                                        )}
                                    />
                                </div>
                                {errors.bank && (
                                    <p className="text-sm text-red-600">{errors.bank}</p>
                                )}
                            </div>
                        )}

                        {/* Cheque Number - Only for CHEQUE */}
                        {formData.paymentMethod === 'CHEQUE' && (
                            <div className="space-y-2">
                                <label htmlFor="chequeNumber" className="block text-sm font-medium text-gray-700">
                                    Cheque Number <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Receipt className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        id="chequeNumber"
                                        value={formData.chequeNumber}
                                        onChange={(e) => handleChange('chequeNumber', e.target.value)}
                                        placeholder="e.g., CHK-123456"
                                        className={cn(
                                            "w-full pl-10 pr-4 py-2.5 border rounded-lg transition-all",
                                            "focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500",
                                            errors.chequeNumber
                                                ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                                                : "border-gray-300 hover:border-gray-400"
                                        )}
                                    />
                                </div>
                                {errors.chequeNumber && (
                                    <p className="text-sm text-red-600">{errors.chequeNumber}</p>
                                )}
                            </div>
                        )}

                        {/* Due Date - Only for CHEQUE */}
                        {formData.paymentMethod === 'CHEQUE' && (
                            <div className="space-y-2">
                                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                                    Due Date <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="date"
                                        id="dueDate"
                                        value={formData.dueDate}
                                        onChange={(e) => handleChange('dueDate', e.target.value)}
                                        className={cn(
                                            "w-full pl-10 pr-4 py-2.5 border rounded-lg transition-all",
                                            "focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500",
                                            errors.dueDate
                                                ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                                                : "border-gray-300 hover:border-gray-400"
                                        )}
                                    />
                                </div>
                                {errors.dueDate && (
                                    <p className="text-sm text-red-600">{errors.dueDate}</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Form Footer */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => navigate(orderId ? `/orders/${orderId}` : '/orders')}
                            className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className={cn(
                                "inline-flex items-center gap-2 px-6 py-2 font-medium rounded-lg transition-all",
                                "bg-indigo-600 text-white hover:bg-indigo-700",
                                "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
                                submitting && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Add Payment
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
