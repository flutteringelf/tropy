import React from 'react'
import { Iterator } from '../iterator'
import { match, isMeta as meta } from '../../keymap'
import { blank, get } from '../../common/util'
import { on, off } from '../../dom'
import { seq, compose, map, cat, keep } from 'transducers.js'

import {
  arrayOf, shape, bool, func, number, object, string
} from 'prop-types'


export class ItemIterator extends Iterator {
  componentDidMount() {
    on(document, 'global:next-item', this.handleNextItem)
    on(document, 'global:prev-item', this.handlePrevItem)
    on(document, 'global:forward', this.handleItemOpen)
    on(window, 'copy', this.handleCopy)
  }

  componentWillUnmount() {
    off(document, 'global:next-item', this.handleNextItem)
    off(document, 'global:prev-item', this.handlePrevItem)
    off(document, 'global:forward', this.handleItemOpen)
    off(window, 'copy', this.handleCopy)
  }

  focus() {
    this.container.current?.focus()
  }

  get tabIndex() {
    return this.props.isDisabled ? null : super.tabIndex
  }

  getIterables(props = this.props) {
    return props.items || super.getIterables()
  }

  head() {
    const { selection } = this.props
    return selection.length > 0 ? selection[selection.length - 1] : null
  }

  // Note: this can be improved, but we currently check only
  // for the first item before and after the current item. This
  // is because the worst case for weird/sparse selections is
  // not worth the price!
  after() {
    const next = this.next()
    return (next == null || this.isSelected(next)) ? null : next
  }

  before() {
    const prev = this.prev()
    return (prev == null || this.isSelected(prev)) ? null : prev
  }

  getSelection = () => this.props.selection

  getSelectedPhotos({ items, selection } = this.props) {
    return seq(selection, compose(
        map(id => get(items, [this.indexOf(id), 'photos'])),
        keep(),
        cat))
  }

  isSelected({ id }) {
    return this.props.selection.includes(id)
  }

  isRangeSelected(items) {
    return items.every(id => this.props.selection.includes(id))
  }

  get hasMultiSelection() {
    return this.props.selection.length > 1
  }

  clearSelection() {
    this.props.onSelect({ items: [] })
  }

  handleContextMenu = (event, item) => {
    let { list, selection } = this.props

    let context = ['item']
    let target = {
      id: item.id,
      photos: item.photos,
      tags: item.tags,
      list
    }

    if (selection.length > 1) {
      context.push('bulk')
      target.id = [...selection]
      target.photos = this.getSelectedPhotos()

      if (!this.isSelected(item)) {
        target.id.push(item.id)
      }
    }

    if (this.props.isTrashSelected)
      context.push('deleted')
    else if (this.props.isReadOnly)
      context.push('read-only')
    else if (list)
      context.push('list')

    this.props.onContextMenu(event, context.join('-'), target)
  }

  handleItemDelete(items) {
    if (!(this.props.isReadOnly || blank(items))) {
      this.props.onItemDelete(items)
    }
  }

  handleCopy = () => {
    let sel = document.getSelection()
    if (sel == null || !sel.toString()) {
      this.handleItemCopy(this.props.selection)
    }
  }

  handleItemCopy(items) {
    if (!blank(items)) {
      this.props.onItemExport(items, { target: ':clipboard:' })
    }
  }

  handleItemMerge(items) {
    if (!(this.props.isReadOnly || blank(items))) {
      this.props.onItemMerge(items)
    }
  }

  handleItemOpen = async () => {
    this.props.onItemOpen(this.current())
  }

  // eslint-disable-next-line complexity
  handleKeyDown = (event) => {
    switch (match(this.props.keymap, event)) {
      case 'open':
        this.handleItemOpen()
        break
      case 'preview':
        this.preview(this.current())
        break
      case 'clear':
        this.clearSelection()
        break
      case 'delete':
        if (!this.props.isReadOnly) {
          this.select(this.after() || this.before())
          this.handleItemDelete(this.props.selection)
        }
        break
      case 'all':
        this.props.onSelect({}, 'all')
        break
      case 'merge':
        this.handleItemMerge(this.props.selection)
        break
      case 'rotateLeft':
        this.rotate(-90)
        break
      case 'rotateRight':
        this.rotate(90)
        break
      default:
        return
    }

    event.preventDefault()
    event.stopPropagation()
    event.nativeEvent.stopImmediatePropagation()
  }

  handleNextItem = (event) => {
    this.container.current?.next(1, event)
  }

  handlePrevItem = (event) => {
    this.container.current?.prev(1, event)
  }

  handleSelectItem = (item, event) => {
    this.select(item, {
      isMeta: event && meta(event),
      isRange: event?.shiftKey,
      throttle: true
    })
  }

  range({ from = this.head(), to } = {}) {
    const items = this.getIterables()

    from = (from == null) ? 0 : this.indexOf(from)
    to = (to == null) ? this.size - 1 : this.indexOf(to)

    return (from > to) ?
      items.slice(to, from + 1).reverse() :
      items.slice(from, to + 1)
  }

  select = (item, { isMeta, isRange, throttle } = {}) => {
    if (item == null || this.size === 0) return
    let mod, items

    switch (true) {
      case isRange:
        mod = 'merge'
        items = this.range({ to: item.id }).map(it => it.id)
        if (this.isRangeSelected(items)) {
          mod = 'subtract'
          if (items[0] !== item.id) items.unshift(items.pop())
        }
        break

      case isMeta:
        mod = this.isSelected(item) ? 'remove' : 'append'
        items = [item.id]
        break

      default:
        if (!this.hasMultiSelection && this.isSelected(item)) return
        mod = 'replace'
        items = [item.id]
    }

    this.props.onSelect({ items }, mod, { throttle })
  }

  preview({ id, photos }) {
    this.props.onItemPreview({ id, photos })
  }

  rotate(by) {
    if (!this.props.isReadOnly && this.props.selection.length > 0) {
      this.props.onPhotoRotate({
        id: this.getSelectedPhotos(),
        by
      })
    }
  }

  connect(element) {
    return (this.isReadOnly) ?
      element :
      this.props.connectDropTarget(element)
  }

  getIterableProps(item, index) {
    return {
      item,
      index,
      cache: this.props.cache,
      photos: this.props.photos,
      tags: this.props.tags,
      isSelected: this.isSelected(item),
      isReadOnly: this.props.isReadOnly,
      isVertical: this.isVertical,
      getSelection: this.getSelection,
      onContextMenu: this.handleContextMenu,
      onDropItems: this.props.onItemMerge,
      onDropPhotos: this.props.onPhotoMove,
      onItemOpen: this.props.onItemOpen,
      onPhotoError: this.props.onPhotoError,
      onSelect: this.select
    }
  }

  static propTypes = {
    items: arrayOf(shape({
      id: number.isRequired
    })).isRequired,

    sort: shape({
      asc: bool,
      column: string.isRequired
    }).isRequired,

    isDisabled: bool,
    isOver: bool,
    isReadOnly: bool,
    isTrashSelected: bool,

    cache: string.isRequired,
    selection: arrayOf(number).isRequired,
    keymap: object.isRequired,
    list: number,
    size: number.isRequired,
    photos: object.isRequired,
    tags: object.isRequired,

    connectDropTarget: func.isRequired,
    onContextMenu: func.isRequired,
    onItemDelete: func.isRequired,
    onItemExport: func.isRequired,
    onItemMerge: func.isRequired,
    onItemOpen: func.isRequired,
    onItemPreview: func.isRequired,
    onPhotoError: func.isRequired,
    onPhotoMove: func.isRequired,
    onPhotoRotate: func.isRequired,
    onSelect: func.isRequired,
    onSort: func.isRequired
  }
}
