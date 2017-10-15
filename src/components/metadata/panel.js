'use strict'

const React = require('react')
const { PureComponent } = React
const { connect } = require('react-redux')
const { FormattedMessage } = require('react-intl')
const { MetadataList } = require('./list')
const { TemplateSelect } = require('../template/select')
const { PhotoInfo } = require('../photo/info')
const { ItemInfo } = require('../item/info')
const { SelectionInfo } = require('../selection/info')
const { TABS } = require('../../constants')

const {
  arrayOf, bool, func, number, object, shape, string
} = require('prop-types')

const {
  getActiveSelection,
  getActiveSelectionData,
  getAllTemplates,
  getItemMetadata,
  getItemTemplates,
  getSelectedItems,
  getSelectedPhoto
} = require('../../selectors')


class MetadataPanel extends PureComponent {
  componentWillUnmount() {
    this.props.onBlur()
  }

  get isEmpty() {
    return this.props.items.length === 0
  }

  get isBulk() {
    return this.props.items.length > 1
  }

  get tabIndex() {
    return this.isEmpty ? -1 : TABS.MetadataPanel
  }

  setContainer = (container) => {
    this.container = container
  }

  focus = () => {
    this.container.focus()
  }

  handleFocus = (event) => {
    this.props.onFocus()

    if (event != null && event.target === this.container) {
      this.props.onDeactivate()
    } else {
      this.props.onActivate()
    }
  }

  handleBlur = () => {
    this.props.onBlur()
    this.props.onDeactivate()
  }

  handleTemplateChange = (template) => {
    this.props.onItemSave({
      id: this.props.items.map(it => it.id),
      property: 'template',
      value: template.id
    })
  }

  handleKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      this.focus()
      event.stopPropagation()
    }
  }


  renderItemFields() {
    if (this.isEmpty) return null

    const {
      items,
      itemsData,
      itemTemplates,
      templates,
      isDisabled,
      onMetadataSave,
      ...props
    } = this.props

    const item = items[0]

    return (
      <section>
        <h5 className="metadata-heading">
          <FormattedMessage
            id="panel.metadata.item"
            values={{ count: items.length }}/>
        </h5>
        <TemplateSelect
          templates={itemTemplates}
          selected={item.template}
          isDisabled={isDisabled}
          onChange={this.handleTemplateChange}/>
        <MetadataList {...props}
          data={itemsData}
          template={templates[item.template]}
          isDisabled={isDisabled}
          onChange={onMetadataSave}/>
        {items.length === 1 && <ItemInfo item={item}/>}
      </section>
    )
  }

  renderPhotoFields() {
    if (this.isEmpty || this.isBulk) return null

    const {
      photo,
      photoData,
      templates,
      onMetadataSave,
      onOpenInFolder,
      ...props
    } = this.props

    return photo && !photo.pending && (
      <section>
        <h5 className="metadata-heading separator">
          <FormattedMessage id="panel.metadata.photo"/>
        </h5>
        <MetadataList {...props}
          data={photoData}
          template={templates[photo.template]}
          onChange={onMetadataSave}/>
        <PhotoInfo
          photo={photo}
          onOpenInFolder={onOpenInFolder}/>
      </section>
    )
  }

  renderSelectionFields() {
    if (this.isEmpty || this.isBulk) return null

    const {
      selection,
      selectionData,
      templates,
      onMetadataSave,
      ...props
    } = this.props

    return selection != null && !selection.pending && (
      <section>
        <h5 className="metadata-heading separator">
          <FormattedMessage id="panel.metadata.selection"/>
        </h5>
        <MetadataList {...props}
          data={selectionData}
          template={templates[selection.template]}
          onChange={onMetadataSave}/>
        <SelectionInfo
          selection={selection}/>
      </section>
    )
  }

  render() {
    return (
      <div className="metadata tab-pane">
        <div
          className="scroll-container"
          ref={this.setContainer}
          tabIndex={this.tabIndex}
          onBlur={this.handleBlur}
          onFocus={this.handleFocus}>
          {this.renderItemFields()}
          {this.renderPhotoFields()}
          {this.renderSelectionFields()}
        </div>
      </div>
    )
  }

  static propTypes = {
    isDisabled: bool,

    edit: object,
    items: arrayOf(shape({
      id: number.isRequired,
      template: string.isRequired
    })),
    itemsData: object.isRequired,

    photo: shape({
      id: number.isRequired,
      template: string
    }),
    photoData: object,

    templates: object.isRequired,
    itemTemplates: arrayOf(object).isRequired,

    selection: shape({
      id: number.isRequired,
      template: string
    }),
    selectionData: object,

    onActivate: func.isRequired,
    onBlur: func.isRequired,
    onDeactivate: func.isRequired,
    onFocus: func.isRequired,
    onItemSave: func.isRequired,
    onMetadataSave: func.isRequired,
    onOpenInFolder: func.isRequired
  }
}

module.exports = {
  MetadataPanel: connect(
    (state) => ({
      edit: state.edit.field,
      items: getSelectedItems(state),
      itemsData: getItemMetadata(state),
      photo: getSelectedPhoto(state),
      photoData: state.metadata[state.nav.photo],
      templates: getAllTemplates(state),
      itemTemplates: getItemTemplates(state),
      selection: getActiveSelection(state),
      selectionData: getActiveSelectionData(state)
    })
  )(MetadataPanel)
}

