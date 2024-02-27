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
    } else if (extension === 'xlsx' || extension === 'xls') {
      // Handle Excel file
      const reader = new FileReader();
      reader.onload = function (e) {
        handleExcelFile(e.target.result);
      };
      reader.readAsArrayBuffer(file);
    } else if (extension === 'pdf') {
      // Handle PDF file using parsePDF function
      parsePDF(file);
    } else {
      alert('Unsupported file format');
    }
  }
}

function parsePDF(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const arrayBuffer = e.target.result;

    pdfjsLib.getDocument(arrayBuffer).promise.then(function (pdf) {
      let textContent = '';
      const getPageText = pageNum => {
        return pdf.getPage(pageNum).then(function (page) {
          return page.getTextContent().then(function (content) {
            content.items.forEach(function (textItem) {
              textContent += textItem.str + ' ';
            });
          });
        });
      };

      const pagePromises = [];
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        pagePromises.push(getPageText(pageNum));
      }

      Promise.all(pagePromises).then(() => {
        // Split paragraphs on periods followed by a space
        paragraphs = textContent.split('. ');
        currentParagraphIndex = 0;
        displayParagraphs();
        updateParagraphNumber();
      });
    }).catch(function (error) {
      console.error('Error parsing PDF:', error);
      alert('Error parsing PDF file. Check the console for details.');
    });
  };
  reader.readAsArrayBuffer(file);
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

function handleExcelFile(arrayBuffer) {
    const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    paragraphs = excelData.map(row => row.join(' '));
    currentParagraphIndex = 0;
    displayParagraphs();
    updateParagraphNumber();
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