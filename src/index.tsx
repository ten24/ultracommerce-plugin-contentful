import { render } from "react-dom";

import "@contentful/forma-36-react-components/dist/styles.css";
import "@contentful/forma-36-fcss/dist/styles.css";
import "@contentful/forma-36-tokens/dist/css/index.css";
import { setup, renderSkuPicker } from "@contentful/ecommerce-app-base";

import logo from "./assets/slatwall.svg";
import chunk from "lodash/chunk";
import flatMap from "lodash/flatMap";
import difference from "lodash/difference";
import LocalhostWarning from "./components/LocalhostWarning";
import {
  singleProductdataTransformer,
  multipleProductdataTransformers,
} from "./dataTransformer";

const DIALOG_ID = "root";
const PER_PAGE = 20;
// var accessToken: any = null;

function makeCTA(fieldType: any) {
  return fieldType === "Array" ? "Select products" : "Select a product";
}

function validateParameters(parameters: any) {
  if (parameters.apiEndpoint.length < 1) {
    return "Provide the slatwall API endpoint.";
  }
  // if (parameters.storefrontAccessToken.length < 1) {
  //   return "Provide the storefront access token to your slatwall store.";
  // }
  return null;
}

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

  const URL = `${apiEndpoint}/api/scope/getProducts?currentPage=${
    pagination.offset / PER_PAGE + 1
  }&pageSize=${PER_PAGE}${search.length ? `&keyword=${search}` : ""}`;

  const res = await fetch(URL, {
    headers: {
      Accept: "application/vnd.api+json",
    },
    method: "GET",
  });

  return await res.json();
}

const fetchProductPreviews = async function fetchProductPreviews(
  skus: any,
  config: any
) {
  if (!skus.length) {
    return [];
  }

  const PREVIEWS_PER_PAGE = 25;

  const { apiEndpoint } = config;

  const resultPromises = chunk(skus, PREVIEWS_PER_PAGE).map(
    async (skusSubset) => {
      const URL = `${apiEndpoint}/api/public/Product?f:publishedFlag=true&f:productCode:in=${skusSubset}&pageSize=${PREVIEWS_PER_PAGE}`;
      const res = await fetch(URL, {
        headers: {
          Accept: "application/vnd.api+json",
        },
        method: "GET",
      });
      return await res.json();
    }
  );

  const results = await Promise.all(resultPromises);

  const foundProducts = flatMap(results, ({ data }) => {
    return data.map(multipleProductdataTransformers(apiEndpoint));
  });

  const missingProducts = difference(
    skus,
    foundProducts.map((product) => product.sku)
  ).map((sku) => ({ sku, isMissing: true, image: "", name: "", id: "" }));
  return [...foundProducts, ...missingProducts];
};

async function renderDialog(sdk: any) {
  const container = document.createElement("div");
  container.style.display = "flex";
  container.style.flexDirection = "column";

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
          count: PER_PAGE,
          limit: PER_PAGE,
          total: result.data.total,
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

async function openDialog(sdk: any, currentValue: any, config: any) {
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
        id: "storefrontAccessToken",
        name: "Storefront Access Token",
        description: "The storefront access token to your Slatwall store",
        type: "Symbol",
        required: false,
      },
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
