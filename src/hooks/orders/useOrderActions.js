import { useState } from "react";
import { handleError } from "../../utils/helpers";
import { api } from "../../lib/services";

const useOrderActions = () => {
  const [loading, setLoading] = useState(false);

  const getOrders = async (page, limit) => {
    setLoading(true);
    try {
      return await api.getOrders(page, limit);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const getOrdersByContact = async (contactEmail) => {
    setLoading(true);
    try {
      return await api.getOrdersByContact(contactEmail);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const getOrderById = async (id) => {
    setLoading(true);
    try {
      return await api.getOrderById(id);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrder = async (id, orderData) => {
    setLoading(true);
    try {
      await api.updateOrder(id, orderData);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return { loading, getOrders, getOrdersByContact, getOrderById, updateOrder };
};

export default useOrderActions;
