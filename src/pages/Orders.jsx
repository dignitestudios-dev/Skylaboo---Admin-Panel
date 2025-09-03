import { useState } from "react";
import Select from "../components/ui/Select";
import { Eye, Edit, Truck, User, MapPin, Loader2 } from "lucide-react";
import DataTable from "../components/common/DataTable";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import { formatCurrency, formatDateTime } from "../utils/helpers";
import { ORDER_STATUS, PAGINATION_CONFIG } from "../config/constants";
import useOrderActions from "../hooks/orders/useOrderActions";
import useDebounce from "../hooks/global/useDebounce";
import FilterBar from "../components/ui/FilterBar";

const Orders = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGINATION_CONFIG.defaultPageSize);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [newOrderStatus, setNewOrderStatus] = useState("");

  const [search, setSearch] = useState("");
  const searchDebounce = useDebounce(search);

  const defaultFilters = {
    paymentStatus: "",
    orderStatus: "",
    orderType: "",
    startDate: "",
    endDate: "",
  };
  const [filters, setFilters] = useState(defaultFilters);

  const formattedFilters = [
    {
      key: "paymentStatus",
      label: "Payment Status",
      type: "select",
      value: filters.paymentStatus,
      onChange: (value) => setFilters({ ...filters, paymentStatus: value }),
      options: [
        { value: "paid", label: "Paid" },
        { value: "pending", label: "Pending" },
        { value: "failed", label: "Failed" },
      ],
    },
    {
      key: "orderStatus",
      label: "Order Status",
      type: "select",
      value: filters.orderStatus,
      onChange: (value) => setFilters({ ...filters, orderStatus: value }),
      options: [
        { value: "delivered", label: "Delivered" },
        { value: "shipped", label: "Shipped" },
        { value: "processing", label: "Processing" },
        { value: "confirmed", label: "Confirmed" },
        { value: "cancelled", label: "Cancelled" },
      ],
    },
    {
      key: "orderType",
      label: "Order Type",
      type: "select",
      value: filters.orderType,
      onChange: (value) => setFilters({ ...filters, orderType: value }),
      options: [
        { value: "delivery", label: "Delivery" },
        { value: "pickup", label: "Pickup" },
      ],
    },
    {
      key: "startDate",
      label: "Start Date",
      type: "date",
      value: filters.startDate,
      onChange: (value) => setFilters({ ...filters, startDate: value }),
    },
    {
      key: "endDate",
      label: "End Date",
      type: "date",
      value: filters.endDate,
      onChange: (value) => setFilters({ ...filters, endDate: value }),
    },
  ];

  const {
    orders,
    totalPages,
    totalData,
    loading,
    loadingActions,
    updateOrder,
    getOrders,
  } = useOrderActions(
    filters.paymentStatus,
    filters.orderStatus,
    filters.orderType,
    filters.startDate,
    filters.endDate,
    searchDebounce,
    currentPage,
    pageSize
  );

  const columns = [
    {
      key: "shortCode",
      label: "Order ID",

      render: (value) => (
        <span className="font-mono text-sm font-medium">{value}</span>
      ),
    },
    {
      key: "contact",
      label: "Customer Email",

      render: (value, order) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-100/30 rounded-full flex items-center justify-center">
            <span className="text-primary-600 font-medium text-sm">
              {value?.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {value?.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "products",
      label: "Items",
      render: (value) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {value?.length} item{value?.length !== 1 ? "s" : ""}
          </p>
          <p className="text-sm text-gray-500 truncate max-w-xs">
            {value
              ?.map((item) => `${item?.product?.title} (${item.quantity})`)
              .join(", ")}
          </p>
        </div>
      ),
    },
    {
      key: "totalAmount",
      label: "Total",

      render: (value) => (
        <span className="font-semibold text-gray-900 dark:text-white">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      key: "shippingCost",
      label: "Shipping Cost",

      render: (value) => (
        <span className="font-semibold text-gray-900 dark:text-white">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      key: "orderStatus",
      label: "Status",
      render: (value) => (
        <Badge
          variant={
            value === "pending"
              ? "warning"
              : value === "completed"
              ? "success"
              : value === "delivered"
              ? "success"
              : value === "shipped"
              ? "info"
              : value === "processing"
              ? "warning"
              : value === "confirmed"
              ? "info"
              : value === "cancelled"
              ? "danger"
              : "default"
          }
        >
          {value}
        </Badge>
      ),
    },
    {
      key: "paymentStatus",
      label: "Payment",
      render: (value) => (
        <Badge
          variant={
            value === "paid"
              ? "success"
              : value === "failed"
              ? "danger"
              : "warning"
          }
        >
          {value}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Order Date",

      render: (value) => (
        <div>
          <p className="text-sm">{new Date(value).toLocaleDateString()}</p>
          <p className="text-xs text-gray-500">
            {new Date(value).toLocaleTimeString()}
          </p>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, order) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(order)}
            icon={<Eye className="w-4 h-4" />}
            title="View Details"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleUpdateStatus(order)}
            icon={<Edit className="w-4 h-4" />}
            title="Update Status"
          />
        </div>
      ),
    },
  ];

  const handleView = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleUpdateStatus = (order) => {
    setEditingOrder(order);
    setNewOrderStatus(order.orderStatus); // Set current status as default
  };

  const handleStatusChange = async () => {
    if (editingOrder && newOrderStatus) {
      const success = await updateOrder(editingOrder._id, {
        orderStatus: newOrderStatus,
      });
      if (success) {
        setEditingOrder(null);
        getOrders(); // Refresh the orders list
      }
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* {orderStats?.map((stat, index) => (
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
        ))} */}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <FilterBar
          filters={formattedFilters}
          onClear={() => setFilters(defaultFilters)}
        />
      </Card>

      {/* Orders Table */}
      <DataTable
        title="Orders Management"
        data={orders}
        columns={columns}
        loading={loading}
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

      {/* Order Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Order Details"
        size="xl"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Order Header */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Order {selectedOrder.id}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Placed on {formatDateTime(selectedOrder.createdAt)}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge
                  variant={
                    selectedOrder.status === "delivered"
                      ? "success"
                      : selectedOrder.status === "shipped"
                      ? "info"
                      : selectedOrder.status === "processing"
                      ? "warning"
                      : "default"
                  }
                >
                  {selectedOrder.status}
                </Badge>
                <Select
                  value={selectedOrder.status}
                  onChange={(e) =>
                    handleStatusChange(selectedOrder.id, e.target.value)
                  }
                  options={[
                    { value: "pending", label: "Pending" },
                    { value: "confirmed", label: "Confirmed" },
                    { value: "processing", label: "Processing" },
                    { value: "shipped", label: "Shipped" },
                    { value: "delivered", label: "Delivered" },
                    { value: "cancelled", label: "Cancelled" },
                  ]}
                  className="px-2 py-1 text-sm"
                />
              </div>
            </div>

            {/* Customer & Shipping Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Customer Information
                </h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Name
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedOrder.userName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Email
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedOrder.userEmail}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Shipping Address
                </h4>
                <div className="space-y-1 text-gray-900 dark:text-white">
                  <p>{selectedOrder.shippingAddress.street}</p>
                  <p>
                    {selectedOrder.shippingAddress.city},{" "}
                    {selectedOrder.shippingAddress.state}{" "}
                    {selectedOrder.shippingAddress.zipCode}
                  </p>
                  <p>{selectedOrder.shippingAddress.country}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Order Items
              </h4>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {selectedOrder.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(item.price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                Order Summary
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Subtotal:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {formatCurrency(selectedOrder.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tax:</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatCurrency(selectedOrder.tax)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Shipping:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {formatCurrency(selectedOrder.shipping)}
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      Total:
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(selectedOrder.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Order Status Modal */}
      {editingOrder && (
        <Modal
          isOpen={!!editingOrder}
          onClose={() => setEditingOrder(null)}
          title="Update Order Status"
        >
          <div className="space-y-4">
            <p>Select a new status for the order:</p>

            <Select
              value={newOrderStatus}
              onChange={(value) => setNewOrderStatus(value)}
              options={[
                { value: "pending", label: "Pending" },
                { value: "confirmed", label: "Confirmed" },
                { value: "processing", label: "Processing" },
                { value: "shipped", label: "Shipped" },
                { value: "delivered", label: "Delivered" },
                { value: "cancelled", label: "Cancelled" },
              ]}
              disabled={loadingActions}
              error={!newOrderStatus && "Order status is required"}
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditingOrder(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleStatusChange}
                className="h-10 flex items-center gap-2"
              >
                {loadingActions ? (
                  <div className="flex items-center justify-center py-12 gap-2">
                    <Loader2 className={`animate-spin text-white`} />{" "}
                    <span className="text-white">Updating...</span>
                  </div>
                ) : (
                  "Update"
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Orders;
