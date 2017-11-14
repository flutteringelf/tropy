'use strict'

const React = require('react')
const { Component } = React
const { createPortal } = require('react-dom')
const { node, number, shape, string } = require('prop-types')
const { $, append, classes, element, remove } = require('../dom')
const cx = require('classnames')


class Popup extends Component {
  constructor(props) {
    super(props)
    this.dom = element('div')
    classes(this.dom, 'popup-container')
  }

  componentDidMount() {
    append(this.dom, $('#popup-root'))
  }

  componentWillUnmount() {
    remove(this.dom)
  }

  render() {
    return createPortal((
      <div
        className={cx('popup', this.props.className)}
        style={this.props.position}>
        {this.props.children}
      </div>
    ), this.dom)
  }

  static propTypes = {
    children: node.isRequired,
    className: string,
    position: shape({
      top: number,
      left: number,
      width: number
    })
  }
}

module.exports = {
  Popup
}
