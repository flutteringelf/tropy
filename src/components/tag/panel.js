'use strict'

const React = require('react')
const { PureComponent, PropTypes } = React
const { arrayOf, func, number, object, shape, string } = PropTypes
const { connect } = require('react-redux')
const { getItemTags, getSelectedItems } = require('../../selectors')
const { TagList } = require('./list')
const { toId } = require('../../common/util')
const { seq, map, filter, compose } = require('transducers.js')


class TagPanel extends PureComponent {

  handleTagRemove = (tag) => {
    const present = seq(this.props.items,
      compose(filter(it => it.tags.includes(tag)), map(toId)))

    this.props.onItemTagRemove({ id: present, tags: [tag] })
  }

  handleTagAdd = (tag) => {
    if (tag.mixed) {
      const missing = seq(this.props.items,
        compose(filter(it => !it.tags.includes(tag.id)), map(toId)))

      this.props.onItemTagAdd({ id: missing, tags: [tag.id] })
    }
  }

  handleContextMenu = (event, tag) => {
    this.props.onContextMenu(event, 'item-tag', {
      id: tag.id,
      mixed: tag.mixed,
      items: this.props.items.map(toId)
    })
  }

  render() {
    return (
      <div className="tab-pane">
        <TagList
          edit={this.props.edit}
          keymap={this.props.keymap}
          tags={this.props.tags}
          hasFocusIcon
          onCommit={this.handleTagAdd}
          onEditCancel={this.props.onEditCancel}
          onRemove={this.handleTagRemove}
          onSave={this.props.onTagSave}
          onContextMenu={this.handleContextMenu}/>

        <div className="add-tag-container">
          <input
            type="text"
            className="form-control add-tag"
            tabIndex={-1}
            placeholder="Add tags"/>
        </div>
      </div>
    )
  }

  static propTypes = {
    edit: object,
    items: arrayOf(object).isRequired,
    keymap: object.isRequired,

    tags: arrayOf(shape({
      id: number.isRequired,
      name: string.isRequired
    })).isRequired,

    onContextMenu: func.isRequired,
    onEditCancel: func.isRequired,
    onItemTagAdd: func.isRequired,
    onItemTagRemove: func.isRequired,
    onTagSave: func.isRequired
  }
}

module.exports = {
  TagPanel: connect(
    (state) => ({
      edit: state.edit.tabTag,
      items: getSelectedItems(state),
      keymap: state.keymap.TagList,
      tags: getItemTags(state)
    })
  )(TagPanel)
}
