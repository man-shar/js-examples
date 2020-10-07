import React from 'react'
import { connect } from 'react-redux'
import ShapeUtil from '../../Util/ShapeUtil'
import AttributeRow from './AttributeRow'

// Attributes are both dimensions and styles.

class OverallAttributeEditor extends React.Component {
  render () {
    if (!this.props.drawing) {
      return (<div />)
    }
    const ownDimensionList = this.props.drawing['overallAttributes' + '$ownDimensionList']
    const ownStyleList = this.props.drawing['overallAttributes' + '$ownStyleList']
    const axisList = this.props.drawing['overallAttributes' + '$axisList']

    const overallAttributesDimensionsAllProperties = ShapeUtil.getAllOverallAttributesDimensionsAllProperties(
      this.props.drawing
    )

    const overallAttributesStylesAllProperties = ShapeUtil.getAllOverallAttributesStylesAllProperties(
      this.props.drawing
    )

    if (this.props.drawing['overallAttributes$ownDimensionList']) {
      return (
        <div className='AttributeContainer'>
        {axisList.map((attribute, i) => {
            const attributeName = this.props.drawing["overallAttributes$" + attribute + '$name']
            const attributeValue = this.props.drawing["overallAttributes$" + attribute + '$value']
            const attributeExprString = this.props.drawing["overallAttributes$" + attribute + '$exprString']

            return (<AttributeRow
              key={i}
              attributeIndex={i}
              attributeId={'overallAttributes' + '$' + attribute}
              attributeName={attributeName}
              attributeValue={attributeValue}
              attributeExprString={attributeExprString}
              actionOccuredAtId={'overallAttributes'}
              actionOccuredAt='overallAttributes'
              typeOfAttributeReceivingDrop='axis'
              isAttributeOwn
                />)
          }
          )}
          {ownDimensionList.map((attribute, i) => {
            const attributeName = overallAttributesDimensionsAllProperties[attribute + '$name']
            const attributeValue = overallAttributesDimensionsAllProperties[attribute + '$value']
            const attributeExprString = overallAttributesDimensionsAllProperties[attribute + '$exprString']

            return (<AttributeRow
              key={i}
              attributeIndex={i}
              attributeId={'overallAttributes' + '$' + attribute}
              attributeName={attributeName}
              attributeValue={attributeValue}
              attributeExprString={attributeExprString}
              actionOccuredAtId={'overallAttributes'}
              actionOccuredAt='overallAttributes'
              typeOfAttributeReceivingDrop='dimension'
              isAttributeOwn
                />)
          }
          )}
          {ownStyleList.map((attribute, i) => {
            const attributeName = overallAttributesStylesAllProperties[attribute + '$name']
            const attributeValue = overallAttributesStylesAllProperties[attribute + '$value']
            const attributeExprString = overallAttributesStylesAllProperties[attribute + '$exprString']

            return (<AttributeRow
              key={i}
              attributeIndex={i}
              attributeId={'overallAttributes' + '$' + attribute}
              attributeName={attributeName}
              attributeValue={attributeValue}
              attributeExprString={attributeExprString}
              actionOccuredAtId={'overallAttributes'}
              actionOccuredAt='overallAttributes'
              typeOfAttributeReceivingDrop='style'
              isAttributeOwn
                />)
          }
          )}
        </div>
      )
    } else {
      return (<div />)
    }
  }
}

const mapStateToProps = state => {
  return {
    drawing: state['drawing']
  }
}

export default connect(mapStateToProps)(OverallAttributeEditor)
