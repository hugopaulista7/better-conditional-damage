const CONSTS_CONDITIONAL_DAMAGE = {
  OPTIONS_KEY: 'conditional_damage_formulas',
  SELECTED_KEY: 'conditional_damage_selected_formulas',
}

Hooks.on('getSceneControlButtons', (controls, b, c) => {
  const tokenButton = controls.find((control) => control.name === 'token')
  let button = {
    name: 'conditional-damage-button-activate',
    title: 'Conditional Damage',
    icon: 'fas fa-sword',
    button: true,
    visible: true,
    onClick: (event) => {
      renderDialog()
    },
  }

  tokenButton.tools.push(button)
})

let globalDamageButtons = []

const getOptionsStateFromLocalStorage = () => {
  const optsJson = localStorage.getItem(CONSTS_CONDITIONAL_DAMAGE.OPTIONS_KEY)
  const optsParsed = JSON.parse(optsJson)

  if (!optsParsed || !optsParsed.length) {
    return
  }

  globalDamageButtons = optsParsed
}

Hooks.on('ready', () => {
  getOptionsStateFromLocalStorage()
})

let newDamageOption = {
  title: '',
  formula: '',
}

const getCheckboxes = () => {
  let str = ''

  globalDamageButtons.forEach((btn) => {
    str += `
      <div class="checkbox; display: flex; align-items: center;">
        <label style="height: auto; display: flex; align-items: center;"><input type="checkbox" name="${
          btn.id
        }" value="${btn.value}"
        ${btn.isChecked ? 'checked' : ''}
        >${btn.label}</label>
      </div>
    `
  })
  return str
}

const getDialogHTML = () => {
  const htmlSituational = `
        <label>Better Situational</label>
        <div style="display: grid; grid-template-columns: auto; padding: 16px 0px">
          ${getCheckboxes()}
        </div>
    `

  const formGroup = document.createElement('div')
  formGroup.classList.add('form-group')
  formGroup.innerHTML = htmlSituational.trim()

  return formGroup.innerHTML
}

const addEventsToCheckboxes = (html) => {
  html[0].addEventListener('change', (event) => {
    globalDamageButtons.forEach((btn) => {
      if (btn.id == event.target.name) {
        btn.isChecked = event.target.checked
      }
    })
  })
}

const saveCurrentOptionsState = () => {
  const options = globalDamageButtons.map((e) => ({ ...e }))
  options.forEach((e) => (e.isChecked = false))
  const json = JSON.stringify(options)

  localStorage.setItem(CONSTS_CONDITIONAL_DAMAGE.OPTIONS_KEY, json)
}

const saveSelected = (opts) => {
  const json = JSON.stringify(opts)
  localStorage.setItem(CONSTS_CONDITIONAL_DAMAGE.SELECTED_KEY, json)
}

const getSelectedOptions = () => {
  const options = globalDamageButtons.filter((e) => e.isChecked)
  saveSelected(options)
  saveCurrentOptionsState()
  if (!options.length) {
    return
  }

  return options
}

const getDialogData = () => {
  const dialogHtml = getDialogHTML()
  return {
    title: 'Apply Conditional Damage',
    content: dialogHtml,
    buttons: {
      add: {
        label: 'Add Damage Options',
        callback: () => {
          getAddDialog()
        },
      },
      confirm: {
        label: 'Confirm',
        callback: () => {
          getSelectedOptions()
        },
      },
    },
    default: 'confirm',
    render: (html) => {
      addEventsToCheckboxes(html)
    },
    close: (html) => console.log('Conditional Damage | Close Dialog', html),
    preventClose: true,
  }
}

const getAddHTML = () => {
  const html = `
    <form id="conditional-damage-create-form">
      <div class="form-group">
        <label>
          Name:
        </label>
        <input type="text" placeholder="Eg: Divine Smite 1st" id="conditional-damage-create-title"/>
      </div>
      <div class="form-group">
        <label>
          Formula:
        </label>
        <input type="text" placeholder="Eg: 2d8[Radiant]" id="conditional-damage-create-formula"/>
      </div>
    </form>
  `

  const formgroup = document.createElement('div')
  formgroup.innerHTML = html.trim()

  return formgroup.innerHTML
}

const handleForm = (html) => {
  const btn = {
    label: newDamageOption.title,
    id: newDamageOption.title.toLowerCase().replace(' ', '-'),
    value: newDamageOption.formula,
    isChecked: false,
  }

  globalDamageButtons.push(btn)
  saveCurrentOptionsState()
}

const handleFormChanged = (name, value) => {
  if (name == 'conditional-damage-create-title') {
    newDamageOption.title = value
  } else if (name == 'conditional-damage-create-formula') {
    newDamageOption.formula = value
  }
}

const getAddDialog = () => {
  newDamageOption.formula = ''
  newDamageOption.title = ''

  const addHtml = getAddHTML()

  const data = {
    title: 'Add Conditional Damage Options',
    content: addHtml,
    buttons: {
      save: {
        label: 'Save',
        callback: (html) => {
          handleForm(html)
        },
      },
      cancel: {
        label: 'Cancel',
        callback: () => {},
      },
    },
    default: 'cancel',
    render: (html) => {
      console.log('Conditional Damage | Rendering Add Damage Dialog', html)
      const formTitle = document.getElementById(
        'conditional-damage-create-title'
      )
      const formFormula = document.getElementById(
        'conditional-damage-create-formula'
      )
      formTitle.addEventListener('input', (event) => {
        newDamageOption.title = event.target.value
      })

      formFormula.addEventListener('input', (event) => {
        newDamageOption.formula = event.target.value
      })
    },
    close: () => console.log('Conditional Damage | Add Damage Closed'),
  }

  const dialog = new Dialog(data)
  dialog.render(true)
}

const renderDialog = () => {
  const dialogData = getDialogData()
  const dialog = new Dialog(dialogData)
  dialog.render(true)
}
