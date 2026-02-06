import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { clientService } from '../../services/client.service';
import { cn } from '../../lib/utils';
import {
    ArrowLeft,
    Save,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Mail,
    Lock,
    UserCircle
} from 'lucide-react';

interface FormData {
    fullName: string;
    email: string;
    password: string;
}

interface FormErrors {
    fullName?: string;
    email?: string;
    password?: string;
}

export function ClientFormPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditing = !!id;

    const [formData, setFormData] = useState<FormData>({
        fullName: '',
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isEditing) {
            loadClient();
        }
    }, [id]);

    const loadClient = async () => {
        setLoading(true);
        try {
            const client = await clientService.getById(Number(id));
            setFormData({
                fullName: client.fullName,
                email: client.email,
                password: '',
            });
        } catch (err) {
            setError('Failed to load client');
            console.error('Error loading client:', err);
        } finally {
            setLoading(false);
        }
    };

    const validate = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        } else if (formData.fullName.length < 2 || formData.fullName.length > 100) {
            newErrors.fullName = 'Full name must be between 2 and 100 characters';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!isEditing) {
            if (!formData.password) {
                newErrors.password = 'Password is required';
            } else if (formData.password.length < 6) {
                newErrors.password = 'Password must be at least 6 characters';
            }
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
            if (isEditing) {
                await clientService.update(Number(id), {
                    fullName: formData.fullName.trim(),
                    email: formData.email.trim(),
                });
            } else {
                await clientService.create({
                    fullName: formData.fullName.trim(),
                    email: formData.email.trim(),
                    password: formData.password,
                });
            }

            setSuccess(true);
            setTimeout(() => {
                navigate('/clients');
            }, 1000);
        } catch (err: any) {
            const message = err.response?.data?.message || err.response?.data?.error || 'Failed to save client';
            setError(message);
            console.error('Error saving client:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
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
                    onClick={() => navigate('/clients')}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Clients
                </button>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        {isEditing ? 'Edit Client' : 'Add Client'}
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {isEditing ? 'Update the client details below' : 'Fill in the details to create a new client'}
                    </p>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <p className="text-green-700 font-medium">
                            Client {isEditing ? 'updated' : 'created'} successfully! Redirecting...
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
                        {/* Full Name */}
                        <div className="space-y-2">
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    id="fullName"
                                    value={formData.fullName}
                                    onChange={(e) => handleChange('fullName', e.target.value)}
                                    placeholder="e.g., John Doe"
                                    className={cn(
                                        "w-full pl-10 pr-4 py-2.5 border rounded-lg transition-all",
                                        "focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500",
                                        errors.fullName
                                            ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                                            : "border-gray-300 hover:border-gray-400"
                                    )}
                                />
                            </div>
                            {errors.fullName && (
                                <p className="text-sm text-red-600">{errors.fullName}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    id="email"
                                    value={formData.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    placeholder="john@example.com"
                                    className={cn(
                                        "w-full pl-10 pr-4 py-2.5 border rounded-lg transition-all",
                                        "focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500",
                                        errors.email
                                            ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                                            : "border-gray-300 hover:border-gray-400"
                                    )}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>

                        {/* Password - Only for new clients */}
                        {!isEditing && (
                            <div className="space-y-2">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="password"
                                        id="password"
                                        value={formData.password}
                                        onChange={(e) => handleChange('password', e.target.value)}
                                        placeholder="Minimum 6 characters"
                                        className={cn(
                                            "w-full pl-10 pr-4 py-2.5 border rounded-lg transition-all",
                                            "focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500",
                                            errors.password
                                                ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                                                : "border-gray-300 hover:border-gray-400"
                                        )}
                                    />
                                </div>
                                {errors.password && (
                                    <p className="text-sm text-red-600">{errors.password}</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Form Footer */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/clients')}
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
                                    {isEditing ? 'Update Client' : 'Create Client'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
