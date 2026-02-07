import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientService, type Client } from '../../services/client.service';
import { useAuth } from '../auth/AuthContext';
import { ClientCard } from './ClientCard';

import {
    Plus,
    Search,
    Users,
    AlertCircle,
    Loader2,
} from 'lucide-react';


export function ClientsListPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN';

    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchClients = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await clientService.getAll();
            setClients(data);
        } catch (err) {
            setError('Failed to load clients. Please try again.');
            console.error('Error fetching clients:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    const filteredClients = clients.filter(client =>
        client.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase())
    );


    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Clients</h1>
                        <p className="text-gray-500 mt-1">Manage your customer base</p>
                    </div>
                    {isAdmin && (
                        <button
                            onClick={() => navigate('/clients/new')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm hover:shadow-md"
                        >
                            <Plus className="w-4 h-4" />
                            Add Client
                        </button>
                    )}
                </div>

                {/* Filters Bar */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search clients by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        />
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <p className="text-red-700">{error}</p>
                        <button
                            onClick={fetchClients}
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
                ) : filteredClients.length === 0 ? (
                    /* Empty State */
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 py-16 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">No clients found</h3>
                        <p className="text-gray-500 mb-6">
                            {searchQuery ? 'Try adjusting your search' : 'Get started by adding your first client'}
                        </p>
                        {isAdmin && !searchQuery && (
                            <button
                                onClick={() => navigate('/clients/new')}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add Client
                            </button>
                        )}
                    </div>
                ) : (
                    /* Clients Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredClients.map((client) => (
                            <ClientCard key={client.id} client={client} isAdmin={isAdmin} />
                        ))}
                    </div>
                )}

                {/* Summary */}
                {!loading && filteredClients.length > 0 && (
                    <div className="mt-6 text-sm text-gray-500 text-center">
                        Showing {filteredClients.length} of {clients.length} clients
                    </div>
                )}
            </div>
        </div>
    );
}
