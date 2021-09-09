import { Button, Flex } from '@contentful/forma-36-react-components'

const ListingPaginationModern = ({ currentPage = 1, setPage, count = 0, pageMax = 12 }) => {
  currentPage = parseInt(currentPage)

  return (
    <nav className="d-flex justify-content-between" aria-label="Page navigation" style={{ marginTop: '1rem' }}>
      <Flex justifyContent="space-between" alignItems="center" marginBottom="spacingM">
        <Flex>
          {currentPage > 1 && (
            <Button
              className="page-link clickable"
              aria-label="Previous"
              onClick={evt => {
                evt.preventDefault()
                setPage(currentPage - 1)
              }}
            >
              Previous
            </Button>
          )}
        </Flex>
        <Flex>
          <div className="page-item">
            <span className="paginationTxtClr">{currentPage}</span>
          </div>
        </Flex>
        <Flex>
          {count === pageMax && (
            <Button
              className="page-link clickable"
              aria-label="Next"
              onClick={evt => {
                evt.preventDefault()
                setPage(currentPage + 1)
              }}
            >
              Next
            </Button>
          )}
        </Flex>
      </Flex>
    </nav>
  )
}

export { ListingPaginationModern }
