document.getElementById('file-input').addEventListener('change', handleFileSelect);

let paragraphs = [];
let currentParagraphIndex = 0;

function handleFileSelect(event) {
  const fileInput = event.target;
  const file = fileInput.files[0];

  if (file) {
    const extension = file.name.split('.').pop().toLowerCase();

    if (extension === 'json') {
      // Handle JSON file
      const reader = new FileReader();
      reader.onload = function (e) {
        const content = e.target.result;
        handleTextFile(content);
      };
      reader.readAsText(file);
    } else if (extension === 'docx') {
      // Handle DOCX file
      parseDocx(file);
    } else if (extension === 'csv') {
      // Handle CSV file
      const reader = new FileReader();
      reader.onload = function (e) {
        handleCSVFile(e.target.result);
      };
      reader.readAsText(file);
    } else {
      alert('Unsupported file format');
    }
  }
}

function handleTextFile(content) {
  paragraphs = content.split('\n'); // Assuming each line is a paragraph
  currentParagraphIndex = 0;
  displayParagraphs();
  updateParagraphNumber();
}

function handleCSVFile(content) {
  Papa.parse(content, {
    header: true,
    dynamicTyping: true,
    complete: result => {
      paragraphs = result.data.map(row => Object.values(row).join(' '));
      currentParagraphIndex = 0;
      displayParagraphs();
      updateParagraphNumber();
    },
    error: error => {
      console.error(error.message);
      alert('Error parsing CSV file');
    }
  });
}

function parseDocx(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const arrayBuffer = e.target.result;

    mammoth.extractRawText({ arrayBuffer: arrayBuffer })
      .then(function (result) {
        const textContent = result.value;
        paragraphs = textContent.split('\n');
        currentParagraphIndex = 0;
        displayParagraphs();
        updateParagraphNumber();
      })
      .catch(function (error) {
        console.error('Error parsing DOCX:', error);
        alert('Error parsing DOCX file. Check the console for details.');
      });
  };
  reader.readAsArrayBuffer(file);
}

function displayParagraphs() {
  console.log(paragraphs[currentParagraphIndex]);
}

function updateParagraphNumber() {
  console.log(`Paragraph ${currentParagraphIndex + 1} of ${paragraphs.length}`);
}
