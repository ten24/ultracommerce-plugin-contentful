/**
 * Transforms the API response of slatwall into
 * the product schema expected by the SkuPicker component
 */

// we got different keys for all products API and multiproducts API so we used 2 functions.
import preloadData from "./preload";
const { imageURL, placeHolderImage } = preloadData;
export const singleProductdataTransformer =
  () =>
  ({ productName, images, productID }) => {
    // we need to pass the image name and sku as empty so we used ternary here.
    const image = images.length ? images[1] : placeHolderImage;
    const name = productName ? productName : "";
    // As per the API we can get the multiple products using the product code only, so I have used the product code as sku.
    const sku = productID ? productID : "";
    return {
      sku_skuID: productID,
      image: imageURL + image,
      name,
      sku,
    };
  };
