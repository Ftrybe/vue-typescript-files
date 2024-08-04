const vscode = acquireVsCodeApi();

const commonHeaders = [
  'Content-Type',
  'Authorization',
  'Accept',
  'User-Agent',
  'Referer',
  'Cache-Control',
  'Accept-Encoding',
  'Accept-Language',
  'Connection',
  'Cookie'
];

let currentState = {
  fileName: '',
  templateDir: '',
  template: '',
  customParams: [],
  templateList: [],
  syncConfig: false
};

document.addEventListener('DOMContentLoaded', function () {

  listenPostMessage();

  document.getElementById('addParamButton').addEventListener('click', () => {
    addKeyValuePair();
  });

  document.getElementById('previewButton').addEventListener('click', () => {
    onPreview();
  });

  document.getElementById('previewParamButton').addEventListener('click', () => {
    onPreviewParams();
  })
});



function listenPostMessage () {
  window.addEventListener('message', event => {
    const message = event.data;

    switch (message.command) {
      case 'restoreState':
        currentState = message.state;
        restoreUIFromState(currentState);
        break;
      case "loadTemplateFiles":
        currentState.templateList = message.data;
        setTemplateOptions();
        break;
      case "defaultValue":
        const value = message.data;
        loadDefaultValue(value);
        break;
      case "previewParams":
         loadPreviewParams(message.data);
         break;
    }
  });
}


function loadTemplateFiles () {
  const node = document.getElementById("templateDir");
  const path = node.value;

  pushMessage("loadTemplateFiles", { data: path });
}


function loadPreviewParams(data) {
  document.getElementById("response").innerHTML = JSON.stringify(data, null, 2);
}

function loadDefaultValue (value) {
  const { tempList, dirPath } = value;
  const dirNode = document.getElementById("templateDir")
  dirNode.value = dirPath;
  currentState.templateList = tempList;
  setTemplateOptions();
  saveState();
}

function setTemplateOptions () {
  const node = document.getElementById("template");
  node.innerHTML = '';
  currentState.templateList.forEach(file => {
    const option = document.createElement('option');
    option.value = file.path;
    option.textContent = file.name;
    node.appendChild(option);
  });
}


function updateState (field, value) {
  if (field === 'customParams') {
     currentState.customParams = getCustomParams();
  } else {
    currentState[field] = value;
  }
  vscode.postMessage({ command: 'saveState', syncConfig: field === 'customParams',  state: currentState });
}

function saveState () {
  currentState = getState();
  vscode.postMessage({ command: 'saveState', state: currentState });
}

function pushMessage (command, data) {
  vscode.postMessage({
    command: command,
    ...data
  });
}

function addKeyValuePair (param = { key: '', type: 'string', value: '', needUpdateState: true }) {
  const { key, type, value, needUpdateState } = param;
  const customParamsContainer = document.getElementById('customParamsContainer');

  const div = document.createElement('div');
  div.className = 'key-value-pair';
  // div.dataset.id = _id;

  const keyInput = document.createElement('input');
  keyInput.type = 'text';
  keyInput.placeholder = 'Key';
  keyInput.value = key;

  const typeSelect = document.createElement('select');
  const types = ['string', 'api', 'js', 'json'];
  types.forEach(t => {
    const option = document.createElement('option');
    option.value = t;
    option.textContent = t;
    typeSelect.appendChild(option);
  });
  typeSelect.value = type;


  keyInput.addEventListener('input', () => updateState('customParams'));


  const valueContainer = document.createElement('div');
  valueContainer.className = 'value-container';

  function updateValueInput (_value) {
    valueContainer.innerHTML = '';
    switch (typeSelect.value) {
      case 'api':
        addApiNode(valueContainer, _value);
        break;
      case 'js':
      case 'json':
        addFileChooseNode(valueContainer, typeSelect, _value);
        break;
      default:
        addInputNode(valueContainer, _value);
    }
  }

  // 首次插入时添加节点
  updateValueInput(value);

  typeSelect.addEventListener('change', () => {
    updateValueInput('');
    updateState('customParams');
  });

  const removeButton = document.createElement('button');
  removeButton.className = 'remove-button';
  removeButton.textContent = 'X';
  removeButton.addEventListener('click', () => {
    customParamsContainer.removeChild(div);
    updateState('customParams');
  });

  div.appendChild(keyInput);
  div.appendChild(typeSelect);
  div.appendChild(valueContainer);
  div.appendChild(removeButton);
  customParamsContainer.appendChild(div);
}


function addInputNode (container, value = '') {
  const stringInput = document.createElement('input');
  stringInput.type = 'text';
  stringInput.placeholder = 'Enter value';
  stringInput.value = value;
  container.appendChild(stringInput);

  stringInput.addEventListener('input', () => updateState('customParams'));
  // container.appendChild(stringInput);
}


function addApiNode (container, value = { apiUrl: '', headers: [] }) {
  const apiUrlInput = document.createElement('input');
  apiUrlInput.type = 'text';
  apiUrlInput.placeholder = 'Enter API request URL';
  apiUrlInput.value = value.apiUrl || '';
  apiUrlInput.addEventListener('input', () => updateState('customParams'));

  container.appendChild(apiUrlInput);

  const headersContainer = document.createElement('div');
  headersContainer.className = 'headers-container';

  function addHeaderPair (headerKey = '', headerValue = '') {
    const headerDiv = document.createElement('div');
    headerDiv.className = 'header-pair';

    const headerKeyInput = document.createElement('input');
    headerKeyInput.type = 'text';
    headerKeyInput.placeholder = 'Header Key';
    headerKeyInput.value = headerKey;

    const headerValueInput = document.createElement('input');
    headerValueInput.type = 'text';
    headerValueInput.placeholder = 'Header Value';
    headerValueInput.value = headerValue;

    const removeHeaderButton = document.createElement('button');
    removeHeaderButton.className = 'remove-header-button';
    removeHeaderButton.textContent = 'X';
    removeHeaderButton.addEventListener('click', () => {
      headersContainer.removeChild(headerDiv);
    });

    const autocompleteList = document.createElement('div');
    autocompleteList.className = 'autocomplete-list';

    headerKeyInput.addEventListener('input', () => {
      const value = headerKeyInput.value.toLowerCase();
      autocompleteList.innerHTML = '';
      if (value) {
        const filteredHeaders = commonHeaders.filter(h => h.toLowerCase().includes(value));
        filteredHeaders.forEach(h => {
          const item = document.createElement('div');
          item.className = 'autocomplete-item';
          item.textContent = h;
          item.addEventListener('click', () => {
            headerKeyInput.value = h;
            autocompleteList.innerHTML = '';
          });
          autocompleteList.appendChild(item);
        });
      }

    });


    headerValueInput.addEventListener('input', () => updateState('customParams'));
    headerDiv.appendChild(headerKeyInput);
    headerDiv.appendChild(headerValueInput);
    headerDiv.appendChild(removeHeaderButton);
    headerDiv.appendChild(autocompleteList);
    headersContainer.appendChild(headerDiv);
  }

  const addHeaderButton = document.createElement('button');
  addHeaderButton.className = 'add-header-button';
  addHeaderButton.textContent = 'Add Header';
  addHeaderButton.addEventListener('click', () => {
    addHeaderPair();
  });

  container.appendChild(headersContainer);
  container.appendChild(addHeaderButton);

  if (value.headers) {
    for (const header of value.headers) {
      addHeaderPair(header.key, header.value);
    }
  }
}

function addFileChooseNode (container, typeSelect, initialValue = '') {
  const fileInputWrapper = document.createElement('div');
  fileInputWrapper.className = 'file-input-wrapper';

  const fileInputButton = document.createElement('input');
  fileInputButton.className = 'file-input-button';
  fileInputButton.placeholder = 'Choose File';

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = typeSelect.value === 'js' ? '.js' : '.json';
  fileInput.className = 'file-input';
  if (initialValue) {
    fileInputButton.value = initialValue; // 显示文件名
  }
  fileInput.addEventListener('change', () => {
    fileInputButton.value = fileInput.files[0].path;
    updateState('customParams');
  });

  fileInputWrapper.appendChild(fileInputButton);
  fileInputWrapper.appendChild(fileInput);
  container.appendChild(fileInputWrapper);
}

function onPreview () {
  const data = getState();
  pushMessage('preview', {
    data: data
  })
}

function onPreviewParams() {
  const data = getState();
  pushMessage('previewParams', {
    data: data
  })
}

const typeHandlers = {
  api: (container) => ({
    apiUrl: container.querySelector('input[type="text"]').value,
    headers: Array.from(container.querySelectorAll('.header-pair')).map(headerPair => ({
      key: headerPair.querySelector('input:nth-child(1)').value,
      value: headerPair.querySelector('input:nth-child(2)').value,
    })),
  }),
  js: (container) => getFilePath(container),
  json: (container) => getFilePath(container),
  default: (container) => container.querySelector('input').value,
};

function getFilePath(container) {
  const fileInput = container.querySelector('input[type="file"]');
  return fileInput.files && fileInput.files.length > 0 ? fileInput.files[0].path : null;
}

function parseCustomParams() {
  const customParamsContainer = document.getElementById('customParamsContainer');
  const pairs = customParamsContainer.querySelectorAll('.key-value-pair');
  
  return Array.from(pairs).map(pair => {
    const key = pair.querySelector('input:nth-child(1)').value.trim();
    const type = pair.querySelector('select').value;
    const valueContainer = pair.querySelector('.value-container');

    if (!key) {
      throw new Error("Key Cannot Be Empty");
    }

    const value = (typeHandlers[type] || typeHandlers.default)(valueContainer);

    return { key, type, value };
  });
}

function getState() {
  try {
    const [template, templateDir, fileName] = ['template', 'templateDir', 'fileName']
      .map(id => document.getElementById(id).value);

    const customParams = parseCustomParams();

    return {
      fileName,
      template,
      templateDir,
      customParams
    };
  } catch (error) {
    pushMessage('alert', { status: 'error', data: error.message });
    return null;
  }
}

function getCustomParams() {
  try {
    return parseCustomParams();
  } catch (error) {
    console.error(error.message);
    return [];
  }
}


// 从状态恢复 UI
function restoreUIFromState (state) {
  if (state) {
    currentState = state;
    document.getElementById('fileName').value = state.fileName || '';
    document.getElementById('templateDir').value = state.templateDir || '';
    document.getElementById('template').value = state.template || '';

    document.getElementById('customParamsContainer').innerHTML = '';
    document.getElementById('syncConfig').checked = state.syncConfig || false;
    if (state.customParams) {
      state.customParams.forEach((param) => {
        addKeyValuePair({ key: param.key, type: param.type, value: param.value, needUpdateState: false });
      });
    }

    loadTemplateFiles(state.tempList);
 
  }
}

// 改变值
// 文件名称改变
function onChangeFileName () {
  updateState('fileName', document.getElementById('fileName').value);
}

// 模版路径改变
function onChangeTemplateDir () {
  updateState('templateDir', document.getElementById('templateDir').value);
}

function onSyncConfig () {
  const dir = document.getElementById('templateDir').value;
  if (!dir || dir.trim() == '' || dir.trim() == 'undefined') {
    pushMessage('alert', { status: 'error', data: "Config Directory Cannot Be Empty" })
    return;
  }

  const checked = document.getElementById('syncConfig').checked;
  updateState('syncConfig', checked);

  // 如果勾选了，那么就要更新配置文件
  pushMessage('toggleSyncConfig', {data: checked});
}
