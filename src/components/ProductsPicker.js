import { useEffect, useState } from 'react'
import { Grid } from '@contentful/forma-36-react-components'
import * as SlatwalSDK from '@slatwall/slatwall-sdk'
import preloadData from '../preload'
import { FilterSidebar } from './FilterSidebar'
import { ProductGrid } from './ProductGrid'
import { SelectedProductsSidebar } from './SelectedProductsSidebar'
import { useDebounce } from '../hooks/useDebounce'

const ProductsPicker = ({ validateParameters, sdk, fetchProductPreviews }) => {
  const {
    invocation: { fieldValue },
    installation: { apiEndpoint },
  } = sdk.parameters
  const [selectedProducts, setSelectedProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  const [currentPage, setCurrentPage] = useState(1)
  const [products, setProducts] = useState([])
  const SlatwalApiService = SlatwalSDK.init({
    host: apiEndpoint,
  })
  const [filters, setFilters] = useState({
    categories: [],
    productTypes: [],
    brands: [],
  })
  useEffect(() => {
    const payload = {
      entityName: 'product',
      'p:current': currentPage,
      'p:show': preloadData.PREVIEWS_PER_PAGE,
      includeAttributesMetadata: true,
    }
    if (filters.categories.length) payload['f:categories.categoryID:in'] = filters.categories.join(',')
    if (filters.productTypes.length) payload['f:productType.productTypeID:in'] = filters.productTypes.join(',')
    if (filters.brands.length) payload['f:brand.brandID:in'] = filters.brands.join(',')
    if (debouncedSearchTerm) payload['f:productName:like'] = `%${debouncedSearchTerm}%`

    SlatwalApiService.general.getEntity(payload).then(response => {
      if (response.isSuccess() && response.success().data) {
        setProducts(response.success().data)
      } else {
        sdk.notifier.error('There was an error fetching the data.')
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, currentPage, debouncedSearchTerm])

  useEffect(() => {
    const payload = {
      entityName: 'product',
      'f:productID:in': fieldValue.join(),
      includeAttributesMetadata: true,
    }

    SlatwalApiService.general.getEntity(payload).then(response => {
      if (response.isSuccess() && response.success().data) {
        setSelectedProducts(response.success().data)
      } else {
        sdk.notifier.error('There was an error fetching the data.')
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Grid columns="1fr 4fr 1fr">
      <FilterSidebar sdk={sdk} filters={filters} setFilters={setFilters} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <ProductGrid products={products} currentPage={currentPage} setCurrentPage={setCurrentPage} selectedProducts={selectedProducts} setSelectedProducts={setSelectedProducts} />
      <SelectedProductsSidebar sdk={sdk} selectedProducts={selectedProducts} setSelectedProducts={setSelectedProducts} />
    </Grid>
  )
}

export { ProductsPicker }
