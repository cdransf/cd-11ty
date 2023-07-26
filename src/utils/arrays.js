module.exports = {
  getKeyByValue: (object, value) => Object.keys(object).find((key) => object[key].includes(value)),
}
