import { render } from 'react-dom';

import '@contentful/forma-36-react-components/dist/styles.css';
import '@contentful/forma-36-fcss/dist/styles.css';
import '@contentful/forma-36-tokens/dist/css/index.css';
import { setup, renderSkuPicker } from '@contentful/ecommerce-app-base';

import logo from './assets/slatwall.svg';
import { fetchProductPreviews, makeProductSearchResolver } from './productResolvers'
import LocalhostWarning from './components/LocalhostWarning';

const DIALOG_ID = 'dialog-root';
const PER_PAGE = 20;

function makeCTA(fieldType: any) {
  return fieldType === 'Array' ? 'Select products' : 'Select a product';
}

export function validateParameters(parameters: any) {
  if (parameters.storefrontAccessToken.length < 1) {
    return 'Provide the storefront access token to your slatwall store.';
  }
  if (parameters.apiEndpoint.length < 1) {
    return 'Provide the slatwall API endpoint.';
  }
  return null;
}

function isDisabled(/* currentValue, config */) {
  // No restrictions need to be imposed as to when the field is disabled from the app's side
  return false;
}

let products = [{
  id: '1',
  image: 'https://images-na.ssl-images-amazon.com/images/I/71ZIrJ6XLLL._SL1500_.jpg',
  productId: '123',
  name: 'Watch',
  sku: '11'
},
{
  id: '2',
  image: 'https://contents.mediadecathlon.com/p1484240/k$ab565f3675dbdd7e3c486175e2c16583/men-s-travel-trekking-shirt-travel100-warm-bordeaux.jpg?&f=x',
  productId: '123',
  name: 'shirt',
  sku: '12'
},
{
  id: '3',
  image: 'https://static.digit.in/product/97036a3ef3b60f99a34cf0e16fb867896146a6e2.jpeg?tr=w-1200',
  productId: '123',
  name: 'mobile',
  sku: '13'
},
{
  id: '4',
  image: 'https://5.imimg.com/data5/PQ/KY/MY-37987079/cello-butterflow-pen-pack-of-5-700x700-500x500.jpg',
  productId: '123',
  name: 'pen',
  sku: '14'
}]

async function fetchSKUs(installationParams: any, search: String, pagination: any) {
  const validationError = validateParameters(installationParams);
  if (validationError) {
    throw new Error(validationError);
  }

  const { clientId, apiEndpoint } = installationParams;
  // const accessToken = await getAccessToken(clientId, apiEndpoint);

  // const URL = `${apiEndpoint}/api/skus?page[size]=${PER_PAGE}&page[number]=${pagination.offset /
  //   PER_PAGE +
  //   1}${search.length ? `&filter[q][name_or_code_cont]=${search}` : ''}`;

  // const res = await fetch(URL, {
  //   headers: {
  //     Accept: 'application/vnd.api+json',
  //     Authorization: `Bearer ${accessToken}`
  //   },
  //   method: 'GET'
  // });

  return products;
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

async function renderDialog(sdk: any) {
  const container = document.createElement('div');
  container.id = DIALOG_ID;
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  document.body.appendChild(container);

  renderSkuPicker(DIALOG_ID, {
    sdk,
    fetchProductPreviews,
    fetchProducts: async (search, pagination) => {
      const result = await fetchSKUs(sdk.parameters.installation, search, pagination);
      return {
        pagination: {
          count: PER_PAGE,
          limit: PER_PAGE,
          total: result.length,
          offset: 1
        },
        products
      };
    },
    searchDelay: 750
  });

  sdk.window.startAutoResizer();
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
      {
        id: 'storefrontAccessToken',
        name: 'Storefront Access Token',
        description: 'The storefront access token to your Slatwall store',
        type: 'Symbol',
        required: true
      },
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
