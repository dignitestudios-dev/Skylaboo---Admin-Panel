import { useState } from "react";
import { handleError } from "../../utils/helpers";
import { api } from "../../lib/services";

const useCreateCategory = () => {
  const [loading, setLoading] = useState(false);

  const createCategory = async (categoryData) => {
    setLoading(true);
    try {
      await api.createCategory(categoryData);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return { loading, createCategory };
};

export default useCreateCategory;
