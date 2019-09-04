import $ from 'jquery';

import BpmnModeler from 'bpmn-js/lib/Modeler';

import diagramXML from '../resources/newDiagram.bpmn';

var container = $('#js-drop-zone');

var modeler = new BpmnModeler({
  container: '#js-canvas'
});

function createNewDiagram() {
  openDiagram(diagramXML);
}

function openDiagram(xml) {

  modeler.importXML(xml, function(err) {

    if (err) {
      container
        .removeClass('with-diagram')
        .addClass('with-error');

      container.find('.error pre').text(err.message);

      console.error(err);
    } else {
      container
        .removeClass('with-error')
        .addClass('with-diagram');
    }


  });
}

function saveSVG(done) {
  modeler.saveSVG(done);
}

function saveDiagram(done) {

  modeler.saveXML({
    format: true
  }, function(err, xml) {
    done(err, xml);
  });
}

function registerFileDrop(container, callback) {

  function handleFileSelect(e) {
    e.stopPropagation();
    e.preventDefault();

    var files = e.dataTransfer.files;

    var file = files[0];

    var reader = new FileReader();

    reader.onload = function(e) {

      var xml = e.target.result;

      callback(xml);
    };

    reader.readAsText(file);
  }

  function handleDragOver(e) {
    e.stopPropagation();
    e.preventDefault();

    e.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
  }

  container.get(0).addEventListener('dragover', handleDragOver, false);
  container.get(0).addEventListener('drop', handleFileSelect, false);
}


function switchDiagram(e) {
  let diagramSwitch = modeler.get('diagramSwitch');
  diagramSwitch.switchDiagram(e.target.value);
}

function addDiagram() {
  let diagramSwitch = modeler.get('diagramSwitch');
  diagramSwitch.addDiagram();
  populateDiagramCombo();
}

function deleteDiagram() {
  let diagramSwitch = modeler.get('diagramSwitch');
  diagramSwitch.deleteDiagram();
  populateDiagramCombo();
}

function renameDiagram(e) {
  let diagramSwitch = modeler.get('diagramSwitch');
  diagramSwitch.renameDiagram(e.target.value);
  populateDiagramCombo();
}

function populateDiagramCombo() {
  let diagramSwitch = modeler.get('diagramSwitch');
  const select = $('.djs-select');
  select.empty();

  const currentDiagram = diagramSwitch._diagramUtil.currentDiagram();
  const diagrams = diagramSwitch._diagramUtil.diagrams();

  diagrams.forEach((diagram) => {
    const diagramName = diagram.name || diagram.id;
    select.append(`
        <option
          value="${diagram.id}"
          ${currentDiagram.id == diagram.id ? 'selected' : ''}>
            ${diagramName}
        </option>
      `);
  });
}

function handleEndRenameEvent(e) {
  if (e.keyCode && e.keyCode !== 13) {
    return;
  }

  displaySelectInterface();
}

function displayRenameInterface() {
  hideInterface();

  let diagramSwitch = modeler.get('diagramSwitch');
  const renameWrapper = document.querySelector('.djs-rename-wrapper');
  renameWrapper.style.display = 'flex';

  const renameInput = document.querySelector('.djs-rename');
  const currentDiagram = diagramSwitch._diagramUtil.currentDiagram();
  renameInput.value = currentDiagram.name || currentDiagram.id;
  renameInput.focus();
  renameInput.select();
}

function displaySelectInterface() {
  hideInterface();

  populateDiagramCombo();
  const selectWrapper = document.querySelector('.djs-select-wrapper');
  selectWrapper.style.display = 'flex';
}

function hideInterface() {
  const renameWrapper = document.querySelector('.djs-rename-wrapper');
  renameWrapper.style.display = 'none';

  const selectWrapper = document.querySelector('.djs-select-wrapper');
  selectWrapper.style.display = 'none';
}


// file drag / drop ///////////////////////

// check file api availability
if (!window.FileList || !window.FileReader) {
  window.alert(
    'Looks like you use an older browser that does not support drag and drop. ' +
    'Try using Chrome, Firefox or the Internet Explorer > 10.');
} else {
  registerFileDrop(container, openDiagram);
}

// bootstrap diagram functions

$(function() {

  $('#js-create-diagram').click(function(e) {
    e.stopPropagation();
    e.preventDefault();

    createNewDiagram();
  });

  var downloadLink = $('#js-download-diagram');
  var downloadSvgLink = $('#js-download-svg');

  $('.buttons a').click(function(e) {
    if (!$(this).is('.active')) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  function setEncoded(link, name, data) {
    var encodedData = encodeURIComponent(data);

    if (data) {
      link.addClass('active').attr({
        'href': 'data:application/bpmn20-xml;charset=UTF-8,' + encodedData,
        'download': name
      });
    } else {
      link.removeClass('active');
    }
  }

  var exportArtifacts = debounce(function() {

    saveSVG(function(err, svg) {
      setEncoded(downloadSvgLink, 'diagram.svg', err ? null : svg);
    });

    saveDiagram(function(err, xml) {
      setEncoded(downloadLink, 'diagram.bpmn', err ? null : xml);
    });
  }, 500);

  modeler.on('commandStack.changed', exportArtifacts);
  let eventBus = modeler.get('eventBus');
  eventBus.once('import.render.complete', populateDiagramCombo);

  $('.djs-palette').append(`<div class="djs-select-wrapper">
    <select class="djs-select"></select>
    <button id="start-rename-diagram" class="bpmn-icon-screw-wrench" title="Rename this diagram"></button>
    <button id="delete-diagram" class="bpmn-icon-trash" title="Delete this diagram"></button>
    <button id="add-diagram" class="bpmn-icon-sub-process-marker" title="Add a new diagram"></button>
  </div>

  <div class="djs-rename-wrapper">
    <input class="djs-rename" type="text">
    <button id="end-rename-diagram" class="djs-button">Rename</button>
  </div>`);

  $('.djs-select').on('change', switchDiagram);
  $('#add-diagram').on('click', addDiagram);
  $('#delete-diagram').on('click', deleteDiagram);

  $('#start-rename-diagram').on('click', displayRenameInterface);
  $('.djs-rename').on('change', renameDiagram);
  $('.djs-rename').on('keyup', handleEndRenameEvent);
  $('#end-rename-diagram').on('click', handleEndRenameEvent);

});



// helpers //////////////////////

function debounce(fn, timeout) {

  var timer;

  return function() {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(fn, timeout);
  };
}
