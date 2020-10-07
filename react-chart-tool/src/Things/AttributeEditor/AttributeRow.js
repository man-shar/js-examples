  import React from 'react'
    import ShapeUtil from '../../Util/ShapeUtil'
  import AttributeName from './AttributeName'
  import AttributeExpressionEditable from './AttributeExpressionEditable'
  import AttributeValue from './AttributeValue'

// single row for an attribute.

  class AttributeRow extends React.Component {
    render () {
      const attribute = this.props.attribute
      const attributeId = this.props.attributeId
      const attributeValue = this.props.attributeValue
      const attributeName = this.props.attributeName
      const attributeExprString = this.props.attributeExprString
      const actionOccuredAt = this.props.actionOccuredAt
      const actionOccuredAtId = this.props.actionOccuredAtId
      const typeOfAttributeReceivingDrop = this.props.typeOfAttributeReceivingDrop
      const isAttributeOwn = this.props.isAttributeOwn

    // passing this down because I have to edit own attributes and remove elements from own/inherited attributes.
      const attributeIndex = this.props.attributeIndex

    // check if attribute's value is not a pure number.
      return (
        <div className={'AttributeRow' + (isAttributeOwn ? '' : ' inherited-attribute')} id={attributeId}>
          <AttributeName attributeIndex={attributeIndex} actionOccuredAtId={actionOccuredAtId} attributeId={attributeId} attributeName={attributeName} actionOccuredAt={actionOccuredAt} />
          <div className='AttributeExpression'>
            <AttributeExpressionEditable attributeIndex={attributeIndex} typeOfAttributeReceivingDrop={typeOfAttributeReceivingDrop} actionOccuredAtId={actionOccuredAtId} attributeId={attributeId} attributeExprString={attributeExprString} actionOccuredAt={actionOccuredAt} />
            <AttributeValue attributeIndex={attributeIndex} actionOccuredAtId={actionOccuredAtId} attributeId={attributeId} attributeValue={attributeValue} actionOccuredAt={actionOccuredAt} />
          </div>
        </div>
      )
    }
}

  export default AttributeRow
