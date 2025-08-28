import { useMemo, useState } from "react";
import Select from "../components/ui/Select";
import {
  Edit,
  Trash2,
  Eye,
  Package,
  ShieldX,
  ShieldCheck,
  X,
} from "lucide-react";
import DataTable from "../components/common/DataTable";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import TextArea from "../components/ui/TextArea";
import { useForm, Controller } from "react-hook-form";
import { formatCurrency, formatDate, formatNumber } from "../utils/helpers";
import Card from "../components/ui/Card";
import useGetAllProducts from "../hooks/products/useGetAllProducts";
import { API_CONFIG } from "../config/constants";
import FilterBar from "../components/ui/FilterBar";
import useDebounce from "../hooks/global/useDebounce";
import useGetAllCategories from "../hooks/categories/useGetAllCategories";
import TagInput from "../components/ui/TagInput";



const Products = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(
    API_CONFIG.pagination.defaultPageSize
  );
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const searchDebounce = useDebounce(search);
  const [categoryId, setCategoryId] = useState("");
  const { loading, products, stats, totalPages, totalData, itemsPerPage } =
    useGetAllProducts(searchDebounce, status, currentPage, pageSize);
  const { loading: loadingCategories, categories } = useGetAllCategories(
    1,
    200
  );

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizesError, setSizesError] = useState("");
  const [colorsError, setColorsError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm();

  const productStats = useMemo(
    () => [
      {
        title: "Total Products",
        value: formatNumber(stats?.totalProducts || 0),
        icon: Package,
        color: "text-primary-600",
        bgColor: "bg-primary-600/20",
      },
      {
        title: "Active Products",
        value: formatNumber(stats?.totalActiveProducts || 0),
        icon: ShieldCheck,
        color: "text-green-600",
        bgColor: "bg-green-600/20",
      },
      {
        title: "Inactive Products",
        value: formatNumber(stats?.totalInactiveProducts || 0),
        icon: ShieldX,
        color: "text-orange-600",
        bgColor: "bg-orange-600/20",
      },
    ],
    [stats]
  );

  const columns = [
    {
      key: "_id",
      label: "ID",
      sortable: true,
    },
    {
      key: "title",
      label: "Product Name",
      sortable: true,
    },
    {
      key: "category",
      label: "Category",
      sortable: true,
      render: (value) => value.name,
    },
    {
      key: "price",
      label: "Price",
      sortable: true,
      render: (value) => formatCurrency(value),
    },
    {
      key: "sizes",
      label: "Sizes",
      render: (sizes) => (
        <div className="flex flex-wrap gap-1">
          {sizes?.slice(0, 3).map((size, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {size}
            </Badge>
          ))}
          {sizes?.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{sizes.length - 3}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "colors",
      label: "Colors",
      render: (colors) => (
        <div className="flex flex-wrap gap-1">
          {colors?.slice(0, 3).map((color, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {color}
            </Badge>
          ))}
          {colors?.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{colors.length - 3}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "isActive",
      label: "Status",
      render: (isActive) => (
        <Badge variant={isActive ? "success" : "danger"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (value) => formatDate(value),
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (_, product) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(product)}
            icon={<Eye className="w-4 h-4" />}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(product)}
            icon={<Edit className="w-4 h-4" />}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(product)}
            icon={<Trash2 className="w-4 h-4" />}
          />
        </div>
      ),
    },
  ];

  const formattedCategories = useMemo(() => {
    const formattedCategories = categories?.map((category, index) => {
      return {
        value: category.name,
        label: category.name,
      };
    });

    return [
      { value: "", label: `-- Select a Category --`, disabled: true },
      ...(formattedCategories || []),
    ];
  }, [categories]);

  const handlePageChange = (page) => {
    if (page) setCurrentPage(page);
  };

  const handlePageSizeChange = (pageSize) => {
    if (pageSize) {
      setCurrentPage(1);
      setPageSize(pageSize);
    }
  };

  const handleSearch = (search) => {
    setCurrentPage(1);
    setSearch(search);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setSizes([]);
    setColors([]);
    setSizesError("");
    setColorsError("");
    reset();
    setShowModal(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setSizes(product.sizes || []);
    setColors(product.colors || []);
    setSizesError("");
    setColorsError("");
    reset(product);
    setShowModal(true);
  };

  const handleView = (product) => {
    alert(`Viewing product: ${product.name}`);
  };

  const handleDelete = (product) => {
    if (confirm(`Are you sure you want to delete ${product.name}?`)) {
      setProducts(products.filter((p) => p.id !== product.id));
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSizes([]);
    setColors([]);
    setSizesError("");
    setColorsError("");
  };

  const onSubmit = (data) => {
    // Validate sizes and colors
    let hasErrors = false;

    if (sizes.length === 0) {
      setSizesError("At least one size is required");
      hasErrors = true;
    } else {
      setSizesError("");
    }

    if (colors.length === 0) {
      setColorsError("At least one color is required");
      hasErrors = true;
    } else {
      setColorsError("");
    }

    // If validation fails, don't submit
    if (hasErrors) {
      return;
    }

    const productData = {
      ...data,
      price: parseFloat(data.price),
      stock: parseInt(data.stock),
      sizes: sizes,
      colors: colors,
    };

    if (editingProduct) {
      setProducts(
        products.map((p) =>
          p.id === editingProduct.id ? { ...p, ...productData } : p
        )
      );
    } else {
      const newProduct = {
        ...productData,
        id: Math.max(...products.map((p) => p.id)) + 1,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setProducts([...products, newProduct]);
    }
    setShowModal(false);
    setSizes([]);
    setColors([]);
    setSizesError("");
    setColorsError("");
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {productStats?.map((stat, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <FilterBar
          filters={[
            {
              key: "status",
              label: "Status",
              type: "select",
              value: status,
              onChange: (value) => setStatus(value),
              options: [
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ],
            },
          ]}
          onClear={() => setStatus("")}
        />
      </Card>

      <div>
        <DataTable
          title="Products Management"
          loading={loading}
          data={products}
          columns={columns}
          onAdd={handleAdd}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          totalPages={totalPages}
          totalData={totalData}
          searchTerm={search}
          onSearch={(value) => handleSearch(value)}
          searchable
          exportable
        />

        <Modal
          isOpen={showModal}
          onClose={handleModalClose}
          title={editingProduct ? "Edit Product" : "Add New Product"}
          size="lg"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Product Name"
                {...register("name", { required: "Product name is required" })}
                error={errors.name?.message}
              />

              <Input
                label="Product Subtitle"
                {...register("subtitle", {
                  required: "Product subtitle is required",
                })}
                error={errors.subtitle?.message}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Price"
                type="number"
                step="0.01"
                {...register("price", {
                  required: "Price is required",
                  min: { value: 0, message: "Price must be positive" },
                })}
                error={errors.price?.message}
              />

              <Input
                label="Stock"
                type="number"
                {...register("stock", {
                  required: "Stock is required",
                  min: { value: 0, message: "Stock must be positive" },
                })}
                error={errors.stock?.message}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Category"
                options={formattedCategories}
                {...register("category", { required: "Category is required" })}
                error={errors.category?.message}
              />

              <Select
                label="Receiving Option"
                options={[
                  { value: "", label: "Select Receiving Option" },
                  { value: "delivery", label: "Delivery" },
                  { value: "pickup", label: "Pickup" },
                ]}
                {...register("receivingOptions", {
                  required: "Receiving option is required",
                })}
                error={errors.receivingOptions?.message}
              />
            </div>

            {/* Sizes and Colors Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TagInput
                label="Sizes"
                value={sizes}
                onChange={setSizes}
                placeholder="Enter size (e.g., S, M, L, XL)"
                error={sizesError}
                required={true}
              />

              <TagInput
                label="Colors"
                value={colors}
                onChange={setColors}
                placeholder="Enter color (e.g., Red, Blue, Green)"
                error={colorsError}
                required={true}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Featured"
                options={[
                  { value: false, label: "No" },
                  { value: true, label: "Yes" },
                ]}
                {...register("featured")}
                error={errors.featured?.message}
              />

              <Select
                label="Status"
                options={[
                  { value: "", label: "Select Status" },
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
                {...register("status", { required: "Status is required" })}
                error={errors.status?.message}
              />
            </div>

            <TextArea
              label="Description"
              {...register("description")}
              rows={4}
              placeholder="Enter product description"
              error={errors.description?.message}
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleModalClose}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingProduct ? "Update Product" : "Create Product"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default Products;
