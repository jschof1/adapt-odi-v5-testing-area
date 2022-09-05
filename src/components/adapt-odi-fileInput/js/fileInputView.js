import QuestionView from 'core/js/views/questionView';
import Papa from './csvToJson';
import Ajv from './ajv7.min.js';
import DataTable from 'libraries/jquery.dataTables.min';


export default class fileInputView extends QuestionView {

  events() {
    return {
      'focus .js-item-input': 'onItemFocus',
      'blur .js-item-input': 'onItemBlur',
      'change .js-item-input': 'onInputChanged',
      'keyup .js-item-input': 'onKeyPress'
    };
  }


  resetQuestionOnRevisit() {
    this.resetQuestion();
  }

  setupQuestion() {
    this.model.setupRandomisation();
  }

  onQuestionRendered() {
    this.setReadyStatus();
  }

  // Used by the question view to reset the look and feel of the component.
  resetQuestion() {
    this.model.resetActiveItems();
    this.model.resetItems();
  }

  showCorrectAnswer() {
    this.model.set('_isCorrectAnswerShown', true);
  }

  hideCorrectAnswer() {
    this.model.set('_isCorrectAnswerShown', false);
  }

  getFile() {
    const $itemInput = this.$('.js-item-input').eq(0);
    function readFile(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = res => {
          resolve(res.target.result);
        };
        reader.onerror = err => reject(err);
        return reader.readAsText(file);
      });
    }
    async function onSubmit() {
      const file = $itemInput[0].files[0]
      const contents = await readFile(file)
      let parse = await Papa.parse(contents, {
        header: true
      });
      let fileObj = await { parse: parse, contents: contents }

      return await fileObj
    }

    return onSubmit()
  }

  async createTable() {
    let result = await this.getFile()
    // console.log(result.parse.data, 'hi')

    let tableData = []

    for (var i = 0; i < result.parse.data.length; i++) {
      var record = result.parse.data[i];
      var recordVals = [];
      var numCols = Object.keys(record).length;
      for (var j = 0; j < numCols; j++) {
        var key = Object.keys(record)[j];
        var value = record[key];
        recordVals.push(value);
      }
      tableData.push(recordVals);
    }

    window.alert = function () { }

    var col = [];
    var tableHeader = [];
    for (var i = 0; i < result.parse.data.length; i++) {
      for (var key in result.parse.data[i]) {
        if (col.indexOf(key) === -1) {
          col.push(key);
        }
      }
    }
    for (var i in col) {
      tableHeader.push({ title: col[i] });
    }

    $('#example').DataTable({
      "dom": '<"top"ip>rt<"clear">',
      data: tableData, // extract this from input file
      columns: tableHeader,
      scrollX: true,
    });
  }
  async checkCsvStructure() {

    let result = await this.getFile()
    let lines = result.contents.split('\n');
    let csvLineBreaks = [];

    let encodingErrors = [];
    // 1: YELLOW
    const lineBreaks = (csv) => {
      for (let i = 0; i < lines.length - 1; i++) {
        csvLineBreaks.push(lines[i].split('\r').length - 1);
      }
      let csvLineBreaks_unique = csvLineBreaks.filter(function (item, pos) {
        return csvLineBreaks.indexOf(item) == pos;
      });
      if (csvLineBreaks_unique.length > 1) {
        encodingErrors.push('Line breaks are not the same throughout the csv file.');
      }
    };

    // Whitespace: if there is any whitespace between commas and double quotes around fields
    const whiteSpace = (csv) => {
      let csv_lines = csv.split('\n');
      let csvRows = [];
      for (let i = 1; i < csv_lines.length - 1; i++) {
        csvRows.push(csv_lines[i].split(','));
      }
      let csvRows_whitespace = [];
      for (let i = 0; i < csvRows.length - 1; i++) {
        for (let j = 0; j < csvRows[i].length; j++) {
          if (csvRows[i][j].split('"').length % 2 != 0) {
            if (csvRows[i][j].split('"').length > 2) {
              if (csvRows[i][j].split('"')[1].split(' ').length > 1) {
                csvRows_whitespace.push(i);
              }
            }
          }
        }
      }
      if (csvRows_whitespace.length > 0) {
        encodingErrors.push(
          'There is whitespace between commas and double quotes around fields in csv.',
          `whitespace: ${csvRows_whitespace}`
        );
      }
    };


    // Invalid encoding: check if there are any odd characters in a file which could cause encoding Errors
    // look for odd charachters in csv file that cannot be encoded as UTF-8
    const invalidEncoding = (csv) => {
      let invalid = false;
      for (let i of csv) {
        if (csv.charCodeAt(i) > 127) {
          invalid = true;
        }
      }
      return invalid;
    }

    // Encoding: if you don't use UTF-8 as the encoding for the file

    const checkUTF8 = (csv) => {
      let utf8Text = csv;
      try {
        // Try to convert to utf-8
        utf8Text = decodeURIComponent(escape(csv));
        // If the conversion succeeds, text is not utf-8
      } catch (e) {
        // csvResults.push(e.message); // URI malformed
        // This exception means text is utf-8
      }
      return utf8Text; // returned text is always utf-8
    };

    // No content type: if you don't provide a Content-Type HTTP header

    // No encoding: if you don't specify an encoding with a charset parameter

    // Excel: if it looks like you're serving an Excel file rather than CSV (because the suffix for the file is .xls and there is no 'Content - Type' header)
    // CHECK .HBS FILE - ONLY ALLOWING FOR .CSV FILES


    ////////////////
    // 2: GREEN
    ///////////////

    let encodingInside = []

    // Check options: if the CSV file only contains a single comma - separated column; this usually means you're using a separator other than a comma
    const singleCommaSeparated = csv => {
      let csv_lines = csv.split('\n');
      let csvRows = [];
      for (let i = 1; i < csv_lines.length - 1; i++) {
        csvRows.push(csv_lines[i].split(','));
      }
      let csvRows_columns = [];
      for (let i = 0; i < csvRows.length - 1; i++) {
        csvRows_columns.push(csvRows[i].length);
      }
      let csvRows_columns_unique = csvRows_columns.filter(function (item, pos) {
        return csvRows_columns.indexOf(item) == pos;
      });
      if (csvRows_columns_unique.length == 1 && csvRows_columns_unique[0] == 1) {
        encodingInside.push(
          'The CSV file only contains a single comma-separated column.',
        );
      }
    }

    ////////////////
    // 3: BLUE
    ///////////////

    let headerColumns = []

    // Undeclared header: if you do not specify in a machine readable way whether or not your CSV has a header row
    const undeclaredHeader = (csv) => {
      let csv_lines = csv.split('\n');
      let csv_headers = csv_lines[0].split(',');
      if (csv_headers.length == 1) {
        headerColumns.push('The csv headers have not been declared.', `the headers are: ${headers}`);
      }
    };

    // Title row: if there appears to be a title field in the first row of the CSV and if we get the CSV from a URL, we return these warnings:

    ////////////////
    // 4: PINK
    ///////////////

    let columnValidation = []

    // Empty column name: if all the columns don't have a name
    const emptyColumnName = (csv) => {
      let csv_lines = csv.split('\n');
      let csv_headers = csv_lines[0].split(',');
      let csv_headers_blank = [];
      for (let i = 0; i < csv_headers.length; i++) {
        if (csv_headers[i] == '') {
          csv_headers_blank.push(i);
        }
      }
      if (csv_headers_blank.length > 0) {
        columnValidation.push("There are columns that don't have a name in the csv file.");
      }
    };
    // Duplicate column name: if all the column names aren't unique
    const duplicateColumnName = (csv) => {
      let csv_lines = csv.split('\n');
      let csv_headers = csv_lines[0].split(',');
      let csv_headers_unique = csv_headers.filter(function (item, pos) {
        return csv_headers.indexOf(item) == pos;
      });
      if (csv_headers_unique.length != csv_headers.length) {
        columnValidation.push('Not all the columns are unique.', `see here: ${csv_headers_unique}`)
      }
    };

    ////////////////
    // 5: PURPLE
    ///////////////

    let rowValidation = []

    // Ragged rows: if every row in the file doesn't have the same number of columns
    const raggedRows = (csv) => {
      let csv_lines = csv.split('\n');
      let csv_headers = csv_lines[0].split(',');
      let csvRows = []
      // csvResults.push(csvRows)
      for (let i = 1; i < csv_lines.length - 1; i++) {
        csvRows.push(csv_lines[i].split(','));
      }
      let csvRows_columns = [];
      for (let i = 0; i < csvRows.length - 1; i++) {
        csvRows_columns.push(csvRows[i].length);
      }
      let csvRows_columns_unique = csvRows_columns.filter(function (item, pos) {
        return csvRows_columns.indexOf(item) == pos;
      });
      if (csvRows_columns_unique.length > 1) {
        // csvResults.push(csvRows_columns_unique[0])
        // csvResults.push(csvRows_columns_unique)
        // const displayColumns = num => csvRows_columns[csvRows_columns_unique[num]]
        rowValidation.push(
          "Every row in the file doesn't have the same number of columns.",
          `here are the column counts we have found: ${[...csvRows_columns_unique]}`
        );
      }
    };

    // Blank rows: if there are any blank rows
    const blankRows = (csv) => {
      let csv_lines = csv.split('\n');
      let csvRows = [];
      for (let i = 1; i < csv_lines.length - 1; i++) {
        csvRows.push(csv_lines[i].split(','));
      }
      let csvRows_blank = [];
      for (let i = 0; i < csvRows.length - 1; i++) {
        if (csvRows[i].length == 1 && csvRows[i][0] == '') {
          csvRows_blank.push(i);
        }
      }
      if (csvRows_blank.length > 0) {
        rowValidation.push('There are blank rows in the csv.', `see here: ${csvRows_blank} / ${csvRows.length - 1}`);
      }
    };

    ////////////////
    // 5: GREY
    ///////////////

    let itemsValidation = []

    // Inconsistent values: if any column contains inconsistent values, for example if most values in a column are numeric but there's a significant proportion that aren't
    const find = (csv) => {
      var lineBreaks = csv.match(/\n/g);
      itemsValidation.push(lineBreaks);
    }
    const inconsistentValues = (csv) => {
      let csv_lines = csv.split('\n');
      let csvRows = [];
      for (let i = 1; i < csv_lines.length - 1; i++) {
        csvRows.push(csv_lines[i].split(','));
      }
      let csvRows_columns = [];
      for (let i = 0; i < csvRows.length - 1; i++) {
        csvRows_columns.push(csvRows[i].length);
      }
      let csvRows_columns_unique = csvRows_columns.filter(function (item, pos) {
        return csvRows_columns.indexOf(item) == pos;
      });
      let csvRows_columns_unique_max = Math.max.apply(
        Math,
        csvRows_columns_unique
      );
      let csvRows_columns_unique_max_index = csvRows_columns_unique.indexOf(
        csvRows_columns_unique_max
      );
      let csvRows_columns_unique_max_columns =
        csvRows_columns_unique[csvRows_columns_unique_max_index];
      let csvRows_columns_unique_max_columns_values = [];
      for (let i = 0; i < csvRows.length - 1; i++) {
        csvRows_columns_unique_max_columns_values.push(
          csvRows[i][csvRows_columns_unique_max_columns]
        );
      }
      let csvRows_columns_unique_max_columns_values_numeric = [];
      for (let i = 0; i < csvRows_columns_unique_max_columns_values.length; i++) {
        if (!isNaN(csvRows_columns_unique_max_columns_values[i])) {
          csvRows_columns_unique_max_columns_values_numeric.push(
            csvRows_columns_unique_max_columns_values[i]
          );
        }
      }
      if (
        csvRows_columns_unique_max_columns_values_numeric.length /
        csvRows_columns_unique_max_columns_values.length <
        0.9
      ) {
        itemsValidation.push(`There are inconsistent values in the csv file.`);
      }
    };


    lineBreaks(result.contents)
    undeclaredHeader(result.contents)
    raggedRows(result.contents)
    singleCommaSeparated(result.contents)
    blankRows(result.contents)
    whiteSpace(result.contents)
    checkUTF8(result.contents)
    inconsistentValues(result.contents)
    emptyColumnName(result.contents)
    duplicateColumnName(result.contents)

    let feedback = {
      encodingErrors,
      rowValidation,
      columnValidation,
      itemsValidation,
      encodingInside
    }

    let nonEmptyArrays = Object.keys(feedback).filter(key => feedback[key].length > 0)

    let feedbackString = []
    nonEmptyArrays.forEach(arr => {
      if (arr == 'encodingErrors') {
        feedbackString.push(`Is it encoded correctly as a CSV. Not much a human can do about this.`)
      }
      if (arr == 'rowValidation') {
        feedbackString.push(`The rows are not valid`)
      }
      if (arr == 'columnValidation') {
        feedbackString.push(`The columns are not valid`)
      }
      if (arr == 'itemsValidation') {
        feedbackString.push(`The items are not valid`)
      }
      if (arr == 'encodingInside') {
        feedbackString.push(`The encoding is not valid`)
      }
    })

    return feedbackString
  }

  async validateAjv() {
    let result = await this.getFile()

    function convertIntObj(input) {
      const res = {}
      for (const key in input) {
        res[key] = {};
        for (const prop in input[key]) {
          const parsed = parseInt(input[key][prop], 10);
          res[key][prop] = isNaN(parsed) ? input[key][prop] : parsed;
        }
      }
      return res;
    }

    var r = convertIntObj(result.parse.data);
    var arrayResult = Object.values(r);

    const ajv = new Ajv({
      allErrors: true,
      strict: false,
      validateFormats: 'full',
    });

    let _schema = this.model.get('_schema')
    ajv.addFormat('float', /^\$(\d{1,3}(\,\d{3})*|(\d+))(\.\d{2})?$/);

    let errorList = [];

    for (let i = 0; i < arrayResult.length; i++) {
      let valid = ajv.validate(_schema, arrayResult[i]);
      if (!valid) {
        errorList.push(ajv.errors);
      }
    }

    let errText = [];
    errorList.map((a) => {
      a.map((b) => {
        // console.log(b.instancePath.slice(1))
        let colName = b['instancePath'].slice(1);
        let colType = b['keyword'];
        let problem = b['message']
        if (colType === 'type' || 'format') {
          var errMsg = `"${colName}" ${colType} ${problem}.`;
          errText.push(errMsg);
        } else if (b['params']['error'] === 'missing') {
          let missingCol = b['params']['missingProperty'];
          var errMsg = `Cannot find required property "${missingCol}".`;
          errText.push(errMsg);
        } else if (colType === 'enum') {
          let allowed = b['params']['allowedValues'];
          let missingCol = b['params']['missingProperty'];
          var errMsg = `"<strong> ${colName} </strong>" must be one of ${allowed}.`;
          errText.push(errMsg);
        }
      });
    });

    // replace "required must have required property" from all errors
    let errTextFixes = errText.map((a) => {
      if (a.includes('"" required must have required property')) {
        return a.replace('"" required must have required property', '<strong> Missing property: </strong>');
      } else {
        return a;
      }
    }).filter((a) => {
      return a !== undefined;
    })
    // console.log(errText2)
    // return errText2;

    // console.log(errText2)
  

    const userResult = errTextFixes;

    return userResult;
  }
  async feedback() {
    let ajv = await this.validateAjv()
    let csv = await this.checkCsvStructure()
    console.log(csv, ajv)
    let combinedArr = [...new Set(ajv.concat(csv))]
    // let combinedArrString = combinedArr.join(' <br />')

    console.log(combinedArr)
    this.model.get('_items')[0].feedback = combinedArr
    this.model.get('_items')[0]["_score"] = combinedArr.length
    // this.model.get('_feedback').correct = combinedArrString
    this.model.get('_feedback')._partlyCorrect.final = combinedArr

    // const feedback = await $('#feedback').html(`<h1> Errors </h1> <ul> ${combinedArr.map((result) => {
    //   return `<li>${result}</li>`
    // }).join('')} </ul>`);

    // turn error messsages into a table with headers dividing ajv ones with csv ones
    const table = await $('#feedbackTable').html(`<table class="table table-striped table-bordered table-hover table-condensed">
    <thead>
      <tr>
        <th>Error Description</th>
        <th>Error Type</th>
      </tr>
    </thead>
    <tbody>
      ${combinedArr.map((result) => {
      return `<tr>
        <td>${result}</td>
        <td>${ajv.includes(result) ? 'Content 🖊️' : 'Structure 🏗️'}</td>
      </tr>`
    }).join('')}
    </tbody>
  </table>`);
  }

  async onInputChanged(e) {
    const index = $(e.currentTarget).data('adapt-index');
    const itemModel = this.model.getItem(index);
    let shouldSelect = !itemModel.get('_isActive');
    shouldSelect = true;
    this.model.resetActiveItems();
    itemModel.toggleActive(shouldSelect);
    this.createTable()
    this.feedback()

  // this.model.get('_maxScore') = 100

    // set score based on feedback count and if it is correct or not
    // if (this.model.get('_feedback')._partlyCorrect.final.length === 0) {
    //   this.model.get('_items')[0]["_score"] = 30
    // } else {
    //   this.model.get('_items')[0]["_score"] = 0
    // }
    // console.log(Object.values(this.model.get('_items')))
  }
}

