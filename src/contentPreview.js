// we got different keys for all products API and multiproducts API so we used 2 functions.
import preloadData from './preload'
import * as SlatwalSDK from '@slatwall/slatwall-sdk'

// to preview the last updated products get it from API
const fetchProductPreviews = async (skus = [], config) => {
  const { placeHolderImage } = preloadData
  if (!skus.length) {
    return []
  }

  const { apiEndpoint, siteCode } = config

  const SlatwalApiService = SlatwalSDK.init({
    host: apiEndpoint,
  })

  const payload = {
    entityName: 'product',
    includeAttributesMetadata: true,
    'f:productID:in': skus.join(','),
  }
  let results = await SlatwalApiService.general
    .getEntity(payload, {
      'SWX-requestSiteCode': siteCode,
    })
    .then(response => {
      if (response.isSuccess() && response.success().data && response.success().data.pageRecords) {
        return response.success().data.pageRecords
      }
      console.log('error')
      return []
    })
  const foundProducts = results.map(({ productName = '', images = [], productID = '', brand_brandName, productCode }) => {
    return {
      image: process.env.REACT_APP_SLATWALL_URL + (images.length ? images[1] : placeHolderImage),
      name: productName,
      sku: productID,
      brand: brand_brandName,
      productCode: productCode,
    }
  })
  const missingProducts = skus.filter(data => !foundProducts.map(product => product.sku).includes(data)).map(sku => ({ sku, isMissing: true, image: '', name: '', id: '' }))
  return [...foundProducts, ...missingProducts]
}
export { fetchProductPreviews }
