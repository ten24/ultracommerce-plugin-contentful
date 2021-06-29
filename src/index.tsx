import { render } from "react-dom";

import "@contentful/forma-36-react-components/dist/styles.css";
import "@contentful/forma-36-fcss/dist/styles.css";
import "@contentful/forma-36-tokens/dist/css/index.css";
import { setup, renderSkuPicker } from "@contentful/ecommerce-app-base";

import logo from "./assets/slatwall.svg";
import LocalhostWarning from "./components/LocalhostWarning";
import {
  singleProductdataTransformer,
  multipleProductdataTransformers,
} from "./dataTransformer";
import preloadData from "./preload";
const SlatwalSDK = require("@slatwall/slatwall-sdk/dist/client/index");
const DIALOG_ID = "root";
const { PREVIEWS_PER_PAGE } = preloadData;

function _chunk(array: any, size = 1) {
  let arrayChunks = [];
  for (let i = 0; i < array.length; i += size) {
    let arrayChunk = array.slice(i, i + size);
    arrayChunks.push(arrayChunk);
  }
  return arrayChunks;
}

function makeCTA(fieldType: any) {
  return fieldType === "Array" ? "Select products" : "Select a product";
}
// it validates the config values
function validateParameters(parameters: any) {
  if (parameters.apiEndpoint.length < 1) {
    return "Provide the slatwall API endpoint.";
  }
  return null;
}

// to get all products to show in the dialogue modal
async function fetchSKUs(
  installationParams: any,
  search: any,
  pagination: any
) {
  const validationError = validateParameters(installationParams);
  if (validationError) {
    throw new Error(validationError);
  }
  const { apiEndpoint } = installationParams;

  let SlatwalApiService = SlatwalSDK.init({
    host: apiEndpoint,
  });
  let payload = {
    currentPage: pagination.offset / PREVIEWS_PER_PAGE + 1,
    keyword: search,
    pageSize: PREVIEWS_PER_PAGE,
  };
  const resp = await SlatwalApiService.products
    .search(payload)
    .then((response: any) => {
      return response;
    });
  return resp.success();
}

// to preview the last updated products get it from API
const fetchProductPreviews = async function fetchProductPreviews(
  skus: any,
  config: any
) {
  if (!skus.length) {
    return [];
  }

  const { apiEndpoint } = config;
  let SlatwalApiService = SlatwalSDK.init({
    host: apiEndpoint,
  });

  // chunk used for split the data
  const resultPromises = _chunk(skus, PREVIEWS_PER_PAGE).map(
    async (skusSubset) => {
      let params = {
        "f:publishedFlag": 1,
        "f:productCode:in": skusSubset.map((data: any) => data).join(","),
        entityName: "Product",
        includeAttributesMetadata: true,
        pageSize: PREVIEWS_PER_PAGE,
      };
      const resp = await SlatwalApiService.general
        .getEntity(params)
        .then((response: any) => {
          return response;
        });

      return resp.success();
    }
  );

  const results = await Promise.all(resultPromises);

  const foundProducts = results.flatMap(({ data }) => {
    return data.map(multipleProductdataTransformers(apiEndpoint));
  });

  const missingProducts = skus
    .filter(
      (data: any) => !foundProducts.map((product) => product.sku).includes(data)
    )
    .map((sku: any) => ({ sku, isMissing: true, image: "", name: "", id: "" }));
  return [...foundProducts, ...missingProducts];
};

async function renderDialog(sdk: any) {
  const container = document.createElement("div");
  container.style.display = "flex";
  container.style.flexDirection = "column";
  // picker modal data
  renderSkuPicker(DIALOG_ID, {
    sdk,
    fetchProductPreviews,
    fetchProducts: async (search, pagination) => {
      const result = await fetchSKUs(
        sdk.parameters.installation,
        search,
        pagination
      );

      return {
        pagination: {
          count: PREVIEWS_PER_PAGE,
          limit: PREVIEWS_PER_PAGE,
          total: result.data.products.length,
          offset: 1,
        },
        products: result.data.products.map(
          singleProductdataTransformer(sdk.parameters.installation.apiEndpoint)
        ),
      };
    },
  });

  sdk.window.startAutoResizer();
}

async function openDialog(sdk: any, config: any) {
  const skus = await sdk.dialogs.openCurrentApp({
    allowHeightOverflow: true,
    position: "center",
    title: makeCTA(sdk.field.type),
    shouldCloseOnOverlayClick: true,
    shouldCloseOnEscapePress: true,
    parameters: config,
    width: 1400,
  });

  return Array.isArray(skus) ? skus : [];
}

function isDisabled(/* currentValue, config */) {
  // No restrictions need to be imposed as to when the field is disabled from the app's side
  return false;
}

if (process.env.NODE_ENV === "development" && window.self === window.top) {
  // You can remove this if block before deploying your app
  const root = document.getElementById("root");
  render(<LocalhostWarning />, root);
} else {
  setup({
    makeCTA,
    name: "Slatwall",
    logo,
    color: "#212F3F",
    description:
      "The Slatwall app allows editors to select products from their Slatwall account and reference them inside of Contentful entries.",
    parameterDefinitions: [
      {
        id: "apiEndpoint",
        name: "API Endpoint",
        description: "The Slatwall API endpoint",
        type: "Symbol",
        required: true,
      },
    ],
    validateParameters: validateParameters,
    fetchProductPreviews,
    renderDialog,
    openDialog,
    isDisabled,
  });
}
