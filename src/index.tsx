import ReactDOMServer from "react-dom/server";
import { setup, renderSkuPicker } from "@contentful/ecommerce-app-base";
// import { setup, renderSkuPicker } from "./contentfulLibrary/@contentful/ecommerce-app-base";
import logo from "./assets/slatwall.svg";
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
  console.log("search", search);

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
  const resp = await SlatwalApiService.products.list().then((response: any) => {
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

  // we get get last updated products ids in skus
  // chunk used for split the data (if we got 50 sku's we need to split it by previous per page) for pagination.
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
    return data.map(multipleProductdataTransformers());
  });
  // if any products are missed from API we need to the products with missed label
  const missingProducts = skus
    .filter(
      (data: any) => !foundProducts.map((product) => product.sku).includes(data)
    )
    .map((sku: any) => ({ sku, isMissing: true, image: "", name: "", id: "" }));
  return [...foundProducts, ...missingProducts];
};

function test(sdk: any) {
  return (
    <div
      style={{
        justifyContent: "space-between",
        flexDirection: "row",
        display: "flex",
      }}
    >
      <label>Select Product types</label>
      <select id="types" onChange={() => fetchSKUs(sdk, "", 1)}>
        <option>Soccer</option>
        <option>BaseBall</option>
        <option>Goals</option>
        <option>Socks</option>
      </select>
      <label>Select Categories</label>
      <select id="Categories" onChange={() => console.log("onchange")}>
        <option>Hockey</option>
        <option>Soccer</option>
        <option>Golf</option>
        <option>Sports</option>
      </select>
    </div>
  );
}

async function renderDialog(sdk: any) {
  const container = document.createElement("div");
  container.innerHTML = ReactDOMServer.renderToString(test(sdk));
  document.body.prepend(container);
  renderSkuPicker(DIALOG_ID, {
    sdk,
    fetchProductPreviews: fetchProductPreviews, // to initialize the selected products (shortant property)
    fetchProducts: async (search, pagination) => {
      const result = await fetchSKUs(
        sdk.parameters.installation,
        search,
        pagination
      );
      console.log("result", result);

      return {
        pagination: {
          count: PREVIEWS_PER_PAGE,
          limit: PREVIEWS_PER_PAGE,
          total: 50, // as of now we are not getting total products in API so given static total.
          offset: 1,
        },
        products: result.data.products.map(multipleProductdataTransformers()),
      };
    },
  });
  sdk.window.startAutoResizer();
}
// to open the dialog modal
async function openDialog(sdk: any, currentValue: any, config: any) {
  const skus = await sdk.dialogs.openCurrentApp({
    allowHeightOverflow: true,
    position: "center",
    title: "Select products",
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

// initially setup is called
setup({
  //Returns the text that is displayed on the button in the field location (makeCTA).
  makeCTA: () => "Select products", // name of field button
  name: "Slatwall", // name of config screen
  logo, // logo of field button and config screen
  color: "#212F3F", // bg color of config screen
  description:
    "The Slatwall app allows editors to select products from their Slatwall account and reference them inside of Contentful entries.", // desc of config screen
  parameterDefinitions: [
    {
      id: "apiEndpoint",
      name: "API Endpoint",
      description: "The Slatwall API endpoint",
      type: "Symbol",
      required: true,
    },
  ], // what are the parameters we want to show in config screen we need to give here, as of now we want the api endpoint from the user.
  validateParameters: validateParameters, // to check the given parameter values are empty
  fetchProductPreviews, // to show the previously selected products in the field
  renderDialog, // to show the all products and preview the selected products in the dialog modal
  openDialog, // to render the dialog modal design.
  isDisabled, // to disable the select products button
});
