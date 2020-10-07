import React from 'react'
import ShapeUtil from '../../Util/ShapeUtil'

// render editable attribute value

class AttributeValue extends React.Component {
  render () {
    const attributeValue = this.props.attributeValue
    const attributeId = this.props.attributeId

    return (
      <div className='AttributeValue'>
        {attributeValue}
      </div>
    )
  }
}

export default AttributeValue
