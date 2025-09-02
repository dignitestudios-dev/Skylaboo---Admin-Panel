import { useState } from "react";
import { handleError } from "../../utils/helpers";
import { api } from "../../lib/services";

const useCategoryActions = () => {
  const [loading, setLoading] = useState(false);

  const updateCategory = async (id, categoryData) => {
    setLoading(true);
    try {
      await api.updateCategory(id, categoryData);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id) => {
    setLoading(true);
    try {
      await api.deleteCategory(id);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryById = async (id) => {
    setLoading(true);
    try {
      return await api.getCategoryById(id);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return { loading, updateCategory, deleteCategory, getCategoryById };
};

export default useCategoryActions;
