import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  User,
  CreditCard,
  Globe,
  Save,
  X,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import StoreMap from "../../components/ui/StoreMap";
import storeService from "../../services/storeService";
import { toast } from "react-hot-toast";

const EditStorePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    region: "",
    address: "",
    contact_person: "",
    phone: "",
    email: "",
    payment_method: "cash",
    credit_limit: "",
    notes: "",
    status: "active",
  });

  // Load store data
  useEffect(() => {
    const loadStore = async () => {
      try {
        setIsLoading(true);
        const response = await storeService.getStore(id);
        const store = response.data;

        setFormData({
          name: store.name || "",
          region: store.region || "",
          address: store.address || "",
          contact_person: store.contact_person || "",
          phone: store.phone || "",
          email: store.email || "",
          payment_method: store.payment_method || "cash",
          credit_limit: store.credit_limit || "",
          notes: store.notes || "",
          status: store.status || "active",
        });

        if (store.latitude && store.longitude) {
          setSelectedLocation({
            lat: parseFloat(store.latitude),
            lng: parseFloat(store.longitude),
            name: store.name,
          });
        }
      } catch (error) {
        console.error("Error loading store:", error);
        toast.error("Failed to load store data");
        navigate("/stores");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadStore();
    }
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    const validation = storeService.validateStoreData({
      ...formData,
      latitude: selectedLocation?.lat,
      longitude: selectedLocation?.lng,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      toast.error("Please fix the validation errors");
      return;
    }

    try {
      setIsSaving(true);
      setErrors({});

      const storeData = storeService.formatStoreData({
        ...formData,
        latitude: selectedLocation?.lat,
        longitude: selectedLocation?.lng,
      });

      await storeService.updateStore(id, storeData);
      toast.success("Store updated successfully");
      navigate("/stores");
    } catch (error) {
      console.error("Error updating store:", error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
      toast.error("Failed to update store");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await storeService.deleteStore(id);
      toast.success("Store deleted successfully");
      navigate("/stores");
    } catch (error) {
      console.error("Error deleting store:", error);
      toast.error("Failed to delete store");
    }
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setErrors((prev) => ({ ...prev, latitude: null, longitude: null }));
  };

  const clearLocation = () => {
    setSelectedLocation(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <Link to="/stores" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Store</h1>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            icon={<AlertTriangle className="w-4 h-4" />}
            onClick={() => setShowDeleteConfirm(true)}
            className="text-red-600 hover:text-red-700"
          >
            Delete Store
          </Button>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                Delete Store
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this store? This action cannot be
              undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                icon={<Trash2 className="w-4 h-4" />}
                onClick={handleDelete}
              >
                Delete Store
              </Button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Store Information */}
        <Card>
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Store Information
            </h2>
          </div>
          <div className="card-body space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Store Name *
                </label>
                <input
                  type="text"
                  className={`mt-1 input ${
                    errors.name ? "border-red-500" : ""
                  }`}
                  value={formData.name}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, name: e.target.value }));
                    if (errors.name)
                      setErrors((prev) => ({ ...prev, name: null }));
                  }}
                  placeholder="Enter store name"
                  required
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Region
                </label>
                <select
                  className="mt-1 input"
                  value={formData.region}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, region: e.target.value }))
                  }
                >
                  <option value="">Select a region</option>
                  <option value="north">North</option>
                  <option value="south">South</option>
                  <option value="east">East</option>
                  <option value="west">West</option>
                  <option value="central">Central</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Address *
                </label>
                <textarea
                  className={`mt-1 input ${
                    errors.address ? "border-red-500" : ""
                  }`}
                  rows={3}
                  value={formData.address}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }));
                    if (errors.address)
                      setErrors((prev) => ({ ...prev, address: null }));
                  }}
                  placeholder="Enter store address"
                  required
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Contact Person
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    className="mt-1 input pl-10"
                    value={formData.contact_person}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        contact_person: e.target.value,
                      }))
                    }
                    placeholder="Contact person name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    className={`mt-1 input pl-10 ${
                      errors.phone ? "border-red-500" : ""
                    }`}
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }));
                      if (errors.phone)
                        setErrors((prev) => ({ ...prev, phone: null }));
                    }}
                    placeholder="+1234567890"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    className={`mt-1 input pl-10 ${
                      errors.email ? "border-red-500" : ""
                    }`}
                    value={formData.email}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }));
                      if (errors.email)
                        setErrors((prev) => ({ ...prev, email: null }));
                    }}
                    placeholder="store@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Payment Method
                </label>
                <select
                  className="mt-1 input"
                  value={formData.payment_method}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      payment_method: e.target.value,
                    }))
                  }
                >
                  <option value="cash">Cash</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Credit Limit (€)
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    className={`mt-1 input pl-10 ${
                      errors.credit_limit ? "border-red-500" : ""
                    }`}
                    value={formData.credit_limit}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        credit_limit: e.target.value,
                      }));
                      if (errors.credit_limit)
                        setErrors((prev) => ({ ...prev, credit_limit: null }));
                    }}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                {errors.credit_limit && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.credit_limit}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  className="mt-1 input"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, status: e.target.value }))
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                className="mt-1 input"
                rows={3}
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Additional notes about the store..."
              />
            </div>
          </div>
        </Card>

        {/* Location Selection */}
        <Card>
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Store Location
            </h2>
          </div>
          <div className="card-body space-y-4">
            {selectedLocation && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Selected Location
                    </p>
                    <p className="text-sm text-blue-700">
                      Lat: {selectedLocation.lat.toFixed(6)}, Lng:{" "}
                      {selectedLocation.lng.toFixed(6)}
                    </p>
                    {selectedLocation.name && (
                      <p className="text-sm text-blue-600">
                        {selectedLocation.name}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={clearLocation}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <StoreMap
              stores={[]}
              onLocationSelect={handleLocationSelect}
              selectedLocation={selectedLocation}
              height="400px"
              interactive={true}
            />

            <p className="text-sm text-gray-600">
              Click on the map to select the store location, or click on an
              existing store to select its location.
            </p>
          </div>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <Link to="/stores">
            <Button variant="outline" disabled={isSaving}>
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            icon={<Save className="w-4 h-4" />}
            loading={isSaving}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditStorePage;
