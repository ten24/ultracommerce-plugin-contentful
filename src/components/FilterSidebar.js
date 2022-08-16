import { useEffect, useState } from 'react'
import { Grid, GridItem, TextInput, CheckboxField, Flex, Heading, Subheading } from '@contentful/forma-36-react-components'
import * as SlatwalSDK from '@slatwall/slatwall-sdk'

const FilterSidebar = ({ sdk, filters, setFilters, searchTerm, setSearchTerm, setCurrentPage }) => {
  const [productTypes, setProductTypes] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])

  const { apiEndpoint, siteCode } = sdk.parameters.installation
  const SlatwalApiService = SlatwalSDK.init({
    host: apiEndpoint,
  })

  const getProductTypes = async () => {
    let productTypes = await getAPI('producttype')
    let sortedProductTypes = productTypes?.sort((a, b) => a.productTypeName.localeCompare(b.productTypeName))
    setProductTypes(sortedProductTypes)
  }
  const getCategories = async () => {
    let categoryData = await getAPI('category')
    let sortedCategory = categoryData?.sort((a, b) => a.categoryName.localeCompare(b.categoryName))
    setCategories(sortedCategory)
  }
  const getBrands = async () => {
    let brandData = await getAPI('brand')
    let sortedBrands = brandData?.sort((a, b) => a.brandName.localeCompare(b.brandName))
    setBrands(sortedBrands)
  }

  const getAPI = entity => {
    let payload = {
      entityName: entity,
      includeAttributesMetadata: true,
    }
    return SlatwalApiService.general
      .getEntity(payload, {
        'SWX-requestSiteCode': siteCode,
      })
      .then(response => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setCategory = category => {
    let categories = [...filters.categories, category.categoryID]
    if (filters.categories.includes(category.categoryID)) {
      categories = categories.filter(categoryID => categoryID !== category.categoryID)
    }
    setCurrentPage(1)
    setFilters({ ...filters, categories })
  }
  const setBrand = brand => {
    let brands = [...filters.brands, brand.brandID]
    if (filters.brands.includes(brand.brandID)) {
      brands = brands.filter(brandID => brandID !== brand.brandID)
    }
    setCurrentPage(1)
    setFilters({ ...filters, brands })
  }
  const setProductType = productType => {
    let productTypes = [...filters.productTypes, productType.productTypeID]
    if (filters.productTypes.includes(productType.productTypeID)) {
      productTypes = productTypes.filter(productTypeID => productTypeID !== productType.productTypeID)
    }
    setCurrentPage(1)
    setFilters({ ...filters, productTypes })
  }

  return (
    <GridItem>
      <TextInput
        name="example"
        type="text"
        value={searchTerm}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            setCurrentPage(1)
            setSearchTerm(e.target.value)
          }
        }}
        onBlur={e => {
          setCurrentPage(1)
          setSearchTerm(e.target.value)
        }}
        placeholder="Search Products"
        className="f36-margin-bottom--m"
      />
      <Heading className="f36-font-size--m">Filter By</Heading>
      <Grid rowGap="spacingXl">
        <GridItem>
          <Subheading>Categories</Subheading>
          {categories?.map(category => {
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
          {productTypes?.map(productType => {
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
          {brands?.map(brand => {
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

export { FilterSidebar }
