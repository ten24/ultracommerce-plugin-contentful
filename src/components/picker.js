import { useEffect, useState } from 'react'
import { Grid, GridItem, CheckboxField, Flex, Button, EntityList, EntityListItem, DropdownList, DropdownListItem, Card, Typography, Paragraph, Heading, Subheading, Asset } from '@contentful/forma-36-react-components'
import * as SlatwalSDK from '@slatwall/slatwall-sdk'
import preloadData from '../preload'

const FilterSidebar = ({ sdk, filters, setFilters }) => {
  const [productTypes, setProductTypes] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])

  const { apiEndpoint } = sdk.parameters.installation
  const SlatwalApiService = SlatwalSDK.init({
    host: apiEndpoint,
  })

  const getProductTypes = async () => {
    let productTypes = await getAPI('producttype')
    let sortedProductTypes = productTypes.sort((a, b) => a.productTypeName.localeCompare(b.productTypeName))
    setProductTypes(sortedProductTypes)
  }
  const getCategories = async () => {
    let categoryData = await getAPI('category')
    let sortedCategory = categoryData.sort((a, b) => a.categoryName.localeCompare(b.categoryName))
    setCategories(sortedCategory)
  }
  const getBrands = async () => {
    let brandData = await getAPI('brand')
    let sortedBrands = brandData.sort((a, b) => a.brandName.localeCompare(b.brandName))
    setBrands(sortedBrands)
  }

  const getAPI = entity => {
    let payload = {
      entityName: entity,
      includeAttributesMetadata: true,
    }
    return SlatwalApiService.general.getEntity(payload).then(response => {
      if (response.isSuccess() && response.success().data && response.success().data.pageRecords) {
        return response.success().data.pageRecords
      } else {
        sdk.notifier.error('There was an error fetching the data.')
      }
    })
  }

  useEffect(() => {
    getProductTypes()
    getCategories()
    getBrands()
  }, [])

  const setCategory = category => {
    let categories = [...filters.categories, category.categoryID]
    if (filters.categories.includes(category.categoryID)) {
      categories = categories.filter(categoryID => categoryID !== category.categoryID)
    }
    setFilters({ ...filters, categories })
  }
  const setBrand = brand => {
    let brands = [...filters.brands, brand.brandID]
    if (filters.brands.includes(brand.brandID)) {
      brands = brands.filter(brandID => brandID !== brand.brandID)
    }
    setFilters({ ...filters, brands })
  }
  const setProductType = productType => {
    let productTypes = [...filters.productTypes, productType.productTypeID]
    if (filters.productTypes.includes(productType.productTypeID)) {
      productTypes = productTypes.filter(productTypeID => productTypeID !== productType.productTypeID)
    }
    setFilters({ ...filters, productTypes })
  }

  return (
    <GridItem>
      <Heading>Filter By</Heading>
      <Grid rowGap="spacingXl">
        <GridItem>
          <Subheading>Categories</Subheading>
          {categories.length > 0 &&
            categories.map(category => {
              return (
                <Flex key={category.categoryID}>
                  <CheckboxField
                    key={category.categoryID}
                    labelText={category.categoryName}
                    name={category.categoryName}
                    value={category.categoryID}
                    id={category.categoryID}
                    checked={filters.categories.includes(category.categoryID)}
                    labelIsLight
                    onClick={() => {
                      setCategory(category)
                    }}
                  />
                </Flex>
              )
            })}
        </GridItem>
        <GridItem>
          <Subheading>Product Types</Subheading>
          {productTypes.length > 0 &&
            productTypes.map(productType => {
              return (
                <Flex key={productType.productTypeID}>
                  <CheckboxField
                    labelText={productType.productTypeName}
                    name={productType.productTypeName}
                    value={productType.productTypeID}
                    id={productType.productTypeID}
                    checked={filters.productTypes.includes(productType.productTypeID)}
                    labelIsLight
                    onClick={() => {
                      setProductType(productType)
                    }}
                  />
                </Flex>
              )
            })}
        </GridItem>
        <GridItem>
          <Subheading>Brands</Subheading>
          {brands.length > 0 &&
            brands.map(brand => {
              return (
                <Flex key={brand.brandID}>
                  <CheckboxField
                    labelText={brand.brandName}
                    name={brand.brandName}
                    value={brand.brandID}
                    id={brand.brandID}
                    checked={filters.brands.includes(brand.brandID)}
                    labelIsLight
                    onClick={() => {
                      setBrand(brand)
                    }}
                  />
                </Flex>
              )
            })}
        </GridItem>
      </Grid>
    </GridItem>
  )
}
const SelectedProductsSidebar = ({ sdk, selectedProducts, setSelectedProducts }) => {
  return (
    <GridItem>
      <Heading>Select products</Heading>
      <EntityList>
        {selectedProducts.map(product => {
          return (
            <EntityListItem
              key={product.productID}
              thumbnailUrl={product.images.length ? `${preloadData.imageURL}${product.images[1]}` : preloadData.placeHolderImage}
              title={product.productName}
              description="Description"
              status=""
              dropdownListElements={
                <DropdownList>
                  <DropdownListItem isTitle>Actions</DropdownListItem>
                  <DropdownListItem
                    onClick={() => {
                      setSelectedProducts(selectedProducts.filter(prod => prod.productID !== product.productID))
                    }}
                  >
                    Remove
                  </DropdownListItem>
                </DropdownList>
              }
            />
          )
        })}
      </EntityList>
      <Button
        buttonType="primary"
        onClick={() => {
          sdk.close(selectedProducts.map(products => products.productID))
        }}
        disabled={selectedProducts.length === 0}
      >
        {`Save ${selectedProducts.length} Products`}
      </Button>
    </GridItem>
  )
}

const ProductGrid = ({ products, selectedProducts, setSelectedProducts }) => {
  const onSelectProduct = product => {
    const hasProduct = selectedProducts.filter(prod => prod.productID === product.productID).length > 0
    let products = [...selectedProducts, product]
    if (hasProduct) {
      products = [...selectedProducts, product].filter(prod => prod.productID !== product.productID)
    }
    setSelectedProducts(products)
  }
  return (
    <GridItem>
      <Grid columns={3} rowGap="spacingM" columnGap="spacingM">
        {products.map(data => {
          return (
            <GridItem key={data.productID}>
              <Card
                selected={selectedProducts.filter(sp => data.productID === sp.productID).length ? true : false}
                title={data.productName}
                onClick={() => {
                  onSelectProduct(data)
                }}
              >
                <Asset src={data.images.length ? `${preloadData.imageURL}${data.images[1]}` : preloadData.placeHolderImage} type="image" />
                <Typography>
                  <p>{data.productName}</p>
                  <div className="d-flex justify-content-between mt-2">
                    <p className="text-secondary">{data.defaultSku_skuPrices_listPrice !== ' ' && <s>${data.defaultSku_skuPrices_listPrice}</s>}</p>
                    {data.defaultSku_skuPrices_price !== ' ' && <Paragraph>${data.defaultSku_skuPrices_price}</Paragraph>}
                  </div>
                </Typography>
              </Card>
            </GridItem>
          )
        })}
      </Grid>
    </GridItem>
  )
}
const ProductsPicker = ({ validateParameters, sdk, fetchProductPreviews }) => {
  const {
    invocation: { fieldValue },
    installation: { apiEndpoint },
  } = sdk.parameters
  const [selectedProducts, setSelectedProducts] = useState([])
  const [searchValue, setSearchValue] = useState('')
  const [pageNumber, setPageNumber] = useState(1)
  const [products, setProducts] = useState([])
  const SlatwalApiService = SlatwalSDK.init({
    host: apiEndpoint,
  })
  console.log('sdk', sdk)
  const [filters, setFilters] = useState({
    categories: [],
    productTypes: [],
    brands: [],
  })
  console.log('filters', filters)
  useEffect(() => {
    const payload = {
      entityName: 'product',
      'p:current': pageNumber,
      'p:show': preloadData.PREVIEWS_PER_PAGE,
      includeAttributesMetadata: true,
    }
    if (filters.categories.length) payload['f:category.categoryID:in'] = filters.categories.join(',')
    if (filters.productTypes.length) payload['f:productType.productTypeID:in'] = filters.productTypes.join(',')
    if (filters.brands.length) payload['f:brand.brandID:in'] = filters.brands.join(',')
    //if (filters.searchValue.length) payload['f:productName:like'] = searchValue

    SlatwalApiService.general.getEntity(payload).then(response => {
      if (response.isSuccess() && response.success().data) {
        setProducts(response.success().data)
      } else {
        sdk.notifier.error('There was an error fetching the data.')
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pageNumber])

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
      <FilterSidebar sdk={sdk} filters={filters} setFilters={setFilters} />
      <ProductGrid products={products} selectedProducts={selectedProducts} setSelectedProducts={setSelectedProducts} />
      <SelectedProductsSidebar sdk={sdk} selectedProducts={selectedProducts} setSelectedProducts={setSelectedProducts} />
    </Grid>
  )
}

export default ProductsPicker
