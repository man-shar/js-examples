import React from 'react'
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
      type: "data"
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
class DataFlexColumnHeader extends React.Component {
  render () {
    const { isDragging, connectDragSource, attributeId, drawing } = this.props
    const hoveredAttributeId = drawing.hoveredAttributeId;
    const updateHoveredAttribute = this.props.updateHoveredAttribute.bind(this)

    const className = 'DataFlexColumnHeader' + ((attributeId === hoveredAttributeId) ? ' isHovered' : '')

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
        <span>{drawing[attributeId + "$name"]}</span>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    drawing: state.drawing,
  }
}


const mapDispatchToProps = (dispatch) => {
  return {
    updateHoveredAttribute: (hoveredAttributeId) => {
      dispatch(updateHoveredAttribute(hoveredAttributeId))
    }
  }
}

export default DragSource(ItemTypesDnd.DATA, attributeSource, collect)(connect(mapStateToProps, mapDispatchToProps)(DataFlexColumnHeader))
