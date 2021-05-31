import get from "lodash/get";

/**
 * Transforms the API response of CommerceLayer into
 * the product schema expected by the SkuPicker component
 */
export const singleProductdataTransformer = (projectUrl) => (product) => {
  const { sku_skuID } = product;
  const image =
    get(product, ["imageUrl"]) ||
    "https://lh3.googleusercontent.com/f4wX2JJcJRVbtGedb6Is06kfl1Lb4KV2p6_XAzusHS1rZ0JSH1_eUkG-0YA6u5fkSjg1FQ=s85";
  const name = get(product, ["product_productName"]);
  const sku = get(product, ["product_productCode"]);
  return {
    sku_skuID,
    image,
    name,
    sku,
    externalLink: `${projectUrl}/admin/skus/${sku_skuID}/edit`,
  };
};
export const multipleProductdataTransformers = (projectUrl) => (product) => {
  const { defaultSku_skuID } = product;
  const image =
    get(product, ["imageUrl"]) ||
    "https://lh3.googleusercontent.com/f4wX2JJcJRVbtGedb6Is06kfl1Lb4KV2p6_XAzusHS1rZ0JSH1_eUkG-0YA6u5fkSjg1FQ=s85";
  const name = get(product, ["productName"]);
  const sku = get(product, ["productCode"]);
  return {
    sku_skuID: defaultSku_skuID,
    image,
    name,
    sku,
    externalLink: `${projectUrl}/admin/skus/${defaultSku_skuID}/edit`,
  };
};
