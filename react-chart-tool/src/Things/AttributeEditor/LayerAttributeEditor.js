import React from 'react'
import { connect } from 'react-redux'
import ShapeUtil from '../../Util/ShapeUtil'
import Util from '../../Util/Util'
import AttributeRow from './AttributeRow'

// Attributes are both dimensions and styles.
// Attributes of a particular Layer.

class LayerAttributeEditor extends React.Component {
  render () {
    const layerId = this.props.layerId
    const drawing = this.props.drawing
    const dimensionList = ShapeUtil.allDimensions[drawing[layerId + '$type']]
    const styleList = ShapeUtil.allStyles[drawing[layerId + '$type']]

    if (layerId) {
      return (
        <div>
          <div className="AttributesSectionHeading">
            <span>{drawing[layerId + "$name"]}'s Shared Attributes</span>
          </div>
          <div className='AttributeContainer'>
            {dimensionList.map((attribute, i) => {
              const attributeProperties = ShapeUtil.getLayerDimensionAllProperties(attribute, layerId, drawing)
              const attributeName = attributeProperties[attribute + '$name']
              const attributeValue = attributeProperties[attribute + '$value']
              const attributeExprString = attributeProperties[attribute + '$exprString']
              const isAttributeOwn = ShapeUtil.isLayerOwn(attribute, layerId, drawing)
              const inheritedFrom = isAttributeOwn ? layerId : 'overallAttributes'

              return (<AttributeRow
                key={i}
                attributeIndex={i}
                attributeId={inheritedFrom + '$' + attribute}
                attributeName={attributeName}
                attributeValue={attributeValue}
                attributeExprString={attributeExprString}
                actionOccuredAtId={layerId}
                actionOccuredAt='layer'
                typeOfAttributeReceivingDrop='dimension'
                isAttributeOwn={isAttributeOwn}
                  />)
            }
            )}
            {styleList.map((attribute, i) => {
              const attributeProperties = ShapeUtil.getLayerStyleAllProperties(attribute, layerId, drawing)
              const attributeName = attributeProperties[attribute + '$name']
              const attributeValue = attributeProperties[attribute + '$value']
              const attributeExprString = attributeProperties[attribute + '$exprString']
              const isAttributeOwn = ShapeUtil.isLayerOwn(attribute, layerId, drawing)
              const inheritedFrom = isAttributeOwn ? layerId : 'overallAttributes'

              return (
                <AttributeRow
                  key={i}
                  attributeIndex={i}
                  attributeId={inheritedFrom + '$' + attribute}
                  attributeName={attributeName}
                  attributeValue={attributeValue}
                  attributeExprString={attributeExprString}
                  actionOccuredAtId={layerId}
                  actionOccuredAt='layer'
                  typeOfAttributeReceivingDrop='style'
                  isAttributeOwn={isAttributeOwn}
                  />
              )
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

LayerAttributeEditor = connect(mapStateToProps)(LayerAttributeEditor)

export default LayerAttributeEditor
