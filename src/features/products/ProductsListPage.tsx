import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { productService, type Product } from '../../services/product.service';
import { useAuth } from '../auth/AuthContext';
import { cn } from '../../lib/utils';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    RefreshCw,
    Package,
    AlertCircle,
    Loader2,
    ChevronLeft,
    ChevronRight,
    LayoutGrid,
    List
} from 'lucide-react';

const formatPrice = (amount: number): string => {
    return new Intl.NumberFormat('fr-MA', {
        style: 'currency',
        currency: 'MAD',
        minimumFractionDigits: 2,
    }).format(amount);
};

export function ProductsListPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN';

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [showDeleted, setShowDeleted] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await productService.getPaginated(
                currentPage,
                pageSize,
                'id',
                'asc',
                showDeleted
            );
            setProducts(response.content);
            setTotalPages(response.totalPages);
            setTotalElements(response.totalElements);
        } catch (err) {
            setError('Failed to load products. Please try again.');
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, showDeleted]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: 'Delete Product?',
            text: 'Are you sure you want to delete this product?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await productService.delete(id);
                fetchProducts();
                Swal.fire('Deleted!', 'The product has been deleted.', 'success');
            } catch (err) {
                console.error('Error deleting product:', err);
                Swal.fire('Error', 'Failed to delete product', 'error');
            }
        }
    };

    const handleRestore = async (id: number) => {
        try {
            await productService.restore(id);
            fetchProducts();
            Swal.fire('Restored!', 'The product has been restored.', 'success');
        } catch (err) {
            console.error('Error restoring product:', err);
            Swal.fire('Error', 'Failed to restore product', 'error');
        }
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const StockBadge = ({ stock }: { stock: number }) => {
        if (stock === 0) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                    <AlertCircle className="w-3 h-3" />
                    Out of Stock
                </span>
            );
        }
        if (stock < 10) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                    <AlertCircle className="w-3 h-3" />
                    Low ({stock})
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                <Package className="w-3 h-3" />
                {stock} in stock
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Products</h1>
                        <p className="text-gray-500 mt-1">Manage your product inventory</p>
                    </div>
                    {isAdmin && (
                        <button
                            onClick={() => navigate('/products/new')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm hover:shadow-md"
                        >
                            <Plus className="w-4 h-4" />
                            Add Product
                        </button>
                    )}
                </div>

                {/* Filters Bar */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full sm:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            {/* View Toggle */}
                            <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={cn(
                                        "p-2 rounded-md transition-all",
                                        viewMode === 'list'
                                            ? "bg-white text-indigo-600 shadow-sm"
                                            : "text-gray-500 hover:text-gray-700"
                                    )}
                                >
                                    <List className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={cn(
                                        "p-2 rounded-md transition-all",
                                        viewMode === 'grid'
                                            ? "bg-white text-indigo-600 shadow-sm"
                                            : "text-gray-500 hover:text-gray-700"
                                    )}
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Show Deleted Toggle */}
                            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={showDeleted}
                                    onChange={(e) => {
                                        setShowDeleted(e.target.checked);
                                        setCurrentPage(0);
                                    }}
                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                                Show deleted
                            </label>

                            <button
                                onClick={fetchProducts}
                                className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <p className="text-red-700">{error}</p>
                        <button
                            onClick={fetchProducts}
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
                ) : filteredProducts.length === 0 ? (
                    /* Empty State */
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 py-16 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Package className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">No products found</h3>
                        <p className="text-gray-500 mb-6">
                            {searchQuery ? 'Try adjusting your search' : 'Get started by adding your first product'}
                        </p>
                        {isAdmin && !searchQuery && (
                            <button
                                onClick={() => navigate('/products/new')}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add Product
                            </button>
                        )}
                    </div>
                ) : viewMode === 'list' ? (
                    /* Table View */
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Product
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Price
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Stock
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredProducts.map((product) => (
                                    <tr
                                        key={product.id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                                    <Package className="w-5 h-5 text-indigo-600" />
                                                </div>
                                                <span className="font-medium text-gray-900">
                                                    {product.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono font-semibold text-gray-900">
                                                {formatPrice(product.price)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StockBadge stock={product.stock} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {isAdmin && (
                                                    <>
                                                        <button
                                                            onClick={() => navigate(`/products/${product.id}/edit`)}
                                                            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        {showDeleted ? (
                                                            <button
                                                                onClick={() => handleRestore(product.id)}
                                                                className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                                title="Restore"
                                                            >
                                                                <RefreshCw className="w-4 h-4" />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleDelete(product.id)}
                                                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    /* Grid View */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map((product) => (
                            <div
                                key={product.id}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
                            >
                                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                                    <Package className="w-16 h-16 text-gray-300" />
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                                    <p className="text-gray-500 text-sm mt-1">
                                        <StockBadge stock={product.stock} />
                                    </p>
                                    <div className="flex items-center justify-between mt-4">
                                        <span className="text-lg font-bold text-indigo-600 font-mono">
                                            {formatPrice(product.price)}
                                        </span>
                                        {isAdmin && (
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => navigate(`/products/${product.id}/edit`)}
                                                    className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                {showDeleted ? (
                                                    <button
                                                        onClick={() => handleRestore(product.id)}
                                                        className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    >
                                                        <RefreshCw className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleDelete(product.id)}
                                                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {!loading && filteredProducts.length > 0 && (
                    <div className="flex items-center justify-between mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="text-sm text-gray-600">
                            Showing {filteredProducts.length} of {totalElements} products
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                disabled={currentPage === 0}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="text-sm text-gray-600 px-2">
                                Page {currentPage + 1} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={currentPage >= totalPages - 1}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
