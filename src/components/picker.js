import { useEffect, useState } from 'react'
import { Grid, GridItem, CheckboxField, Flex, SectionHeading, EntityList, EntityListItem, DropdownList, DropdownListItem, Card, Typography, Paragraph, Heading, Subheading, Asset } from '@contentful/forma-36-react-components'
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
    setCategories(
      [...categories].map(cat => {
        if (cat.categoryID === category.categoryID) cat.checked = !cat?.checked
        return cat
      })
    )
  }
  const setBrand = brand => {
    setBrands(
      [...brands].map(b => {
        if (b.brandID === brand.brandID) b.checked = !b?.checked
        return b
      })
    )
  }
  const setProductType = productType => {
    setProductTypes(
      [...productTypes].map(pt => {
        if (pt.productTypeID === productType.productTypeID) pt.checked = !pt?.checked
        return pt
      })
    )
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
                <Flex>
                  <CheckboxField
                    labelText={category.categoryName}
                    name={category.categoryName}
                    value={category.categoryID}
                    id={category.categoryID}
                    checked={category?.checked || false}
                    onClick={() => {
                      setCategory(category)
                    }}
                  />
                </Flex>
              )
            })}
        </GridItem>
        <GridItem>
          <SectionHeading element="h3">Product Types</SectionHeading>
          {productTypes.length > 0 &&
            productTypes.map(productType => {
              return (
                <Flex>
                  <CheckboxField
                    labelText={productType.productTypeName}
                    name={productType.productTypeName}
                    value={productType.productTypeID}
                    id={productType.productTypeID}
                    checked={productType?.checked || false}
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
                <Flex>
                  <CheckboxField
                    labelText={brand.brandName}
                    name={brand.brandName}
                    value={brand.brandID}
                    id={brand.brandID}
                    checked={brand?.checked || false}
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
const SelectedProductsSidebar = ({ selectedProducts }) => {
  return (
    <GridItem>
      <Heading>Select products</Heading>
      <EntityList>
        {selectedProducts.map(product => {
          return (
            <EntityListItem
              thumbnailUrl={product.images.length ? `${preloadData.imageURL}${product.images[1]}` : preloadData.placeHolderImage}
              title={product.productName}
              description="Description"
              status=""
              dropdownListElements={
                <DropdownList>
                  <DropdownListItem isTitle>Actions</DropdownListItem>
                  <DropdownListItem>Remove</DropdownListItem>
                </DropdownList>
              }
            />
          )
        })}
      </EntityList>
    </GridItem>
  )
}

const ProductGrid = ({ products, selectedProducts, setSelectedProducts }) => {
  return (
    <GridItem>
      <Grid columns={2} rowGap="spacingM" columnGap="spacingM">
        {products.map(data => {
          return (
            <GridItem>
              <Card selected={selectedProducts.filter(sp => data.productID === sp.productID).length ? true : false} title={data.productName} onClick={() => setSelectedProducts([...selectedProducts, data])}>
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
  const [searchValue, setSearchValue] = useState('')
  const [pageNumber, setPageNumber] = useState(1)

  const [filters, setFilters] = useState({
    categories: [],
    productTypes: [],
    brands: [],
  })
  const [selectedProducts, setSelectedProducts] = useState([])

  const products = [
    {
      defaultSku_skuID: '2c91808975d7ac720175d9ed7063005b',
      calculatedQATS: 1000,
      optionGroups: [
        {
          optionGroupCode: 'soccerBallSize',
          options: [
            {
              optionID: '2c918082729f9bfa0172a3c9b475000f',
              optionName: 'Size 3',
              optionCode: '3',
            },
            {
              optionID: '2c918082729f9bfa0172a3c9e1d80010',
              optionName: 'Size 4',
              optionCode: '4',
            },
            {
              optionID: '2c918082729f9bfa0172a3ca099e0011',
              optionName: 'Size 5',
              optionCode: '5',
            },
          ],
          optionGroupName: 'Soccer Ball Size',
          optionGroupID: '2c918082729f9bfa0172a3c6457f000e',
        },
        {
          optionGroupCode: 'colors',
          options: [
            {
              optionID: '2c91808472a3ddc70172cd2a7ee600f5',
              optionName: 'Blue',
              optionCode: 'global-blue',
            },
            {
              optionID: '2c918087740ac4470174117416d80014',
              optionName: 'Gold',
              optionCode: 'global-gold',
            },
            {
              optionID: '2c918087740ac44701741174682e0015',
              optionName: 'Silver',
              optionCode: 'global-silver',
            },
          ],
          optionGroupName: 'Colors',
          optionGroupID: '2c91808472a3ddc70172cd29da8d00f2',
        },
      ],
      brand_brandName: 'Northeast Sports Supply',
      defaultSku_skuPrices_price: 29.99,
      defaultSku_imageFile: 'fifa-soccer-ball-global-blue.jpg',
      urlTitle: 'fifa-soccer-ball',
      defaultSelectedOptions: '2c918082729f9bfa0172a3c9b475000f,2c91808472a3ddc70172cd2a7ee600f5',
      brand_urlTitle: 'northeast--sports-supply',
      images: ['/custom/assets/images/product/default/cache/fifa-soccer-ball-global-blue_150w_150h.jpg', '/custom/assets/images/product/default/cache/fifa-soccer-ball-global-blue_300w_300h.jpg', '/custom/assets/images/product/default/cache/fifa-soccer-ball-global-blue_212w_263h.jpg'],
      productType_productTypeID: '2c918082729f9bfa0172a3ca944d0012',
      panelNumber: ' ',
      ageGroupVolleyball: ' ',
      baseProductTypeSystemCode: 'merchandise',
      categories: [
        {
          urlTitle: 'soccer',
          categoryID: '2c9180867218c3fc01722d8f071e0011',
          categoryName: 'Soccer',
        },
      ],
      settings: {
        productTitleString: 'Northeast Sports Supply Fifa Soccer Ball',
        productMetaDescriptionString: '<h2>Quality Construction</h2>\r\n\r\n<ul>\r\n\t<li>Machine-stitched construction</li>\r\n\t<li>100% TPU cover</li>\r\n\t<li>Butyl bladder</li>\r\n\t<li>Durable lasting material</li>\r\n</ul>',
        productMetaKeywordsString: 'Fifa Soccer Ball, Soccer, Northeast Sports Supply',
        productHTMLTitleString: 'Northeast Sports Supply Fifa Soccer Ball - Soccer',
      },
      productDescription: '<h2>Quality Construction</h2>\r\n\r\n<ul>\r\n\t<li>Machine-stitched construction</li>\r\n\t<li>100% TPU cover</li>\r\n\t<li>Butyl bladder</li>\r\n\t<li>Durable lasting material</li>\r\n</ul>',
      brand_brandID: '2c91808472a3ddc70172a3e27e5f000c',
      soccerBallType: ' ',
      defaultSku_skuPrices_listPrice: 39.99,
      productName: 'Fifa Soccer Ball',
      productID: '2c91808975d7ac720175d9ed7054005a',
      productType_productTypeIDPath: '444df2f7ea9c87e60051f3cd87b435a1,2c9180867218c3fc01722d90783d0013,2c918082729f9bfa0172a3ca944d0012',
      productCode: 'fifa-soccer-ball',
    },
    {
      defaultSku_skuID: '2c91808975d7ac720175d950ab4d0024',
      calculatedQATS: 1000,
      optionGroups: [],
      brand_brandName: 'Sports Supply Professionals',
      defaultSku_skuPrices_price: 7.99,
      defaultSku_imageFile: 'coaching-guides-digital-subscription-.jpg',
      urlTitle: 'coaching-guides-digital-subscription',
      defaultSelectedOptions: '',
      brand_urlTitle: 'sports-supply-professionals',
      images: ['/custom/assets/images/product/default/cache/coaching-guides-digital-subscription-_150w_150h.jpg', '/custom/assets/images/product/default/cache/coaching-guides-digital-subscription-_300w_300h.jpg', '/custom/assets/images/product/default/cache/coaching-guides-digital-subscription-_212w_263h.jpg'],
      productType_productTypeID: '444df2f9c7deaa1582e021e894c0e299',
      panelNumber: ' ',
      ageGroupVolleyball: ' ',
      baseProductTypeSystemCode: 'subscription',
      categories: [],
      settings: {
        productTitleString: 'Sports Supply Professionals Coaching Guides Digital Subscription',
        productMetaDescriptionString: '<p>Subscribe to the&nbsp;Coaching Guides Digital Subscription to receive unlimited access to newly curated coaching training guides.&nbsp;</p>',
        productMetaKeywordsString: 'Coaching Guides Digital Subscription, Subscription, Sports Supply Professionals',
        productHTMLTitleString: 'Sports Supply Professionals Coaching Guides Digital Subscription - Subscription',
      },
      productDescription: '<p>Subscribe to the&nbsp;Coaching Guides Digital Subscription to receive unlimited access to newly curated coaching training guides.&nbsp;</p>',
      brand_brandID: '2c91808373d825ac017402ebc12f0026',
      soccerBallType: ' ',
      defaultSku_skuPrices_listPrice: ' ',
      productName: 'Coaching Guides Digital Subscription',
      productID: '2c91808975d7ac720175d950ab3b0023',
      productType_productTypeIDPath: '444df2f9c7deaa1582e021e894c0e299',
      productCode: 'coaching-guides-digital-subscription',
    },
    {
      defaultSku_skuID: '2c91808e75cee84a0175d30dcf07001f',
      calculatedQATS: 1000,
      optionGroups: [],
      brand_brandName: ' ',
      defaultSku_skuPrices_price: 10.99,
      defaultSku_imageFile: 'soccer-training-magazine-.jpg',
      urlTitle: 'soccer-training-magazine-issue-2020',
      defaultSelectedOptions: '',
      brand_urlTitle: ' ',
      images: ['/custom/assets/images/product/default/cache/soccer-training-magazine-_150w_150h.jpg', '/custom/assets/images/product/default/cache/soccer-training-magazine-_300w_300h.jpg', '/custom/assets/images/product/default/cache/soccer-training-magazine-_212w_263h.jpg'],
      productType_productTypeID: '444df313ec53a08c32d8ae434af5819a',
      panelNumber: ' ',
      ageGroupVolleyball: ' ',
      baseProductTypeSystemCode: 'contentAccess',
      categories: [],
      settings: {
        productTitleString: ' Soccer Training Magazine Issue 2020',
        productMetaDescriptionString:
          '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse scelerisque gravida nunc, in placerat magna ullamcorper id. Vestibulum scelerisque magna nisl, vel volutpat tortor iaculis vitae. Donec sed quam vulputate, vestibulum lorem eu, tempor ante. Fusce bibendum ligula quis ipsum interdum condimentum. Nunc et velit augue. Nulla sed nulla nec ante euismod rhoncus sed vitae lorem. Nulla cursus in ligula at tincidunt. Maecenas lacus augue, scelerisque eu turpis eu, vestibulum laoreet urna. Maecenas condimentum porttitor libero id rutrum. Maecenas nisi dolor, tincidunt nec dapibus ut, venenatis sit amet risus. Suspendisse eu augue laoreet, gravida elit sit amet, ullamcorper purus. Phasellus in finibus velit. Sed nec feugiat ligula. Cras placerat maximus dolor at maximus. In tristique, enim id luctus convallis, tortor dolor ullamcorper odio, non suscipit massa nibh in felis. Aenean ultrices sit amet tellus eget dapibus. Donec in diam in ipsum ultricies ullamcorper a tristique sapien. Nulla cursus augue eu augue tincidunt mollis. Duis quis fermentum nulla. Proin nisl est, fermentum sit amet turpis eu, pharetra sagittis nibh. Vestibulum velit justo, hendrerit ut laoreet at, viverra eget risus. Morbi sollicitudin ac elit vitae rhoncus. Donec sit amet tristique mauris, vehicula molestie nunc. Fusce auctor, libero vitae semper sollicitudin, nunc est auctor odio, vitae imperdiet velit odio non eros.</p>',
        productMetaKeywordsString: 'Soccer Training Magazine Issue 2020, Content Access, ',
        productHTMLTitleString: ' Soccer Training Magazine Issue 2020 - Content Access',
      },
      productDescription:
        '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse scelerisque gravida nunc, in placerat magna ullamcorper id. Vestibulum scelerisque magna nisl, vel volutpat tortor iaculis vitae. Donec sed quam vulputate, vestibulum lorem eu, tempor ante. Fusce bibendum ligula quis ipsum interdum condimentum. Nunc et velit augue. Nulla sed nulla nec ante euismod rhoncus sed vitae lorem. Nulla cursus in ligula at tincidunt. Maecenas lacus augue, scelerisque eu turpis eu, vestibulum laoreet urna. Maecenas condimentum porttitor libero id rutrum. Maecenas nisi dolor, tincidunt nec dapibus ut, venenatis sit amet risus. Suspendisse eu augue laoreet, gravida elit sit amet, ullamcorper purus. Phasellus in finibus velit. Sed nec feugiat ligula. Cras placerat maximus dolor at maximus. In tristique, enim id luctus convallis, tortor dolor ullamcorper odio, non suscipit massa nibh in felis. Aenean ultrices sit amet tellus eget dapibus. Donec in diam in ipsum ultricies ullamcorper a tristique sapien. Nulla cursus augue eu augue tincidunt mollis. Duis quis fermentum nulla. Proin nisl est, fermentum sit amet turpis eu, pharetra sagittis nibh. Vestibulum velit justo, hendrerit ut laoreet at, viverra eget risus. Morbi sollicitudin ac elit vitae rhoncus. Donec sit amet tristique mauris, vehicula molestie nunc. Fusce auctor, libero vitae semper sollicitudin, nunc est auctor odio, vitae imperdiet velit odio non eros.</p>',
      brand_brandID: ' ',
      soccerBallType: ' ',
      defaultSku_skuPrices_listPrice: ' ',
      productName: 'Soccer Training Magazine Issue 2020',
      productID: '2c91808e75cee84a0175d30dcedd001e',
      productType_productTypeIDPath: '444df313ec53a08c32d8ae434af5819a',
      productCode: 'soccer-training-magazine',
    },
    {
      defaultSku_skuID: '2c91808974e8eba001750d83dc200020',
      calculatedQATS: 1000,
      optionGroups: [],
      brand_brandName: ' ',
      defaultSku_skuPrices_price: 25,
      defaultSku_imageFile: 'mixed-gift-card-.jpg',
      urlTitle: 'mixed-egift-card',
      defaultSelectedOptions: '',
      brand_urlTitle: ' ',
      images: ['/assets/images/cache/missingimage_150w_150h.jpg', '/assets/images/cache/missingimage_300w_300h.jpg', '/assets/images/cache/missingimage_212w_263h.jpg'],
      productType_productTypeID: '50cdfabbc57f7d103538d9e0e37f61e4',
      panelNumber: ' ',
      ageGroupVolleyball: ' ',
      baseProductTypeSystemCode: 'gift-card',
      categories: [],
      settings: {
        productTitleString: ' Mixed eGift Card',
        productMetaDescriptionString: '',
        productMetaKeywordsString: 'Mixed eGift Card, Gift Card, ',
        productHTMLTitleString: ' Mixed eGift Card - Gift Card',
      },
      productDescription: ' ',
      brand_brandID: ' ',
      soccerBallType: ' ',
      defaultSku_skuPrices_listPrice: ' ',
      productName: 'Mixed eGift Card',
      productID: '2c91808974e8eba001750d83dc0f001f',
      productType_productTypeIDPath: '50cdfabbc57f7d103538d9e0e37f61e4',
      productCode: 'mixed-gift-card',
    },
  ]

  return (
    <Grid columns="1fr 4fr 1fr">
      <FilterSidebar sdk={sdk} filters={filters} setFilters={setFilters} />

      <ProductGrid products={products} selectedProducts={selectedProducts} setSelectedProducts={setSelectedProducts} />

      <SelectedProductsSidebar selectedProducts={selectedProducts} />
    </Grid>
  )
}

export default ProductsPicker
