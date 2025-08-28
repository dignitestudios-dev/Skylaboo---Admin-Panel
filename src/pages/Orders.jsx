import { useState } from 'react'
import Select from '../components/ui/Select'
import Input from '../components/ui/Input'
import { Eye, Edit, Truck, Package, CheckCircle, XCircle, Calendar, User, MapPin } from 'lucide-react'
import DataTable from '../components/common/DataTable'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import { formatCurrency, formatDateTime } from '../utils/helpers'
import { ORDER_STATUS } from '../config/constants'

const Orders = () => {
  const [orders, setOrders] = useState([
    {
      id: 'ORD001',
      userId: 1,
      userName: 'John Doe',
      userEmail: 'john@example.com',
      items: [
        { id: 1, name: 'iPhone 14 Pro', quantity: 1, price: 999.99 },
        { id: 2, name: 'AirPods Pro', quantity: 1, price: 249.99 }
      ],
      subtotal: 1249.98,
      tax: 99.99,
      shipping: 15.00,
      total: 1364.97,
      status: 'processing',
      paymentStatus: 'paid',
      shippingAddress: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      },
      trackingNumber: 'TRK123456789',
      createdAt: '2024-01-20T10:30:00Z',
      updatedAt: '2024-01-20T14:22:00Z',
      estimatedDelivery: '2024-01-25T00:00:00Z'
    },
    {
      id: 'ORD002',
      userId: 2,
      userName: 'Jane Smith',
      userEmail: 'jane@example.com',
      items: [
        { id: 3, name: 'MacBook Pro', quantity: 1, price: 2499.99 }
      ],
      subtotal: 2499.99,
      tax: 199.99,
      shipping: 0.00,
      total: 2699.98,
      status: 'shipped',
      paymentStatus: 'paid',
      shippingAddress: {
        street: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        country: 'USA'
      },
      trackingNumber: 'TRK987654321',
      createdAt: '2024-01-19T09:15:00Z',
      updatedAt: '2024-01-21T11:30:00Z',
      estimatedDelivery: '2024-01-24T00:00:00Z'
    },
    {
      id: 'ORD003',
      userId: 3,
      userName: 'Bob Johnson',
      userEmail: 'bob@example.com',
      items: [
        { id: 4, name: 'iPad Air', quantity: 2, price: 599.99 }
      ],
      subtotal: 1199.98,
      tax: 95.99,
      shipping: 10.00,
      total: 1305.97,
      status: 'delivered',
      paymentStatus: 'paid',
      shippingAddress: {
        street: '789 Pine St',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'USA'
      },
      trackingNumber: 'TRK456789123',
      createdAt: '2024-01-15T16:45:00Z',
      updatedAt: '2024-01-22T09:15:00Z',
      estimatedDelivery: '2024-01-22T00:00:00Z'
    }
  ])

  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [filters, setFilters] = useState({
    status: '',
    paymentStatus: '',
    dateRange: { start: '', end: '' }
  })

  const columns = [
    {
      key: 'id',
      label: 'Order ID',
      sortable: true,
      render: (value) => (
        <span className="font-mono text-sm font-medium">{value}</span>
      )
    },
    {
      key: 'userName',
      label: 'Customer',
      sortable: true,
      render: (value, order) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-600 font-medium text-sm">
              {value.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{value}</p>
            <p className="text-sm text-gray-500">{order.userEmail}</p>
          </div>
        </div>
      )
    },
    {
      key: 'items',
      label: 'Items',
      render: (value) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {value.length} item{value.length !== 1 ? 's' : ''}
          </p>
          <p className="text-sm text-gray-500 truncate max-w-xs">
            {value.map(item => `${item.name} (${item.quantity})`).join(', ')}
          </p>
        </div>
      )
    },
    {
      key: 'total',
      label: 'Total',
      sortable: true,
      render: (value) => (
        <span className="font-semibold text-gray-900 dark:text-white">
          {formatCurrency(value)}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <Badge variant={
          value === 'delivered' ? 'success' :
          value === 'shipped' ? 'info' :
          value === 'processing' ? 'warning' :
          value === 'confirmed' ? 'info' :
          value === 'cancelled' ? 'danger' :
          'default'
        }>
          {value}
        </Badge>
      )
    },
    {
      key: 'paymentStatus',
      label: 'Payment',
      render: (value) => (
        <Badge variant={value === 'paid' ? 'success' : 'warning'}>
          {value}
        </Badge>
      )
    },
    {
      key: 'createdAt',
      label: 'Order Date',
      sortable: true,
      render: (value) => (
        <div>
          <p className="text-sm">{new Date(value).toLocaleDateString()}</p>
          <p className="text-xs text-gray-500">{new Date(value).toLocaleTimeString()}</p>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
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
          {order.trackingNumber && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleTrackOrder(order)}
              icon={<Truck className="w-4 h-4" />}
              title="Track Order"
            />
          )}
        </div>
      )
    }
  ]

  const handleView = (order) => {
    setSelectedOrder(order)
    setShowDetailModal(true)
  }

  const handleUpdateStatus = (order) => {
    const newStatus = prompt('Enter new status (pending, confirmed, processing, shipped, delivered, cancelled):')
    if (newStatus && Object.values(ORDER_STATUS).includes(newStatus)) {
      setOrders(orders.map(o => 
        o.id === order.id 
          ? { ...o, status: newStatus, updatedAt: new Date().toISOString() }
          : o
      ))
    }
  }

  const handleTrackOrder = (order) => {
    alert(`Tracking order ${order.id} with tracking number: ${order.trackingNumber}`)
  }

  const handleStatusChange = (orderId, newStatus) => {
    setOrders(orders.map(o => 
      o.id === orderId 
        ? { ...o, status: newStatus, updatedAt: new Date().toISOString() }
        : o
    ))
  }

  // Calculate stats
  const totalOrders = orders.length
  const pendingOrders = orders.filter(o => o.status === 'pending').length
  const processingOrders = orders.filter(o => o.status === 'processing').length
  const shippedOrders = orders.filter(o => o.status === 'shipped').length
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)

  // Filter orders
  const filteredOrders = orders.filter(order => {
    if (filters.status && order.status !== filters.status) return false
    if (filters.paymentStatus && order.paymentStatus !== filters.paymentStatus) return false
    if (filters.dateRange.start && new Date(order.createdAt) < new Date(filters.dateRange.start)) return false
    if (filters.dateRange.end && new Date(order.createdAt) > new Date(filters.dateRange.end)) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-4 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalOrders}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Processing</p>
              <p className="text-2xl font-bold text-yellow-600">{processingOrders}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Package className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Shipped</p>
              <p className="text-2xl font-bold text-blue-600">{shippedOrders}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Truck className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center space-x-4 flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
          
          <Select
            value={filters.status}
            onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
            options={[
              { value: '', label: 'All Status' },
              { value: 'pending', label: 'Pending' },
              { value: 'confirmed', label: 'Confirmed' },
              { value: 'processing', label: 'Processing' },
              { value: 'shipped', label: 'Shipped' },
              { value: 'delivered', label: 'Delivered' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
            className="px-3 py-1 text-sm"
          />
          
          <Select
            value={filters.paymentStatus}
            onChange={e => setFilters(prev => ({ ...prev, paymentStatus: e.target.value }))}
            options={[
              { value: '', label: 'All Payment Status' },
              { value: 'paid', label: 'Paid' },
              { value: 'pending', label: 'Pending' },
              { value: 'failed', label: 'Failed' },
            ]}
            className="px-3 py-1 text-sm"
          />
          
          <Input
            type="date"
            value={filters.dateRange.start}
            onChange={(e) => setFilters(prev => ({ 
              ...prev, 
              dateRange: { ...prev.dateRange, start: e.target.value }
            }))}
            className="px-3 py-1 text-sm"
          />
          
          <Input
            type="date"
            value={filters.dateRange.end}
            onChange={(e) => setFilters(prev => ({ 
              ...prev, 
              dateRange: { ...prev.dateRange, end: e.target.value }
            }))}
            className="px-3 py-1 text-sm"
          />
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilters({ status: '', paymentStatus: '', dateRange: { start: '', end: '' } })}
          >
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Orders Table */}
      <DataTable
        title="Orders Management"
        data={filteredOrders}
        columns={columns}
        searchable={true}
        filterable={false}
        exportable={true}
        addButton={false}
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
                <Badge variant={
                  selectedOrder.status === 'delivered' ? 'success' :
                  selectedOrder.status === 'shipped' ? 'info' :
                  selectedOrder.status === 'processing' ? 'warning' :
                  'default'
                }>
                  {selectedOrder.status}
                </Badge>
                <Select
                  value={selectedOrder.status}
                  onChange={e => handleStatusChange(selectedOrder.id, e.target.value)}
                  options={[
                    { value: 'pending', label: 'Pending' },
                    { value: 'confirmed', label: 'Confirmed' },
                    { value: 'processing', label: 'Processing' },
                    { value: 'shipped', label: 'Shipped' },
                    { value: 'delivered', label: 'Delivered' },
                    { value: 'cancelled', label: 'Cancelled' },
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
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="text-gray-900 dark:text-white">{selectedOrder.userName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900 dark:text-white">{selectedOrder.userEmail}</p>
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
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}
                  </p>
                  <p>{selectedOrder.shippingAddress.country}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">Order Items</h4>
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
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Order Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                  <span className="text-gray-900 dark:text-white">{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tax:</span>
                  <span className="text-gray-900 dark:text-white">{formatCurrency(selectedOrder.tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Shipping:</span>
                  <span className="text-gray-900 dark:text-white">{formatCurrency(selectedOrder.shipping)}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900 dark:text-white">Total:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tracking Information */}
            {selectedOrder.trackingNumber && (
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                  <Truck className="w-4 h-4 mr-2" />
                  Tracking Information
                </h4>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                        Tracking Number: {selectedOrder.trackingNumber}
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-400">
                        Estimated Delivery: {new Date(selectedOrder.estimatedDelivery).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTrackOrder(selectedOrder)}
                      icon={<Truck className="w-4 h-4" />}
                    >
                      Track Package
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Orders
