"use client"

import { createContext, useContext, useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import axios from "axios"
import { API_BASE_URL } from "@env"
import { useAuth } from "./AuthContext"

// Initial state
const initialState = {
  fragrances: [],
  filteredFragrances: [],
  loading: false,
  error: null,
  filters: {
    category: null,
    brand: null,
    gender: null,
    concentration: null,
    minRating: null,
    search: "",
  },
  currentFragrance: null,
  pagination: {
    page: 1,
    limit: 20,
    totalPages: 1,
    hasMore: true,
  },
}

// Create context
export const FragranceContext = createContext()

// Provider component
export const FragranceProvider = ({ children }) => {
  const [state, setState] = useState(initialState)
  const { token, isAuthenticated } = useAuth()

  // Debug: Log the API_BASE_URL
  useEffect(() => {
    console.log("FragranceContext - API_BASE_URL:", API_BASE_URL)
    if (!API_BASE_URL) {
      console.error("API_BASE_URL is not defined in environment variables")
    }
  }, [])

  // Cache management
  const cacheFragrances = async (fragranceData) => {
    try {
      await AsyncStorage.setItem(
        "cachedFragrances",
        JSON.stringify({
          data: fragranceData,
          timestamp: Date.now(),
        }),
      )
      console.log("Fragrances cached successfully")
    } catch (err) {
      console.error("Error caching fragrances:", err)
    }
  }

  const getCachedFragrances = async () => {
    try {
      const cached = await AsyncStorage.getItem("cachedFragrances")
      if (cached) {
        const { data, timestamp } = JSON.parse(cached)
        // Cache valid for 5 minutes
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          console.log("Using cached fragrances")
          return data
        }
      }
      return null
    } catch (err) {
      console.error("Error getting cached fragrances:", err)
      return null
    }
  }

  // Fetch fragrances with optional filters
  const fetchFragrances = async (page = 1, resetList = false) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      console.log("Fetching fragrances...")
      console.log("API URL:", `${API_BASE_URL}/api/fragrances`)
      console.log("Filters:", state.filters)
      console.log("Page:", page)

      if (!API_BASE_URL) {
        throw new Error("API_BASE_URL is not configured. Please check your .env file.")
      }

      // Build query params
      const params = new URLSearchParams()
      if (state.filters.category) params.append("category", state.filters.category)
      if (state.filters.brand) params.append("brand", state.filters.brand)
      if (state.filters.gender) params.append("gender", state.filters.gender)
      if (state.filters.concentration) params.append("concentration", state.filters.concentration)
      if (state.filters.minRating) params.append("minRating", state.filters.minRating)
      if (state.filters.search) params.append("search", state.filters.search)
      params.append("page", page)
      params.append("limit", state.pagination.limit)

      const response = await axios.get(`${API_BASE_URL}/api/fragrances?${params.toString()}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        timeout: 10000,
      })

      console.log("Fragrances fetched successfully:", response.data.length)

      const newFragrances = response.data || []

      setState((prev) => ({
        ...prev,
        fragrances: resetList || page === 1 ? newFragrances : [...prev.fragrances, ...newFragrances],
        pagination: {
          ...prev.pagination,
          page,
          hasMore: newFragrances.length === state.pagination.limit,
        },
      }))

      // Cache only if no filters applied
      if (!hasActiveFilters()) {
        await cacheFragrances(newFragrances)
      }

      return { success: true, data: newFragrances }
    } catch (err) {
      console.error("Failed to fetch fragrances:", err.response?.data || err.message)

      let errorMessage = "Failed to fetch fragrances"

      if (err.code === "ECONNABORTED") {
        errorMessage = "Request timeout. Please check your internet connection."
      } else if (err.code === "NETWORK_ERROR" || err.message.includes("Network Error")) {
        errorMessage = "Network error. Please check your internet connection."
        // Try to load cached data on network error
        const cached = await getCachedFragrances()
        if (cached && page === 1) {
          setState((prev) => ({ ...prev, fragrances: cached }))
          return { success: true, data: cached, fromCache: true }
        }
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.message) {
        errorMessage = err.message
      }

      setState((prev) => ({ ...prev, error: errorMessage }))
      return { success: false, error: errorMessage }
    } finally {
      setState((prev) => ({ ...prev, loading: false }))
    }
  }

  // Get fragrance by ID
  const getFragranceById = async (id) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      console.log("Fetching fragrance by ID:", id)

      if (!API_BASE_URL) {
        throw new Error("API_BASE_URL is not configured. Please check your .env file.")
      }

      const response = await axios.get(`${API_BASE_URL}/api/fragrances/${id}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        timeout: 10000,
      })

      console.log("Fragrance details fetched successfully:", response.data)

      const fragranceData = response.data
      setState((prev) => ({ ...prev, currentFragrance: fragranceData }))

      return { success: true, data: fragranceData }
    } catch (err) {
      console.error("Failed to fetch fragrance details:", err.response?.data || err.message)

      let errorMessage = "Failed to fetch fragrance details"

      if (err.code === "ECONNABORTED") {
        errorMessage = "Request timeout. Please check your internet connection."
      } else if (err.code === "NETWORK_ERROR" || err.message.includes("Network Error")) {
        errorMessage = "Network error. Please check your internet connection."
      } else if (err.response?.status === 404) {
        errorMessage = "Fragrance not found"
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.message) {
        errorMessage = err.message
      }

      setState((prev) => ({ ...prev, error: errorMessage }))
      return { success: false, error: errorMessage }
    } finally {
      setState((prev) => ({ ...prev, loading: false }))
    }
  }

  // Update fragrance rating
  const updateRating = async (id, rating) => {
    if (!isAuthenticated) {
      setState((prev) => ({ ...prev, error: "Please login to rate fragrances" }))
      return { success: false, error: "Authentication required" }
    }

    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      console.log("Updating fragrance rating:", { id, rating })

      const response = await axios.put(
        `${API_BASE_URL}/api/fragrances/${id}/rating`,
        { rating },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000,
        },
      )

      console.log("Rating updated successfully:", response.data)

      const updatedFragrance = response.data

      // Update in current fragrance if it's the same
      if (state.currentFragrance?._id === id) {
        setState((prev) => ({ ...prev, currentFragrance: updatedFragrance }))
      }

      // Update in fragrances list
      setState((prev) => ({
        ...prev,
        fragrances: prev.fragrances.map((fragrance) => (fragrance._id === id ? updatedFragrance : fragrance)),
      }))

      return { success: true, data: updatedFragrance }
    } catch (err) {
      console.error("Failed to update rating:", err.response?.data || err.message)

      let errorMessage = "Failed to update rating"

      if (err.response?.status === 401) {
        errorMessage = "Please login to rate fragrances"
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.message) {
        errorMessage = err.message
      }

      setState((prev) => ({ ...prev, error: errorMessage }))
      return { success: false, error: errorMessage }
    } finally {
      setState((prev) => ({ ...prev, loading: false }))
    }
  }

  // Create fragrance (admin only)
  const createFragrance = async (fragranceData) => {
    if (!isAuthenticated) {
      setState((prev) => ({ ...prev, error: "Please login to create fragrances" }))
      return { success: false, error: "Authentication required" }
    }

    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      console.log("Creating fragrance:", fragranceData)

      const response = await axios.post(`${API_BASE_URL}/api/fragrances`, fragranceData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        timeout: 15000,
      })

      console.log("Fragrance created successfully:", response.data)

      const newFragrance = response.data

      // Add to fragrances list
      setState((prev) => ({
        ...prev,
        fragrances: [newFragrance, ...prev.fragrances],
      }))

      return { success: true, data: newFragrance }
    } catch (err) {
      console.error("Failed to create fragrance:", err.response?.data || err.message)

      let errorMessage = "Failed to create fragrance"

      if (err.response?.status === 401) {
        errorMessage = "Please login to create fragrances"
      } else if (err.response?.status === 403) {
        errorMessage = "You do not have permission to create fragrances"
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.message) {
        errorMessage = err.message
      }

      setState((prev) => ({ ...prev, error: errorMessage }))
      return { success: false, error: errorMessage }
    } finally {
      setState((prev) => ({ ...prev, loading: false }))
    }
  }

  // Update fragrance (admin only)
  const updateFragrance = async (id, fragranceData) => {
    if (!isAuthenticated) {
      setState((prev) => ({ ...prev, error: "Please login to update fragrances" }))
      return { success: false, error: "Authentication required" }
    }

    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      console.log("Updating fragrance:", { id, fragranceData })

      const response = await axios.put(`${API_BASE_URL}/api/fragrances/${id}`, fragranceData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        timeout: 15000,
      })

      console.log("Fragrance updated successfully:", response.data)

      const updatedFragrance = response.data

      // Update in current fragrance if it's the same
      if (state.currentFragrance?._id === id) {
        setState((prev) => ({ ...prev, currentFragrance: updatedFragrance }))
      }

      // Update in fragrances list
      setState((prev) => ({
        ...prev,
        fragrances: prev.fragrances.map((fragrance) => (fragrance._id === id ? updatedFragrance : fragrance)),
      }))

      return { success: true, data: updatedFragrance }
    } catch (err) {
      console.error("Failed to update fragrance:", err.response?.data || err.message)

      let errorMessage = "Failed to update fragrance"

      if (err.response?.status === 401) {
        errorMessage = "Please login to update fragrances"
      } else if (err.response?.status === 403) {
        errorMessage = "You do not have permission to update fragrances"
      } else if (err.response?.status === 404) {
        errorMessage = "Fragrance not found"
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.message) {
        errorMessage = err.message
      }

      setState((prev) => ({ ...prev, error: errorMessage }))
      return { success: false, error: errorMessage }
    } finally {
      setState((prev) => ({ ...prev, loading: false }))
    }
  }

  // Delete fragrance (admin only)
  const deleteFragrance = async (id) => {
    if (!isAuthenticated) {
      setState((prev) => ({ ...prev, error: "Please login to delete fragrances" }))
      return { success: false, error: "Authentication required" }
    }

    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      console.log("Deleting fragrance:", id)

      await axios.delete(`${API_BASE_URL}/api/fragrances/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      })

      console.log("Fragrance deleted successfully")

      // Remove from fragrances list
      setState((prev) => ({
        ...prev,
        fragrances: prev.fragrances.filter((fragrance) => fragrance._id !== id),
      }))

      // Clear current fragrance if it's the deleted one
      if (state.currentFragrance?._id === id) {
        setState((prev) => ({ ...prev, currentFragrance: null }))
      }

      return { success: true }
    } catch (err) {
      console.error("Failed to delete fragrance:", err.response?.data || err.message)

      let errorMessage = "Failed to delete fragrance"

      if (err.response?.status === 401) {
        errorMessage = "Please login to delete fragrances"
      } else if (err.response?.status === 403) {
        errorMessage = "You do not have permission to delete fragrances"
      } else if (err.response?.status === 404) {
        errorMessage = "Fragrance not found"
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.message) {
        errorMessage = err.message
      }

      setState((prev) => ({ ...prev, error: errorMessage }))
      return { success: false, error: errorMessage }
    } finally {
      setState((prev) => ({ ...prev, loading: false }))
    }
  }

  // Filter management
  const updateFilters = (newFilters) => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters },
      pagination: { ...prev.pagination, page: 1 },
    }))
  }

  const clearFilters = () => {
    setState((prev) => ({
      ...prev,
      filters: initialState.filters,
      pagination: { ...prev.pagination, page: 1 },
    }))
  }

  const hasActiveFilters = () => {
    const { category, brand, gender, concentration, minRating, search } = state.filters
    return !!(category || brand || gender || concentration || minRating || search)
  }

  // Load more fragrances
  const loadMoreFragrances = async () => {
    if (!state.pagination.hasMore || state.loading) return

    const nextPage = state.pagination.page + 1
    await fetchFragrances(nextPage, false)
  }

  // Refresh fragrances
  const refreshFragrances = async () => {
    setState((prev) => ({ ...prev, pagination: { ...prev.pagination, page: 1 } }))
    await fetchFragrances(1, true)
  }

  // Clear error
  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }))
  }

  // Initialize fragrances on mount
  useEffect(() => {
    const initializeFragrances = async () => {
      // Try to load cached data first
      const cached = await getCachedFragrances()
      if (cached) {
        setState((prev) => ({ ...prev, fragrances: cached }))
      }

      // Then fetch fresh data
      await fetchFragrances(1, true)
    }

    initializeFragrances()
  }, [])

  return (
    <FragranceContext.Provider
      value={{
        // State
        fragrances: state.fragrances,
        currentFragrance: state.currentFragrance,
        isLoading: state.loading,
        error: state.error,
        filters: state.filters,
        pagination: state.pagination,

        // Actions
        fetchFragrances,
        getFragranceById,
        updateRating,
        createFragrance,
        updateFragrance,
        deleteFragrance,
        updateFilters,
        clearFilters,
        hasActiveFilters,
        loadMoreFragrances,
        refreshFragrances,
        clearError,
      }}
    >
      {children}
    </FragranceContext.Provider>
  )
}

export const useFragrance = () => {
  const context = useContext(FragranceContext)
  if (!context) {
    throw new Error("useFragrance must be used within a FragranceProvider")
  }
  return context
}
