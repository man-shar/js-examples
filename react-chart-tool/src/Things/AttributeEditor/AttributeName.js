import React from 'react'
import ShapeUtil from '../../Util/ShapeUtil'
import { DragSource } from 'react-dnd'
import ItemTypesDnd from '../ItemTypesDnd'
import { connect } from 'react-redux'
import { updateHoveredAttribute } from '../../Actions/actions'

/**
 * What data do we want the drop target to receive.
 */
const attributeSource = {
  beginDrag (props) {
    return {
      attributeId: props.attributeId,
    }
  }
}

/**
 * Specifies the props to inject into the component.
 */
 // this connect is different from redux's connect.
function collect (connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  }
}

// TODO: Add DragLayer component for showing component while dragging.

// render editable attribute name
class AttributeName extends React.Component {
  render () {
    const { isDragging, connectDragSource, attributeName, attributeId, actionOccuredAt, actionOccuredAtId, hoveredAttributeId } = this.props

    const updateHoveredAttribute = this.props.updateHoveredAttribute.bind(this)

    // have to wrap span in div to allow for drag events to happen with contenteditable;

    const className = 'AttributeName' + ((attributeId === hoveredAttributeId) ? ' isHovered' : '')

    return connectDragSource(
      <div
        className={className}
        onMouseOver={(e) => {
          updateHoveredAttribute(attributeId)
        }}
        onMouseOut={(e) => {
          updateHoveredAttribute('')
        }}
        >
        <div className='EditableTextAttributeName'>
          <span>{attributeName}</span>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    hoveredAttributeId: state.drawing.hoveredAttributeId
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateHoveredAttribute: (hoveredAttributeId) => {
      dispatch(updateHoveredAttribute(hoveredAttributeId))
    }
  }
}

export default DragSource(ItemTypesDnd.ATTRIBUTE, attributeSource, collect)(connect(mapStateToProps, mapDispatchToProps)(AttributeName))
