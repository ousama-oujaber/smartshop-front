import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productService } from '../../services/product.service';
import { cn } from '../../lib/utils';
import {
    ArrowLeft,
    Package,
    Save,
    Loader2,
    AlertCircle,
    CheckCircle2,
    DollarSign,
    Boxes
} from 'lucide-react';

interface FormData {
    name: string;
    price: string;
    stock: string;
}

interface FormErrors {
    name?: string;
    price?: string;
    stock?: string;
}

export function ProductFormPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditing = !!id;

    const [formData, setFormData] = useState<FormData>({
        name: '',
        price: '',
        stock: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isEditing) {
            loadProduct();
        }
    }, [id]);

    const loadProduct = async () => {
        setLoading(true);
        try {
            const product = await productService.getById(Number(id));
            setFormData({
                name: product.name,
                price: product.price.toString(),
                stock: product.stock.toString(),
            });
        } catch (err) {
            setError('Failed to load product');
            console.error('Error loading product:', err);
        } finally {
            setLoading(false);
        }
    };

    const validate = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Product name is required';
        }

        if (!formData.price.trim()) {
            newErrors.price = 'Price is required';
        } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
            newErrors.price = 'Price must be a positive number';
        }

        if (!formData.stock.trim()) {
            newErrors.stock = 'Stock is required';
        } else if (isNaN(Number(formData.stock)) || Number(formData.stock) < 0) {
            newErrors.stock = 'Stock must be 0 or greater';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setSaving(true);
        setError(null);
        setSuccess(false);

        try {
            const productData = {
                name: formData.name.trim(),
                price: Number(formData.price),
                stock: Number(formData.stock),
            };

            if (isEditing) {
                await productService.update(Number(id), productData);
            } else {
                await productService.create(productData);
            }

            setSuccess(true);
            setTimeout(() => {
                navigate('/products');
            }, 1000);
        } catch (err: any) {
            const message = err.response?.data?.message || err.response?.data?.error || 'Failed to save product';
            setError(message);
            console.error('Error saving product:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user types
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
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
            <div className="max-w-2xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/products')}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Products
                </button>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        {isEditing ? 'Edit Product' : 'Add Product'}
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {isEditing ? 'Update the product details below' : 'Fill in the details to create a new product'}
                    </p>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <p className="text-green-700 font-medium">
                            Product {isEditing ? 'updated' : 'created'} successfully! Redirecting...
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
                        {/* Product Name */}
                        <div className="space-y-2">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Product Name <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    placeholder="e.g., iPhone 15 Pro"
                                    className={cn(
                                        "w-full pl-10 pr-4 py-2.5 border rounded-lg transition-all",
                                        "focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500",
                                        errors.name
                                            ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                                            : "border-gray-300 hover:border-gray-400"
                                    )}
                                />
                            </div>
                            {errors.name && (
                                <p className="text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>

                        {/* Price & Stock - Two Column */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Price */}
                            <div className="space-y-2">
                                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                                    Price <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="number"
                                        id="price"
                                        value={formData.price}
                                        onChange={(e) => handleChange('price', e.target.value)}
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        className={cn(
                                            "w-full pl-10 pr-4 py-2.5 border rounded-lg transition-all",
                                            "focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500",
                                            errors.price
                                                ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                                                : "border-gray-300 hover:border-gray-400"
                                        )}
                                    />
                                </div>
                                {errors.price && (
                                    <p className="text-sm text-red-600">{errors.price}</p>
                                )}
                            </div>

                            {/* Stock */}
                            <div className="space-y-2">
                                <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                                    Stock <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Boxes className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="number"
                                        id="stock"
                                        value={formData.stock}
                                        onChange={(e) => handleChange('stock', e.target.value)}
                                        placeholder="0"
                                        min="0"
                                        step="1"
                                        className={cn(
                                            "w-full pl-10 pr-4 py-2.5 border rounded-lg transition-all",
                                            "focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500",
                                            errors.stock
                                                ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                                                : "border-gray-300 hover:border-gray-400"
                                        )}
                                    />
                                </div>
                                {errors.stock && (
                                    <p className="text-sm text-red-600">{errors.stock}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Form Footer */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/products')}
                            className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className={cn(
                                "inline-flex items-center gap-2 px-6 py-2 font-medium rounded-lg transition-all",
                                "bg-indigo-600 text-white hover:bg-indigo-700",
                                "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
                                saving && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    {isEditing ? 'Update Product' : 'Create Product'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
