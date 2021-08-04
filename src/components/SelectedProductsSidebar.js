import { GridItem, Button, EntityList, EntityListItem, DropdownList, DropdownListItem, Heading } from '@contentful/forma-36-react-components'
import preloadData from '../preload'

const SelectedProductsSidebar = ({ sdk, selectedProducts, setSelectedProducts }) => {
  return (
    <GridItem>
      <Heading>Select products</Heading>
      <EntityList>
        {selectedProducts.map(product => {
          return (
            <EntityListItem
              key={product.productID}
              thumbnailUrl={product.images.length ? `${preloadData.imageURL}${product.images[1]}` : preloadData.placeHolderImage}
              title={product.productName}
              description="Description"
              status=""
              dropdownListElements={
                <DropdownList>
                  <DropdownListItem isTitle>Actions</DropdownListItem>
                  <DropdownListItem
                    onClick={() => {
                      setSelectedProducts(selectedProducts.filter(prod => prod.productID !== product.productID))
                    }}
                  >
                    Remove
                  </DropdownListItem>
                </DropdownList>
              }
            />
          )
        })}
      </EntityList>
      <Button
        buttonType="primary"
        onClick={() => {
          sdk.close(selectedProducts.map(products => products.productID))
        }}
        disabled={selectedProducts.length === 0}
      >
        {`Save ${selectedProducts.length} Products`}
      </Button>
    </GridItem>
  )
}

export { SelectedProductsSidebar }
