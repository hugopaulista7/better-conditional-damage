class BetterConditionalDamage extends Application {
  get damageButtons() {
    const optsJson = localStorage.getItem(
      CONSTS_CONDITIONAL_DAMAGE.SELECTED_KEY
    )
    const optsParsed = JSON.parse(optsJson)
    return optsParsed
  }

  constructor() {
    super()
    this.init()
  }

  getSelectedOptions() {
    const selected = []
    const checkboxes = this.damageButtons

    checkboxes.forEach((checkbox) => {
      if (checkbox.isChecked) {
        selected.push(checkbox)
      }
    })
    return selected
  }

  showConditionalDialog() {
    return new Promise((resolve, reject) => {
      const dialogHtml = this.getDialogHTML()
    })
  }

  interceptDamageRolls() {
    Hooks.on('dnd5e.preRollDamage', (item, config) => {
      if (item.type !== 'weapon' && item.type !== 'spell') {
        // continue the default behavior
        return true
      }
      const selected = this.getSelectedOptions()
      if (!selected.length) {
        return true
      }
      let modifier = ''
      selected.forEach((el, index) => {
        modifier += el.value
        if (index + 1 < selected.length) {
          modifier += ' + '
        }
      })

      config.parts.push(modifier)

      return true
    })
  }

  init() {
    Hooks.once('ready', () => {
      this.interceptDamageRolls()
    })
  }
}

const dmg = new BetterConditionalDamage()
