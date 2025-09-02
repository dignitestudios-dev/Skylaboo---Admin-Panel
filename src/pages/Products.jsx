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
  Loader2,
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
import { API_CONFIG, PAGINATION_CONFIG } from "../config/constants";
import FilterBar from "../components/ui/FilterBar";
import useDebounce from "../hooks/global/useDebounce";
import useGetAllCategories from "../hooks/categories/useGetAllCategories";
import TagInput from "../components/ui/TagInput";
import useProductActions from "../hooks/products/useProductActions";
import useCreateProduct from "../hooks/products/useCreateProduct";
import ImageUploader from "../components/ui/ImageUploader";

const Products = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGINATION_CONFIG.defaultPageSize);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const searchDebounce = useDebounce(search);
  const { loading, products, stats, totalPages, totalData, getAllProducts } =
    useGetAllProducts(searchDebounce, status, currentPage, pageSize);
  const { loading: loadingCreateProduct, createProduct } = useCreateProduct();
  const { loading: loadingUpdateProduct, updateProduct } = useProductActions();
  const { loading: loadingCategories, categories } = useGetAllCategories(
    1,
    200
  );

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    clearErrors, // Add this
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
      key: "stock",
      label: "Stock",
      sortable: true,
      render: (value) => {
        return value ? formatNumber(value) : "N/A";
      },
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

  // For the FilterBar fix, update your formattedCategories to include the category ID:
  const formattedCategories = useMemo(() => {
    const formattedCategories = categories?.map((category) => {
      return {
        value: category._id, // Use _id instead of name for the value
        label: category.name,
      };
    });

    return [
      { value: "", label: `-- Select a Category --` },
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
    reset();
    setShowModal(true);
  };

  const handleEdit = (product) => {
    const receivingOptions =
      product?.receivingOptions == ["delivery"]
        ? "delivery"
        : product?.receivingOptions == ["pickup"]
        ? "pickup"
        : "both";

    const formattedProduct = {
      ...product,
      receivingOptions: receivingOptions,
      category: product.category._id,
      isActive: JSON.stringify(product.isActive), // Convert boolean to string
    };

    console.log("editing formattedProduct: ", formattedProduct);

    setEditingProduct(formattedProduct);

    reset(formattedProduct);
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
    reset();
  };

  const onSubmit = async (data) => {
    // const formData = new FormData();
    // Object.keys(data).forEach((key) => {
    //   if (key === "images") {
    //     data[key].forEach((image) => formData.append("images", image));
    //   } else {
    //     formData.append(key, data[key]);
    //   }
    // });

    const receivingOptions =
      data.receivingOptions === "delivery"
        ? ["delivery"]
        : data.receivingOptions === "pickup"
        ? ["pickup"]
        : data.receivingOptions === "both"
        ? ["delivery", "pickup"]
        : [];

    const payload = {
      ...data,
      receivingOptions: receivingOptions,
      isActive: JSON.parse(data.isActive), // Convert string to boolean
    };

    try {
      if (editingProduct) {
        const productId = editingProduct._id;

        const {
          _id,
          images,
          createdAt,
          updatedAt,
          __v,
          ...editProductPayload
        } = payload;

        console.log("editProductPayload: ", editProductPayload);

        const success = await updateProduct(productId, editProductPayload);
        if (success) {
          reset();
          setShowModal(false);
          getAllProducts();
        }
      } else {
        const success = await createProduct(payload);
        if (success) {
          reset();
          setShowModal(false);
          getAllProducts();
        }
      }
    } catch (error) {
      console.error("Error creating product:", error);
    }
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
              onChange: setStatus,
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
                {...register("title", { required: "Product name is required" })}
                disabled={loadingCreateProduct}
                error={errors.title?.message}
              />

              <Input
                label="Product Subtitle"
                {...register("subtitle", {
                  required: "Product subtitle is required",
                })}
                disabled={loadingCreateProduct}
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
                disabled={loadingCreateProduct}
                error={errors.price?.message}
              />

              <Input
                label="Stock"
                type="number"
                {...register("stock", {
                  required: "Stock is required",
                  min: { value: 0, message: "Stock must be positive" },
                })}
                disabled={loadingCreateProduct}
                error={errors.stock?.message}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="category"
                control={control}
                disabled={loadingCreateProduct}
                defaultValue=""
                rules={{ required: "Category is required" }}
                render={({ field, fieldState }) => (
                  <Select
                    label="Category"
                    loading={loadingCategories}
                    searchable
                    options={formattedCategories}
                    value={field.value || ""}
                    onChange={(value) => {
                      field.onChange(value);
                      // Clear the error when a value is selected
                      if (value) {
                        clearErrors("category");
                      }
                    }}
                    disabled={loadingCreateProduct}
                    error={fieldState.error?.message}
                  />
                )}
              />

              <Controller
                name="receivingOptions"
                control={control}
                disabled={loadingCreateProduct}
                defaultValue=""
                rules={{ required: "Receiving option is required" }}
                render={({ field, fieldState }) => (
                  <Select
                    label="Receiving Option"
                    options={[
                      { value: "", label: "Select Receiving Option" },
                      { value: "delivery", label: "Delivery" },
                      { value: "pickup", label: "Pickup" },
                      { value: "both", label: "Both Pickup and Delivery" },
                    ]}
                    value={field.value || ""}
                    onChange={(value) => {
                      field.onChange(value);
                      // Clear the error when a value is selected
                      if (value) {
                        clearErrors("receivingOptions");
                      }
                    }}
                    disabled={loadingCreateProduct}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </div>

            {/* Sizes and Colors Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="sizes"
                control={control}
                disabled={loadingCreateProduct}
                defaultValue=""
                rules={{ required: "Size is required" }}
                render={({ field, fieldState }) => (
                  <TagInput
                    label="Sizes"
                    value={field.value || ""}
                    onChange={(value) => {
                      field.onChange(value);

                      // Clear the error when a value is selected
                      if (value) {
                        clearErrors("sizes");
                      }
                    }}
                    placeholder="Enter size (e.g., S, M, L, XL)"
                    error={fieldState.error?.message}
                    disabled={loadingCreateProduct}
                    required={true}
                  />
                )}
              />
              <Controller
                name="colors"
                control={control}
                disabled={loadingCreateProduct}
                defaultValue=""
                rules={{ required: "Color is required" }}
                render={({ field, fieldState }) => (
                  <TagInput
                    label="Colors"
                    value={field.value || ""}
                    onChange={(value) => {
                      field.onChange(value);

                      // Clear the error when a value is selected
                      if (value) {
                        clearErrors("colors");
                      }
                    }}
                    disabled={loadingCreateProduct}
                    placeholder="Enter color (e.g., Red, Blue, Green)"
                    error={fieldState.error?.message}
                    required={true}
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="isFeatured"
                control={control}
                disabled={loadingCreateProduct}
                defaultValue={false}
                render={({ field, fieldState }) => (
                  <Select
                    label="Featured"
                    options={[
                      { value: false, label: "No" },
                      { value: true, label: "Yes" },
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                    disabled={loadingCreateProduct}
                    error={fieldState.error?.message}
                  />
                )}
              />

              <Controller
                name="isActive"
                control={control}
                disabled={loadingCreateProduct}
                defaultValue=""
                rules={{ required: "Status is required" }}
                render={({ field, fieldState }) => (
                  <Select
                    label="Status"
                    options={[
                      { value: "", label: "Select Status" },
                      { value: "true", label: "Active" },
                      { value: "false", label: "Inactive" },
                    ]}
                    value={field.value || ""}
                    onChange={(value) => {
                      field.onChange(value);
                      // Clear the error when a value is selected
                      if (value) {
                        clearErrors("isActive");
                      }
                    }}
                    disabled={loadingCreateProduct}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </div>

            <TextArea
              label="Description"
              {...register("description", {
                required: "Product description is required",
              })}
              rows={4}
              placeholder="Enter product description"
              error={errors.description?.message}
              disabled={loadingCreateProduct}
            />

            {/* Image Uploader */}
            <Controller
              name="images"
              control={control}
              defaultValue={[]}
              render={({ field: { onChange, value }, fieldState }) => (
                <ImageUploader
                  onChange={(files) => onChange(files)}
                  value={value}
                  label="Product Images"
                  error={fieldState.error?.message}
                  disabled={loadingCreateProduct}
                />
              )}
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                disabled={loadingCreateProduct}
                onClick={handleModalClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-10 flex items-center gap-2"
                disabled={loadingCreateProduct || loadingUpdateProduct}
              >
                {loadingCreateProduct ? (
                  <div className="flex items-center justify-center py-12 gap-2">
                    <Loader2 className={`animate-spin text-white`} />{" "}
                    <span className="text-white">Creating...</span>
                  </div>
                ) : loadingUpdateProduct ? (
                  <div className="flex items-center justify-center py-12 gap-2">
                    <Loader2 className={`animate-spin text-white`} />{" "}
                    <span className="text-white">Updating...</span>
                  </div>
                ) : editingProduct ? (
                  "Update Product"
                ) : (
                  "Create Product"
                )}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default Products;
