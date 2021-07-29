import { render } from "react-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { setup } from "@contentful/ecommerce-app-base";
import logo from "./assets/slatwall.svg";
import { singleProductdataTransformer } from "./dataTransformer";
import preloadData from "./preload";
import ProductsPicker from "./picker";
import { _chunk } from "./utils";

const SlatwalSDK = require("@slatwall/slatwall-sdk/dist/client/index");

var axios = require("axios");

const DIALOG_ID = "root";
const { PREVIEWS_PER_PAGE } = preloadData;

// it validates the config values
function validateParameters(parameters: any) {
  if (parameters.apiEndpoint.length < 1) {
    return "Provide the slatwall API endpoint.";
  }
  return null;
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
      var config = {
        method: "get",
        url: `${apiEndpoint}/api/public/product/?f:productID:in=${skusSubset
          .map((data: any) => data)
          .join(",")}`,
      };

      let res = await axios(config)
        .then(function (response: any) {
          return response.data;
        })
        .catch(function (error: any) {
          console.log(error);
        });
      return res;
    }
  );

  const results = await Promise.all(resultPromises);

  const foundProducts = results.flatMap(({ data }) => {
    return data.map(singleProductdataTransformer());
  });
  // if any products are missed from API we need to the products with missed label
  const missingProducts = skus
    .filter(
      (data: any) => !foundProducts.map((product) => product.sku).includes(data)
    )
    .map((sku: any) => ({ sku, isMissing: true, image: "", name: "", id: "" }));
  return [...foundProducts, ...missingProducts];
};

async function renderDialog(sdk: any) {
  const root = document.getElementById(DIALOG_ID);
  render(
    <ProductsPicker
      validateParameters={validateParameters}
      sdk={sdk}
      fetchProductPreviews={fetchProductPreviews}
    />,
    root
  );
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
    width: 1600,
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
