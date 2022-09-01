import QuestionView from 'core/js/views/questionView';
// import ZingGrid from './zinggrid.min.js'
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

  async createTable(){
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
    const csvResults = [];
    let result = await this.getFile()
    const lineBreaks = (csv) => {
      let csv_lines = csv.split('\n');
      let csv_line_breaks = [];
      for (let i = 0; i < csv_lines.length - 1; i++) {
        csv_line_breaks.push(csv_lines[i].split('\r').length - 1);
      }
      let csv_line_breaks_unique = csv_line_breaks.filter(function (item, pos) {
        return csv_line_breaks.indexOf(item) == pos;
      });
      if (csv_line_breaks_unique.length > 1) {
        csvResults.push('Line breaks are not the same throughout the csv file.');
      }
    };

    // Undeclared header: if you do not specify in a machine readable way whether or not your CSV has a header row
    const undeclaredHeader = (csv) => {
      let csv_lines = csv.split('\n');
      let csv_headers = csv_lines[0].split(',');
      if (csv_headers.length == 1) {
        csvResults.push('The csv headers have not been declared.', `the headers are: ${headers}`);
      }
    };

    // Ragged rows: if every row in the file doesn't have the same number of columns
    const raggedRows = (csv) => {
      let csv_lines = csv.split('\n');
      let csv_headers = csv_lines[0].split(',');
      let csv_rows = []
      // csvResults.push(csv_rows)
      for (let i = 1; i < csv_lines.length - 1; i++) {
        csv_rows.push(csv_lines[i].split(','));
      }
      let csv_rows_columns = [];
      for (let i = 0; i < csv_rows.length - 1; i++) {
        csv_rows_columns.push(csv_rows[i].length);
      }
      let csv_rows_columns_unique = csv_rows_columns.filter(function (item, pos) {
        return csv_rows_columns.indexOf(item) == pos;
      });
      if (csv_rows_columns_unique.length > 1) {
        // csvResults.push(csv_rows_columns_unique[0])
        // csvResults.push(csv_rows_columns_unique)
        // const displayColumns = num => csv_rows_columns[csv_rows_columns_unique[num]]
        csvResults.push(
          "Every row in the file doesn't have the same number of columns.",
          `here are the column counts we have found: ${[...csv_rows_columns_unique]}`
        );
      }
    };

    // Blank rows: if there are any blank rows
    const blankRows = (csv) => {
      let csv_lines = csv.split('\n');
      let csv_rows = [];
      for (let i = 1; i < csv_lines.length - 1; i++) {
        csv_rows.push(csv_lines[i].split(','));
      }
      let csv_rows_blank = [];
      for (let i = 0; i < csv_rows.length - 1; i++) {
        if (csv_rows[i].length == 1 && csv_rows[i][0] == '') {
          csv_rows_blank.push(i);
        }
      }
      if (csv_rows_blank.length > 0) {
        csvResults.push('There are blank rows in the csv.', `see here: ${csv_rows_blank} / ${csv_rows.length - 1}`);
      }
    };

    // Whitespace: if there is any whitespace between commas and double quotes around fields
    const whiteSpace = (csv) => {
      let csv_lines = csv.split('\n');
      let csv_rows = [];
      for (let i = 1; i < csv_lines.length - 1; i++) {
        csv_rows.push(csv_lines[i].split(','));
      }
      let csv_rows_whitespace = [];
      for (let i = 0; i < csv_rows.length - 1; i++) {
        for (let j = 0; j < csv_rows[i].length; j++) {
          if (csv_rows[i][j].split('"').length % 2 != 0) {
            if (csv_rows[i][j].split('"').length > 2) {
              if (csv_rows[i][j].split('"')[1].split(' ').length > 1) {
                csv_rows_whitespace.push(i);
              }
            }
          }
        }
      }
      if (csv_rows_whitespace.length > 0) {
        csvResults.push(
          'There is whitespace between commas and double quotes around fields in csv.',
          `whitespace: ${csv_rows_whitespace}`
        );
      }
    };

    // If we get the CSV from a URL, then we also check for these errors:
    // Not found: if the file doesn't exist (we get a 404 Not Found response)
    let file = '';
    let file_exists = false;
    let file_lines = file.split('\n');
    if (file_lines.length > 0) {
      file_exists = true;
    }
    if (!file_exists) {
      csvResults.push('404 error');
    }
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
    // Check options: if the CSV file only contains a single comma-separated column; this usually means you're using a separator other than a comm
    const singleCommaSeparated = csv => {
      let csv_lines = csv.split('\n');
      let csv_rows = [];
      for (let i = 1; i < csv_lines.length - 1; i++) {
        csv_rows.push(csv_lines[i].split(','));
      }
      let csv_rows_columns = [];
      for (let i = 0; i < csv_rows.length - 1; i++) {
        csv_rows_columns.push(csv_rows[i].length);
      }
      let csv_rows_columns_unique = csv_rows_columns.filter(function (item, pos) {
        return csv_rows_columns.indexOf(item) == pos;
      });
      if (csv_rows_columns_unique.length == 1 && csv_rows_columns_unique[0] == 1) {
        csvResults.push(
          'The CSV file only contains a single comma-separated column.',
        );
      }
    }
    // Inconsistent values: if any column contains inconsistent values, for example if most values in a column are numeric but there's a significant proportion that aren't
    const find = (csv) => {
      var lineBreaks = csv.match(/\n/g);
      csvResults.push(lineBreaks);
    }
    const inconsistentValues = (csv) => {
      let csv_lines = csv.split('\n');
      let csv_rows = [];
      for (let i = 1; i < csv_lines.length - 1; i++) {
        csv_rows.push(csv_lines[i].split(','));
      }
      let csv_rows_columns = [];
      for (let i = 0; i < csv_rows.length - 1; i++) {
        csv_rows_columns.push(csv_rows[i].length);
      }
      let csv_rows_columns_unique = csv_rows_columns.filter(function (item, pos) {
        return csv_rows_columns.indexOf(item) == pos;
      });
      let csv_rows_columns_unique_max = Math.max.apply(
        Math,
        csv_rows_columns_unique
      );
      let csv_rows_columns_unique_max_index = csv_rows_columns_unique.indexOf(
        csv_rows_columns_unique_max
      );
      let csv_rows_columns_unique_max_columns =
        csv_rows_columns_unique[csv_rows_columns_unique_max_index];
      let csv_rows_columns_unique_max_columns_values = [];
      for (let i = 0; i < csv_rows.length - 1; i++) {
        csv_rows_columns_unique_max_columns_values.push(
          csv_rows[i][csv_rows_columns_unique_max_columns]
        );
      }
      let csv_rows_columns_unique_max_columns_values_numeric = [];
      for (let i = 0; i < csv_rows_columns_unique_max_columns_values.length; i++) {
        if (!isNaN(csv_rows_columns_unique_max_columns_values[i])) {
          csv_rows_columns_unique_max_columns_values_numeric.push(
            csv_rows_columns_unique_max_columns_values[i]
          );
        }
      }
      if (
        csv_rows_columns_unique_max_columns_values_numeric.length /
        csv_rows_columns_unique_max_columns_values.length <
        0.9
      ) {
        csvResults.push(`There are inconsistent values in the csv file.`);
      }
    };

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
        csvResults.push("There are columns that don't have a name in the csv file.");
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
        csvResults.push('Not all the columns are unique.', `see here: ${csv_headers_unique}`)
      }
    };
    // console.log(result.contents)
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

    // this.model.get('_items')[0].feedback = userResult
    // this.model.get('_feedback').correct = userResult
    // this.model.get('_feedback')._incorrect.final = userResult
    // this.model.get('_feedback')._partlyCorrect.final = userResult

    return csvResults

  }

  // return $('#feedbackCsv').html(`<ul> ${csvResults.map((result) => {
  //   return `<li>${result}</li>`
  // })} </ul>`);

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
    // console.log(result)
    var r = convertIntObj(result.parse.data);
    var arrayResult = Object.values(r);
    // console.log(arrayResult)
    const ajv = new Ajv({
      allErrors: true,
      strict: false,
      validateFormats: 'full',
    });
    let _schema =  this.model.get('_schema')
    ajv.addFormat('float', /^\$(\d{1,3}(\,\d{3})*|(\d+))(\.\d{2})?$/);

    let errorList = [];
    // var testSchemaValidator = ajv.compile(_schema);
    for (let i = 0; i < arrayResult.length; i++) {
      let valid = ajv.validate(_schema, arrayResult[i]);
      console.log(valid);
      // let valid = testSchemaValidator(arrayResult[i]);
      // console.log(valid);
      if (!valid) {
        errorList.push(ajv.errors);
      }
    }
    console.log(errorList);

    // console.log(results)

    // console.log(results)
    let errText = [];
    errorList.map((a) => {
      a.map((b) => {
        // console.log(b.instancePath.slice(1))
        let colName = b['instancePath'].slice(1);
        let colType = b['keyword'];
        //delete words 'must have required' from message object
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
    
    
    const userResult = [...new Set(errText)];
    console.log(userResult)


    return userResult
    // return $('#feedbackAjv').html(`<ul> ${userResult.map((result) => {
    //   return `<li>${result}</li>`
    // })} </ul>`);

  }
  async feedback() {
    let ajv = await this.validateAjv()
    let csv = await this.checkCsvStructure()
    // console.log(userResult)
    // for (let i of userResult.userResults) {
    //   arrResults = `${Object.values(i)}`
    //   console.log(arrResults)
    // }



    //set score in model
  
    let combinedArr = ajv.concat(csv)

    //turn comibinedArr into a string
    let combinedArrString = combinedArr.join(' <br />')
    console.log(combinedArrString)


    this.model.get('_items')[0].feedback = combinedArr
    this.model.get('_items')[0]["_score"] = combinedArr.length
    this.model.get('_feedback').correct = combinedArrString
    // console.log(this.model.get('_items')[0]["_score"])
    // this.model.get('_feedback')._incorrect.final = combinedArr
    this.model.get('_feedback')._partlyCorrect.final = combinedArr
    const feedback = await $('#feedback').html(`<h1> Errors </h1> <ul> ${combinedArr.map((result) => {
      return `<li>${result}</li>`
    }).join('')} </ul>`);

    return feedback
  }

  // async removeButton() {
  //   const tableContents = $("#example-wrapper")
  //   const $itemInput = this.$('.js-item-input').eq(0)
  //   // console.log($itemInput)
  //   /* create button that removes uploaded file so that the user can reupload */
  //   var clearUploadButton = document.createElement('button');
  //   clearUploadButton.innerHTML = 'Clear Upload';
  //   clearUploadButton.onclick = function() {
  //     $itemInput.val('');
  //     tableContents.html('');
  //     $itemInput.trigger('change');

  //   };
  //   document.body.appendChild(clearUploadButton);
  //   }

  async onInputChanged(e) {
    const index = $(e.currentTarget).data('adapt-index');
    const itemModel = this.model.getItem(index);
    let shouldSelect = !itemModel.get('_isActive');
    shouldSelect = true;
    this.model.resetActiveItems();
    itemModel.toggleActive(shouldSelect);
    this.createTable()
    this.feedback()
  }
}

