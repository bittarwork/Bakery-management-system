import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  User,
  Building,
  Clock,
  MapPin,
  Plus,
  Trash2,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import EnhancedButton from "../ui/EnhancedButton";
import EnhancedInput from "../ui/EnhancedInput";
import { toast } from "react-hot-toast";

const CreateScheduleModal = ({
  isOpen,
  onClose,
  onCreateSuccess,
  distributors = [],
  stores = [],
}) => {
  // Form state
  const [formData, setFormData] = useState({
    distributor_id: "",
    schedule_date: new Date().toISOString().split("T")[0], // Today's date
    optimize_route: true,
    stores_data: [],
  });

  // Form validation and UI state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStores, setSelectedStores] = useState([]);

  // Store selection state
  const [availableStores, setAvailableStores] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      resetForm();
      setAvailableStores(stores);
    }
  }, [isOpen, stores]);

  // Filter available stores based on search
  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = stores.filter(
        (store) =>
          store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          store.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setAvailableStores(filtered);
    } else {
      setAvailableStores(stores);
    }
  }, [searchTerm, stores]);

  const resetForm = () => {
    setFormData({
      distributor_id: "",
      schedule_date: new Date().toISOString().split("T")[0],
      optimize_route: true,
      stores_data: [],
    });
    setSelectedStores([]);
    setErrors({});
    setSearchTerm("");
  };

  // Handle form field changes
  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  // Add store to schedule
  const handleAddStore = (store) => {
    if (selectedStores.find((s) => s.id === store.id)) {
      toast.error("Store already added to schedule");
      return;
    }

    const newStoreEntry = {
      id: store.id,
      store_id: store.id,
      name: store.name,
      address: store.address,
      gps_coordinates: store.gps_coordinates,
      estimated_duration: 30, // Default 30 minutes
      scheduled_start_time: "09:00",
      scheduled_end_time: "09:30",
      visit_order: selectedStores.length + 1,
      order_ids: [], // Will be populated later if needed
      notes: "",
    };

    setSelectedStores((prev) => [...prev, newStoreEntry]);

    // Update form data
    setFormData((prev) => ({
      ...prev,
      stores_data: [...prev.stores_data, newStoreEntry],
    }));
  };

  // Remove store from schedule
  const handleRemoveStore = (storeId) => {
    const updatedStores = selectedStores.filter((s) => s.id !== storeId);

    // Reorder visit orders
    const reorderedStores = updatedStores.map((store, index) => ({
      ...store,
      visit_order: index + 1,
    }));

    setSelectedStores(reorderedStores);
    setFormData((prev) => ({
      ...prev,
      stores_data: reorderedStores,
    }));
  };

  // Update store details
  const handleUpdateStoreDetails = (storeId, field, value) => {
    const updatedStores = selectedStores.map((store) => {
      if (store.id === storeId) {
        const updatedStore = { ...store, [field]: value };

        // Auto-calculate end time if start time or duration changes
        if (
          field === "scheduled_start_time" ||
          field === "estimated_duration"
        ) {
          const startTime =
            field === "scheduled_start_time"
              ? value
              : store.scheduled_start_time;
          const duration =
            field === "estimated_duration"
              ? parseInt(value)
              : store.estimated_duration;

          if (startTime && duration) {
            const [hours, minutes] = startTime.split(":").map(Number);
            const startDate = new Date();
            startDate.setHours(hours, minutes, 0, 0);

            const endDate = new Date(startDate.getTime() + duration * 60000);
            const endTime = endDate.toTimeString().slice(0, 5);

            updatedStore.scheduled_end_time = endTime;
          }
        }

        return updatedStore;
      }
      return store;
    });

    setSelectedStores(updatedStores);
    setFormData((prev) => ({
      ...prev,
      stores_data: updatedStores,
    }));
  };

  // Move store up/down in order
  const handleMoveStore = (storeId, direction) => {
    const currentIndex = selectedStores.findIndex((s) => s.id === storeId);
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= selectedStores.length) return;

    const updatedStores = [...selectedStores];
    [updatedStores[currentIndex], updatedStores[newIndex]] = [
      updatedStores[newIndex],
      updatedStores[currentIndex],
    ];

    // Update visit orders
    const reorderedStores = updatedStores.map((store, index) => ({
      ...store,
      visit_order: index + 1,
    }));

    setSelectedStores(reorderedStores);
    setFormData((prev) => ({
      ...prev,
      stores_data: reorderedStores,
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.distributor_id) {
      newErrors.distributor_id = "Please select a distributor";
    }

    if (!formData.schedule_date) {
      newErrors.schedule_date = "Please select a schedule date";
    }

    if (selectedStores.length === 0) {
      newErrors.stores = "Please add at least one store to the schedule";
    }

    // Validate individual store data
    selectedStores.forEach((store, index) => {
      if (!store.scheduled_start_time) {
        newErrors[`store_${store.id}_start_time`] = "Start time is required";
      }
      if (!store.estimated_duration || store.estimated_duration <= 0) {
        newErrors[`store_${store.id}_duration`] =
          "Duration must be greater than 0";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix validation errors");
      return;
    }

    setIsSubmitting(true);

    try {
      const scheduleData = {
        distributor_id: parseInt(formData.distributor_id),
        schedule_date: formData.schedule_date,
        stores_data: formData.stores_data,
        optimize_route: formData.optimize_route,
      };

      console.log("Creating schedule with data:", scheduleData);

      await onCreateSuccess(scheduleData);

      toast.success("Distribution schedule generated successfully!");
      onClose();
      resetForm();
    } catch (error) {
      console.error("Error creating schedule:", error);
      toast.error(error.message || "Failed to generate distribution schedule");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Generate Distribution Schedule
                </h2>
                <p className="text-sm text-gray-600">
                  Create a new daily distribution schedule for a distributor
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Distributor *
                  </label>
                  <select
                    value={formData.distributor_id}
                    onChange={(e) =>
                      handleFieldChange("distributor_id", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Distributor</option>
                    {distributors.map((distributor) => (
                      <option key={distributor.id} value={distributor.id}>
                        {distributor.full_name} - {distributor.phone}
                      </option>
                    ))}
                  </select>
                  {errors.distributor_id && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.distributor_id}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schedule Date *
                  </label>
                  <EnhancedInput
                    type="date"
                    value={formData.schedule_date}
                    onChange={(e) =>
                      handleFieldChange("schedule_date", e.target.value)
                    }
                    className={errors.schedule_date ? "border-red-300" : ""}
                  />
                  {errors.schedule_date && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.schedule_date}
                    </p>
                  )}
                </div>
              </div>

              {/* Route Optimization */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="optimize_route"
                  checked={formData.optimize_route}
                  onChange={(e) =>
                    handleFieldChange("optimize_route", e.target.checked)
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="optimize_route"
                  className="ml-2 text-sm text-gray-700"
                >
                  Optimize route automatically (recommended)
                </label>
              </div>

              {/* Store Selection */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Add Stores to Schedule
                </h3>

                {/* Store Search */}
                <div className="mb-4">
                  <div className="relative">
                    <EnhancedInput
                      type="text"
                      placeholder="Search stores..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <Building className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Available Stores */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 max-h-32 overflow-y-auto">
                  {availableStores.map((store) => (
                    <div
                      key={store.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {store.name}
                        </h4>
                        <p className="text-xs text-gray-500">{store.address}</p>
                      </div>
                      <EnhancedButton
                        type="button"
                        size="sm"
                        onClick={() => handleAddStore(store)}
                        disabled={selectedStores.find((s) => s.id === store.id)}
                        className="flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Add
                      </EnhancedButton>
                    </div>
                  ))}
                </div>

                {errors.stores && (
                  <p className="mb-4 text-sm text-red-600">{errors.stores}</p>
                )}

                {/* Selected Stores Schedule */}
                {selectedStores.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">
                      Scheduled Stores ({selectedStores.length})
                    </h4>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {selectedStores.map((store, index) => (
                        <div
                          key={store.id}
                          className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900">
                                #{store.visit_order}
                              </span>
                              <h5 className="text-sm font-medium text-gray-900">
                                {store.name}
                              </h5>
                            </div>
                            <div className="flex items-center gap-2">
                              {index > 0 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleMoveStore(store.id, "up")
                                  }
                                  className="p-1 text-gray-400 hover:text-gray-600"
                                  title="Move Up"
                                >
                                  ↑
                                </button>
                              )}
                              {index < selectedStores.length - 1 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleMoveStore(store.id, "down")
                                  }
                                  className="p-1 text-gray-400 hover:text-gray-600"
                                  title="Move Down"
                                >
                                  ↓
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveStore(store.id)}
                                className="p-1 text-red-400 hover:text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Start Time
                              </label>
                              <EnhancedInput
                                type="time"
                                value={store.scheduled_start_time}
                                onChange={(e) =>
                                  handleUpdateStoreDetails(
                                    store.id,
                                    "scheduled_start_time",
                                    e.target.value
                                  )
                                }
                                className="text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Duration (minutes)
                              </label>
                              <EnhancedInput
                                type="number"
                                min="1"
                                value={store.estimated_duration}
                                onChange={(e) =>
                                  handleUpdateStoreDetails(
                                    store.id,
                                    "estimated_duration",
                                    parseInt(e.target.value)
                                  )
                                }
                                className="text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                End Time
                              </label>
                              <EnhancedInput
                                type="time"
                                value={store.scheduled_end_time}
                                readOnly
                                className="text-sm bg-gray-100"
                              />
                            </div>
                          </div>

                          <div className="mt-3">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Notes (optional)
                            </label>
                            <textarea
                              value={store.notes}
                              onChange={(e) =>
                                handleUpdateStoreDetails(
                                  store.id,
                                  "notes",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              rows="2"
                              placeholder="Special instructions for this visit..."
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <EnhancedButton
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </EnhancedButton>
            <EnhancedButton
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting || selectedStores.length === 0}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Generate Schedule
                </>
              )}
            </EnhancedButton>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreateScheduleModal;
