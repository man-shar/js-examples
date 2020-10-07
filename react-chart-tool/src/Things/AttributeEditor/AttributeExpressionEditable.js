import React from 'react'
import { render } from 'react-dom'
import PropTypes from 'prop-types'
import { Provider, connect } from 'react-redux'
import { UnControlled as CodeMirror } from 'react-codemirror2'
import 'codemirror/mode/javascript/javascript'
import ShapeUtil from '../../Util/ShapeUtil'
import { changeAttributeExpressionStringThunk, addAttributeReferenceToAttribute } from '../../Actions/actions'
import { DropTarget } from 'react-dnd'
import ItemTypesDnd from '../ItemTypesDnd'
import CodeMirrorMark from './CodeMirrorMark'
import 'codemirror-colorpicker/dist/codemirror-colorpicker.css'
import 'codemirror-colorpicker' 

// render editable attribute expression as codemirror editor. use references objects to render references to other attributes.

// to control whether the codemirror should update, we use a shouldupdate property. if you let react do it's thing, it updates codemirror everytime there is a change. which causes the cursor on codemirror to jump to the end because the component is re-mounted hence the editor is recreated. but what we can do is that use compoenentWillReceiveProps to decide whether the nextprops are the same as codemirror contents and if true, set the shouldupdate property to false. else it will be true. and use this value as the return value in shouldComponentUpdate.

// initially i had set the shouldUpdate property on the state, but because setState if async, it was not updating in time for componentshouldupdate, so i set it directlt on the class instance instead.

const dropMethods = {
  drop: function (props, monitor) {
  }
}

function collect (connect, monitor) {
  return {
    // Call this function inside render()
    // to let React DnD handle the drag events:
    connectDropTarget: connect.dropTarget(),
    monitor: monitor
  }
}

class AttributeExpressionEditable extends React.Component {
  constructor () {
    super()

    this.instance = null;
    this.shouldUpdate = true;
    this.store;
  }

  componentDidMount () {
    // have to do this becuse we are using document.createElement to render codemirror marks. which doesn't automatically get Provider's context. so have to explicitly pass it that.
    this.store = this.context.store
  }

  renderCodeMirrorMarks (editor) {
    const referenceAttributes = ShapeUtil.referenceAttributes[this.props.attributeId]
    if (referenceAttributes) {      
      const marks = referenceAttributes['marks']
      // console.log(marks);

      marks.forEach((mark) => {
        const el = document.createElement('span')
        el.style.display = 'inline'

        render(
          <CodeMirrorMark
            markText={mark.text}
            attributeId={mark.attributeId}
              // here we pass store as prop to component using connect. it doesn't get passed by default as it is not part of the DOM tree so the provider doesn't give it access yet (I guess).
            store={this.store}
             />
          , el
        )

        editor.markText({
            line: 0,
            ch: mark.from
          },
          {
            line: 0,
            ch: mark.to
          },
          {
            replacedWith: el,
            handleMouseEvents: true
          }
        )
      })
    }
  }

  shouldComponentUpdate () {
    return (this.shouldUpdate)
  }

  componentWillReceiveProps (nextProps) {
    const editor = this.instance;

    if (editor && (nextProps.attributeExprString === editor.getValue())) {
      this.shouldUpdate = false;
    }

    else {
      this.shouldUpdate = true;
    }
  }

  onMirrorChange (editor, changeObj) {
    if (this.props.attributeExprString === editor.getValue()) {
      this.renderCodeMirrorMarks(editor);
      return
    }

    // i need actionOccuredAtId because I need to check whether the attribute is an own attribute or not.
    this.props.onAttributeExprStringChange(this.props.attributeId, editor.getValue(), this.props.typeOfAttributeReceivingDrop, this.props.actionOccuredAtId, this.props.attributeIndex);
  }

  onMirrorDrop (editor, event) {
    const monitor = this.props.monitor
    const attributeId = this.props.attributeId
    const item = monitor.getItem();

    if (!item.attributeId) {
      console.log('not defined')
      return
    }

    this.props.onAttributeReferenceDrop(editor, event, attributeId, monitor.getItem(), this.props.typeOfAttributeReceivingDrop, this.props.actionOccuredAtId, this.props.attributeIndex);

    // this.renderCodeMirrorMarks(editor);
  }

  render () {
    const attributeExprString = this.props.attributeExprString
    const attributeId = this.props.attributeId
    const typeOfAttributeReceivingDrop = this.props.typeOfAttributeReceivingDrop
    // can also be overallAttributes.
    const actionOccuredAtId = this.props.actionOccuredAtId

    const connectDropTarget = this.props.connectDropTarget
    const attributeIndex = this.props.attributeIndex

    // have to wrap in div because react dnd only takes native nodes as drop targets
    return connectDropTarget(
      <div>
        <CodeMirror
          value={attributeExprString}
          options={{
            mode: 'javascript',
            viewportMargin: Infinity,
            smartIndent: true,
            indentUnit: 2,
            tabSize: 2,
            indentWithTabs: true,
            lineWrapping: true,
            scrollbarStyle: 'null',
            undoDepth: 0,
            dragDrop: true,
            colorpicker: {
              mode : 'edit'
            }
          }}
          className='AttributeExpressionEditable'
          onChange={this.onMirrorChange.bind(this)}
          onDrop={this.onMirrorDrop.bind(this)}
          editorDidMount={(editor) => {
            editor.setValue(this.props.attributeExprString);

            // this.renderCodeMirrorMarks(editor);
            // console.log("rendered marks from editordidmount")
            this.instance = editor
          }}
        />
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    drawing: state.drawing
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onAttributeExprStringChange: (attributeId, newExprString, typeOfAttributeReceivingDrop, actionOccuredAtId, attributeIndex) => {
      dispatch(changeAttributeExpressionStringThunk(attributeId, newExprString, typeOfAttributeReceivingDrop, actionOccuredAtId, attributeIndex));
    },
    onAttributeReferenceDrop: (editor, event, attributeId, droppedAttributeMonitorItem, typeOfAttributeReceivingDrop, actionOccuredAtId, attributeIndex) => {
      dispatch(addAttributeReferenceToAttribute(editor, event, attributeId, droppedAttributeMonitorItem, typeOfAttributeReceivingDrop, actionOccuredAtId, attributeIndex))
    }
  }
}

AttributeExpressionEditable.contextTypes = {
  store: PropTypes.object
}

AttributeExpressionEditable = connect(mapStateToProps, mapDispatchToProps)(AttributeExpressionEditable)

export default DropTarget([ItemTypesDnd.ATTRIBUTE, ], dropMethods, collect)(AttributeExpressionEditable)
