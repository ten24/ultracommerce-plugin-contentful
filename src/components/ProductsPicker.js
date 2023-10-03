import { useEffect, useState } from 'react'
import { Grid } from '@contentful/forma-36-react-components'
import * as SlatwalSDK from '@slatwall/slatwall-sdk'
import preloadData from '../preload'
import { FilterSidebar } from './FilterSidebar'
import { ProductGrid } from './ProductGrid'
import { SelectedProductsSidebar } from './SelectedProductsSidebar'

const ProductsPicker = ({ sdk }) => {
  const {
    invocation: { fieldValue },
    installation: { apiEndpoint, siteCode },
  } = sdk.parameters
  const [selectedProducts, setSelectedProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

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
      includeCategories: true,
      includeImages: true,
      'p:show': preloadData.PREVIEWS_PER_PAGE,
      includeAttributesMetadata: true,
    }
    if (filters.categories.length) payload['f:categories.categoryID:in'] = filters.categories.join(',')
    if (filters.productTypes.length) payload['f:productType.productTypeID:in'] = filters.productTypes.join(',')
    if (filters.brands.length) payload['f:brand.brandID:in'] = filters.brands.join(',')
    if (searchTerm) payload['f:productName:like'] = `%${searchTerm}%`

    SlatwalApiService.general
      .getEntity(payload, {
        'SWX-requestSiteCode': siteCode,
      })
      .then(response => {
        if (response.isSuccess() && response.success().data && response.success().data.pageRecords) {
          const products = response.success().data.pageRecords.map(product => {
            return { ...product, brandName: product.brand_brandName, brandUrlTitle: product.brand_urlTitle, imageFile: product.defaultSku_imageFile, skuCode: product.defaultSku_skuCode, product: product.defaultSku_imageFile, skuID: product.defaultSku_skuID }
          })
          setProducts(products)
        } else {
          sdk.notifier.error('There was an error fetching the data.')
        }
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, currentPage, searchTerm])
  useEffect(() => {
    if (fieldValue && fieldValue.length) {
      const payload = {
        entityName: 'product',
        includeCategories: true,
        includeImages: true,
        'f:productID:in': typeof fieldValue === 'string' ? fieldValue : fieldValue.join(','),
        includeAttributesMetadata: true,
      }

      SlatwalApiService.general
        .getEntity(payload, {
          'SWX-requestSiteCode': siteCode,
        })
        .then(response => {
          if (response.isSuccess() && response.success().data && response.success().data.pageRecords) {
            const initProduct = typeof fieldValue === 'string' ? fieldValue.split(',') : fieldValue
            const tempArray = new Array(initProduct.length).fill('')
            const pageRecords = response.success().data.pageRecords

            pageRecords.forEach(product => {
              let index = initProduct.indexOf(product.productID)
              tempArray[index] = product
            })

            setSelectedProducts(tempArray)
          } else {
            sdk.notifier.error('There was an error fetching the data.')
          }
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <Grid columns="1fr 4fr 1fr">
      <FilterSidebar sdk={sdk} filters={filters} setFilters={setFilters} searchTerm={searchTerm} setCurrentPage={setCurrentPage} setSearchTerm={setSearchTerm} />
      <ProductGrid products={products} currentPage={currentPage} setCurrentPage={setCurrentPage} selectedProducts={selectedProducts} setSelectedProducts={setSelectedProducts} />
      <SelectedProductsSidebar sdk={sdk} selectedProducts={selectedProducts} setSelectedProducts={setSelectedProducts} />
    </Grid>
  )
}

export { ProductsPicker }
