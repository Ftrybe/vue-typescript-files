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
  templateList: []
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
    }
  });
}


function loadTemplateFiles () {
  const node = document.getElementById("templateDir");
  const path = node.value;

  pushMessage("loadTemplateFiles", { data: path });
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


function updateState (field, value, index = -1) {
  if (field === 'customParams') {
    if (index >= 0) {
      currentState.customParams[index] = value;
    } else {
      currentState.customParams.push(value);
    }
  } else {
    currentState[field] = value;
  }
  vscode.postMessage({ command: 'saveState', state: currentState });
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

function addKeyValuePair (param = { key: '', type: 'string', value: '', needUpdateState: true, index: undefined }) {
  const { key, type, value, needUpdateState, index } = param;
  const customParamsContainer = document.getElementById('customParamsContainer');
  const _index = index ?? currentState.customParams.length;

  if (needUpdateState) {
    updateState('customParams', { key, type, value });
  }


  const div = document.createElement('div');
  div.className = 'key-value-pair';

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


  keyInput.addEventListener('input', () => updateCustomParam(_index, 'key', keyInput.value));


  const valueContainer = document.createElement('div');
  valueContainer.className = 'value-container';

  function updateValueInput (_index) {
    valueContainer.innerHTML = '';
    switch (typeSelect.value) {
      case 'api':
        addApiNode(valueContainer, _index, value);
        break;
      case 'js':
      case 'json':
        addFileChooseNode(valueContainer, _index, typeSelect, value);
        break;
      default:
        addInputNode(valueContainer, _index, value);
    }
  }

  // 首次插入时添加节点
  updateValueInput(_index);

  typeSelect.addEventListener('change', () => {
    updateValueInput(_index);
    updateCustomParam(_index, 'type', typeSelect.value);
  });

  const removeButton = document.createElement('button');
  removeButton.className = 'remove-button';
  removeButton.textContent = 'X';
  removeButton.addEventListener('click', () => {
    customParamsContainer.removeChild(div);
    currentState.customParams.splice(_index, 1);
    updateState('customParams', null, _index);
  });

  div.appendChild(keyInput);
  div.appendChild(typeSelect);
  div.appendChild(valueContainer);
  div.appendChild(removeButton);
  customParamsContainer.appendChild(div);
}


function updateCustomParam (index, field, value) {
  currentState.customParams[index][field] = value;
  updateState('customParams', currentState.customParams[index], index);
}

function addInputNode (container, index, value = '') {
  const stringInput = document.createElement('input');
  stringInput.type = 'text';
  stringInput.placeholder = 'Enter value';
  stringInput.value = value;
  container.appendChild(stringInput);

  stringInput.addEventListener('input', () => updateCustomParam(index, 'value', stringInput.value));
  // container.appendChild(stringInput);
}


function addApiNode (container, index, value = { apiUrl: '', headers: [] }) {
  const apiUrlInput = document.createElement('input');
  apiUrlInput.type = 'text';
  apiUrlInput.placeholder = 'Enter API request URL';
  apiUrlInput.value = value.apiUrl || '';
  apiUrlInput.addEventListener('input', () => updateApiUrl(index, apiUrlInput.value));

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

      // updateCustomParam(index, 'value', { apiUrl: apiUrlInput.value });
    });


    headerValueInput.addEventListener('input', () => updateApiHeaders(index));
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


function updateApiHeaders (index) {
  const headers = Array.from(document.querySelectorAll('.header-pair')).map(headerPair => ({
    key: headerPair.children[0].value,
    value: headerPair.children[1].value,
  }));
  updateCustomParam(index, 'value', { apiUrl: currentState.customParams[index].value.apiUrl, headers });
}

function updateApiUrl(index, apiUrl) {
  const val = currentState.customParams[index]['value']
  const headers = val?.headers ?? [];

  updateCustomParam(index, 'value', { apiUrl: apiUrl, headers });
}

function addFileChooseNode (container, index, typeSelect, initialValue = '') {
  const fileInputWrapper = document.createElement('div');
  fileInputWrapper.className = 'file-input-wrapper';

  const fileInputButton = document.createElement('button');
  fileInputButton.className = 'file-input-button';
  fileInputButton.textContent = 'Choose File';

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = typeSelect.value === 'js' ? '.js' : '.json';
  fileInput.className = 'file-input';
  if (initialValue) {
    fileInputButton.textContent = initialValue; // 显示文件名
  }
  fileInput.addEventListener('change', () => {
    fileInputButton.textContent = fileInput.files[0].name;
    updateCustomParam(index, 'value', fileInput.files[0].path);
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

function getState () {
  const template = document.getElementById('template').value;
  const templateDir = document.getElementById('templateDir').value;
  const fileName = document.getElementById("fileName").value;
  const customParams = [];
  const pairs = customParamsContainer.getElementsByClassName('key-value-pair');
  for (const pair of pairs) {
    const key = pair.children[0].value;
    const type = pair.children[1].value;
    let value;

    switch (type) {
      case 'api':
        value = {
          apiUrl: pair.children[2].children[0].value,
          headers: Array.from(pair.children[2].getElementsByClassName('header-pair')).map(headerPair => ({
            key: headerPair.children[0].value,
            value: headerPair.children[1].value,
          })),
        };
        break;

      case 'js':
      case 'json':
        const fileInputElement = pair.children[2].children[0].children[1];
        if (fileInputElement.files && fileInputElement.files.length > 0) {
          value = fileInputElement.files[0].path;
        } else {
          console.error("No file selected or file list is empty.");
          value = null;
        }
        break;

      default:
        value = pair.children[2].children[0].value;
    }

    if (!key || key.trim() == '') {
      pushMessage('alert', { status: 'error', data: "Key Cannot Be Empty" })
      return;
    }
    customParams.push({ key, type, value });
  }
  return {
    fileName,
    template,
    templateDir,
    customParams
  };
  // Add your preview functionality here
}

// 从状态恢复 UI
function restoreUIFromState (state) {
  if (state) {
    currentState = state;
    document.getElementById('fileName').value = state.fileName || '';
    document.getElementById('templateDir').value = state.templateDir || '';
    document.getElementById('template').value = state.template || '';

    document.getElementById('customParamsContainer').innerHTML = '';

    if (state.customParams) {
      state.customParams.forEach((param, index) => {
        addKeyValuePair({ key: param.key, type: param.type, value: param.value, needUpdateState: false , index: index});
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