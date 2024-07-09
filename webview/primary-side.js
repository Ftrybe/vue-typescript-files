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

function loadTemplateFiles() {
  const node = document.getElementById("templateDir");
  const path = node.value;
  pushMessage("loadTemplateFiles", {data: path});
  
}

function setTemplateOptions(list) {
  const node = document.getElementById("template");
  node.innerHTML = '';
  list.forEach(file => {
   const option = document.createElement('option');
   option.value = file.path;
   option.textContent = file.name;
   node.appendChild(option);
 });
}


function loadDefaultValue(value) {
    const { tempList, dirPath } = value;
    const dirNode = document.getElementById("templateDir")
    dirNode.value = dirPath;
    this.setTemplateOptions(tempList);
}

function listenPostMessage() {
  window.addEventListener('message', event => {
    const message = event.data;

    switch (message.command) {
      case 'restoreInput':
        break;
      case "loadTemplateFiles":
         const tempList = message.data;
         this.setTemplateOptions(tempList);
         break;
      case "defaultValue": 
        const value = message.data;
        this.loadDefaultValue(value);
    }
  });
}

function changetemplateDir(e) {
  console.log(e);
}



function saveData() {
  const customParams = collectCustomParams();
  pushMessage('saveData', customParams);
}


function pushMessage(command, data) {
  vscode.postMessage({
    command: command,
      ...data
  });
}

document.addEventListener('DOMContentLoaded', function () {
  const customParamsContainer = document.getElementById('customParamsContainer');
  const addParamButton = document.getElementById('addParamButton');

  listenPostMessage();

  function addKeyValuePair (key = '', type = 'string', value = '') {
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

    const valueContainer = document.createElement('div');
    valueContainer.className = 'value-container';

    function updateValueInput () {
      valueContainer.innerHTML = '';

      switch (typeSelect.value) {
        case 'api':
          const apiUrlInput = document.createElement('input');
          apiUrlInput.type = 'text';
          apiUrlInput.placeholder = 'Enter API request URL';
          apiUrlInput.value = value.apiUrl || '';
          valueContainer.appendChild(apiUrlInput);

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

          valueContainer.appendChild(headersContainer);
          valueContainer.appendChild(addHeaderButton);

          if (value.headers) {
            for (const header of value.headers) {
              addHeaderPair(header.key, header.value);
            }
          }

          break;

        case 'js':
        case 'json':
          const fileInputWrapper = document.createElement('div');
          fileInputWrapper.className = 'file-input-wrapper';

          const fileInputButton = document.createElement('button');
          fileInputButton.className = 'file-input-button';
          fileInputButton.textContent = 'Choose File';

          const fileInput = document.createElement('input');
          fileInput.type = 'file';
          fileInput.accept = typeSelect.value === 'js' ? '.js' : '.json';
          fileInput.className = 'file-input';

          fileInput.addEventListener('change', () => {
            fileInputButton.textContent = fileInput.files[0].name;
          });

          fileInputWrapper.appendChild(fileInputButton);
          fileInputWrapper.appendChild(fileInput);
          valueContainer.appendChild(fileInputWrapper);
          break;

        default:
          const stringInput = document.createElement('input');
          stringInput.type = 'text';
          stringInput.placeholder = 'Enter value';
          stringInput.value = value;
          valueContainer.appendChild(stringInput);
      }
    }

    typeSelect.addEventListener('change', updateValueInput);
    updateValueInput();

    const removeButton = document.createElement('button');
    removeButton.className = 'remove-button';
    removeButton.textContent = 'X';
    removeButton.addEventListener('click', () => {
      customParamsContainer.removeChild(div);
    });

    div.appendChild(keyInput);
    div.appendChild(typeSelect);
    div.appendChild(valueContainer);
    div.appendChild(removeButton);
    customParamsContainer.appendChild(div);
  }

  addParamButton.addEventListener('click', () => {
    addKeyValuePair();
  });

  document.getElementById('previewButton').addEventListener('click', function () {
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
        pushMessage('alert', {status: 'error', data: "Key Cannot Be Empty"})
        return;
      }
      customParams.push({ key, type, value });
    }

    pushMessage('preview', {
      data: {
        fileName,
        template,
        templateDir,
        customParams
      }
    })
    // Add your preview functionality here
  });
});


function collectCustomParams() {
  const customParams = [];
  const pairs = document.querySelectorAll('.key-value-pair');
  pairs.forEach(pair => {
      const key = pair.querySelector('input[type="text"]').value;
      const type = pair.querySelector('select').value;
      let value;
      switch (type) {
          // 根据实际结构调整，可能需要添加其他逻辑
          case 'api':
              value = { apiUrl: pair.querySelector('.apiUrl').value }; // 请调整具体实现
              break;
          default:
              value = pair.querySelector('.value-container input').value;
      }
      customParams.push({ key, type, value });
  });
  return customParams;
}

function restoreCustomParams(data) {
  data.forEach(param => {
      addKeyValuePair(param.key, param.type, param.value);
  });
}