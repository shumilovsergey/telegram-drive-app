const fileSystem = {
  name: 'root',
  type: 'folder',
  children: [
    { name: 'Documents', type: 'folder', children: [] },
    { name: 'Pictures', type: 'folder', children: [
      { name: 'image1.jpg', type: 'file', link: 'https://example.com/image1.jpg' },
    ] },
    { name: 'file1.txt', type: 'file', link: 'https://example.com/file1.txt' },
  ],
};

let currentPath = fileSystem;
let selectedFolder = null;

function updatePathDisplay() {
  const pathDisplay = document.getElementById('path-display');
  pathDisplay.textContent = getPathString(currentPath);
}

function getPathString(folder) {
  let path = folder.name;
  let parent = folder.parent;
  while (parent) {
    path = parent.name + '/' + path;
    parent = parent.parent;
  }
  return path + '/';
}

function renderFileSystem(folder, element) {
  element.innerHTML = '';

  folder.children.forEach((item) => {
    const itemElement = document.createElement('li');
    itemElement.classList.add(item.type);
    itemElement.textContent = item.name;
    itemElement.draggable = true;

    if (item.type === 'folder') {
      itemElement.addEventListener('dblclick', () => {
        item.parent = folder;
        currentPath = item;
        updatePathDisplay();
        renderFileSystem(currentPath, element);
      });

      itemElement.addEventListener('click', () => {
        selectedFolder = item;
        renderFolderContents(selectedFolder);
      });
    }

    if (item.type === 'file') {
      itemElement.addEventListener('click', () => {
        window.open(item.link, '_blank');
      });
    }

    itemElement.addEventListener('dragstart', (event) => {
      event.dataTransfer.setData('text/plain', JSON.stringify(item));
      event.dataTransfer.setData('parent-folder', JSON.stringify(folder)); // Track the source folder
    });

    itemElement.addEventListener('dragover', (event) => {
      if (item.type === 'folder') event.preventDefault();
    });

    itemElement.addEventListener('drop', (event) => {
      event.preventDefault();
      const draggedItemData = event.dataTransfer.getData('text/plain');
      const sourceFolderData = event.dataTransfer.getData('parent-folder');
      const draggedItem = JSON.parse(draggedItemData);
      const sourceFolder = JSON.parse(sourceFolderData);

      // Remove the item from the original source folder
      const originalFolder = findFolderByPath(fileSystem, sourceFolder.name);
      originalFolder.children = originalFolder.children.filter((child) => child.name !== draggedItem.name);

      // Move the dragged item to the new folder
      item.children.push(draggedItem);
      draggedItem.parent = item;

      renderFileSystem(currentPath, element);
      if (selectedFolder === item) renderFolderContents(item);
    });

    element.appendChild(itemElement);
  });

  // Add drop handling to the left pane itself if we're in the root
  if (folder === fileSystem) {
    element.addEventListener('dragover', (event) => {
      event.preventDefault();
    });

    element.addEventListener('drop', (event) => {
      event.preventDefault();
      const draggedItemData = event.dataTransfer.getData('text/plain');
      const sourceFolderData = event.dataTransfer.getData('parent-folder');
      const draggedItem = JSON.parse(draggedItemData);
      const sourceFolder = JSON.parse(sourceFolderData);

      // Remove the item from the original source folder
      const originalFolder = findFolderByPath(fileSystem, sourceFolder.name);
      originalFolder.children = originalFolder.children.filter((child) => child.name !== draggedItem.name);

      // Move the dragged item to the root
      fileSystem.children.push(draggedItem);
      draggedItem.parent = fileSystem;

      renderFileSystem(currentPath, element);
      if (selectedFolder) renderFolderContents(selectedFolder);
    });
  }
}

function renderFolderContents(folder) {
  const folderContents = document.getElementById('folder-contents');
  folderContents.innerHTML = '';

  folder.children.forEach((item) => {
    const itemElement = document.createElement('li');
    itemElement.classList.add(item.type);
    itemElement.textContent = item.name;
    itemElement.draggable = true;

    itemElement.addEventListener('dragstart', (event) => {
      event.dataTransfer.setData('text/plain', JSON.stringify(item));
      event.dataTransfer.setData('parent-folder', JSON.stringify(folder)); // Track the source folder
    });

    folderContents.appendChild(itemElement);
  });
}

function findFolderByPath(rootFolder, folderName) {
  if (rootFolder.name === folderName) return rootFolder;
  for (const child of rootFolder.children) {
    if (child.type === 'folder') {
      const found = findFolderByPath(child, folderName);
      if (found) return found;
    }
  }
  return null;
}

const fileList = document.getElementById('file-list');
renderFileSystem(currentPath, fileList);
updatePathDisplay();

document.getElementById('new-folder-btn').addEventListener('click', () => {
  const folderName = prompt('Enter folder name:');
  if (folderName) {
    currentPath.children.push({
      name: folderName,
      type: 'folder',
      children: [],
      parent: currentPath
    });
    renderFileSystem(currentPath, fileList);
  }
});

document.getElementById('back-btn').addEventListener('click', () => {
  if (currentPath.parent) {
    currentPath = currentPath.parent;
    updatePathDisplay();
    renderFileSystem(currentPath, fileList);
  }
});
