import { useState } from "react";
import {
  Send,
  Users,
  UserCheck,
  Bell,
  Calendar,
  Eye,
  Trash2,
  Plus,
} from "lucide-react";
import DataTable from "../components/common/DataTable";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import TextArea from "../components/ui/TextArea";
import Select from "../components/ui/Select";
import { useForm } from "react-hook-form";
import { formatDateTime } from "../utils/helpers";
import { NOTIFICATION_TYPES } from "../config/constants";

const Notifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: "NOTIF001",
      title: "Welcome to Premium!",
      message:
        "Thank you for upgrading to our premium plan. Enjoy all the new features!",
      type: "all_users",
      targetAudience: "All Users",
      recipientCount: 12543,
      sentCount: 12543,
      deliveredCount: 12340,
      openedCount: 8765,
      status: "sent",
      createdAt: "2024-01-20T10:30:00Z",
      sentAt: "2024-01-20T10:35:00Z",
      createdBy: "Admin User",
    },
    {
      id: "NOTIF002",
      title: "System Maintenance Notice",
      message:
        "We will be performing scheduled maintenance on Sunday from 2-4 AM EST.",
      type: "role_based",
      targetAudience: "Premium Users",
      recipientCount: 3456,
      sentCount: 3456,
      deliveredCount: 3445,
      openedCount: 2234,
      status: "sent",
      createdAt: "2024-01-19T14:15:00Z",
      sentAt: "2024-01-19T14:20:00Z",
      createdBy: "Admin User",
    },
    {
      id: "NOTIF003",
      title: "New Feature: Dark Mode",
      message: "We've added dark mode! Toggle it in your settings.",
      type: "specific_users",
      targetAudience: "Beta Testers",
      recipientCount: 150,
      sentCount: 0,
      deliveredCount: 0,
      openedCount: 0,
      status: "draft",
      createdAt: "2024-01-20T16:45:00Z",
      sentAt: null,
      createdBy: "Admin User",
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const watchType = watch("type");

  const columns = [
    {
      key: "id",
      label: "ID",

      render: (value) => <span className="font-mono text-sm">{value}</span>,
    },
    {
      key: "title",
      label: "Title",

      render: (value, notification) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{value}</p>
          <p className="text-sm text-gray-500 truncate max-w-xs">
            {notification.message}
          </p>
        </div>
      ),
    },
    {
      key: "targetAudience",
      label: "Audience",
      render: (value, notification) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{value}</p>
          <p className="text-sm text-gray-500">
            {notification.recipientCount.toLocaleString()} recipients
          </p>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <Badge
          variant={
            value === "sent"
              ? "success"
              : value === "draft"
              ? "warning"
              : value === "scheduled"
              ? "info"
              : "default"
          }
        >
          {value}
        </Badge>
      ),
    },
    {
      key: "deliveredCount",
      label: "Delivery Stats",
      render: (value, notification) => (
        <div className="text-sm">
          <p className="text-gray-900 dark:text-white">
            Delivered: {notification.deliveredCount.toLocaleString()}
          </p>
          <p className="text-gray-500">
            Opened: {notification.openedCount.toLocaleString()}(
            {notification.deliveredCount > 0
              ? Math.round(
                  (notification.openedCount / notification.deliveredCount) * 100
                )
              : 0}
            %)
          </p>
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Created",

      render: (value, notification) => (
        <div>
          <p className="text-sm">{new Date(value).toLocaleDateString()}</p>
          <p className="text-xs text-gray-500">
            {notification.sentAt
              ? `Sent: ${new Date(notification.sentAt).toLocaleDateString()}`
              : "Not sent"}
          </p>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, notification) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(notification)}
            icon={<Eye className="w-4 h-4" />}
            title="View Details"
          />
          {notification.status === "draft" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSend(notification)}
              icon={<Send className="w-4 h-4" />}
              title="Send Notification"
            />
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(notification)}
            icon={<Trash2 className="w-4 h-4" />}
            title="Delete"
          />
        </div>
      ),
    },
  ];

  const handleCreate = () => {
    reset();
    setShowCreateModal(true);
  };

  const handleView = (notification) => {
    setSelectedNotification(notification);
    setShowDetailModal(true);
  };

  const handleSend = (notification) => {
    if (
      confirm(
        `Send notification "${notification.title}" to ${notification.recipientCount} recipients?`
      )
    ) {
      const updatedNotifications = notifications.map((n) =>
        n.id === notification.id
          ? {
              ...n,
              status: "sent",
              sentAt: new Date().toISOString(),
              sentCount: n.recipientCount,
              deliveredCount: Math.floor(n.recipientCount * 0.98), // 98% delivery rate
              openedCount: Math.floor(n.recipientCount * 0.65), // 65% open rate
            }
          : n
      );
      setNotifications(updatedNotifications);
    }
  };

  const handleDelete = (notification) => {
    if (confirm(`Delete notification "${notification.title}"?`)) {
      setNotifications(notifications.filter((n) => n.id !== notification.id));
    }
  };

  const onSubmit = (data) => {
    const newNotification = {
      ...data,
      id: `NOTIF${String(notifications.length + 1).padStart(3, "0")}`,
      recipientCount:
        data.type === "all_users"
          ? 12543
          : data.type === "role_based"
          ? 3456
          : 150,
      sentCount: 0,
      deliveredCount: 0,
      openedCount: 0,
      status: "draft",
      createdAt: new Date().toISOString(),
      sentAt: null,
      createdBy: "Admin User",
      targetAudience:
        data.type === "all_users"
          ? "All Users"
          : data.type === "role_based"
          ? data.roleTarget || "Premium Users"
          : data.specificTarget || "Selected Users",
    };

    setNotifications([newNotification, ...notifications]);
    setShowCreateModal(false);
  };

  // Calculate stats
  const totalSent = notifications.filter((n) => n.status === "sent").length;
  const totalDrafts = notifications.filter((n) => n.status === "draft").length;
  const totalRecipients = notifications.reduce(
    (sum, n) => sum + (n.sentCount || 0),
    0
  );
  const totalOpened = notifications.reduce(
    (sum, n) => sum + (n.openedCount || 0),
    0
  );
  const avgOpenRate =
    totalRecipients > 0 ? Math.round((totalOpened / totalRecipients) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Sent
              </p>
              <p className="text-2xl font-bold text-green-600">{totalSent}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Send className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Drafts
              </p>
              <p className="text-2xl font-bold text-yellow-600">
                {totalDrafts}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Bell className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Recipients
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {totalRecipients.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Avg. Open Rate
              </p>
              <p className="text-2xl font-bold text-purple-600">
                {avgOpenRate}%
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Eye className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Notifications Table */}
      <DataTable
        title="Push Notifications"
        data={notifications}
        columns={columns}
        onAdd={handleCreate}
        searchable={true}
        filterable={true}
        exportable={true}
      />

      {/* Create Notification Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Push Notification"
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Notification Title"
            {...register("title", { required: "Title is required" })}
            error={errors.title?.message}
            placeholder="Enter notification title"
          />

          <TextArea
            label="Message"
            {...register("message", { required: "Message is required" })}
            rows={4}
            placeholder="Enter notification message"
            error={errors.message?.message}
          />

          <Select
            label="Target Audience"
            options={[
              { value: "", label: "Select Target Audience" },
              { value: "all_users", label: "All Users" },
              { value: "role_based", label: "Role-based" },
              { value: "specific_users", label: "Specific Users" },
            ]}
            {...register("type", { required: "Target audience is required" })}
            error={errors.type?.message}
            placeholder="Select Target Audience"
          />

          {watchType === "role_based" && (
            <Select
              label="Select Role"
              options={[
                { value: "premium_users", label: "Premium Users" },
                { value: "basic_users", label: "Basic Users" },
                { value: "trial_users", label: "Trial Users" },
                { value: "inactive_users", label: "Inactive Users" },
              ]}
              {...register("roleTarget")}
              placeholder="Select Role"
            />
          )}

          {watchType === "specific_users" && (
            <Input
              label="Specific Target Description"
              {...register("specificTarget")}
              placeholder="e.g., Beta Testers, VIP Users, etc."
            />
          )}

          <Input
            label="Schedule (Optional)"
            type="datetime-local"
            {...register("scheduledAt")}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave empty to save as draft
          </p>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Notification</Button>
          </div>
        </form>
      </Modal>

      {/* Notification Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Notification Details"
        size="lg"
      >
        {selectedNotification && (
          <div className="space-y-6">
            {/* Notification Header */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedNotification.title}
                </h3>
                <Badge
                  variant={
                    selectedNotification.status === "sent"
                      ? "success"
                      : selectedNotification.status === "draft"
                      ? "warning"
                      : "info"
                  }
                >
                  {selectedNotification.status}
                </Badge>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                {selectedNotification.message}
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>Target: {selectedNotification.targetAudience}</span>
                <span>•</span>
                <span>
                  Recipients:{" "}
                  {selectedNotification.recipientCount.toLocaleString()}
                </span>
                <span>•</span>
                <span>
                  Created: {formatDateTime(selectedNotification.createdAt)}
                </span>
              </div>
            </div>

            {/* Stats Grid */}
            {selectedNotification.status === "sent" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedNotification.sentCount.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Sent
                    </p>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {selectedNotification.deliveredCount.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Delivered (
                      {Math.round(
                        (selectedNotification.deliveredCount /
                          selectedNotification.sentCount) *
                          100
                      )}
                      %)
                    </p>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {selectedNotification.openedCount.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Opened (
                      {Math.round(
                        (selectedNotification.openedCount /
                          selectedNotification.deliveredCount) *
                          100
                      )}
                      %)
                    </p>
                  </div>
                </Card>
              </div>
            )}

            {/* Timeline */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Timeline
              </h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Notification Created</p>
                    <p className="text-xs text-gray-500">
                      {formatDateTime(selectedNotification.createdAt)}
                    </p>
                  </div>
                </div>
                {selectedNotification.sentAt && (
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Notification Sent</p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(selectedNotification.sentAt)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              {selectedNotification.status === "draft" && (
                <Button
                  onClick={() => {
                    handleSend(selectedNotification);
                    setShowDetailModal(false);
                  }}
                  icon={<Send className="w-4 h-4" />}
                >
                  Send Now
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Notifications;
