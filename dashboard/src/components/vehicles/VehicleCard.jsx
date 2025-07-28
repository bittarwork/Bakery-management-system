import React from 'react';
import { motion } from 'framer-motion';
import { 
    Edit3, 
    Trash2, 
    User, 
    Calendar, 
    Fuel, 
    Settings,
    UserCheck,
    UserX,
    AlertTriangle,
    CheckCircle,
    Clock,
    XCircle
} from 'lucide-react';
import vehicleService from '../../services/vehicleService';

const VehicleCard = ({ 
    vehicle, 
    onEdit, 
    onDelete, 
    onAssign, 
    onUnassign, 
    onStatusChange,
    showActions = true 
}) => {
    const vehicleTypeInfo = vehicleService.getVehicleTypeInfo(vehicle.vehicle_type);
    const statusInfo = vehicleService.getStatusInfo(vehicle.status);
    const fuelTypeInfo = vehicleService.getFuelTypeInfo(vehicle.fuel_type);

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'maintenance':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'inactive':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'retired':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getVehicleAge = () => {
        const currentYear = new Date().getFullYear();
        return currentYear - vehicle.vehicle_year;
    };

    const isMaintenanceDue = () => {
        if (!vehicle.next_maintenance_km || !vehicle.current_km) return false;
        return vehicle.current_km >= vehicle.next_maintenance_km;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
        >
            {/* Header with vehicle type and status */}
            <div className="relative p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="text-3xl">{vehicleTypeInfo.icon}</div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">
                                {vehicle.vehicle_model}
                            </h3>
                            <p className="text-sm text-gray-600">
                                {vehicleTypeInfo.label} • {vehicle.vehicle_year}
                            </p>
                        </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(vehicle.status)}`}>
                        {statusInfo.icon} {statusInfo.label}
                    </div>
                </div>

                {/* Vehicle plate */}
                <div className="mt-3 p-2 bg-white rounded-lg border border-gray-200 text-center">
                    <span className="text-xl font-bold text-gray-900 tracking-wider">
                        {vehicle.vehicle_plate}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
                {/* Vehicle details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                        <Fuel className="w-4 h-4 text-orange-500" />
                        <span className="text-gray-600">{fuelTypeInfo.label}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Settings className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">{vehicle.transmission_type === 'manual' ? 'يدوي' : 'أوتوماتيك'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span className="text-gray-600">{getVehicleAge()} سنوات</span>
                    </div>
                    {vehicle.engine_capacity && (
                        <div className="text-gray-600">
                            <span className="font-medium">{vehicle.engine_capacity}</span>
                        </div>
                    )}
                </div>

                {/* Assigned distributor */}
                <div className="pt-3 border-t border-gray-100">
                    {vehicle.assignedDistributor ? (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <UserCheck className="w-4 h-4 text-green-500" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {vehicle.assignedDistributor.full_name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {vehicle.assignedDistributor.phone}
                                    </p>
                                </div>
                            </div>
                            {showActions && (
                                <button
                                    onClick={() => onUnassign(vehicle.id)}
                                    className="text-red-600 hover:text-red-800 text-xs font-medium"
                                >
                                    إلغاء التعيين
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <UserX className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-500">غير مُعينة</span>
                            </div>
                            {showActions && vehicle.status === 'active' && (
                                <button
                                    onClick={() => onAssign(vehicle.id)}
                                    className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                                >
                                    تعيين موزع
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Maintenance warning */}
                {isMaintenanceDue() && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                            <p className="text-sm text-amber-800 font-medium">
                                صيانة مستحقة!
                            </p>
                        </div>
                        <p className="text-xs text-amber-700 mt-1">
                            العداد: {vehicle.current_km?.toLocaleString()} كم
                        </p>
                    </div>
                )}

                {/* Additional info */}
                {vehicle.notes && (
                    <div className="pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-600">
                            <span className="font-medium">ملاحظات:</span> {vehicle.notes}
                        </p>
                    </div>
                )}
            </div>

            {/* Actions */}
            {showActions && (
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                            <button
                                onClick={() => onEdit(vehicle)}
                                className="flex items-center space-x-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                            >
                                <Edit3 className="w-3 h-3" />
                                <span>تعديل</span>
                            </button>
                            
                            {!vehicle.assigned_distributor_id && (
                                <button
                                    onClick={() => onDelete(vehicle.id)}
                                    className="flex items-center space-x-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                                >
                                    <Trash2 className="w-3 h-3" />
                                    <span>حذف</span>
                                </button>
                            )}
                        </div>

                        {/* Status change dropdown */}
                        <select
                            value={vehicle.status}
                            onChange={(e) => onStatusChange(vehicle.id, e.target.value)}
                            className="text-xs border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="active">نشطة</option>
                            <option value="maintenance">صيانة</option>
                            <option value="inactive">غير نشطة</option>
                            <option value="retired">متقاعدة</option>
                        </select>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default VehicleCard; 