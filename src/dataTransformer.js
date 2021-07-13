/**
 * Transforms the API response of slatwall into
 * the product schema expected by the SkuPicker component
 */

// we got different keys for all products API and multiproducts API so we used 2 functions.
import preloadData from "./preload";
const { imageURL, placeHolderImage, imagePath } = preloadData;
export const singleProductdataTransformer =
  () =>
  ({ sku_skuID, sku_imageFile, product_productName, product_productCode }) => {
    // we need to pass the image name and sku as empty so we used ternary here.
    const image = sku_imageFile ? sku_imageFile : placeHolderImage;
    const name = product_productName ? product_productName : "";
    // As per the API we can get the multiple products using the product code only, so I have used the product code as sku.
    const sku = product_productCode ? product_productCode : "";
    return {
      sku_skuID,
      image: imageURL + imagePath + image,
      name,
      sku,
    };
  };
export const multipleProductdataTransformers =
  () =>
  ({ defaultSku_skuID, productName, productCode, images }) => {
    // we need to pass the image name and sku as empty so we used ternary here.
    const image = images.length > 0 ? images[0] : placeHolderImage;
    const name = productName ? productName : "";
    const sku = productCode ? productCode : "";
    return {
      sku_skuID: defaultSku_skuID,
      image: imageURL + image,
      name,
      sku,
    };
  };
