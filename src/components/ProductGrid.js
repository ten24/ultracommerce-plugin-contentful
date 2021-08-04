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
        {products.map(data => {
          return (
            <GridItem key={data.productID}>
              <Card
                selected={selectedProducts.filter(sp => data.productID === sp.productID).length ? true : false}
                title={data.productName}
                onClick={() => {
                  onSelectProduct(data)
                }}
              >
                <Asset src={data.images.length ? `${preloadData.imageURL}${data.images[1]}` : preloadData.placeHolderImage} type="image" />
                <Typography>
                  <p>{data.productName}</p>
                  <div className="d-flex justify-content-between mt-2">
                    <p className="text-secondary">{data.defaultSku_skuPrices_listPrice !== ' ' && <s>${data.defaultSku_skuPrices_listPrice}</s>}</p>
                    {data.defaultSku_skuPrices_price !== ' ' && <Paragraph>${data.defaultSku_skuPrices_price}</Paragraph>}
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
