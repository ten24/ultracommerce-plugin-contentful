import { GridItem, Button, EntityList, EntityListItem, DropdownList, DropdownListItem, Heading } from '@contentful/forma-36-react-components'
import preloadData from '../preload'
import { useState, useRef, useCallback } from 'react'
import { useDrag, useDrop, DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import update from 'immutability-helper'

const SelectedProductsSidebar = ({ sdk, selectedProducts, setSelectedProducts }) => {
  const [sortOrder, setSortOrder] = useState(true) // true is asc and false is desc
  const moveCard = useCallback(
    (dragIndex, hoverIndex) => {
      const dragCard = selectedProducts[dragIndex]
      setSelectedProducts(
        update(selectedProducts, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragCard],
          ],
        })
      )
    },
    [selectedProducts, setSelectedProducts]
  )
  return (
    <GridItem style={{ width: '300px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', marginBottom: 10 }}>
        <Heading className="f36-margin-bottom--xs">Selected Products</Heading>
        <Button
          style={{ width: '100%' }}
          buttonType="muted"
          onClick={() => {
            setSelectedProducts(prev => {
              let temp = [...prev]
              temp.sort((a, b) => (a.productName === b.productName ? 0 : a.productName < b.productName ? -1 : 1))
              if (!sortOrder) {
                temp.reverse()
              }
              return temp
            })
            setSortOrder(!sortOrder)
          }}
          disabled={selectedProducts.length === 0}
        >
          Sort by name ({sortOrder ? 'asc' : 'desc'})
        </Button>
        <Button
          buttonType="primary"
          className="f36-margin-top--s"
          onClick={() => {
            sdk.close(selectedProducts.map(products => products.productID))
          }}
          disabled={selectedProducts.length === 0}
        >
          {`Save ${selectedProducts.length} Products`}
        </Button>
      </div>

      <EntityList>
        <DndProvider backend={HTML5Backend}>
          {selectedProducts.map((product, index) => {
            return <Card product={product} key={product.productID} index={index} id={product.productID} setSelectedProducts={setSelectedProducts} selectedProducts={selectedProducts} moveCard={moveCard} />
          })}{' '}
        </DndProvider>
      </EntityList>
    </GridItem>
  )
}

export { SelectedProductsSidebar }

const Card = ({ id, product, index, moveCard, setSelectedProducts, selectedProducts }) => {
  const ref = useRef(null)
  const [{ handlerId }, drop] = useDrop({
    accept: 'card',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },
    hover(item, monitor) {
      if (!ref.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = index
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return
      }
      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect()
      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      // Determine mouse position
      const clientOffset = monitor.getClientOffset()
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }
      // Time to actually perform the action
      moveCard(dragIndex, hoverIndex)
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex
    },
  })
  const [{ isDragging }, drag] = useDrag({
    type: 'card',
    item: () => {
      return { id, index }
    },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  })
  const opacity = isDragging ? 0 : 1
  drag(drop(ref))
  return (
    <div ref={ref} key={product.productID} data-handler-id={handlerId} style={{ opacity, cursor: 'move' }}>
      <EntityListItem
        key={product.productID}
        thumbnailUrl={product.images.length ? `${process.env.REACT_APP_SLATWALL_URL}${product.images[1]}` : preloadData.placeHolderImage}
        title={product.productName}
        description={product.productCode}
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
    </div>
  )
}
