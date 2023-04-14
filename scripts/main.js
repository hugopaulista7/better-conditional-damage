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
      <div class="checkbox" style="display: flex; align-items: center; width: 100%; justify-content: space-between; margin-bottom: 8px">
        <label style="height: auto; display: flex; align-items: center;">
          <input type="checkbox" name="${btn.id}" value="${btn.value}"
          ${btn.isChecked ? 'checked' : ''}>
        ${btn.label}
        </label>

        <div>
        <button id="edit-button-${
          btn.id
        }" class="edit-button" style="width: auto; padding-left: 8px; padding-right: 8px;">
          <i class="fas fa-pencil" id="edit-button-icon-${btn.id}"></i>
        </button>
        <button id="delete-button-${
          btn.id
        }" class="edit-button" style="width: auto; padding-left: 8px; padding-right: 8px;">
          <i class="fas fa-times" id="delete-button-icon-${btn.id}"></i>
        </button>
        </div>
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

const getIdFromHtmlId = (htmlId) => {
  let splited = htmlId.split('button-')[1]
  if (splited.includes('icon')) {
    splited = splited.split('icon-')
    return splited.join('')
  }

  return splited
}

const getEditHtml = () => {
  let addHtml = getAddHTML()
  return addHtml.replaceAll('-create', '-edit')
}

const editOption = (htmlid) => {
  const id = getIdFromHtmlId(htmlid)
  const option = globalDamageButtons.find((btn) => btn.id == id)
  const dialogHtml = getEditHtml(option)
  let temp = { label: option.label, value: option.value, id }

  const dialogData = {
    title: 'Edit Conditional Damage',
    content: dialogHtml,
    buttons: {
      cancel: {
        label: 'Cancel',
        callback: () => {},
      },
      confirm: {
        label: 'Confirm',
        callback: () => {
          globalDamageButtons.forEach((btn) => {
            if (btn.id == id) {
              btn.label = temp.label
              btn.value = temp.value
            }
          })

          reRenderGlobalDialog()
        },
      },
    },
    default: 'cancel',
    render: (html) => {
      const title = document.getElementById('conditional-damage-edit-title')
      const formula = document.getElementById('conditional-damage-edit-formula')

      title.value = option.label
      formula.value = option.value

      title.addEventListener('input', (event) => {
        temp.label = event.target.value
      })
      formula.addEventListener('input', (event) => {
        temp.value = event.target.value
      })
    },
    close: (html) => console.log('Conditional Damage | Close Dialog', html),
  }

  const dialog = new Dialog(dialogData)
  dialog.render(true)
}
const deleteOption = (htmlid) => {
  const id = getIdFromHtmlId(htmlid)
  const option = globalDamageButtons.find((btn) => btn.id == id)

  const dialogData = {
    title: 'Delete Conditional Damage?',
    content: '<p>Are you sure?</p>',
    buttons: {
      cancel: {
        label: 'Cancel',
        callback: () => {},
      },
      confirm: {
        label: 'Confirm',
        callback: () => {
          const index = globalDamageButtons.indexOf(option)

          console.log('INDEX:: ', index, id, globalDamageButtons)

          if (index < 0) {
            return
          }

          globalDamageButtons.splice(index, 1)

          console.log('GLOBAL DAAMGE: ', globalDamageButtons)
          reRenderGlobalDialog()
        },
      },
    },
    default: 'cancel',
    close: (html) => console.log('Conditional Damage | Close Dialog', html),
  }

  const dialog = new Dialog(dialogData)
  dialog.render(true)
}

const addEventsToButtons = (html) => {
  const btns = Array.from(document.getElementsByClassName('edit-button'))
  btns.forEach((btn) => {
    btn.addEventListener('click', (event) => {
      const id = event.target.id
      if (id.includes('edit')) {
        return editOption(id)
      }
      if (id.includes('delete')) {
        return deleteOption(id)
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
      addEventsToButtons(html)
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

function makeid(length) {
  let result = ''
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  let counter = 0
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
    counter += 1
  }
  return result
}

const handleForm = (html) => {
  const btn = {
    label: newDamageOption.title,
    id: newDamageOption.title.toLowerCase().replaceAll(' ', '-') + makeid(16),
    value: newDamageOption.formula,
    isChecked: false,
  }

  globalDamageButtons.push(btn)
  reRenderGlobalDialog()
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
  globalDialog = new Dialog(dialogData)
  globalDialog.render(true)
}

const reRenderGlobalDialog = () => {
  saveCurrentOptionsState()
  globalDialog.data.content = getDialogHTML()
  globalDialog.render(true)
}

let globalDialog
