import React from 'react'
import { useIntl } from 'react-intl'
import cx from 'classnames'
import { Toggle } from './form.js'
import * as icons from './icons.js'

export const ButtonGroup = ({ className, children }) => (
  <div className={cx('btn-group', className)}>
    {children}
  </div>
)

export const ButtonContainer = ({ className, children }) => (
  <div className={cx('btn-container', className)}>
    {children}
  </div>
)

export const Button = React.memo(React.forwardRef(({
  activeIcon,
  className,
  icon,
  isActive,
  isBlock,
  isDefault,
  isDisabled,
  isPrimary,
  noFocus = false,
  onBlur,
  onClick,
  onFocus,
  onMouseDown,
  size = 'md',
  tabIndex = -1,
  text,
  title,
  type = 'button'
}, ref) => {

  let intl = useIntl()

  let attr = {
    className: cx('btn', className, `btn-${size}`, {
      'active': isActive && activeIcon == null,
      'btn-block': isBlock,
      'btn-default': isDefault,
      'btn-icon': icon != null,
      'btn-primary': isPrimary,
      'disabled': isDisabled
    }),

    onBlur,
    onFocus,
    ref,
    title: title && intl.formatMessage({ id: title })
  }

  if (!noFocus) {
    attr.disabled = isDisabled
    attr.type = type
  }

  if (!isDisabled) {
    if (noFocus) {
      attr.onMouseDown = (event) => {
        event.preventDefault()
        onMouseDown?.(event)
      }
      attr.onClick = (event) => {
        event.preventDefault()
        onClick?.(event)
      }

    } else {
      attr.onClick = onClick
      attr.onMouseDown = onMouseDown
      attr.tabIndex = tabIndex
    }
  }

  if (isActive)
    icon = activeIcon || icon

  if (typeof icon === 'string')
    icon = React.createElement(icons[icon])

  return React.createElement(
    noFocus ? 'span' : 'button',
    attr,
    icon,
    text && intl.formatMessage({ id: text }))
}))

export const ToggleButton = ({
  isChecked,
  isDisabled,
  name,
  onChange,
  size = 'md',
  text,
  tabIndex,
  value
}) => (
  <Toggle
    className={cx('btn', 'btn-toggle', `btn-${size}`)}
    id={text || name}
    isChecked={isChecked}
    isDisabled={isDisabled}
    name={name}
    onChange={onChange}
    tabIndex={tabIndex}
    type="radio"
    value={value}/>
)

export const ToggleButtonGroup = ({
  id,
  name,
  onChange,
  size = 'md',
  options,
  tabIndex,
  value
}) => (
  <ButtonGroup>
    {options.map(option => (
      <ToggleButton
        isChecked={option === value}
        key={`${option}`}
        name={name}
        onChange={onChange}
        size={size}
        text={`${id || name}.option.${option}`}
        tabIndex={tabIndex}
        value={option}/>
    ))}
  </ButtonGroup>
)

export const PlusMinusControls = ({
  canAdd,
  canRemove,
  onAdd,
  onRemove
}) => (
  <ButtonGroup>
    <Button
      icon="IconPlusCircle"
      isDisabled={!(canAdd && onAdd)}
      onClick={onAdd}/>
    <Button
      icon="IconMinusCircle"
      isDisabled={!(canRemove && onRemove)}
      onClick={onRemove}/>
  </ButtonGroup>
)
