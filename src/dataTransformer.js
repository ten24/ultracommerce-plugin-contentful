/**
 * Transforms the API response of slatwall into
 * the product schema expected by the SkuPicker component
 */
export const singleProductdataTransformer =
  (projectUrl) =>
  ({ sku_skuID, sku_imageFile, product_productName, product_productCode }) => {
    // we need to pass the image name and sku as empty so we used ternary here.
    const image = sku_imageFile
      ? sku_imageFile
      : "https://lh3.googleusercontent.com/f4wX2JJcJRVbtGedb6Is06kfl1Lb4KV2p6_XAzusHS1rZ0JSH1_eUkG-0YA6u5fkSjg1FQ=s85";
    const name = product_productName ? product_productName : "";
    const sku = product_productCode ? product_productCode : "";
    return {
      sku_skuID,
      image:
        "https://contentful.slatwallcommerce-dev.io" +
        "/custom/assets/images/product/default/" +
        image,
      name,
      sku,
      externalLink: `${projectUrl}/admin/skus/${sku_skuID}/edit`,
    };
  };
export const multipleProductdataTransformers =
  (projectUrl) =>
  ({ defaultSku_skuID, imageUrl, productName, productCode }) => {
    // we need to pass the image name and sku as empty so we used ternary here.
    const image = imageUrl
      ? imageUrl
      : "https://lh3.googleusercontent.com/f4wX2JJcJRVbtGedb6Is06kfl1Lb4KV2p6_XAzusHS1rZ0JSH1_eUkG-0YA6u5fkSjg1FQ=s85";
    const name = productName ? productName : "";
    const sku = productCode ? productCode : "";
    return {
      sku_skuID: defaultSku_skuID,
      image,
      name,
      sku,
      externalLink: `${projectUrl}/admin/skus/${defaultSku_skuID}/edit`,
    };
  };
