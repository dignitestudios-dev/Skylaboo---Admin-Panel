import { useState } from "react";
import { handleError } from "../../utils/helpers";
import { api } from "../../lib/services";

const useProductActions = () => {
  const [loading, setLoading] = useState(false);

  const updateProduct = async (id, productData) => {
    setLoading(true);
    try {
      const response = await api.updateProduct(id, productData);
      setLoading(false);
      return response.success;
    } catch (error) {
      handleError(error);
      setLoading(false);
      return false;
    }
  };

  const deleteProduct = async (id) => {
    setLoading(true);
    try {
      await api.deleteProduct(id);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const getProductById = async (id) => {
    setLoading(true);
    try {
      return await api.getProductById(id);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return { loading, updateProduct, deleteProduct, getProductById };
};

export default useProductActions;
