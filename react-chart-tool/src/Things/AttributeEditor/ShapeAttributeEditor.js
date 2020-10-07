import React from 'react'
import { connect } from 'react-redux'
import ShapeUtil from '../../Util/ShapeUtil'
import AttributeRow from './AttributeRow'
import Util from '../../Util/Util'

// Attributes are both dimensions and styles.
// Attributes of a particular Shape.

class ShapeAttributeEditor extends React.Component {
  render () {
    const shapeId = this.props.shapeId
    const layerId = this.props.layerId
    const drawing = this.props.drawing
    const dimensionList = ShapeUtil.allDimensions[drawing[shapeId + '$type']]
    const styleList = ShapeUtil.allStyles[drawing[shapeId + '$type']]

    if (shapeId) {
      return (
        <div>
          <div className="AttributesSectionHeading">
            <span>{drawing[shapeId + "$name"]}'s Shape Attributes</span>
          </div>
          <div className='AttributeContainer'>
            {dimensionList.map((attribute, i) => {
              const attributeProperties = ShapeUtil.getShapeDimensionAllProperties(attribute, shapeId, layerId, drawing)

              const attributeName = attributeProperties[attribute + '$name']
              const attributeValue = attributeProperties[attribute + '$value']
              const attributeExprString = attributeProperties[attribute + '$exprString']
              const isAttributeOwn = ShapeUtil.isShapeOwn(attribute, shapeId, drawing)

              const inheritedFrom = isAttributeOwn ? shapeId : (ShapeUtil.isLayerOwn(attribute, layerId, drawing) ? layerId : 'overallAttributes')

              return (<AttributeRow
                key={i}
                attributeIndex={i}
                attributeId={inheritedFrom + '$' + attribute}
                attributeName={attributeName}
                attributeValue={attributeValue}
                attributeExprString={attributeExprString}
                actionOccuredAtId={shapeId}
                actionOccuredAt='shape'
                typeOfAttributeReceivingDrop='dimension'
                isAttributeOwn={isAttributeOwn}
                  />)
            }
            )}
            {styleList.map((attribute, i) => {
              const attributeProperties = ShapeUtil.getShapeStyleAllProperties(attribute, shapeId, layerId, drawing)

              const attributeName = attributeProperties[attribute + '$name']
              const attributeValue = attributeProperties[attribute + '$value']
              const attributeExprString = attributeProperties[attribute + '$exprString']
              const isAttributeOwn = ShapeUtil.isShapeOwn(attribute, shapeId, drawing)

              const inheritedFrom = isAttributeOwn ? shapeId : (ShapeUtil.isLayerOwn(attribute, layerId, drawing) ? layerId : 'overallAttributes')

              return (<AttributeRow
                key={i}
                attributeIndex={i}
                attributeId={inheritedFrom + '$' + attribute}
                attributeName={attributeName}
                attributeValue={attributeValue}
                attributeExprString={attributeExprString}
                actionOccuredAtId={shapeId}
                actionOccuredAt='shape'
                typeOfAttributeReceivingDrop='style'
                isAttributeOwn={isAttributeOwn}
                  />)
            }
            )}
          </div>
        </div>
      )
    } else {
      return (<div />)
    }
  }
}

const mapStateToProps = state => {
  return {
    drawing: state.drawing
  }
}

ShapeAttributeEditor = connect(mapStateToProps)(ShapeAttributeEditor)

export default ShapeAttributeEditor
