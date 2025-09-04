import React, { createContext, useContext, useState, useEffect } from "react";
import { SECURITY_CONFIG, AUTH_ROUTES } from "../config/constants";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(null);

  // Check if user is locked out
  const isLockedOut = () => {
    if (!lockedUntil) return false;
    return new Date() < new Date(lockedUntil);
  };

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const userData = localStorage.getItem("userData");

        if (token && userData) {
          const parsedUser = JSON.parse(userData);

          setUser(parsedUser);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        // Clear corrupted auth data
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    if (isLockedOut()) {
      const remainingTime = Math.ceil(
        (new Date(lockedUntil) - new Date()) / 1000 / 60
      );
      return {
        success: false,
        error: `Account locked. Try again in ${remainingTime} minutes.`,
      };
    }

    setLoading(true);

    try {
      // Simulate API call - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Demo credentials
      if (email === "admin@example.com" && password === "Password@12") {
        const userData = {
          id: 1,
          email: "admin@example.com",
          name: "Admin User",
          role: "admin",
          avatar: null,
          permissions: ["read", "write", "delete", "admin"],
        };

        const token =
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YjAzMmU0ZWRhYjc2MWMwMGVhODMwZSIsImlhdCI6MTc1NjM3NzgyOCwiZXhwIjoxNzY0MTUzODI4fQ.Qe4VrVM8rqqJ76hatu1IYoBKxCfIRoa4lC4m3TX0Dgg";
        const expiry = new Date(Date.now() + SECURITY_CONFIG.sessionTimeout);

        // Store auth data
        localStorage.setItem("authToken", token);
        localStorage.setItem("userData", JSON.stringify(userData));
        localStorage.setItem("tokenExpiry", expiry.toISOString());

        setUser(userData);
        setLoginAttempts(0);
        setLockedUntil(null);

        return { success: true, user: userData };
      } else {
        // Invalid credentials
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);

        if (newAttempts >= SECURITY_CONFIG.maxLoginAttempts) {
          const lockoutEnd = new Date(
            Date.now() + SECURITY_CONFIG.lockoutDuration
          );
          setLockedUntil(lockoutEnd.toISOString());
          return {
            success: false,
            error: `Too many failed attempts. Account locked for ${
              SECURITY_CONFIG.lockoutDuration / 60000
            } minutes.`,
          };
        }

        return {
          success: false,
          error: `Invalid credentials. ${
            SECURITY_CONFIG.maxLoginAttempts - newAttempts
          } attempts remaining.`,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: "Login failed. Please try again.",
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);

    try {
      // Clear auth data
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      localStorage.removeItem("tokenExpiry");

      setUser(null);
      setLoginAttempts(0);
      setLockedUntil(null);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: "Logout failed",
      };
    } finally {
      setLoading(false);
    }
  };

  // Forgot password function
  const forgotPassword = async (email) => {
    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In real app, this would send an email with OTP
      return {
        success: true,
        message: "OTP sent to your email address",
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to send OTP. Please try again.",
      };
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP function
  const verifyOTP = async (email, otp) => {
    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Demo OTP verification (in real app, verify against backend)
      if (otp === "123456") {
        const resetToken = "demo-reset-token";
        return {
          success: true,
          token: resetToken,
        };
      } else {
        return {
          success: false,
          error: "Invalid OTP. Please try again.",
        };
      }
    } catch (error) {
      return {
        success: false,
        error: "OTP verification failed",
      };
    } finally {
      setLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (token, newPassword) => {
    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Validate password strength
      const isValidPassword = validatePassword(newPassword);
      if (!isValidPassword.valid) {
        return {
          success: false,
          error: isValidPassword.error,
        };
      }

      return {
        success: true,
        message: "Password reset successfully",
      };
    } catch (error) {
      return {
        success: false,
        error: "Password reset failed",
      };
    } finally {
      setLoading(false);
    }
  };

  // Change password function
  const changePassword = async (currentPassword, newPassword) => {
    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Validate current password (in real app, verify against backend)
      if (currentPassword !== "password") {
        return {
          success: false,
          error: "Current password is incorrect",
        };
      }

      // Validate new password strength
      const isValidPassword = validatePassword(newPassword);
      if (!isValidPassword.valid) {
        return {
          success: false,
          error: isValidPassword.error,
        };
      }

      return {
        success: true,
        message: "Password changed successfully",
      };
    } catch (error) {
      return {
        success: false,
        error: "Password change failed",
      };
    } finally {
      setLoading(false);
    }
  };

  // Password validation function
  const validatePassword = (password) => {
    if (password.length < SECURITY_CONFIG.passwordMinLength) {
      return {
        valid: false,
        error: `Password must be at least ${SECURITY_CONFIG.passwordMinLength} characters long`,
      };
    }

    if (SECURITY_CONFIG.passwordRequireUppercase && !/[A-Z]/.test(password)) {
      return {
        valid: false,
        error: "Password must contain at least one uppercase letter",
      };
    }

    if (SECURITY_CONFIG.passwordRequireLowercase && !/[a-z]/.test(password)) {
      return {
        valid: false,
        error: "Password must contain at least one lowercase letter",
      };
    }

    if (SECURITY_CONFIG.passwordRequireNumbers && !/\d/.test(password)) {
      return {
        valid: false,
        error: "Password must contain at least one number",
      };
    }

    if (
      SECURITY_CONFIG.passwordRequireSpecialChars &&
      !/[!@#$%^&*(),.?":{}|<>]/.test(password)
    ) {
      return {
        valid: false,
        error: "Password must contain at least one special character",
      };
    }

    return { valid: true };
  };

  // Check if user has permission
  const hasPermission = (permission) => {
    if (!user || !user.permissions) return false;
    return (
      user.permissions.includes(permission) ||
      user.permissions.includes("admin")
    );
  };

  // Check if user has role
  const hasRole = (role) => {
    if (!user) return false;
    return user.role === role || user.role === "admin";
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isLockedOut: isLockedOut(),
    loginAttempts,
    login,
    logout,
    forgotPassword,
    verifyOTP,
    resetPassword,
    changePassword,
    validatePassword,
    hasPermission,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
