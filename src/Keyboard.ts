export enum KeyboardColor {
  PRIMARY = 'primary',
  DEFAULT = 'default',
  NEGATIVE = 'negative',
  POSITIVE = 'positive'
}

/**
 * Класс для создания клавиатуры для бота
 */
export default class Keyboard {
  private obj: any

  constructor(oneTime = false) { this.obj = { one_time: oneTime, buttons: [] } }

  addButton(label: string, color: string = KeyboardColor.DEFAULT, payload = null) {
    if (!this.obj.buttons.length) this.obj.buttons.push([])

    let lastRow = this.obj.buttons[this.obj.buttons.length - 1]
    if (lastRow.length === 4) throw new Error('Maximum amount of buttons in one row = 4')

    lastRow.push({ action: { type: 'text', label, payload }, color })

    return this
  }

  addRow() {
    if (this.obj.buttons.length === 10) throw new Error('Maximum amount of rows = 10')
    this.obj.buttons.push([])

    return this
  }

  toString() { return JSON.stringify(this.obj) }
}

