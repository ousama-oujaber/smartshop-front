import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService, type CreateOrderRequest } from '../../services/order.service';
import { clientService, type Client } from '../../services/client.service';
import { productService, type Product } from '../../services/product.service';
import { cn } from '../../lib/utils';
import {
    ArrowLeft,
    ArrowRight,
    Plus,
    Trash2,
    User,
    Package,
    Tag,
    CheckCircle2,
    Loader2,
    AlertCircle,
    Search,
    Minus,
    ShoppingBag
} from 'lucide-react';

const formatPrice = (amount: number): string => {
    return new Intl.NumberFormat('fr-MA', {
        style: 'currency',
        currency: 'MAD',
        minimumFractionDigits: 2,
    }).format(amount);
};

type OrderItem = {
    productId: number;
    productName: string;
    quantity: number;
    price: number;
    stock: number;
};

export function CreateOrderPage() {
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [clients, setClients] = useState<Client[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [promoCode, setPromoCode] = useState('');
    const [clientSearch, setClientSearch] = useState('');
    const [productSearch, setProductSearch] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [clientsData, productsData] = await Promise.all([
                clientService.getAll(),
                productService.getAll()
            ]);
            setClients(clientsData);
            setProducts(productsData.filter(p => p.stock > 0));
        } catch (err) {
            setError('Failed to load data');
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
        }
    };

    const calculateTotals = () => {
        const subTotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Apply tier discount
        let tierDiscount = 0;
        if (selectedClient) {
            const { tier } = selectedClient;
            if (tier === 'SILVER' && subTotal >= 500) tierDiscount = subTotal * 0.05;
            else if (tier === 'GOLD' && subTotal >= 800) tierDiscount = subTotal * 0.10;
            else if (tier === 'PLATINUM' && subTotal >= 1200) tierDiscount = subTotal * 0.15;
        }

        // Apply promo code discount (5% if valid)
        let promoDiscount = 0;
        if (promoCode && /^PROMO-[A-Z0-9]{4}$/.test(promoCode)) {
            promoDiscount = subTotal * 0.05;
        }

        const totalDiscount = tierDiscount + promoDiscount;
        const taxableAmount = subTotal - totalDiscount;
        const tax = taxableAmount * 0.20; // 20% TVA
        const totalAmount = taxableAmount + tax;

        return { subTotal, totalDiscount, tax, totalAmount, tierDiscount, promoDiscount };
    };

    const addItem = (product: Product) => {
        const existingItem = orderItems.find(item => item.productId === product.id);
        if (existingItem) {
            if (existingItem.quantity < product.stock) {
                setOrderItems(orderItems.map(item =>
                    item.productId === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                ));
            }
        } else {
            setOrderItems([...orderItems, {
                productId: product.id,
                productName: product.name,
                quantity: 1,
                price: product.price,
                stock: product.stock
            }]);
        }
    };


    const updateQuantity = (productId: number, delta: number) => {
        setOrderItems(orderItems.map(item => {
            if (item.productId === productId) {
                const newQuantity = Math.max(1, Math.min(item.stock, item.quantity + delta));
                return { ...item, quantity: newQuantity };
            }
            return item;
        }));
    };

    const removeItem = (productId: number) => {
        setOrderItems(orderItems.filter(item => item.productId !== productId));
    };

    const handleSubmit = async () => {
        if (!selectedClient || orderItems.length === 0) return;

        setSubmitting(true);
        setError(null);

        try {
            const orderData: CreateOrderRequest = {
                clientId: selectedClient.id,
                items: orderItems.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity
                })),
                ...(promoCode && { promoCode })
            };

            const createdOrder = await orderService.create(orderData);
            navigate(`/orders/${createdOrder.id}`);
        } catch (err: any) {
            const message = err.response?.data?.message || err.response?.data?.error || 'Failed to create order';
            setError(message);
            console.error('Error creating order:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const filteredClients = clients.filter(client =>
        client.fullName.toLowerCase().includes(clientSearch.toLowerCase()) ||
        client.email.toLowerCase().includes(clientSearch.toLowerCase())
    );

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(productSearch.toLowerCase()) &&
        !orderItems.find(item => item.productId === product.id)
    );

    const totals = calculateTotals();

    const TierBadge = ({ tier }: { tier: Client['tier'] }) => {
        const styles = {
            BASIC: 'bg-gray-100 text-gray-700',
            SILVER: 'bg-gray-200 text-gray-800',
            GOLD: 'bg-amber-100 text-amber-800',
            PLATINUM: 'bg-indigo-100 text-indigo-800',
        };
        return (
            <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${styles[tier]}`}>
                {tier}
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
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create Order</h1>
                    <p className="text-gray-500 mt-1">Create a new order for a customer</p>
                </div>

                {/* Stepper */}
                <div className="flex items-center gap-4 mb-8">
                    <div className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                        step === 1 ? "bg-indigo-600 text-white" : "bg-white text-gray-600"
                    )}>
                        <span className="w-6 h-6 rounded-full bg-current flex items-center justify-center text-xs">
                            <span className={step === 1 ? "text-indigo-600" : "text-white"}>1</span>
                        </span>
                        Select Customer
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                    <div className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                        step === 2 ? "bg-indigo-600 text-white" : "bg-white text-gray-600"
                    )}>
                        <span className="w-6 h-6 rounded-full bg-current flex items-center justify-center text-xs">
                            <span className={step === 2 ? "text-indigo-600" : "text-white"}>2</span>
                        </span>
                        Add Items
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                    <div className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                        step === 3 ? "bg-indigo-600 text-white" : "bg-white text-gray-600"
                    )}>
                        <span className="w-6 h-6 rounded-full bg-current flex items-center justify-center text-xs">
                            <span className={step === 3 ? "text-indigo-600" : "text-white"}>3</span>
                        </span>
                        Review
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {/* Step 1: Select Customer */}
                {step === 1 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <User className="w-5 h-5 text-gray-400" />
                                Select Customer
                            </h2>
                            <div className="mt-4 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search customers..."
                                    value={clientSearch}
                                    onChange={(e) => setClientSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                />
                            </div>
                        </div>
                        <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                            {filteredClients.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    No customers found
                                </div>
                            ) : (
                                filteredClients.map(client => (
                                    <button
                                        key={client.id}
                                        onClick={() => {
                                            setSelectedClient(client);
                                            setStep(2);
                                        }}
                                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                                <span className="font-semibold text-indigo-600">
                                                    {client.fullName.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{client.fullName}</p>
                                                <p className="text-sm text-gray-500">{client.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <TierBadge tier={client.tier} />
                                            <ArrowRight className="w-5 h-5 text-gray-400" />
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Step 2: Add Items */}
                {step === 2 && selectedClient && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Products List */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Package className="w-5 h-5 text-gray-400" />
                                    Available Products
                                </h2>
                                <div className="mt-4 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        value={productSearch}
                                        onChange={(e) => setProductSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    />
                                </div>
                            </div>
                            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                                {filteredProducts.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        No products available
                                    </div>
                                ) : (
                                    filteredProducts.map(product => (
                                        <div
                                            key={product.id}
                                            className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
                                        >
                                            <div>
                                                <p className="font-medium text-gray-900">{product.name}</p>
                                                <p className="text-sm text-gray-500 font-mono">{formatPrice(product.price)}</p>
                                                <p className="text-xs text-gray-400">{product.stock} in stock</p>
                                            </div>
                                            <button
                                                onClick={() => addItem(product)}
                                                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Selected Items */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <ShoppingBag className="w-5 h-5 text-gray-400" />
                                    Selected Items
                                </h2>
                            </div>
                            <div className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
                                {orderItems.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        No items selected
                                    </div>
                                ) : (
                                    orderItems.map(item => (
                                        <div key={item.productId} className="px-6 py-4 flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-gray-900">{item.productName}</p>
                                                <p className="text-sm text-gray-500 font-mono">
                                                    {formatPrice(item.price * item.quantity)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => updateQuantity(item.productId, -1)}
                                                    className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.productId, 1)}
                                                    className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => removeItem(item.productId)}
                                                    className="p-1 text-red-500 hover:bg-red-50 rounded ml-2"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            {/* Promo Code */}
                            <div className="p-6 border-t border-gray-200">
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Tag className="w-4 h-4" />
                                    Promo Code (optional)
                                </label>
                                <input
                                    type="text"
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                    placeholder="PROMO-XXXX"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 uppercase"
                                />
                                {promoCode && !/^PROMO-[A-Z0-9]{4}$/.test(promoCode) && (
                                    <p className="text-xs text-red-600 mt-1">Invalid format. Use PROMO-XXXX</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Review */}
                {step === 3 && selectedClient && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Customer Info */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer</h3>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                                        <span className="font-semibold text-indigo-600">
                                            {selectedClient.fullName.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{selectedClient.fullName}</p>
                                        <p className="text-sm text-gray-500">{selectedClient.email}</p>
                                    </div>
                                    <TierBadge tier={selectedClient.tier} />
                                </div>
                            </div>

                            {/* Items */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">Items</h3>
                                </div>
                                <div className="divide-y divide-gray-200">
                                    {orderItems.map(item => (
                                        <div key={item.productId} className="px-6 py-4 flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-gray-900">{item.productName}</p>
                                                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="font-mono font-medium text-gray-900">
                                                {formatPrice(item.price * item.quantity)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-mono text-gray-900">{formatPrice(totals.subTotal)}</span>
                                    </div>
                                    {totals.tierDiscount > 0 && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Tier Discount ({selectedClient?.tier})</span>
                                            <span className="font-mono text-green-600">-{formatPrice(totals.tierDiscount)}</span>
                                        </div>
                                    )}
                                    {totals.promoDiscount > 0 && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Promo Discount</span>
                                            <span className="font-mono text-green-600">-{formatPrice(totals.promoDiscount)}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Total Discount</span>
                                        <span className="font-mono text-green-600">-{formatPrice(totals.totalDiscount)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Tax (TVA 20%)</span>
                                        <span className="font-mono text-gray-900">{formatPrice(totals.tax)}</span>
                                    </div>
                                    <div className="pt-3 border-t border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-gray-900">Total</span>
                                            <span className="text-2xl font-bold text-indigo-600 font-mono">
                                                {formatPrice(totals.totalAmount)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-8">
                    <button
                        onClick={() => setStep(Math.max(1, step - 1))}
                        disabled={step === 1}
                        className="px-6 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    {step < 3 ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            disabled={
                                (step === 1 && !selectedClient) ||
                                (step === 2 && orderItems.length === 0)
                            }
                            className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting || orderItems.length === 0}
                            className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    Create Order
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
