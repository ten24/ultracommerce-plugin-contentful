import { render } from 'react-dom';

import '@contentful/forma-36-react-components/dist/styles.css';
import '@contentful/forma-36-fcss/dist/styles.css';
import '@contentful/forma-36-tokens/dist/css/index.css';
import { setup, renderSkuPicker } from '@contentful/ecommerce-app-base';
// import CLayerAuth from '@commercelayer/js-auth';

import logo from './assets/slatwall.svg';
import chunk from 'lodash/chunk';
import flatMap from 'lodash/flatMap';
import difference from 'lodash/difference';
import LocalhostWarning from './components/LocalhostWarning';
import { dataTransformer } from './dataTransformer';

const DIALOG_ID = 'root';
const PER_PAGE = 20;
var accessToken: any = null;

function makeCTA(fieldType: any) {
  return fieldType === 'Array' ? 'Select products' : 'Select a product';
}

function validateParameters(parameters: any) {
  if (parameters.apiEndpoint.length < 1) {
    return 'Provide the slatwall API endpoint.';
  }
  return null;
}

// async function getAccessToken() {
//   let accessTokens: any = ''
//   if (!accessToken) {
//     accessTokens = (
//       await CLayerAuth.getIntegrationToken({
//         clientId: 'wXqRQI8me0saW5nGXpAZAGjdTfv4mf-UT7bxi7kTKE8',
//         endpoint: 'https://the-green-brand-112.commercelayer.io',
//         clientSecret: ''
//       })
//     );
//     console.log('accessToken......', accessTokens.accessToken)
//   }
//   return accessTokens.accessToken;
// }

async function fetchSKUs(installationParams: any, search: any, pagination: any) {
  const validationError = validateParameters(installationParams);
  if (validationError) {
    throw new Error(validationError);
  }
  const { apiEndpoint } = installationParams;
  // const accessToken = await getAccessToken();

  // const URL = `https://the-green-brand-112.commercelayer.io/api/skus?page[size]=${PER_PAGE}&page[number]=${pagination.offset /
  //   PER_PAGE +
  //   1}${search.length ? `&filter[q][name_or_code_cont]=${search}` : ''}`;

  // const res = await fetch(URL, {
  //   headers: {
  //     Accept: 'application/vnd.api+json',
  //     Authorization: `Bearer eyJhbGciOiJIUzUxMiJ9.eyJvcmdhbml6YXRpb24iOnsiaWQiOiJ6bkJFckZKTm9YIn0sImFwcGxpY2F0aW9uIjp7ImlkIjoiYXBFbWFpV2JWcCIsImtpbmQiOiJjb250ZW50ZnVsIiwicHVibGljIjp0cnVlfSwidGVzdCI6dHJ1ZSwiZXhwIjoxNjE5MTAwNzQ5LCJyYW5kIjowLjg4ODUwNDU2MTAwMzYyOTh9.NDQKdKxY4gY-V03mikRzXUYLQVEiWAgxbx8UyYRJ8P5m4tDaFXzGG-sjRs-huOiN3aqL7Z5RSKFj9fCzOQTwkA`
  //   },
  //   method: 'GET'
  // });

  // console.log('res,,,,,,,,', await res.json())
  let response: any = []
  let init = {
    hostname: 'slatwall.mitrahsoft.co.in',
    AccessKey: 'B44ACE4E36B498BFCE066FD5CF2881C5C540F570',
    AccessKeySecret: 'ODM0MjQ4REVBNDY1ODY4REJCNTY1MkJCRDZGOTQzQUVDMDg2NEZCMw=='
  }

  const slatwall = require("../src/Slatwall/slatwall")(init)

  var res = await slatwall.products.get()
  console.log('res....', JSON.parse(res))
  response = JSON.parse(res).pageRecords
  console.log('response', response)
  return response;
}

const fetchProductPreviews = async function fetchProductPreviews(skus: any, config: any) {
  console.log('fetchProductPreviews....')
  if (!skus.length) {
    return [];
  }

  const PREVIEWS_PER_PAGE = 25;
  console.log('config', config)

  // const { apiEndpoint } = config;
  // const accessToken = await getAccessToken( apiEndpoint);

  const resultPromises = chunk(skus, PREVIEWS_PER_PAGE).map(async skusSubset => {
    // const URL = `${apiEndpoint}/api/skus?page[size]=${PREVIEWS_PER_PAGE}&filter[q][code_in]=${skusSubset}`;
    // const URL = `https://the-green-brand-112.commercelayer.io/api/skus?page[size]=${PREVIEWS_PER_PAGE}&filter[q][code_in]=${skusSubset}`;
    const URL = `https://slatwall.mitrahsoft.co.in/api/skus?page[size]=${PREVIEWS_PER_PAGE}&filter[q][code_in]=${skusSubset}`;
    const res = await fetch(URL, {
      headers: {
        Accept: 'application/vnd.api+json',
        Authorization: `Bearer eyJhbGciOiJIUzUxMiJ9.eyJvcmdhbml6YXRpb24iOnsiaWQiOiJ6bkJFckZKTm9YIn0sImFwcGxpY2F0aW9uIjp7ImlkIjoiYXBFbWFpV2JWcCIsImtpbmQiOiJjb250ZW50ZnVsIiwicHVibGljIjp0cnVlfSwidGVzdCI6dHJ1ZSwiZXhwIjoxNjE5MTAwNzQ5LCJyYW5kIjowLjg4ODUwNDU2MTAwMzYyOTh9.NDQKdKxY4gY-V03mikRzXUYLQVEiWAgxbx8UyYRJ8P5m4tDaFXzGG-sjRs-huOiN3aqL7Z5RSKFj9fCzOQTwkA`
      },
      method: 'GET'
    });
    return await res.json();
  });

  const results = await Promise.all(resultPromises);

  const foundProducts = flatMap(results, ({ data }) =>
    // data.map(dataTransformer(config.apiEndpoint))
    data.map(dataTransformer('https://the-green-brand-112.commercelayer.io'))
  );

  const missingProducts = difference(
    skus,
    foundProducts.map(product => product.sku)
  ).map(sku => ({ sku, isMissing: true, image: '', name: '', id: '' }));

  return [...foundProducts, ...missingProducts];
};

async function renderDialog(sdk: any) {
  const container = document.createElement('div');
  container.style.display = 'flex';
  container.style.flexDirection = 'column';

  renderSkuPicker(DIALOG_ID, {
    sdk,
    fetchProductPreviews,
    fetchProducts: async (search, pagination) => {
      const result = await fetchSKUs(sdk.parameters.installation, search, pagination);
      return {
        pagination: {
          count: PER_PAGE,
          limit: PER_PAGE,
          // total: result.meta.record_count,
          total: 10,
          offset: 1
        },
        // products: result.data.map(dataTransformer(sdk.parameters.installation.apiEndpoint))
        // products: result.data.map(dataTransformer('https://the-green-brand-112.commercelayer.io'))
        products: []
      };
    }
  });

  sdk.window.startAutoResizer();
}

async function openDialog(sdk: any, currentValue: any, config: any) {
  const skus = await sdk.dialogs.openCurrentApp({
    allowHeightOverflow: true,
    position: 'center',
    title: makeCTA(sdk.field.type),
    shouldCloseOnOverlayClick: true,
    shouldCloseOnEscapePress: true,
    parameters: config,
    width: 1400
  });

  return Array.isArray(skus) ? skus : [];
}

function isDisabled(/* currentValue, config */) {
  // No restrictions need to be imposed as to when the field is disabled from the app's side
  return false;
}

if (process.env.NODE_ENV === 'development' && window.self === window.top) {
  // You can remove this if block before deploying your app
  const root = document.getElementById('root');
  render(<LocalhostWarning />, root);
} else {
  setup({
    makeCTA,
    name: 'Slatwall',
    logo,
    color: '#212F3F',
    description: 'The Slatwall app allows editors to select products from their Slatwall account and reference them inside of Contentful entries.',
    parameterDefinitions: [
      // {
      //   id: 'storefrontAccessToken',
      //   name: 'Storefront Access Token',
      //   description: 'The storefront access token to your Slatwall store',
      //   type: 'Symbol',
      //   required: true
      // },
      {
        id: 'apiEndpoint',
        name: 'API Endpoint',
        description: 'The Slatwall API endpoint',
        type: 'Symbol',
        required: true
      }
    ],
    validateParameters: validateParameters,
    fetchProductPreviews,
    renderDialog,
    openDialog,
    isDisabled,
  });
}
