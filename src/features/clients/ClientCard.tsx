import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Mail,
    CreditCard,
    ShoppingBag,
    Calendar,
    Eye,
    Edit
} from 'lucide-react';
import { clientService, type Client } from '../../services/client.service';

interface ClientCardProps {
    client: Client;
    isAdmin: boolean;
}

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
        month: 'short',
        day: 'numeric'
    });
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

export function ClientCard({ client, isAdmin }: ClientCardProps) {
    const navigate = useNavigate();
    const [dates, setDates] = useState<{ first: string | null; last: string | null }>({
        first: client.firstOrderDate, // Fallback to client data if available
        last: client.lastOrderDate
    });

    useEffect(() => {
        const fetchDates = async () => {
            try {
                const data = await clientService.getOrderDates(client.id);
                setDates({
                    first: data.firstOrderDate,
                    last: data.lastOrderDate
                });
            } catch (err) {
                console.error(`Failed to fetch dates for client ${client.id}`, err);
            }
        };

        fetchDates();
    }, [client.id]);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            {/* Card Header */}
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-lg font-semibold text-indigo-600">
                                {client.fullName.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">{client.fullName}</h3>
                            <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                                <Mail className="w-3.5 h-3.5" />
                                {client.email}
                            </div>
                        </div>
                    </div>
                    <TierBadge tier={client.tier} />
                </div>
            </div>

            {/* Stats */}
            <div className="p-6 grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <CreditCard className="w-4 h-4" />
                        Total Spent
                    </div>
                    <p className="text-lg font-semibold text-gray-900 font-mono">
                        {formatPrice(client.totalSpent)}
                    </p>
                </div>
                <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <ShoppingBag className="w-4 h-4" />
                        Orders
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                        {client.totalOrders}
                    </p>
                </div>
                <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        First Order
                    </div>
                    <p className="text-sm text-gray-700">
                        {formatDate(dates.first)}
                    </p>
                </div>
                <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        Last Order
                    </div>
                    <p className="text-sm text-gray-700">
                        {formatDate(dates.last)}
                    </p>
                </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center gap-2">
                <button
                    onClick={() => navigate(`/clients/${client.id}`)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                >
                    <Eye className="w-4 h-4" />
                    View Details
                </button>
                {isAdmin && (
                    <button
                        onClick={() => navigate(`/clients/${client.id}/edit`)}
                        className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
}
