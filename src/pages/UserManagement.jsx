import { useState, useEffect } from "react";
import {
  Edit,
  Trash2,
  Eye,
  UserPlus,
  Shield,
  ShieldOff,
  MessageSquare,
  Calendar,
  Filter,
} from "lucide-react";
import DataTable from "../components/common/DataTable";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import FilterBar from "../components/ui/FilterBar";
import Card from "../components/ui/Card";
import { useForm } from "react-hook-form";
import { formatDate, formatDateTime } from "../utils/helpers";
import { USER_ROLES, USER_STATUS } from "../config/constants";
import useGetAllUsers from "../hooks/users/useGetAllUsers";

const UserManagement = () => {
  const { totalData, totalPages, users, loading, getAllUsers } =
    useGetAllUsers();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filters, setFilters] = useState({
    role: "",
    status: "",
    dateRange: { start: "", end: "" },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const columns = [
    {
      key: "id",
      label: "ID",
    },
    {
      key: "name",
      label: "Name",

      render: (value, user) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-600 font-medium text-sm">
              {value.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{value}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (value) => (
        <Badge
          variant={
            value === "admin"
              ? "danger"
              : value === "manager"
              ? "warning"
              : "default"
          }
        >
          {value}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value, user) => (
        <div className="flex items-center space-x-2">
          <Badge
            variant={
              user.isBlocked
                ? "danger"
                : value === "active"
                ? "success"
                : "default"
            }
          >
            {user.isBlocked ? "Blocked" : value}
          </Badge>
        </div>
      ),
    },
    {
      key: "totalTransactions",
      label: "Transactions",

      render: (value, user) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-sm text-gray-500">${user.totalSpent.toFixed(2)}</p>
        </div>
      ),
    },
    {
      key: "lastLogin",
      label: "Last Login",

      render: (value) => (
        <div>
          <p className="text-sm">{formatDate(value)}</p>
          <p className="text-xs text-gray-500">
            {new Date(value).toLocaleTimeString()}
          </p>
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Joined",

      render: (value) => formatDate(value),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, user) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(user)}
            icon={<Eye className="w-4 h-4" />}
            title="View Details"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(user)}
            icon={<Edit className="w-4 h-4" />}
            title="Edit User"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleBlock(user)}
            icon={
              user.isBlocked ? (
                <Shield className="w-4 h-4" />
              ) : (
                <ShieldOff className="w-4 h-4" />
              )
            }
            title={user.isBlocked ? "Unblock User" : "Block User"}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleChat(user)}
            icon={<MessageSquare className="w-4 h-4" />}
            title="Start Chat"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(user)}
            icon={<Trash2 className="w-4 h-4" />}
            title="Delete User"
          />
        </div>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingUser(null);
    reset();
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    reset(user);
    setShowModal(true);
  };

  const handleView = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const handleToggleBlock = (user) => {
    const action = user.isBlocked ? "unblock" : "block";
    if (confirm(`Are you sure you want to ${action} ${user.name}?`)) {
      setUsers(
        users.map((u) =>
          u.id === user.id ? { ...u, isBlocked: !u.isBlocked } : u
        )
      );
    }
  };

  const handleChat = (user) => {
    // Navigate to chat or open chat modal
    alert(`Starting chat with ${user.name}`);
  };

  const handleDelete = (user) => {
    if (
      confirm(
        `Are you sure you want to delete ${user.name}? This action cannot be undone.`
      )
    ) {
      setUsers(users.filter((u) => u.id !== user.id));
    }
  };

  const onSubmit = (data) => {
    if (editingUser) {
      setUsers(
        users.map((u) => (u.id === editingUser.id ? { ...u, ...data } : u))
      );
    } else {
      const newUser = {
        ...data,
        id: Math.max(...users.map((u) => u.id)) + 1,
        createdAt: new Date().toISOString(),
        lastLogin: null,
        totalTransactions: 0,
        totalSpent: 0,
        isBlocked: false,
      };
      setUsers([...users, newUser]);
    }
    setShowModal(false);
  };

  // Filter users based on current filters
  const filteredUsers = users.filter((user) => {
    if (filters.role && user.role !== filters.role) return false;
    if (filters.status && user.status !== filters.status) return false;
    if (
      filters.dateRange.start &&
      new Date(user.createdAt) < new Date(filters.dateRange.start)
    )
      return false;
    if (
      filters.dateRange.end &&
      new Date(user.createdAt) > new Date(filters.dateRange.end)
    )
      return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Users
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {users.length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <UserPlus className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Users
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {
                  users.filter((u) => u.status === "active" && !u.isBlocked)
                    .length
                }
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Blocked Users
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {users.filter((u) => u.isBlocked).length}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <ShieldOff className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                New This Month
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {
                  users.filter((u) => {
                    const userDate = new Date(u.createdAt);
                    const now = new Date();
                    return (
                      userDate.getMonth() === now.getMonth() &&
                      userDate.getFullYear() === now.getFullYear()
                    );
                  }).length
                }
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <FilterBar
          filters={[
            {
              key: "role",
              label: "Role",
              type: "select",
              value: filters.role,
              onChange: (value) =>
                setFilters((prev) => ({ ...prev, role: value })),
              options: [
                { value: "user", label: "User" },
                { value: "manager", label: "Manager" },
                { value: "admin", label: "Admin" },
              ],
            },
            {
              key: "status",
              label: "Status",
              type: "select",
              value: filters.status,
              onChange: (value) =>
                setFilters((prev) => ({ ...prev, status: value })),
              options: [
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ],
            },
            {
              key: "startDate",
              label: "Start Date",
              type: "date",
              value: filters.dateRange.start,
              onChange: (value) =>
                setFilters((prev) => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, start: value },
                })),
            },
            {
              key: "endDate",
              label: "End Date",
              type: "date",
              value: filters.dateRange.end,
              onChange: (value) =>
                setFilters((prev) => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, end: value },
                })),
            },
          ]}
          onClear={() =>
            setFilters({
              role: "",
              status: "",
              dateRange: { start: "", end: "" },
            })
          }
        />
      </Card>

      {/* Data Table */}
      <DataTable
        title="User Management"
        data={users}
        loading={loading}
        onAdd={handleAdd}
        columns={columns}
        totalData={totalData}
        totalPages={totalPages}
        currentPage={currentPage}
        pageSize={pageSize}
        searchTerm={searchTerm}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        onSearch={setSearchTerm}
        exportable={true}
      />

      {/* Add/Edit User Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingUser ? "Edit User" : "Add New User"}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            {...register("name", { required: "Name is required" })}
            error={errors.name?.message}
          />

          <Input
            label="Email"
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Invalid email address",
              },
            })}
            error={errors.email?.message}
          />

          <Input
            label="Phone"
            {...register("phone")}
            error={errors.phone?.message}
          />

          <Input
            label="Address"
            {...register("address")}
            error={errors.address?.message}
          />

          <Select
            label="Role"
            options={[
              { value: "", label: "Select Role" },
              { value: "user", label: "User" },
              { value: "manager", label: "Manager" },
              { value: "admin", label: "Admin" },
            ]}
            {...register("role", { required: "Role is required" })}
            error={errors.role?.message}
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

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingUser ? "Update User" : "Create User"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* User Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="User Details"
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-6">
            {/* User Header */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-bold text-xl">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedUser.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedUser.email}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge
                    variant={
                      selectedUser.isBlocked
                        ? "danger"
                        : selectedUser.status === "active"
                        ? "success"
                        : "default"
                    }
                  >
                    {selectedUser.isBlocked ? "Blocked" : selectedUser.status}
                  </Badge>
                  <Badge
                    variant={
                      selectedUser.role === "admin"
                        ? "danger"
                        : selectedUser.role === "manager"
                        ? "warning"
                        : "default"
                    }
                  >
                    {selectedUser.role}
                  </Badge>
                </div>
              </div>
            </div>

            {/* User Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Contact Information
                </h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Phone
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedUser.phone || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Address
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedUser.address || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Account Statistics
                </h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Total Transactions
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedUser.totalTransactions}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Total Spent
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      ${selectedUser.totalSpent.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Member Since
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {formatDate(selectedUser.createdAt)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Last Login
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedUser.lastLogin
                        ? formatDateTime(selectedUser.lastLogin)
                        : "Never"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => handleChat(selectedUser)}
                icon={<MessageSquare className="w-4 h-4" />}
              >
                Start Chat
              </Button>
              <Button
                variant={selectedUser.isBlocked ? "success" : "danger"}
                onClick={() => {
                  handleToggleBlock(selectedUser);
                  setShowDetailModal(false);
                }}
                icon={
                  selectedUser.isBlocked ? (
                    <Shield className="w-4 h-4" />
                  ) : (
                    <ShieldOff className="w-4 h-4" />
                  )
                }
              >
                {selectedUser.isBlocked ? "Unblock User" : "Block User"}
              </Button>
              <Button
                onClick={() => {
                  setShowDetailModal(false);
                  handleEdit(selectedUser);
                }}
                icon={<Edit className="w-4 h-4" />}
              >
                Edit User
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserManagement;
