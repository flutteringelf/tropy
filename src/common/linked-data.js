'use strict'

var jsonld = require('jsonld')

const { select } = require('redux-saga/effects')
const { pick, camelize } = require('./util')
const { ITEM } = require('../constants/type')
const { TEMPLATE } = require('../constants/ontology')
const { getLabel } = require('./ontology')


function propertyLabel(property, props, template) {
  let label, field
  try {
    if (template) {
      field = template.fields.find(f => f.property === property)
      label = field.label
    }
    if (!label) {
      label = props[property] && props[property].label
    }
    if (!label) {
      label = getLabel(field.id)
    }
    return label
  } catch (_) { return label }
}

function shortenLabel(label) {
  return camelize(
    label
    .toLowerCase()
    .trim()
    .normalize('NFD')                // normalize unicode
    .replace(/[\u0300-\u036f]/g, '') // remove accents, ligatures
    .replace(/[^a-zA-Z0-9]+/g, ' ')  // remove non-alphanumeric
  ).replace('_', ' ')                // remove _
}

function shorten(property, props, template) {
  const label = propertyLabel(property, props, template)
  return shortenLabel(label)
}

function* itemToLD(item_id, callback) {

  // extract useful data from current state
  const resources = yield select(state => {
    const item = state.items[item_id]
    return {
      item,
      item_template: state.ontology.template[item.template],
      photos: pick(state.photos, item.photos),
      metadata: state.metadata[item_id],
      ontology: state.ontology
    }
  })

  let context = {
    _template: { '@id': TEMPLATE.TYPE, '@type': '@id' }
  }

  // add fields to context
  resources.item_template.fields.forEach(field => {
    const short = shorten(
      field.property, resources.ontology.props, resources.item_template)
    context[short] = {
      '@id': field.property,
      '@type': field.datatype
    }
  })

  let document = {
    '@context': context,
    '@type': ITEM,
    '_template': resources.item_template.id
  }

  // add metadata to document.metadata
  for (var property in resources.metadata) {
    const short = shorten(
      property, resources.ontology.props, resources.item_template)
    if (short) {
      const text = resources.metadata[property].text
      if (text) {
        document[short] = text
      }
    }
  }

  jsonld.compact(document, context, callback)
}

module.exports = {
  shortenLabel,
  propertyLabel,
  itemToLD
}
