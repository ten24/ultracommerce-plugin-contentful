import { Grid, GridItem, Card, Typography, Paragraph, Asset } from '@contentful/forma-36-react-components'
import preloadData from '../preload'
import { ListingPaginationModern } from './ListingPaginationModern'

const ProductGrid = ({ products, selectedProducts, setSelectedProducts, currentPage, setCurrentPage }) => {
  const onSelectProduct = product => {
    const hasProduct = selectedProducts.filter(prod => prod.productID === product.productID).length > 0
    let products = [...selectedProducts, product]
    if (hasProduct) {
      products = [...selectedProducts, product].filter(prod => prod.productID !== product.productID)
    }
    setSelectedProducts(products)
  }
  return (
    <GridItem>
      <Grid columns={3} rowGap="spacingM" columnGap="spacingM">
        {products.map(product => {
          return (
            <GridItem key={product.productID} style={{ display: 'flex' }}>
              <Card
                selected={selectedProducts.filter(sp => product.productID === sp.productID).length ? true : false}
                title={product.productName}
                onClick={() => {
                  onSelectProduct(product)
                }}
              >
                <Asset src={product.images.length ? `${preloadData.imageURL}${product.images[1]}` : preloadData.placeHolderImage} type="image" />
                <Typography className="f36-margin-top--s">
                  <span className="f36-font-family--sans-serif f36-font-size--m f36-color--text-mid">
                    {product.brandName}
                  </span>
                  <h3 className="f36-font-family--sans-serif f36-font-size--lg f36-margin-bottom--xs" style={{ marginTop: '3px' }}>
                    {product.productName}
                  </h3>
                  <span className="f36-font-family--sans-serif f36-font-size--s">
                    {product.productCode}
                  </span>
                  
                  <div className="f36-font-family--sans-serif">
                    <span className="f36-font-size--m f36-color--text-mid f36-margin-bottom--xs f36-margin-top--m" style={{ display: 'block' }}>
                      {product.listPrice !== ' ' && <s>${product.listPrice}</s>}
                    </span>
                    <span className="f36-font-size--l">
                      {product.salePrice !== ' ' && <span>${product.salePrice}</span>}
                    </span>
                  </div>
                </Typography>
              </Card>
            </GridItem>
          )
        })}
      </Grid>
      <ListingPaginationModern count={products.length} currentPage={currentPage} setPage={setCurrentPage} pageMax={preloadData.PREVIEWS_PER_PAGE} />
    </GridItem>
  )
}

export { ProductGrid }
