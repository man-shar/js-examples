import React from 'react';
import { AttributeRow } from './AttributeRow'

class AttributeContainer extends React.Component {
  render() {
    const attributes = Object.keys(this.props.attributes);

    return (
      <div>
      {attributes.map((attribute, i) => {
        <AttributeRow key={i} attribute={attribute} value={}/>
      })
      }        
      </div>
      }
    );
  }
}

export default AttributeContainer;