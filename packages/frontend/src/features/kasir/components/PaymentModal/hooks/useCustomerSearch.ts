import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/core/store/authStore'
import { Customer, CustomerSearchState } from '../types'
import { CUSTOMER_SEARCH_DEBOUNCE_MS } from '../constants/paymentMethods'

export const useCustomerSearch = () => {
  const token = useAuthStore((s) => s.token)

  const [searchState, setSearchState] = useState<CustomerSearchState>({
    query: '',
    results: [],
    loading: false,
    showDropdown: false,
    selectedIndex: -1
  })

  const updateSearchState = (updates: Partial<CustomerSearchState>) => {
    setSearchState(prev => ({ ...prev, ...updates }))
  }

  const searchCustomers = useCallback(async (query: string) => {
    if (!query.trim()) {
      updateSearchState({ results: [] })
      return
    }

    updateSearchState({ loading: true })
    try {
      const res = await fetch(
        `http://localhost:3000/api/pelanggan/search?q=${encodeURIComponent(query)}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      )
      const data = await res.json()
      if (res.ok && data.success) {
        updateSearchState({ results: data.data || [] })
      }
    } catch {
      updateSearchState({ results: [] })
    } finally {
      updateSearchState({ loading: false })
    }
  }, [token])

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchState.query) {
        searchCustomers(searchState.query)
      }
    }, CUSTOMER_SEARCH_DEBOUNCE_MS)

    return () => clearTimeout(timeout)
  }, [searchState.query, searchCustomers])

  // Hide dropdown when query is empty
  useEffect(() => {
    if (!searchState.query) {
      updateSearchState({ showDropdown: false })
    }
  }, [searchState.query])

  // Reset selected index when query changes
  useEffect(() => {
    updateSearchState({ selectedIndex: -1 })
  }, [searchState.query])

  const setQuery = (query: string) => {
    updateSearchState({ query })
  }

  const setShowDropdown = (show: boolean) => {
    updateSearchState({ showDropdown: show })
  }

  const setSelectedIndex = (index: number) => {
    updateSearchState({ selectedIndex: index })
  }

  const selectCustomer = (customer: Customer) => {
    updateSearchState({
      showDropdown: false,
      query: '',
      selectedIndex: -1
    })
    return customer
  }

  const clearSearch = () => {
    updateSearchState({
      query: '',
      showDropdown: false,
      selectedIndex: -1,
      results: []
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(Math.min(searchState.selectedIndex + 1, searchState.results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(Math.max(searchState.selectedIndex - 1, -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (searchState.selectedIndex >= 0 && searchState.results[searchState.selectedIndex]) {
        return searchState.results[searchState.selectedIndex]
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      updateSearchState({ showDropdown: false, query: '' })
    }
    return null
  }

  return {
    searchState,
    setQuery,
    setShowDropdown,
    setSelectedIndex,
    selectCustomer,
    clearSearch,
    handleKeyDown
  }
}