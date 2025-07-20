import React, { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  Eye,
  EyeOff,
  DollarSign,
  Package,
  Tag,
  FileText,
  Image,
  AlertCircle,
  Loader2,
  Star,
  Scale,
  Calendar,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { productService } from "../../services/productService";

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCostFields, setShowCostFields] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [originalProduct, setOriginalProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    unit: "",
    price_eur: "",
    price_syp: "",
    cost_eur: "",
    cost_syp: "",
    stock_quantity: "",
    minimum_stock: "",
    barcode: "",
    is_featured: false,
    status: "active",
    image_url: "",
    weight_grams: "",
    shelf_life_days: "",
    storage_conditions: "",
    supplier_info: "",
    nutritional_info: "",
    allergen_info: "",
  });
  const [errors, setErrors] = useState({});

  // Fetch product data
  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      const response = await productService.getProduct(id);

      if (response.success) {
        const product = response.data;
        setOriginalProduct(product);
        setFormData({
          name: product.name || "",
          description: product.description || "",
          category: product.category || "",
          unit: product.unit || "",
          price_eur: product.price_eur || "",
          price_syp: product.price_syp || "",
          cost_eur: product.cost_eur || "",
          cost_syp: product.cost_syp || "",
          stock_quantity: product.stock_quantity || "",
          minimum_stock: product.minimum_stock || "",
          barcode: product.barcode || "",
          is_featured: product.is_featured || false,
          status: product.status || "active",
          image_url: product.image_url || "",
          weight_grams: product.weight_grams || "",
          shelf_life_days: product.shelf_life_days || "",
          storage_conditions: product.storage_conditions || "",
          supplier_info: product.supplier_info || "",
          nutritional_info: product.nutritional_info || "",
          allergen_info: product.allergen_info || "",
        });

        if (product.image_url) {
          setImagePreview(product.image_url);
        }

        // Show cost fields if they have values
        if (product.cost_eur > 0 || product.cost_syp > 0) {
          setShowCostFields(true);
        }
      } else {
        throw new Error(response.message || "Failed to fetch product");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Failed to load product");
      navigate("/products");
    } finally {
      setIsLoading(false);
    }
  };

  // Load product data on component mount
  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Handle form field changes
  const handleChange = (field, value) => {
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

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      setSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove image
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(originalProduct?.image_url || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Delete existing image
  const handleDeleteImage = async () => {
    if (!window.confirm("Are you sure you want to delete the current image?")) {
      return;
    }

    try {
      await productService.deleteProductImage(id);
      setImagePreview(null);
      setFormData((prev) => ({ ...prev, image_url: "" }));
      toast.success("Image deleted successfully");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.unit) {
      newErrors.unit = "Unit is required";
    }

    // Validate price_eur - must be positive number
    if (
      !formData.price_eur ||
      formData.price_eur === "" ||
      parseFloat(formData.price_eur) <= 0
    ) {
      newErrors.price_eur =
        "Valid price in EUR is required (must be greater than 0)";
    }

    // Validate price_syp - if provided, must be positive
    if (
      formData.price_syp &&
      formData.price_syp !== "" &&
      parseFloat(formData.price_syp) <= 0
    ) {
      newErrors.price_syp = "Price in SYP must be positive";
    }

    // Validate cost_eur - if provided, must be positive
    if (
      formData.cost_eur &&
      formData.cost_eur !== "" &&
      parseFloat(formData.cost_eur) < 0
    ) {
      newErrors.cost_eur = "Cost in EUR cannot be negative";
    }

    // Validate cost_syp - if provided, must be positive
    if (
      formData.cost_syp &&
      formData.cost_syp !== "" &&
      parseFloat(formData.cost_syp) < 0
    ) {
      newErrors.cost_syp = "Cost in SYP cannot be negative";
    }

    // Validate stock_quantity - if provided, must be non-negative
    if (
      formData.stock_quantity &&
      formData.stock_quantity !== "" &&
      parseInt(formData.stock_quantity) < 0
    ) {
      newErrors.stock_quantity = "Stock quantity cannot be negative";
    }

    // Validate minimum_stock - if provided, must be non-negative
    if (
      formData.minimum_stock &&
      formData.minimum_stock !== "" &&
      parseInt(formData.minimum_stock) < 0
    ) {
      newErrors.minimum_stock = "Minimum stock cannot be negative";
    }

    // Validate weight_grams - if provided, must be positive
    if (
      formData.weight_grams &&
      formData.weight_grams !== "" &&
      parseFloat(formData.weight_grams) <= 0
    ) {
      newErrors.weight_grams = "Weight must be positive";
    }

    // Validate shelf_life_days - if provided, must be positive
    if (
      formData.shelf_life_days &&
      formData.shelf_life_days !== "" &&
      parseInt(formData.shelf_life_days) <= 0
    ) {
      newErrors.shelf_life_days = "Shelf life must be positive";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare form data with proper validation and ensure no negative values
      const productData = {
        ...formData,
        price_eur:
          formData.price_eur &&
          formData.price_eur !== "" &&
          !isNaN(parseFloat(formData.price_eur)) &&
          parseFloat(formData.price_eur) > 0
            ? parseFloat(formData.price_eur)
            : 0.01,
        price_syp:
          formData.price_syp &&
          formData.price_syp !== "" &&
          !isNaN(parseFloat(formData.price_syp)) &&
          parseFloat(formData.price_syp) > 0
            ? parseFloat(formData.price_syp)
            : null,
        cost_eur:
          formData.cost_eur &&
          formData.cost_eur !== "" &&
          !isNaN(parseFloat(formData.cost_eur)) &&
          parseFloat(formData.cost_eur) >= 0
            ? parseFloat(formData.cost_eur)
            : null,
        cost_syp:
          formData.cost_syp &&
          formData.cost_syp !== "" &&
          !isNaN(parseFloat(formData.cost_syp)) &&
          parseFloat(formData.cost_syp) >= 0
            ? parseFloat(formData.cost_syp)
            : null,
        stock_quantity:
          formData.stock_quantity &&
          formData.stock_quantity !== "" &&
          !isNaN(parseInt(formData.stock_quantity)) &&
          parseInt(formData.stock_quantity) >= 0
            ? parseInt(formData.stock_quantity)
            : null,
        minimum_stock:
          formData.minimum_stock &&
          formData.minimum_stock !== "" &&
          !isNaN(parseInt(formData.minimum_stock)) &&
          parseInt(formData.minimum_stock) >= 0
            ? parseInt(formData.minimum_stock)
            : null,
        weight_grams:
          formData.weight_grams &&
          !isNaN(parseFloat(formData.weight_grams)) &&
          parseFloat(formData.weight_grams) > 0
            ? parseFloat(formData.weight_grams)
            : null,
        shelf_life_days:
          formData.shelf_life_days &&
          !isNaN(parseInt(formData.shelf_life_days)) &&
          parseInt(formData.shelf_life_days) > 0
            ? parseInt(formData.shelf_life_days)
            : null,
        is_featured: formData.is_featured,
        image_url:
          formData.image_url && formData.image_url.trim() !== ""
            ? formData.image_url
            : null,
      };

      // Update product
      const response = await productService.updateProduct(id, productData);

      if (response.success) {
        // Upload new image if selected
        if (selectedImage) {
          try {
            await productService.uploadProductImage(selectedImage, id);
            toast.success("Product updated successfully with new image");
          } catch (imageError) {
            toast.success(
              "Product updated successfully, but image upload failed"
            );
          }
        } else {
          toast.success("Product updated successfully");
        }

        // Navigate back to product details
        navigate(`/products/${id}`);
      } else {
        throw new Error(response.message || "Failed to update product");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error(error.message || "Failed to update product");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Categories for dropdown
  const categories = [
    { value: "bread", label: "Bread" },
    { value: "pastry", label: "Pastry" },
    { value: "cake", label: "Cake" },
    { value: "cookies", label: "Cookies" },
    { value: "other", label: "Other" },
  ];

  // Units for dropdown
  const units = [
    { value: "piece", label: "Piece" },
    { value: "kg", label: "Kilogram" },
    { value: "g", label: "Gram" },
    { value: "loaf", label: "Loaf" },
    { value: "box", label: "Box" },
    { value: "pack", label: "Pack" },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading product data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <Link
            to={`/products/${id}`}
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
            <p className="text-gray-600">Update {originalProduct?.name}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCostFields(!showCostFields)}
            icon={
              showCostFields ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )
            }
          >
            {showCostFields ? "Hide" : "Show"} Cost Fields
          </Button>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <Package className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">
                Basic Information
              </h2>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Enter product name"
                  error={errors.name}
                  icon={<Package className="w-4 h-4" />}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.category ? "border-red-500" : "border-gray-300"
                  }`}
                  value={formData.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit *
                </label>
                <select
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.unit ? "border-red-500" : "border-gray-300"
                  }`}
                  value={formData.unit}
                  onChange={(e) => handleChange("unit", e.target.value)}
                >
                  <option value="">Select a unit</option>
                  {units.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
                {errors.unit && (
                  <p className="mt-1 text-sm text-red-600">{errors.unit}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Barcode
                </label>
                <Input
                  type="text"
                  value={formData.barcode}
                  onChange={(e) => handleChange("barcode", e.target.value)}
                  placeholder="Enter barcode"
                  icon={<Tag className="w-4 h-4" />}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Enter product description"
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={formData.is_featured}
                  onChange={(e) =>
                    handleChange("is_featured", e.target.checked)
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="is_featured"
                  className="ml-2 text-sm text-gray-700 flex items-center"
                >
                  <Star className="w-4 h-4 mr-1" />
                  Featured Product
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <DollarSign className="w-5 h-5 text-green-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Pricing</h2>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (EUR) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price_eur}
                  onChange={(e) => handleChange("price_eur", e.target.value)}
                  placeholder="0.00"
                  error={errors.price_eur}
                  icon={<span className="text-green-600 font-medium">€</span>}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Primary pricing in EUR (Euro) - Required
                </p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-600">
                    Alternative Price (SYP)
                  </label>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    Optional
                  </span>
                </div>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price_syp}
                  onChange={(e) => handleChange("price_syp", e.target.value)}
                  placeholder="0.00"
                  error={errors.price_syp}
                  icon={<span className="text-gray-400">ل.س</span>}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Alternative pricing in Syrian Pound (optional)
                </p>
              </div>
            </div>

            {showCostFields && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cost (EUR)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cost_eur}
                    onChange={(e) => handleChange("cost_eur", e.target.value)}
                    placeholder="0.00"
                    icon={<span className="text-gray-500">€</span>}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cost (SYP)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cost_syp}
                    onChange={(e) => handleChange("cost_syp", e.target.value)}
                    placeholder="0.00"
                    icon={<span className="text-gray-500">₺</span>}
                  />
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Inventory */}
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <Package className="w-5 h-5 text-purple-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Inventory</h2>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity
                </label>
                <Input
                  type="number"
                  min="0"
                  value={formData.stock_quantity}
                  onChange={(e) =>
                    handleChange("stock_quantity", e.target.value)
                  }
                  placeholder="0"
                  error={errors.stock_quantity}
                  icon={<Package className="w-4 h-4" />}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Stock Level
                </label>
                <Input
                  type="number"
                  min="0"
                  value={formData.minimum_stock}
                  onChange={(e) =>
                    handleChange("minimum_stock", e.target.value)
                  }
                  placeholder="0"
                  error={errors.minimum_stock}
                  icon={<AlertTriangle className="w-4 h-4" />}
                />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Product Image */}
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <Image className="w-5 h-5 text-indigo-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">
                Product Image
              </h2>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {!imagePreview ? (
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Click to upload product image</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Supports: JPG, PNG, GIF (Max 5MB)
                  </p>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="w-full h-64 object-cover rounded-lg border"
                  />
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="bg-white shadow-md"
                      onClick={handleRemoveImage}
                      icon={<X className="w-4 h-4" />}
                    >
                      Remove
                    </Button>
                    {originalProduct?.image_url && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="bg-white shadow-md"
                        onClick={handleDeleteImage}
                        icon={<Trash2 className="w-4 h-4" />}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  icon={<Upload className="w-4 h-4" />}
                >
                  {imagePreview ? "Change Image" : "Upload Image"}
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </CardBody>
        </Card>

        {/* Additional Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <FileText className="w-5 h-5 text-orange-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">
                Additional Details
              </h2>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (grams)
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.weight_grams}
                  onChange={(e) => handleChange("weight_grams", e.target.value)}
                  placeholder="0"
                  error={errors.weight_grams}
                  icon={<Scale className="w-4 h-4" />}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shelf Life (days)
                </label>
                <Input
                  type="number"
                  min="0"
                  value={formData.shelf_life_days}
                  onChange={(e) =>
                    handleChange("shelf_life_days", e.target.value)
                  }
                  placeholder="0"
                  error={errors.shelf_life_days}
                  icon={<Calendar className="w-4 h-4" />}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Storage Conditions
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                value={formData.storage_conditions}
                onChange={(e) =>
                  handleChange("storage_conditions", e.target.value)
                }
                placeholder="Enter storage conditions"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier Information
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                value={formData.supplier_info}
                onChange={(e) => handleChange("supplier_info", e.target.value)}
                placeholder="Enter supplier information"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nutritional Information
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                value={formData.nutritional_info}
                onChange={(e) =>
                  handleChange("nutritional_info", e.target.value)
                }
                placeholder="Enter nutritional information"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allergen Information
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                value={formData.allergen_info}
                onChange={(e) => handleChange("allergen_info", e.target.value)}
                placeholder="Enter allergen information"
              />
            </div>
          </CardBody>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <Link to={`/products/${id}`}>
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            icon={
              isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )
            }
          >
            {isSubmitting ? "Updating..." : "Update Product"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditProductPage;
