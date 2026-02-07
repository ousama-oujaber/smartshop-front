import React from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { ArrowUpRight, ArrowDownRight, type LucideIcon } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface StatCardProps {
    title: string;
    value: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon: Icon,
    trend,
    className,
}) => {
    return (
        <Card className={cn("hover:shadow-md transition-shadow duration-300", className)}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">{title}</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-lg">
                        <Icon className="w-6 h-6 text-indigo-600" />
                    </div>
                </div>
                {trend && (
                    <div className="mt-4 flex items-center text-sm">
                        <span
                            className={cn(
                                "flex items-center font-medium",
                                trend.isPositive ? "text-green-600" : "text-red-600"
                            )}
                        >
                            {trend.isPositive ? (
                                <ArrowUpRight className="w-4 h-4 mr-1" />
                            ) : (
                                <ArrowDownRight className="w-4 h-4 mr-1" />
                            )}
                            {Math.abs(trend.value)}%
                        </span>
                        <span className="text-gray-500 ml-2">vs last month</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
