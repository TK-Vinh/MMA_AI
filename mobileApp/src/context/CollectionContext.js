"use client"

import { createContext, useContext, useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import axios from "axios"
import { API_BASE_URL } from "@env"
import { useAuth } from "./AuthContext"

const CollectionContext = createContext()

export const CollectionProvider = ({ children }) => {
  const [collection, setCollection] = useState([])
  const [stats, setStats] = useState({
    owned: 0,
    wishlist: 0,
    tried: 0,
    sold: 0,
    totalSpent: 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentStatus, setCurrentStatus] = useState("owned")
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalPages: 1,
    currentPage: 1,
    hasMore: true,
  })

  const { token, isAuthenticated, user } = useAuth()

  // Debug: Log the API_BASE_URL
  useEffect(() => {
    console.log("CollectionContext - API_BASE_URL:", API_BASE_URL)
    if (!API_BASE_URL) {
      console.error("API_BASE_URL is not defined in environment variables")
    }
  }, [])

  // Cache management
  const cacheCollection = async (collectionData, status) => {
    try {
      await AsyncStorage.setItem(
        `collection_${status}`,
        JSON.stringify({
          data: collectionData,
          timestamp: Date.now(),
        }),
      )
      console.log(`Collection ${status} cached successfully`)
    } catch (err) {
      console.error("Error caching collection:", err)
    }
  }

  const getCachedCollection = async (status) => {
    try {
      const cached = await AsyncStorage.getItem(`collection_${status}`)
      if (cached) {
        const { data, timestamp } = JSON.parse(cached)
        // Cache valid for 2 minutes
        if (Date.now() - timestamp < 2 * 60 * 1000) {
          console.log(`Using cached collection for ${status}`)
          return data
        }
      }
      return null
    } catch (err) {
      console.error("Error getting cached collection:", err)
      return null
    }
  }

  // Fetch user's collection
  const fetchCollection = async (status = "owned", page = 1, resetList = false) => {
    if (!isAuthenticated) {
      setError("Please login to view your collection")
      return { success: false, error: "Authentication required" }
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log("Fetching collection...")
      console.log("API URL:", `${API_BASE_URL}/api/collection`)
      console.log("Status:", status, "Page:", page)

      if (!API_BASE_URL) {
        throw new Error("API_BASE_URL is not configured. Please check your .env file.")
      }

      const response = await axios.get(`${API_BASE_URL}/api/collection`, {
        params: { status, page, limit: pagination.limit },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      })

      console.log("Collection fetched successfully:", response.data)

      const { collection: newCollection, totalPages, currentPage } = response.data.data

      if (resetList || page === 1) {
        setCollection(newCollection)
      } else {
        setCollection((prev) => [...prev, ...newCollection])
      }

      setPagination((prev) => ({
        ...prev,
        page: currentPage,
        totalPages,
        hasMore: currentPage < totalPages,
      }))

      setCurrentStatus(status)

      // Cache the collection
      await cacheCollection(newCollection, status)

      return { success: true, data: newCollection }
    } catch (err) {
      console.error("Failed to fetch collection:", err.response?.data || err.message)

      let errorMessage = "Failed to fetch collection"

      if (err.code === "ECONNABORTED") {
        errorMessage = "Request timeout. Please check your internet connection."
      } else if (err.code === "NETWORK_ERROR" || err.message.includes("Network Error")) {
        errorMessage = "Network error. Please check your internet connection."
        // Try to load cached data on network error
        const cached = await getCachedCollection(status)
        if (cached && page === 1) {
          setCollection(cached)
          return { success: true, data: cached, fromCache: true }
        }
      } else if (err.response?.status === 401) {
        errorMessage = "Please login to view your collection"
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.message) {
        errorMessage = err.message
      }

      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch collection statistics
  const fetchStats = async () => {
    if (!isAuthenticated) {
      return { success: false, error: "Authentication required" }
    }

    try {
      console.log("Fetching collection stats...")

      const response = await axios.get(`${API_BASE_URL}/api/collection/stats`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      })

      console.log("Collection stats fetched successfully:", response.data)

      const statsData = response.data.data.stats
      setStats(statsData)

      return { success: true, data: statsData }
    } catch (err) {
      console.error("Failed to fetch collection stats:", err.response?.data || err.message)
      return { success: false, error: err.response?.data?.message || err.message }
    }
  }

  // Add fragrance to collection
  const addToCollection = async (fragranceId, status = "owned", additionalData = {}) => {
    if (!isAuthenticated) {
      setError("Please login to add fragrances to your collection")
      return { success: false, error: "Authentication required" }
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log("Adding to collection:", { fragranceId, status, additionalData })

      const response = await axios.post(
        `${API_BASE_URL}/api/collection`,
        {
          fragranceId,
          status,
          ...additionalData,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000,
        },
      )

      console.log("Added to collection successfully:", response.data)

      const newItem = response.data.data.collection

      // Add to collection if it matches current status
      if (status === currentStatus) {
        setCollection((prev) => [newItem, ...prev])
      }

      // Update stats
      setStats((prev) => ({
        ...prev,
        [status]: prev[status] + 1,
      }))

      return { success: true, data: newItem }
    } catch (err) {
      console.error("Failed to add to collection:", err.response?.data || err.message)

      let errorMessage = "Failed to add to collection"

      if (err.response?.status === 401) {
        errorMessage = "Please login to add fragrances to your collection"
      } else if (err.response?.status === 400 && err.response?.data?.message?.includes("already in")) {
        errorMessage = "This fragrance is already in your collection"
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.message) {
        errorMessage = err.message
      }

      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  // Update collection item
  const updateCollectionItem = async (id, updateData) => {
    if (!isAuthenticated) {
      setError("Please login to update your collection")
      return { success: false, error: "Authentication required" }
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log("Updating collection item:", { id, updateData })

      const response = await axios.put(`${API_BASE_URL}/api/collection/${id}`, updateData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      })

      console.log("Collection item updated successfully:", response.data)

      const updatedItem = response.data.data.collection

      // Update in collection list
      setCollection((prev) => prev.map((item) => (item._id === id ? updatedItem : item)))

      return { success: true, data: updatedItem }
    } catch (err) {
      console.error("Failed to update collection item:", err.response?.data || err.message)

      let errorMessage = "Failed to update collection item"

      if (err.response?.status === 401) {
        errorMessage = "Please login to update your collection"
      } else if (err.response?.status === 404) {
        errorMessage = "Collection item not found"
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.message) {
        errorMessage = err.message
      }

      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  // Remove from collection
  const removeFromCollection = async (id) => {
    if (!isAuthenticated) {
      setError("Please login to remove from your collection")
      return { success: false, error: "Authentication required" }
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log("Removing from collection:", id)

      await axios.delete(`${API_BASE_URL}/api/collection/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      })

      console.log("Removed from collection successfully")

      // Remove from collection list
      setCollection((prev) => prev.filter((item) => item._id !== id))

      // Update stats
      setStats((prev) => ({
        ...prev,
        [currentStatus]: Math.max(0, prev[currentStatus] - 1),
      }))

      return { success: true }
    } catch (err) {
      console.error("Failed to remove from collection:", err.response?.data || err.message)

      let errorMessage = "Failed to remove from collection"

      if (err.response?.status === 401) {
        errorMessage = "Please login to remove from your collection"
      } else if (err.response?.status === 404) {
        errorMessage = "Collection item not found"
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.message) {
        errorMessage = err.message
      }

      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  // Mark as worn
  const markAsWorn = async (id) => {
    if (!isAuthenticated) {
      setError("Please login to mark as worn")
      return { success: false, error: "Authentication required" }
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log("Marking as worn:", id)

      const response = await axios.post(
        `${API_BASE_URL}/api/collection/${id}/worn`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000,
        },
      )

      console.log("Marked as worn successfully:", response.data)

      const updatedItem = response.data.data.collection

      // Update in collection list
      setCollection((prev) => prev.map((item) => (item._id === id ? updatedItem : item)))

      return { success: true, data: updatedItem }
    } catch (err) {
      console.error("Failed to mark as worn:", err.response?.data || err.message)

      let errorMessage = "Failed to mark as worn"

      if (err.response?.status === 401) {
        errorMessage = "Please login to mark as worn"
      } else if (err.response?.status === 404) {
        errorMessage = "Collection item not found"
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.message) {
        errorMessage = err.message
      }

      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  // Load more collection items
  const loadMoreCollection = async () => {
    if (!pagination.hasMore || isLoading) return

    const nextPage = pagination.page + 1
    await fetchCollection(currentStatus, nextPage, false)
  }

  // Refresh collection
  const refreshCollection = async () => {
    setPagination((prev) => ({ ...prev, page: 1 }))
    await fetchCollection(currentStatus, 1, true)
    await fetchStats()
  }

  // Clear error
  const clearError = () => {
    setError(null)
  }

  // Initialize collection when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchStats()
      fetchCollection(currentStatus, 1, true)
    } else {
      // Clear collection data when user logs out
      setCollection([])
      setStats({
        owned: 0,
        wishlist: 0,
        tried: 0,
        sold: 0,
        totalSpent: 0,
      })
    }
  }, [isAuthenticated, user])

  return (
    <CollectionContext.Provider
      value={{
        // State
        collection,
        stats,
        isLoading,
        error,
        currentStatus,
        pagination,

        // Actions
        fetchCollection,
        fetchStats,
        addToCollection,
        updateCollectionItem,
        removeFromCollection,
        markAsWorn,
        loadMoreCollection,
        refreshCollection,
        clearError,

        // Setters
        setCurrentStatus,
      }}
    >
      {children}
    </CollectionContext.Provider>
  )
}

export const useCollection = () => {
  const context = useContext(CollectionContext)
  if (!context) {
    throw new Error("useCollection must be used within a CollectionProvider")
  }
  return context
}
