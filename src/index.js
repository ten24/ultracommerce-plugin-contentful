import { render } from 'react-dom'
import { setup } from '@contentful/ecommerce-app-base'
import { fetchProductPreviews } from './contentPreview'
import { ProductsPicker } from './components/ProductsPicker'
import logo from './assets/icon.svg'

const validateParameters = parameters => {
  if (parameters.apiEndpoint.length < 1) {
    return 'Provide the slatwall API endpoint.'
  }
  if (parameters.siteCode.length < 1) {
    return 'Provide the slatwall Site Code.'
  }
  return null
}

const renderDialog = async sdk => {
  render(<ProductsPicker validateParameters={validateParameters} sdk={sdk} fetchProductPreviews={fetchProductPreviews} />, document.getElementById('root'))
  sdk.window.startAutoResizer()
}
const openDialog = async (sdk, currentValue, config) => {
  return (
    (await sdk.dialogs.openCurrentApp({
      allowHeightOverflow: true,
      position: 'center',
      title: 'Select products',
      shouldCloseOnOverlayClick: true,
      shouldCloseOnEscapePress: true,
      parameters: config,
      width: 1600,
    })) || []
  )
}

if (process.env.REACT_APP_SLATWALL_LOCAL_DEVELOPMENT === 'true') {
  const phonySDK = {
    parameters: {
      invocation: {
        fieldValue: process.env.REACT_APP_SLATWALL_INITIAL_PRODUCTS || '',
      },
      installation: {
        apiEndpoint: process.env.REACT_APP_SLATWALL_URL,
        siteCode: process.env.REACT_APP_SLATWALL_SITE_CODE,
      },
    },
    notifier: {
      error: msg => {
        console.log('Error:', msg)
      },
    },
  }
  render(
    <div style={{ width: '1200px' }}>
      <ProductsPicker validateParameters={validateParameters} sdk={phonySDK} fetchProductPreviews={fetchProductPreviews} />
    </div>,
    document.getElementById('root')
  )
} else {
  // initially setup is called
  setup({
    //Returns the text that is displayed on the button in the field location (makeCTA).
    makeCTA: () => 'Select products', // name of field button
    name: 'Slatwall', // name of config screen
    logo, // logo of field button and config screen
    color: '#212F3F', // bg color of config screen
    description: 'The Slatwall app allows editors to select products from their Slatwall account and reference them inside of Contentful entries.', // desc of config screen
    parameterDefinitions: [
      {
        id: 'apiEndpoint',
        name: 'API Endpoint',
        description: 'Slatwall API endpoint',
        type: 'Symbol',
        required: true,
      },
      {
        id: 'siteCode',
        name: 'Site Code',
        description: 'Slatwall Site Code',
        type: 'Symbol',
        required: false,
      },
    ], // what are the parameters we want to show in config screen we need to give here, as of now we want the api endpoint from the user.
    validateParameters, // to check the given parameter values are empty
    fetchProductPreviews, // to show the previously selected products in the field
    renderDialog, // to show the all products and preview the selected products in the dialog modal
    openDialog, // to render the dialog modal design.
    isDisabled: () => false,
  })
}
