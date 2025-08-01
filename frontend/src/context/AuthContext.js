import React, { createContext, useContext, useReducer, useEffect } from "react";
import { authService } from "../services/authService";

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const actionTypes = {
  SET_LOADING: "SET_LOADING",
  SET_USER: "SET_USER", 
  SET_ERROR: "SET_ERROR",
  LOGOUT: "LOGOUT",
};

const authReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case actionTypes.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case actionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case actionTypes.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    default:
      return state;
  }
};

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const initializeAuth = async () => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });

      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if (token && userStr) {
        const user = JSON.parse(userStr);
        dispatch({ type: actionTypes.SET_USER, payload: user });
      } else {
        dispatch({ type: actionTypes.SET_LOADING, payload: false });
      }
    } catch (error) {
      dispatch({
        type: actionTypes.SET_ERROR,
        payload: "Error al cargar sesión",
      });
    }
  };

  const login = async (credentials) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });

      const response = await authService.login(credentials);

      if (response.success) {
        const { user, token } = response.data;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        dispatch({ type: actionTypes.SET_USER, payload: user });
        return { success: true };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error al iniciar sesión";
      dispatch({ type: actionTypes.SET_ERROR, payload: errorMessage });
      return { success: false, message: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });

      const response = await authService.register(userData);

      if (response.success) {
        const { user, token } = response.data;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        dispatch({ type: actionTypes.SET_USER, payload: user });
        return { success: true };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error al registrar usuario";
      dispatch({ type: actionTypes.SET_ERROR, payload: errorMessage });
      return { success: false, message: errorMessage };
    }
  };

  const logout = () => {
    authService.logout();
    dispatch({ type: actionTypes.LOGOUT });
  };

  const isAdmin = () => {
    return state.user?.rol === "administrador";
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  const value = {
    ...state,
    login,
    register,
    logout,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de AuthProvider");
  }
  return context;
};
