import React from 'react'
import { connect } from 'react-redux'
import { updateHoveredAttribute } from '../../Actions/actions'

class CodeMirrorMark extends React.Component {
  render () {
    const text = this.props.markText
    const attributeId = this.props.attributeId
    const hoveredAttributeId = this.props.hoveredAttributeId
    const updateHoveredAttribute = this.props.updateHoveredAttribute.bind(this)

    const className = 'codemirror-marker' + ((attributeId === hoveredAttributeId) ? ' isHovered' : '')

    return (
      <span
        className={className}
        onMouseOver={(e) => {
          updateHoveredAttribute(attributeId)
        }}
        onMouseOut={(e) => {
          updateHoveredAttribute('')
        }}
      >
        {text}
      </span>
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

CodeMirrorMark = connect(mapStateToProps, mapDispatchToProps)(CodeMirrorMark)

export default CodeMirrorMark
